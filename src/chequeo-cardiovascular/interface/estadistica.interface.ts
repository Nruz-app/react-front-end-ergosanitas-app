/** Serie para los gráficos de torta del Home (IMC, hemoglucotest, saturación). */
export interface IEstadistica {
    labels      : string[];
    data        : number[];
    totalExamen : number;
}

/** Serie para el gráfico de barras de presión. */
export interface IEstadisticaPresion {
    total_paciente : number;
    labels         : string[];
    data           : number[];
}
