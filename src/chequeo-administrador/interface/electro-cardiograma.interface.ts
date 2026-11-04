/** Cuerpo de `POST /electro-cardiograma/save`, el guardado de la revisión médica. */
export interface IElectroCardiograma {
    rut_paciente                 : string;
    id_paciente                  : number;
    estado_paciente              : string;
    frecuencia_cardiaca_paciente : number;
    derivacion_paciente          : string;
    observacion_paciente         : string;
    imc_paciente                 : string;
}

/**
 * Informe que devuelve `POST /GPT/analisis-ecg`, dentro de `analisis`.
 *
 * Todo es texto libre generado por un modelo: **se escapa antes de pintarlo** (§7.1 de la
 * spec). El módulo viejo lo interpolaba como HTML en Swal.
 */
export interface IAnalisisEcg {
    conclusion?          : string;
    nivel_urgencia?      : string;
    ritmo?               : string;
    frecuencia_cardiaca? : string | number;
    eje_electrico?       : string;
    intervalo_pr?        : string;
    complejo_qrs?        : string;
    qt?                  : string;
    qtc?                 : string;
    onda_p?              : string;
    segmento_st?         : string;
    onda_t?              : string;
    hipertrofias?        : string;
    bloqueos?            : string;
    arritmias?           : string;
    hallazgos?           : string;
}

export interface IRespuestaAnalisisEcg {
    analisis : IAnalisisEcg;
}
