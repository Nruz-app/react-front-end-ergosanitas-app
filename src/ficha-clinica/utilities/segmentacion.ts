/**
 * Distribución segmentaria de masa corporal.
 *
 * El equipo de bioimpedancia AHORA reporta masa por segmento: diez campos medidos que
 * llegan en el payload y que este módulo usa tal cual. El reparto por coeficientes
 * antropométricos sigue existiendo, pero degradado a RESPALDO: solo entra cuando el
 * equipo no entregó ese segmento, y en ese caso la cifra viaja marcada como `estimado`
 * para que la UI pueda declararlo. Ver la Spec 03.
 *
 * Funciones puras, sin dependencias de UI, en la misma línea que `parse.ts`.
 */

import {
    EstadoClinico,
    IBioimpedancia,
    IComparacionSegmentaria,
    IDeltaSegmento,
    IDistribucionSegmentaria,
    ISegmentoCorporal,
    MetricaSegmentaria,
    OrigenDistribucion,
    OrigenSegmentario,
    SegmentoId,
} from '../interface';
import { ESCALAS, clasificar } from './umbrales';

/** Sexo ya normalizado. El payload usa dos vocabularios para lo mismo. */
export type SexoNormalizado = 'masculino' | 'femenino';

/**
 * Fracción de masa corporal por segmento, de Leva (1996), ajuste de los datos de
 * Zatsiorsky-Seluyanov. Es la referencia antropométrica estándar en biomecánica.
 *
 * ⚠️ SOLO SE APLICA COMO RESPALDO, cuando el equipo no midió ese segmento. Con datos
 * medidos estos números no se usan.
 *
 * La masa de la cabeza se agrupa en el tronco para que los cinco coeficientes sumen
 * exactamente 1. El reparto es simétrico entre lados: sin medición no hay asimetría que
 * reportar, y fabricarla sería la invención más fácil de detectar.
 *
 * Los coeficientes son de población adulta: en un paciente pediátrico las proporciones
 * difieren (cabeza mayor, extremidades menores).
 */
const COEFICIENTES: Record<SexoNormalizado, Record<SegmentoId, number>> = {
    masculino: {
        brazoIzq  : 0.0494,
        brazoDer  : 0.0494,
        tronco    : 0.5040,
        piernaIzq : 0.1986,
        piernaDer : 0.1986,
    },
    femenino: {
        brazoIzq  : 0.0449,
        brazoDer  : 0.0449,
        tronco    : 0.4926,
        piernaIzq : 0.2088,
        piernaDer : 0.2088,
    },
};

/**
 * Lectura medida de cada segmento.
 *
 * Se accede por función y no por `keyof` para no perder el tipo: los campos segmentarios
 * de la Capa 2 son `number | null`, y un índice genérico los mezclaría con los campos de
 * texto de la misma interfaz.
 */
const MEDIDAS: Record<SegmentoId, (bio: IBioimpedancia) => {
    grasaKg   : number | null;
    musculoKg : number | null;
}> = {
    brazoIzq  : (bio) => ({ grasaKg: bio.grasaBrazoIzqKg,  musculoKg: bio.musculoBrazoIzqKg  }),
    brazoDer  : (bio) => ({ grasaKg: bio.grasaBrazoDerKg,  musculoKg: bio.musculoBrazoDerKg  }),
    tronco    : (bio) => ({ grasaKg: bio.grasaTroncoKg,    musculoKg: bio.musculoTroncoKg    }),
    piernaIzq : (bio) => ({ grasaKg: bio.grasaPiernaIzqKg, musculoKg: bio.musculoPiernaIzqKg }),
    piernaDer : (bio) => ({ grasaKg: bio.grasaPiernaDerKg, musculoKg: bio.musculoPiernaDerKg }),
};

/** Etiquetas de UI. Izquierda y derecha son las del PACIENTE, no las del observador. */
const NOMBRES: Record<SegmentoId, string> = {
    brazoIzq  : 'Brazo izquierdo',
    brazoDer  : 'Brazo derecho',
    tronco    : 'Tronco',
    piernaIzq : 'Pierna izquierda',
    piernaDer : 'Pierna derecha',
};

/** Orden fijo de recorrido, para que la UI siempre liste los segmentos igual. */
export const SEGMENTOS: SegmentoId[] = ['brazoIzq', 'brazoDer', 'tronco', 'piernaIzq', 'piernaDer'];

