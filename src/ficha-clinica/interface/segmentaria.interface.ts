/**
 * Capa 3 — Modelo derivado de la distribución segmentaria.
 *
 * Se arma en `utilities/segmentacion.ts` a partir de una `IBioimpedancia`.
 *
 * El backend AHORA entrega masa por segmento medida por el equipo (diez llaves
 * `grasa_*_kg` / `musculo_*_kg`). Cuando vienen, se usan tal cual. Cuando el equipo no
 * hace bioimpedancia segmentaria y llegan `null`, se cae al reparto por coeficientes
 * antropométricos, y entonces —y solo entonces— la UI está obligada a declarar que la
 * cifra es estimada. Por eso cada valor viaja con su `origen`.
 *
 * Regla de nulabilidad heredada de la Capa 2: sin dato medido y sin total del que
 * repartir, el segmento queda en `null`. Nunca se sustituye por 0.
 */

/**
 * De dónde salió una cifra segmentaria.
 *
 * La distinción no es cosmética: `medido` lo reportó el equipo, `estimado` lo calculó
 * este front repartiendo un total. Mezclarlos en pantalla sin decirlo convertiría un
 * cálculo en una medición.
 */
export type OrigenSegmentario = 'medido' | 'estimado' | 'sinDato';

/** Origen del conjunto de los cinco segmentos. `mixto` = unos medidos y otros estimados. */
export type OrigenDistribucion = OrigenSegmentario | 'mixto';

/**
 * Los cinco segmentos que reciben masa.
 *
 * La cabeza no está aquí: es una región dibujable de la silueta, pero el equipo no le
 * asigna masa. Con datos medidos eso deja un residuo sin repartir (ver
 * `residuoGrasaKg`); con datos estimados se agrupa dentro del tronco.
 *
 * Izquierda y derecha son las del PACIENTE, no las del observador.
 */
export type SegmentoId = 'brazoIzq' | 'brazoDer' | 'tronco' | 'piernaIzq' | 'piernaDer';

/** Qué métrica colorea la silueta y alimenta los callouts. */
export type MetricaSegmentaria = 'grasa' | 'musculo';

/**
 * Estado clínico de una métrica según las escalas de `utilities/umbrales.ts`.
 *
 * `sinDato` no es un estado clínico: marca que el backend no entregó el valor y que
 * la región debe pintarse en neutro, no en verde.
 */
export type EstadoClinico = 'critico' | 'bajo' | 'normal' | 'alto' | 'sinDato';

export interface ISegmentoCorporal {
    id              : SegmentoId;
    nombre          : string;        // 'Brazo izquierdo' — etiqueta lista para la UI

    // Masa del segmento. `null` si no vino medida y tampoco hay total que repartir.
    grasaKg         : number | null;
    musculoKg       : number | null;

    // Qué es cada una de las dos cifras de arriba.
    origenGrasa     : OrigenSegmentario;
    origenMusculo   : OrigenSegmentario;

    // Fracción del TOTAL CORPORAL que aporta este segmento (0.541 → 54.1%).
    // Con datos medidos es una razón real, no un coeficiente aplicado, y por eso los
    // cinco no suman 1: falta el residuo de cabeza y cuello.
    fraccionGrasa   : number;
    fraccionMusculo : number;
}

export interface IDistribucionSegmentaria {
    fecha          : string;                                // de la bioimpedancia de origen
    segmentos      : Record<SegmentoId, ISegmentoCorporal>;

    // Estado global de cada métrica. Los cinco segmentos lo heredan: no existen
    // cortes de normalidad por extremidad y no se inventan.
    estadoGrasa    : EstadoClinico;
    estadoMusculo  : EstadoClinico;

    // Totales de origen, para el pie de la vista y para auditar el reparto.
    masaGrasaKg    : number | null;
    masaMuscularKg : number | null;

    // Origen del conjunto, para decidir qué advertencia muestra la UI.
    origenGrasa    : OrigenDistribucion;
    origenMusculo  : OrigenDistribucion;

    /**
     * Masa del total que los cinco segmentos no cubren: cabeza y cuello, que el equipo
     * no asigna a ninguna región.
     *
     * Solo tiene sentido con datos medidos; con datos estimados los coeficientes suman
     * exactamente 1 y el residuo es 0. `null` cuando falta el total o algún segmento.
     */
    residuoGrasaKg    : number | null;
    residuoMusculoKg  : number | null;
}

/** Variación de un segmento entre dos exámenes. Positivo = subió. */
export interface IDeltaSegmento {
    grasaKg   : number | null;
    musculoKg : number | null;
}

export interface IComparacionSegmentaria {
    fechaBase : string;                              // examen contra el que se compara
    deltas    : Record<SegmentoId, IDeltaSegmento>;
}
