/**
 * Capa 1 — Forma CRUDA del payload del backend.
 *
 * Estas interfaces reflejan el payload exactamente como llega, defectos incluidos
 * (typos en las llaves, números que vienen como string, campos duplicados).
 * Ningún componente importa estos tipos: los consume únicamente el mapper de
 * `utilities/mappers.ts`, que los traduce al modelo de UI.
 *
 * Regla: si el backend cambia, se cambia aquí y en el mapper. Nunca en la UI.
 */

// Bioimpedancia: numérica, snake_case, con nulls.
export interface IBioimpedanciaRaw {
    id                          : number;
    fecha_prueba                : string;        // 'YYYY-MM-DD'
    hora_prueba                 : string | null; // '18:18:08.000000'
    rut                         : string;
    nombre                      : string;
    edad                        : number;
    sexo                        : string;        // 'Hombre' | 'Mujer'
    club                        : string | null; // el mock trae un email aquí
    marca                       : string | null; // 'Fitdays'
    equipo                      : string | null;
    archivo                     : string | null; // PNG del equipo (no se usa)
    raw_json                    : string;        // payload duplicado (no se parsea)
    created_at                  : string;
    updated_at                  : string;

    // Antropometría y composición corporal
    peso_kg                     : number;
    estatura_cm                 : number;
    imc                         : number;
    grasa_corporal_pct          : number;
    masa_grasa_kg               : number;
    grasa_subcutanea_pct        : number;
    grasa_visceral              : number;
    masa_muscular_kg            : number;
    masa_musculo_esqueletico_kg : number;
    smi                         : number;
    proteinas_kg                : number;
    minerales_kg                : number | null; // el equipo del mock no lo reporta
    agua_corporal_total_kg      : number;
    masa_libre_grasa_kg         : number;        // reemplaza a `peso_sin_grasa_kg`
    whr                         : number;

    /**
     * Masa por segmento, MEDIDA por el equipo de bioimpedancia segmentaria.
     *
     * Estas diez llaves son la novedad del contrato: antes el payload solo traía
     * totales y el front repartía con coeficientes antropométricos. Un equipo sin
     * electrodos segmentarios las manda `null`, y en ese caso el front vuelve a estimar
     * (ver `utilities/segmentacion.ts`).
     *
     * Ojo: la suma de los cinco segmentos NO reproduce el total corporal. El equipo no
     * asigna cabeza ni cuello a ningún segmento, así que queda un residuo sin repartir.
     */
    grasa_brazo_izquierdo_kg    : number | null;
    grasa_brazo_derecho_kg      : number | null;
    grasa_tronco_kg             : number | null;
    grasa_pierna_izquierda_kg   : number | null;
    grasa_pierna_derecha_kg     : number | null;
    musculo_brazo_izquierdo_kg  : number | null;
    musculo_brazo_derecho_kg    : number | null;
    musculo_tronco_kg           : number | null;
    musculo_pierna_izquierda_kg : number | null;
    musculo_pierna_derecha_kg   : number | null;

    // Metabolismo y metas
    tasa_metabolica_basal_kcal  : number;
    edad_corporal               : number;
    puntaje_corporal            : number;
    peso_objetivo_kg            : number;
    control_peso_kg             : number;        // negativo = debe bajar
    control_grasa_kg            : number | null; // negativo = debe bajar
    control_musculo_kg          : number | null; // positivo = debe subir
    tipo_corporal               : string;        // 'Obesidad' | 'Normal' | …

    // Trazabilidad de la extracción (el payload sale de leer el PNG del equipo)
    calidad_extraccion          : string | null; // 'buena' | …
    asimetrias_relevantes       : string | null; // hallazgo de asimetría entre lados
}

// Electrocardiograma: TODO llega como string o null, incluidos los números.
export interface IElectrocardiogramaRaw {
    id_electro                   : number;
    id_chequeo                   : number;
    rut_paciente                 : string;
    fecha_atencion               : string;        // '2026-04-24 04:00:00.000000'
    created_at_electro           : string;
    updated_at_electro           : string;

    // Antropometría (tres campos de IMC, solo uno viene poblado)
    peso                         : string | null;
    estatura                     : string | null; // '1.47' → METROS
    imc                          : string | null; // '' en el mock
    imc_electro                  : string | null; // null en el mock
    imc_paciente                 : string | null; // '17.1' ← el bueno

    // Signos vitales
    presion_sistolica            : string | null; // '107'
    presionArterial              : string | null; // '74' → es la DIASTÓLICA
    frecuencia_cardiaca_paciente : string | null; // '84'
    pulso                        : string | null; // null en el mock
    saturacionOxigeno            : string | null;
    hemoglucotest                : string | null;
    temperatura                  : string | null;
    edad                         : string | null; // congelada a la fecha del examen

    // Evaluación clínica
    status                       : string | null; // 'REVISION MEDICA'
    estado_paciente              : string | null; // 'Normal'
    derivacion_paciente          : string | null; // 'na'
    observacion_paciente         : string | null; // lectura del ECG, multilínea
    Recuperacion                 : string | null; // capital R: así llega
    sistemaCardiovascular        : string | null;
    sistemaOsteoarticular        : string | null;
    gradoIncidenciaPosterio      : string | null; // nombre truncado: así llega

    // Antecedentes (viven aquí, no en `paciente`)
    enfermedadesCronicas         : string | null;
    medicamentosDiarios          : string | null;
    enfermedadesAnteriores       : string | null;
}

/**
 * Identidad del paciente.
 *
 * Solo `rut` viene garantizado: es el parámetro con el que se consultó el endpoint. El
 * resto llega `null` cuando el backend no tiene la ficha demográfica de ese RUT — caso
 * real y verificado contra `/api/ficha-clinica/16900918-k`, que responde 200 con
 * `{"rut":"16900918-k","sexo":null,"nombre":null,"fechaNacimiento":null}`.
 */
export interface IPacienteRaw {
    rut             : string;
    nombre          : string | null;
    sexo            : string | null;
    fechaNacimiento : string | null;   // 'YYYY-MM-DD'
}

/**
 * Sobre de la respuesta.
 *
 * Las dos listas llegan `null` —no `[]`— cuando el paciente no tiene exámenes de ese
 * tipo, y es lo habitual: un RUT con bioimpedancias suele no tener electros y viceversa.
 * El mapper las normaliza a array vacío.
 */
export interface IFichaClinicaResponse {
    success : boolean;
    message : string;
    data    : {
        ficha_clinica: {
            paciente            : IPacienteRaw;
            bioimpedancias      : IBioimpedanciaRaw[] | null;
            electrocardiogramas : IElectrocardiogramaRaw[] | null;
        };
    };
}
