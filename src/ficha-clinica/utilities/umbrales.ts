/**
 * Escalas clínicas de referencia y clasificación de valores.
 *
 * Función pura y tablas de datos, sin dependencias de UI.
 *
 * ⚠️ TODAS las escalas de este archivo son de POBLACIÓN ADULTA (OMS / AHA / ADA).
 * No son válidas en pediatría, donde la evaluación se hace por percentiles según
 * edad y sexo. La UI está obligada a rotularlo: ver el pie del tab de distribución
 * segmentaria. El día que existan tablas pediátricas, se agregan aquí sin tocar
 * ningún componente.
 *
 * Convención de los cortes: `hasta` es el límite superior INCLUSIVO del tramo, y
 * se expresa con la misma resolución con la que el backend reporta el dato (un
 * decimal). Por eso el corte de bajo peso es 18.4 y no 18.5: un IMC de 18.5 debe
 * caer en 'normal'.
 */

import { EstadoClinico } from '../interface';

/** Un tramo de la escala. `hasta: null` cierra la escala por arriba. */
export interface ITramoClinico {
    hasta  : number | null;
    estado : EstadoClinico;
}

export interface IEscalaClinica {
    etiqueta   : string;
    unidad     : string;
    referencia : string;          // se muestra en la UI: el usuario debe ver el origen del corte
    tramos     : ITramoClinico[]; // ordenados de menor a mayor
}

/**
 * Escalas por métrica.
 *
 * Los tramos van ordenados ascendentemente y `clasificar` devuelve el primero cuyo
 * techo alcanza al valor. La estructura soporta las dos direcciones sin casos
 * especiales: en la grasa lo malo está arriba, en la saturación abajo, y hay
 * métricas como la presión donde lo malo está en los dos extremos.
 */
export const ESCALAS = {

    // ── Composición corporal ────────────────────────────────────────────────

    grasaMasculino: {
        etiqueta: 'Grasa corporal',
        unidad: '%',
        referencia: 'Adulto masculino (OMS)',
        tramos: [
            { hasta: 7.9,  estado: 'bajo'    },
            { hasta: 20,   estado: 'normal'  },
            { hasta: 25,   estado: 'alto'    },
            { hasta: null, estado: 'critico' },
        ],
    },

    grasaFemenino: {
        etiqueta: 'Grasa corporal',
        unidad: '%',
        referencia: 'Adulto femenino (OMS)',
        tramos: [
            { hasta: 20.9, estado: 'bajo'    },
            { hasta: 33,   estado: 'normal'  },
            { hasta: 39,   estado: 'alto'    },
            { hasta: null, estado: 'critico' },
        ],
    },

    /**
     * Índice de masa músculo-esquelética. Es el indicador que evalúa el estado de
     * la masa muscular en la silueta.
     *
     * Cortes de sarcopenia del EWGSOP2, que son sexo-específicos: por debajo de
     * 7.0 en hombres y de 5.5 en mujeres hay masa muscular disminuida. Aquí lo
     * bajo es lo patológico y no existe un techo clínico, así que el tramo
     * superior es 'normal' y no 'alto'.
     */
    smiMasculino: {
        etiqueta: 'Índice músculo-esquelético',
        unidad: 'kg/m²',
        referencia: 'Adulto masculino (EWGSOP2)',
        tramos: [
            { hasta: 6.0,  estado: 'critico' },
            { hasta: 6.9,  estado: 'bajo'    },
            { hasta: null, estado: 'normal'  },
        ],
    },

    smiFemenino: {
        etiqueta: 'Índice músculo-esquelético',
        unidad: 'kg/m²',
        referencia: 'Adulto femenino (EWGSOP2)',
        tramos: [
            { hasta: 4.5,  estado: 'critico' },
            { hasta: 5.4,  estado: 'bajo'    },
            { hasta: null, estado: 'normal'  },
        ],
    },

    imc: {
        etiqueta: 'IMC',
        unidad: 'kg/m²',
        referencia: 'Adulto (OMS)',
        tramos: [
            { hasta: 18.4, estado: 'bajo'    },
            { hasta: 24.9, estado: 'normal'  },
            { hasta: 29.9, estado: 'alto'    },
            { hasta: null, estado: 'critico' },
        ],
    },

    // ── Signos vitales ──────────────────────────────────────────────────────

    presionSistolica: {
        etiqueta: 'Presión sistólica',
        unidad: 'mmHg',
        referencia: 'Adulto (AHA)',
        tramos: [
            { hasta: 89,   estado: 'bajo'    },   // hipotensión
            { hasta: 119,  estado: 'normal'  },
            { hasta: 139,  estado: 'alto'    },
            { hasta: null, estado: 'critico' },   // hipertensión grado 2
        ],
    },

    presionDiastolica: {
        etiqueta: 'Presión diastólica',
        unidad: 'mmHg',
        referencia: 'Adulto (AHA)',
        tramos: [
            { hasta: 59,   estado: 'bajo'    },
            { hasta: 79,   estado: 'normal'  },
            { hasta: 89,   estado: 'alto'    },
            { hasta: null, estado: 'critico' },
        ],
    },

    frecuenciaCardiaca: {
        etiqueta: 'Frecuencia cardíaca',
        unidad: 'ppm',
        referencia: 'Adulto en reposo (AHA)',
        tramos: [
            { hasta: 49,   estado: 'bajo'    },   // bradicardia
            { hasta: 100,  estado: 'normal'  },
            { hasta: 120,  estado: 'alto'    },   // taquicardia
            { hasta: null, estado: 'critico' },
        ],
    },

    /** Escala invertida: lo grave está abajo. Nunca hay saturación "demasiado alta". */
    saturacionOxigeno: {
        etiqueta: 'Saturación O₂',
        unidad: '%',
        referencia: 'Adulto (AHA)',
        tramos: [
            { hasta: 90,   estado: 'critico' },
            { hasta: 94,   estado: 'bajo'    },
            { hasta: null, estado: 'normal'  },
        ],
    },

    hemoglucotest: {
        etiqueta: 'Hemoglucotest',
        unidad: 'mg/dL',
        referencia: 'Adulto en ayuno (ADA)',
        tramos: [
            { hasta: 69,   estado: 'bajo'    },   // hipoglicemia
            { hasta: 99,   estado: 'normal'  },
            { hasta: 125,  estado: 'alto'    },   // prediabetes
            { hasta: null, estado: 'critico' },
        ],
    },

    temperatura: {
        etiqueta: 'Temperatura',
        unidad: '°C',
        referencia: 'Adulto (OMS)',
        tramos: [
            { hasta: 35.9, estado: 'bajo'    },   // hipotermia
            { hasta: 37.4, estado: 'normal'  },
            { hasta: 38.4, estado: 'alto'    },   // febrícula
            { hasta: null, estado: 'critico' },   // fiebre alta
        ],
    },

} as const satisfies Record<string, IEscalaClinica>;

