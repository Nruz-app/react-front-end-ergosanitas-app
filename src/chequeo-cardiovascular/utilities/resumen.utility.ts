import dayjs from 'dayjs';

import { COLORES, PALETA_CATEGORICA } from '../config/tema';
import type { EstadoTarjeta, IChequeo, SerieApilada, SerieSimple } from '../interface';

/**
 * Derivaciones del Home, calculadas sobre las filas de `chequeo-all`.
 *
 * Son funciones **puras**: reciben el listado y devuelven lo derivado. No llaman a servicios, no
 * leen contextos y no dependen del orden en que se monten las tarjetas.
 *
 * La regla transversal es que **nada se descarta en silencio**: una edad no numérica o una lectura
 * ausente se restan del `usadas` de la serie, que la tarjeta declara en su subtítulo. Un dato
 * que desaparece del gráfico es un error que nadie ve.
 *
 * ⚠️ **Lo que `chequeo-all` NO devuelve**, comprobado contra el backend real: `division_paciente`,
 * `created_at`, `derivacion_paciente`, `observacion_paciente`, `email_paciente` y `pulso`. No
 * derives nada de esos campos desde aquí: llegarán siempre vacíos. Es la razón por la que el
 * gráfico «Avance por curso» se retiró — no era un dato faltante, era un campo inexistente.
 */

/** El único estado que la lista del Home destaca. Literal exacto del backend. */
export const ESTADO_ALTERADO = 'Diag. Card. - Alterado';

/**
 * Lee una fecha del backend, que llega en dos formatos distintos.
 *
 * 🔴 `fecha_atencion` viene como **`DD-MM-YYYY`** (`'23-04-2026'`), que `dayjs()` **no** sabe
 * interpretar sin el plugin `customParseFormat`: la da por inválida y la fila se descarta. Ese
 * era el bug que dejaba «Chequeos por mes» usando **1 de 118 filas** sin que nada lo avisara.
 *
 * Se reordena a ISO a mano en vez de traer el plugin: es una línea y no toca la configuración
 * global de dayjs, que comparten otros módulos.
 *
 * ⚠️ Reordenar no basta: dayjs **no rechaza un día fuera de rango, lo desborda**.
 * `'31-02-2026'` se convierte en el 3 de marzo y `'00-00-2026'` en noviembre del año
 * anterior, así que la fila acabaría contada en un mes en el que no se atendió a nadie: una
 * barra inventada en el gráfico, que es peor que una fila de menos. Por eso se comprueba que
 * el resultado sea exactamente el día que se pidió; si no lo es, la fila se descarta y baja
 * del `usadas` que la tarjeta declara.
 */
export const parsearFecha = (crudo?: string) => {

    if (!crudo) return null;

    const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(crudo.trim());

    if (!dmy) {
        const iso = dayjs(crudo);
        return iso.isValid() ? iso : null;
    }

    const fecha = dayjs(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);

    if (!fecha.isValid()) return null;

    const desbordada = fecha.date() !== Number(dmy[1]) || fecha.month() + 1 !== Number(dmy[2]);

    return desbordada ? null : fecha;
};

/**
 * Los deportistas con diagnóstico cardíaco alterado, del más reciente al más antiguo.
 *
 * Sustituye a los gráficos «Avance por etapa» y «Avance por curso» de la primera versión del
 * Home. La razón es que un colegio no necesita saber *cuántos* hay —eso ya lo dicen los
 * contadores— sino **quiénes son**: es lo único de esta pantalla sobre lo que se puede actuar.
 *
 * Se ordena por fecha de atención descendente y, a igualdad, por nombre, para que el orden sea
 * estable entre cargas. Una fila sin fecha legible baja al final en vez de desaparecer.
 */
