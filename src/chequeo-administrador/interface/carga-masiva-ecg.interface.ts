/** Respuesta de `POST /carga-masiva-ecg`: un resumen y una fila por PDF procesado. */
export interface ICargaMasivaEcg {
    success    : boolean;
    total      : number;
    procesados : IProcesadoEcg[];
}

/**
 * Una fila del resultado de la carga masiva de ECG.
 *
 * En `src/Chequeo/` este tipo se llama `ÏProcesados`, con diéresis: aquí no se hereda la errata.
 */
export interface IProcesadoEcg {
    archivo    : string;
    rut        : string;
    id_chequeo : number | string;
    nombre     : string;
    status     : string;
    resultado  : 'OK' | 'ERROR';
    mensaje    : string;
}