/**
 * Normaliza el sexo a las dos claves de `COEFICIENTES`.
 *
 * El payload usa dos vocabularios: `paciente.sexo` manda 'Masculino' y
 * `bioimpedancia.sexo` manda 'Hombre'. Un tercero es plausible, así que un valor no
 * reconocido cae en 'masculino' en vez de lanzar: la vista debe dibujarse igual.
 * El default es arbitrario y está aquí solo para no romper el render.
 */
export const normalizarSexo = (sexo: string | null | undefined): SexoNormalizado => {

    const limpio = (sexo ?? '').trim().toLowerCase();

    // Se listan las formas femeninas y todo lo demás cae al default. Comparar por
    // prefijo tolera las terminaciones ('femenina', 'mujeres') sin enumerarlas.
    const esFemenino = limpio.startsWith('f') || limpio.startsWith('mujer');

    return esFemenino ? 'femenino' : 'masculino';
};

/** Valor de un segmento junto con la marca de dónde salió. */
interface ILectura {
    valor  : number | null;
    origen : OrigenSegmentario;
}

/**
 * Decide el valor de un segmento: primero lo medido, después la estimación.
 *
 * El orden es la regla clínica de la vista. Un dato del equipo nunca se sustituye por un
 * cálculo, y un cálculo nunca se presenta sin marca.
 */
const resolver = (medido: number | null, total: number | null, coeficiente: number): ILectura => {

    if (medido !== null) return { valor: medido, origen: 'medido' };
    if (total !== null)  return { valor: total * coeficiente, origen: 'estimado' };

    return { valor: null, origen: 'sinDato' };
};

/** Fracción del total corporal que representa un valor. 0 cuando no es calculable. */
const fraccion = (valor: number | null, total: number | null): number => {

    if (valor === null || total === null || total === 0) return 0;

    return valor / total;
};

/**
 * Origen del conjunto de los cinco segmentos.
 *
 * Cualquier mezcla es `mixto`, incluida la de medidos con ausentes: si una parte del
 * cuerpo trae dato del equipo y otra no, la vista no puede rotularse como medida a secas.
 */
const resumirOrigen = (origenes: OrigenSegmentario[]): OrigenDistribucion => {

    const unicos = [...new Set(origenes)];

    return unicos.length === 1 ? unicos[0] : 'mixto';
};

/**
 * Residuo del total que los cinco segmentos no cubren: cabeza y cuello, que el equipo no
 * asigna a ninguna región.
 *
 * `null` si falta el total o alguno de los segmentos: una resta con huecos daría un
 * residuo inventado. Con datos estimados da 0, porque los coeficientes suman 1.
 */
const residuo = (valores: (number | null)[], total: number | null): number | null => {

    if (total === null || valores.some((valor) => valor === null)) return null;

    return total - valores.reduce<number>((suma, valor) => suma + (valor ?? 0), 0);
};

/**
 * Arma la distribución segmentaria de una bioimpedancia.
 *
 * No redondea: el redondeo es cosa del formateo. Así, con datos medidos, la suma de los
 * cinco segmentos más el residuo sigue reproduciendo el total del examen.
 *
 * El estado que devuelve es GLOBAL y los cinco segmentos lo heredan. Tener kilos medidos
 * por extremidad no crea cortes de normalidad por extremidad: esos no existen en la
 * literatura y no se inventan aquí. La grasa se evalúa por `grasaCorporalPct` y el
 * músculo por `smi`, ambos del examen completo.
 */
