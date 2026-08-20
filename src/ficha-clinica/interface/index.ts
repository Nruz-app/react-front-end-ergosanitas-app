// Capa 1 — forma cruda del payload del backend (solo la consume el mapper).
export type {
    IPacienteRaw,
    IBioimpedanciaRaw,
    IElectrocardiogramaRaw,
    IFichaClinicaResponse,
} from './api.interface';

// Capa 2 — modelo de UI (lo que consumen los componentes).
export type {
    IAntecedentes,
    IPacienteBase,
    IBioimpedancia,
    IElectrocardiograma,
    IFichaClinica,
} from './ficha-clinica.interface';

// Capa 3 — modelo derivado de la distribución segmentaria.
export type {
    SegmentoId,
    MetricaSegmentaria,
    EstadoClinico,
    OrigenSegmentario,
    OrigenDistribucion,
    ISegmentoCorporal,
    IDistribucionSegmentaria,
    IDeltaSegmento,
    IComparacionSegmentaria,
} from './segmentaria.interface';
