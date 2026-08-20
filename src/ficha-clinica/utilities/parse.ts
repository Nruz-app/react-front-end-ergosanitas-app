/**
 * Helpers de parseo y normalización del payload de la ficha clínica.
 *
 * Funciones puras, sin dependencias: son la traducción entre la forma cruda del
 * backend (`api.interface.ts`) y el modelo de UI (`ficha-clinica.interface.ts`).
 * El mapper de `mappers.ts` es su único consumidor.
 *
 * Están aisladas aquí a propósito: el proyecto no tiene runner de tests, y estas
 * son las piezas que primero conviene cubrir el día que exista uno.
 */

/** Valor numérico tal como puede llegar del backend: número, string o ausente. */
type ValorCrudo = string | number | null | undefined;

/**
 * Convierte a número, tratando la ausencia de dato como `null`.
 *
 * El backend manda los números del electrocardiograma como string, y usa tanto
 * `null` como `''` para "sin dato". Nunca se devuelve 0 por un valor ausente:
 * un cero en un signo vital es una medición, no un vacío.
 */
export const aNumero = (valor: ValorCrudo): number | null => {

    if (valor === null || valor === undefined) return null;

    if (typeof valor === 'number') {
        return Number.isFinite(valor) ? valor : null;
    }

    const limpio = valor.trim();
    if (limpio === '') return null;

    const numero = Number(limpio);
    return Number.isFinite(numero) ? numero : null;
};

/**
 * Devuelve el primer valor de la lista que parsee a número.
 *
 * Resuelve los campos que el backend duplica: el electrocardiograma trae tres
 * columnas de IMC (`imc_paciente`, `imc`, `imc_electro`) y dos de frecuencia
 * cardíaca (`frecuencia_cardiaca_paciente`, `pulso`), con solo una poblada.
 * El orden de los argumentos define la preferencia.
 */
export const primerValor = (...valores: ValorCrudo[]): number | null => {

    for (const valor of valores) {
        const numero = aNumero(valor);
        if (numero !== null) return numero;
    }

    return null;
};

/**
 * Recorta un timestamp del backend a día: '2026-04-24 04:00:00.000000' → '2026-04-24'.
 *
 * Devuelve `''` cuando la fecha es inválida o ausente. El mapper usa ese `''`
 * para mandar los registros sin fecha al final del ordenamiento, de modo que
 * nunca ganen la posición 0 (de la que sale el snapshot del tab Home).
 */
export const aFechaISO = (valor: string | null | undefined): string => {

    if (!valor) return '';

    const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor.trim());
    if (!partes) return '';

    const [, anio, mes, dia] = partes;

    // Date no rechaza días fuera de rango: '2026-02-30' rueda a marzo. Hay que
    // comprobar que la fecha construida sea la misma que se pidió.
    const fecha = new Date(`${anio}-${mes}-${dia}T00:00:00`);
    const coincide =
        !Number.isNaN(fecha.getTime()) &&
        fecha.getFullYear() === Number(anio) &&
        fecha.getMonth() + 1 === Number(mes) &&
        fecha.getDate() === Number(dia);

    if (!coincide) return '';

    return `${anio}-${mes}-${dia}`;
};

/** Recorta una hora del backend a minutos: '18:18:08.000000' → '18:18'. */
export const aHoraCorta = (valor: string | null | undefined): string | null => {

    if (!valor) return null;

    const partes = /^(\d{2}):(\d{2})/.exec(valor.trim());
    if (!partes) return null;

    return `${partes[1]}:${partes[2]}`;
};

/**
 * Umbral de detección de unidad de estatura. Por debajo se asume metros.
 *
 * Heurística deliberada: el electrocardiograma manda metros ('1.47') y la
 * bioimpedancia centímetros (170), sin ninguna marca que los distinga. Nadie
 * mide menos de 3 cm ni más de 3 m, así que la magnitud alcanza para decidir.
 */
const UMBRAL_METROS = 3;

/** Normaliza una estatura a centímetros, venga en metros o en centímetros. */
export const aCentimetros = (valor: ValorCrudo): number | null => {

    const numero = aNumero(valor);
    if (numero === null) return null;

    const centimetros = numero < UMBRAL_METROS ? numero * 100 : numero;

    // 1.47 * 100 da 147.00000000000003 en coma flotante: se redondea a 1 decimal.
    return Math.round(centimetros * 10) / 10;
};

/**
 * Edad en años cumplidos a la fecha de `hoy`, o `null` si no hay fecha de nacimiento.
 *
 * Se calcula siempre a hoy y se ignora el campo `edad` que traen los exámenes,
 * porque ese está congelado a la fecha en que se tomó la medición.
 * `hoy` es inyectable para poder verificar el cálculo con una fecha fija.
 *
 * Devuelve `null` y no 0 cuando falta el dato: el backend manda `fechaNacimiento: null`
 * para los RUT sin ficha demográfica, y un 0 ahí se leería como un recién nacido.
 */
export const calcularEdad = (
    fechaNacimiento: string | null | undefined,
    hoy: Date = new Date(),
): number | null => {

    const iso = aFechaISO(fechaNacimiento);
    if (iso === '') return null;

    const nacimiento = new Date(`${iso}T00:00:00`);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const mesesDiferencia = hoy.getMonth() - nacimiento.getMonth();
    const cumpleAunNoOcurrio =
        mesesDiferencia < 0 ||
        (mesesDiferencia === 0 && hoy.getDate() < nacimiento.getDate());

    if (cumpleAunNoOcurrio) edad -= 1;

    // Una fecha futura no es una edad negativa: es un dato malo.
    return edad < 0 ? null : edad;
};