export const calcularDistribucion = (
    bio: IBioimpedancia,
    sexo: string | null | undefined,
): IDistribucionSegmentaria => {

    const clave = normalizarSexo(sexo);
    const coeficientes = COEFICIENTES[clave];

    const segmentos = SEGMENTOS.reduce((acumulado, id) => {

        const coeficiente = coeficientes[id];
        const medida = MEDIDAS[id](bio);

        const grasa   = resolver(medida.grasaKg,   bio.masaGrasaKg,    coeficiente);
        const musculo = resolver(medida.musculoKg, bio.masaMuscularKg, coeficiente);

        acumulado[id] = {
            id,
            nombre          : NOMBRES[id],
            grasaKg         : grasa.valor,
            musculoKg       : musculo.valor,
            origenGrasa     : grasa.origen,
            origenMusculo   : musculo.origen,
            fraccionGrasa   : fraccion(grasa.valor,   bio.masaGrasaKg),
            fraccionMusculo : fraccion(musculo.valor, bio.masaMuscularKg),
        };

        return acumulado;
    }, {} as Record<SegmentoId, ISegmentoCorporal>);

    const lista = SEGMENTOS.map((id) => segmentos[id]);

    const escalaGrasa = clave === 'femenino' ? ESCALAS.grasaFemenino : ESCALAS.grasaMasculino;
    const escalaSmi   = clave === 'femenino' ? ESCALAS.smiFemenino   : ESCALAS.smiMasculino;

    return {
        fecha          : bio.fecha,
        segmentos,

        estadoGrasa    : clasificar(bio.grasaCorporalPct, escalaGrasa),
        estadoMusculo  : clasificar(bio.smi, escalaSmi),

        masaGrasaKg    : bio.masaGrasaKg,
        masaMuscularKg : bio.masaMuscularKg,

        origenGrasa    : resumirOrigen(lista.map((segmento) => segmento.origenGrasa)),
        origenMusculo  : resumirOrigen(lista.map((segmento) => segmento.origenMusculo)),

        residuoGrasaKg   : residuo(lista.map((segmento) => segmento.grasaKg),   bio.masaGrasaKg),
        residuoMusculoKg : residuo(lista.map((segmento) => segmento.musculoKg), bio.masaMuscularKg),
    };
};

/** Estado global de la distribución para la métrica que se está mostrando. */
export const estadoDeMetrica = (
    distribucion: IDistribucionSegmentaria,
    metrica: MetricaSegmentaria,
): EstadoClinico =>
    metrica === 'grasa' ? distribucion.estadoGrasa : distribucion.estadoMusculo;

/** Origen del conjunto para la métrica activa: decide qué advertencia muestra la UI. */
export const origenDeMetrica = (
    distribucion: IDistribucionSegmentaria,
    metrica: MetricaSegmentaria,
): OrigenDistribucion =>
    metrica === 'grasa' ? distribucion.origenGrasa : distribucion.origenMusculo;

/** Total corporal del examen para la métrica activa. */
export const totalDeMetrica = (
    distribucion: IDistribucionSegmentaria,
    metrica: MetricaSegmentaria,
): number | null =>
    metrica === 'grasa' ? distribucion.masaGrasaKg : distribucion.masaMuscularKg;

/** Residuo de cabeza y cuello para la métrica activa. */
export const residuoDeMetrica = (
    distribucion: IDistribucionSegmentaria,
    metrica: MetricaSegmentaria,
): number | null =>
    metrica === 'grasa' ? distribucion.residuoGrasaKg : distribucion.residuoMusculoKg;

/** Valor de un segmento en la métrica activa. */
export const valorDeMetrica = (
    segmento: ISegmentoCorporal,
    metrica: MetricaSegmentaria,
): number | null =>
    metrica === 'grasa' ? segmento.grasaKg : segmento.musculoKg;

/** Fracción del total corporal de un segmento en la métrica activa. */
export const fraccionDeMetrica = (
    segmento: ISegmentoCorporal,
    metrica: MetricaSegmentaria,
): number =>
    metrica === 'grasa' ? segmento.fraccionGrasa : segmento.fraccionMusculo;

/** Origen del valor de un segmento en la métrica activa. */
export const origenDeSegmento = (
    segmento: ISegmentoCorporal,
    metrica: MetricaSegmentaria,
): OrigenSegmentario =>
    metrica === 'grasa' ? segmento.origenGrasa : segmento.origenMusculo;

/** Resta dos valores propagando la ausencia: sin ambos datos no hay variación que mostrar. */
const restar = (actual: number | null, base: number | null): number | null =>
    actual === null || base === null ? null : actual - base;

/**
 * Variación de cada segmento entre dos exámenes.
 *
 * Positivo significa que subió respecto al examen base. El resultado alimenta la línea de
 * delta de los callouts; nunca el color, que sigue representando el estado clínico actual.
 */
export const compararDistribuciones = (
    actual: IDistribucionSegmentaria,
    base: IDistribucionSegmentaria,
): IComparacionSegmentaria => {

    const deltas = SEGMENTOS.reduce((acumulado, id) => {

        acumulado[id] = {
            grasaKg   : restar(actual.segmentos[id].grasaKg, base.segmentos[id].grasaKg),
            musculoKg : restar(actual.segmentos[id].musculoKg, base.segmentos[id].musculoKg),
        };

        return acumulado;
    }, {} as Record<SegmentoId, IDeltaSegmento>);

    return { fechaBase: base.fecha, deltas };
};