/** Nombre de escala válido, para tipar quien las selecciona. */
export type EscalaId = keyof typeof ESCALAS;

/**
 * Clasifica un valor dentro de una escala.
 *
 * Un valor ausente devuelve 'sinDato', nunca 'normal': la falta de medición no es
 * un resultado normal, y la silueta debe pintarse en neutro cuando eso pasa.
 */
export const clasificar = (
    valor: number | null | undefined,
    escala: IEscalaClinica,
): EstadoClinico => {

    if (valor === null || valor === undefined || !Number.isFinite(valor)) return 'sinDato';

    for (const tramo of escala.tramos) {
        if (tramo.hasta === null || valor <= tramo.hasta) return tramo.estado;
    }

    // Inalcanzable si la escala cierra con `hasta: null`, que es la convención.
    // Se devuelve 'sinDato' antes que inventar un estado para una escala mal formada.
    return 'sinDato';
};

/** Texto legible del corte aplicado, para mostrar junto al valor en la UI. */
export const describirEscala = (escala: IEscalaClinica): string =>
    `${escala.etiqueta} — referencia ${escala.referencia}`;

/**
 * Severidad relativa, para poder combinar varios estados en uno.
 *
 * `sinDato` es el mínimo a propósito: al resumir la presión y la frecuencia en un solo
 * marcador, que falte una de las dos no debe borrar el hallazgo de la otra.
 */
const SEVERIDAD: Record<EstadoClinico, number> = {
    sinDato : 0,
    normal  : 1,
    bajo    : 2,
    alto    : 3,
    critico : 4,
};

/** El peor de varios estados. Devuelve 'sinDato' solo si ninguno tiene dato. */
export const peorEstado = (...estados: EstadoClinico[]): EstadoClinico =>
    estados.reduce<EstadoClinico>(
        (peor, actual) => (SEVERIDAD[actual] > SEVERIDAD[peor] ? actual : peor),
        'sinDato',
    );

/** Texto del backend que significa "no hay hallazgos". */
const SIN_HALLAZGOS = ['sin alteraciones', 'normal', 'no presenta', 'na'];

/**
 * Clasifica un campo de evaluación clínica que llega como TEXTO libre, no como número.
 *
 * Los campos `sistemaOsteoarticular`, `sistemaCardiovascular` y `Recuperacion` traen
 * frases ('Sin Alteraciones', 'Extrasístole supraventricular aislada'). No hay escala
 * numérica que aplicar: lo único que se puede afirmar es si el médico anotó un hallazgo
 * o no. Por eso cualquier texto que no esté en la lista de "sin hallazgos" se marca como
 * 'alto' y nunca como 'critico': la gravedad la determina el médico, no una comparación
 * de strings.
 */
export const clasificarHallazgo = (texto: string | null | undefined): EstadoClinico => {

    const limpio = (texto ?? '').trim().toLowerCase();

    if (limpio === '') return 'sinDato';

    return SIN_HALLAZGOS.includes(limpio) ? 'normal' : 'alto';
};