export const filtrarAlterados = (filas: IChequeo[]): IChequeo[] => {

    return filas
        .filter((fila) => (fila.estado_paciente ?? '').trim() === ESTADO_ALTERADO)
        .sort((a, b) => {

            const fechaA = parsearFecha(a.fecha_atencion)?.valueOf() ?? -Infinity;
            const fechaB = parsearFecha(b.fecha_atencion)?.valueOf() ?? -Infinity;

            if (fechaA !== fechaB) return fechaB - fechaA;

            return (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es');
        });
};

/**
 * Tramos de saturación de oxígeno por pulsioximetría.
 *
 * ⚠️ **Umbrales clínicos, no una decisión de front.** Son los tramos de referencia habituales de
 * pulsioximetría —normal ≥ 95 %, hipoxemia leve 91-94 %, moderada 88-90 %, severa < 88 %— y
 * **están pendientes del visto bueno médico del proyecto**. Se eligieron porque el gráfico tenía
 * que agrupar de alguna forma, no porque nadie los haya validado aquí. Cambiarlos es una decisión
 * médica y va en su propia spec, igual que los umbrales de IMC.
 *
 * El orden va de mejor a peor, para que la leyenda y la tabla se lean de arriba abajo.
 */
const TRAMOS_SATURACION = [
    { etiqueta: 'Normal (≥ 95%)',   desde: 95,        color: COLORES.normal },
    { etiqueta: 'Leve (91-94%)',    desde: 91,        color: COLORES.limite },
    { etiqueta: 'Moderada (88-90%)', desde: 88,       color: COLORES.limiteAlto },
    { etiqueta: 'Severa (< 88%)',   desde: -Infinity, color: COLORES.alterado },
];

/**
 * Distribución de saturación de oxígeno, **derivada de `chequeo-all`**.
 *
 * Sustituye al gráfico que consultaba `GET /estadisticas/estadistica-saturacion/{user_email}`,
 * que devuelve **HTTP 500** (`Call to undefined method
 * ChequeoCardiovascular::SP_estadistica_saturacion()`) y dejaba la tarjeta permanentemente en
 * «este indicador no está disponible». El dato **sí existe**: viene en el campo
 * `saturacionOxigeno` de cada fila, así que se agrupa aquí y deja de depender de un endpoint roto.
 *
 * Si algún día el backend arregla ese endpoint, volver a él es una decisión aparte: hoy esta vía
 * funciona y no necesita servidor.
 *
 * Una lectura ausente o no numérica se resta del `usadas` que la tarjeta declara; nunca se cuenta
 * como 0 %, que sería una medición inventada.
 */
export const resumirPorSaturacion = (filas: IChequeo[]): SerieSimple => {

    const conteo = TRAMOS_SATURACION.map(() => 0);
    let usadas = 0;

    for (const fila of filas) {

        const valor = parseFloat(fila.saturacionOxigeno ?? '');
        if (isNaN(valor)) continue;

        const indice = TRAMOS_SATURACION.findIndex((tramo) => valor >= tramo.desde);
        if (indice === -1) continue;

        conteo[indice] += 1;
        usadas += 1;
    }

    // A diferencia de la pirámide, los tramos vacíos SÍ se pintan: que «Severa» esté en cero es
    // justo lo que el colegio quiere ver, y ocultarlo dejaría la dona sin escala de referencia.
    return {
        labels  : TRAMOS_SATURACION.map((tramo) => tramo.etiqueta),
        data    : conteo,
        colores : TRAMOS_SATURACION.map((tramo) => tramo.color),
        usadas,
    };
};

/** Rangos de la pirámide. El último es abierto por arriba. */
const RANGOS_EDAD = [
    { etiqueta: '< 6',   desde: 0,  hasta: 5 },
    { etiqueta: '6-8',   desde: 6,  hasta: 8 },
    { etiqueta: '9-11',  desde: 9,  hasta: 11 },
    { etiqueta: '12-14', desde: 12, hasta: 14 },
    { etiqueta: '15-17', desde: 15, hasta: 17 },
    { etiqueta: '18+',   desde: 18, hasta: Infinity },
];

/**
 * Pirámide por rango etario y sexo.
 *
 * `edad` llega como `string` opcional —deuda heredada de `IChequeo`—, así que se parsea y una
 * edad no numérica o negativa excluye la fila. Solo entran `Masculino` y `Femenino`; el resto
 * queda fuera y se nota en `usadas`.
 *
 * Masculino se guarda **en negativo** para que chart.js lo dibuje a la izquierda del cero. Quien
 * pinta es responsable de aplicar `Math.abs` en el eje y en el tooltip.
 */
export const resumirPorEdadSexo = (filas: IChequeo[]): SerieApilada => {

    const masculino = RANGOS_EDAD.map(() => 0);
    const femenino = RANGOS_EDAD.map(() => 0);
    let usadas = 0;

    for (const fila of filas) {

        const sexo = (fila.sexo_paciente ?? '').trim();
        if (sexo !== 'Masculino' && sexo !== 'Femenino') continue;

        const edad = parseInt(fila.edad ?? '', 10);
        if (isNaN(edad) || edad < 0) continue;

        const indice = RANGOS_EDAD.findIndex((rango) => edad >= rango.desde && edad <= rango.hasta);
        if (indice === -1) continue;

        if (sexo === 'Masculino') masculino[indice] += 1;
        else femenino[indice] += 1;

        usadas += 1;
    }

    // Un rango en el que no hay nadie no se pinta: alarga la pirámide sin decir nada.
    const visibles = RANGOS_EDAD
        .map((rango, indice) => ({ rango, indice }))
        .filter(({ indice }) => masculino[indice] > 0 || femenino[indice] > 0);

    return {
        labels : visibles.map(({ rango }) => rango.etiqueta),
        pilas  : [
            {
                nombre : 'Masculino',
                color  : COLORES.primario,
                data   : visibles.map(({ indice }) => -masculino[indice]),
            },
            {
                nombre : 'Femenino',
                color  : COLORES.limite,
                data   : visibles.map(({ indice }) => femenino[indice]),
            },
        ],
        usadas,
    };
};

/**
 * En qué estado pintar una tarjeta de gráfico.
 *
 * Separa «el colegio no tiene mediciones» de «el servicio no respondió». Sin esa distinción, el
 * 500 de `estadistica-saturacion` se leería como un colegio sin datos y nadie lo arreglaría.
 */
export const estadoDeTarjeta = (
    cargado  : boolean,
    error    : boolean,
    hayDatos : boolean,
): EstadoTarjeta => {

    if (!cargado) return 'cargando';
    if (error) return 'no-disponible';
    if (!hayDatos) return 'sin-datos';

    return 'ok';
};

/**
 * Paleta cíclica para series **sin orden clínico** —cursos, meses—, donde el color solo separa
 * una categoría de otra. Si la serie trae más etiquetas que colores, se repiten en vez de faltar.
 */
export const colorPorIndice = (indice: number, paleta: string[] = PALETA_CATEGORICA): string =>
    paleta[indice % paleta.length];

/**
 * Reglas de color de una categoría clínica, **de más grave a menos**. El orden importa: se
 * devuelve la primera que coincida, por eso «Hipertensión Grado 2» cae en `alterado` y no en el
 * `limiteAlto` de «Hipertensión» a secas.
 */
const REGLAS_COLOR_CLINICO: { patron: RegExp; color: string }[] = [
    { patron: /obesidad|grado\s*2|alterad/i,        color: COLORES.alterado },
    { patron: /hipertensi|grado\s*1|sobre\s*peso/i, color: COLORES.limiteAlto },
    { patron: /bajo|elevad|riesgo/i,                color: COLORES.limite },
    { patron: /normal/i,                            color: COLORES.normal },
];

/**
 * Color de una categoría clínica **por el texto de su etiqueta**, no por su posición.
 *
 * 🔴 Esto empezó siendo posicional, asumiendo que el backend devolvía las series ordenadas de
 * normal a alterado. **Es falso**, verificado contra `http://127.0.0.1:8000/api`:
 *
 * - `estadistica-imc` → `['Bajo Peso', 'Normal', 'Sobre Peso', 'Obesidad']`
 * - `estadistica-hemoglucotest` → `['Bajo', 'Normal', 'Alterado']`
 * - `estadistica-presion` → `['Normal', 'Elevada', 'Hipertensión Grado 1', 'Hipertensión Grado 2']`
 *
 * En dos de las tres, la posición 0 **no** es «normal»: son curvas de campana, no escalas
 * monótonas. Con el color por índice, «Bajo Peso» se pintaba de verde y «Normal» de ámbar — la
 * interfaz afirmaba exactamente lo contrario de lo que pasaba.
 *
 * Una etiqueta que no reconoce ninguna regla sale en **gris**, que no afirma nada. Es
 * deliberado: es preferible una categoría sin color a una categoría mal coloreada de verde.
 *
 * ⚠️ El reparto fino entre ámbar y naranja (`Sobre Peso` vs `Bajo Peso`) es una graduación
 * visual, no un criterio médico validado. Lo que sí es firme es que **solo «Normal» va en
 * verde**.
 */
export const colorClinico = (etiqueta: string): string => {

    for (const { patron, color } of REGLAS_COLOR_CLINICO) {
        if (patron.test(etiqueta)) return color;
    }

    return COLORES.neutro;
};

/** «32 de 118 deportistas», el subtítulo auditable de cada tarjeta derivada. */
export const subtituloResumen = (usadas: number, total: number): string => {

    if (total === 0) return 'Sin deportistas registrados';
    if (usadas === total) return `${total} deportista${total === 1 ? '' : 's'}`;

    return `${usadas} de ${total} deportistas con el dato registrado`;
};
