export {
    aNumero,
    primerValor,
    aFechaISO,
    aHoraCorta,
    aCentimetros,
    calcularEdad,
} from './parse';

export { mapFichaClinica } from './mappers';

// Escalas clínicas de referencia (adulto) y clasificación de valores.
export { ESCALAS, clasificar, describirEscala, peorEstado, clasificarHallazgo } from './umbrales';
export type { ITramoClinico, IEscalaClinica, EscalaId } from './umbrales';

// Distribución segmentaria: valores MEDIDOS por el equipo, con estimación de respaldo
// cuando un segmento no viene. Cada cifra sabe de cuál de los dos casos salió.
export {
    SEGMENTOS,
    normalizarSexo,
    calcularDistribucion,
    estadoDeMetrica,
    origenDeMetrica,
    totalDeMetrica,
    residuoDeMetrica,
    valorDeMetrica,
    fraccionDeMetrica,
    origenDeSegmento,
    compararDistribuciones,
} from './segmentacion';
export type { SexoNormalizado } from './segmentacion';
