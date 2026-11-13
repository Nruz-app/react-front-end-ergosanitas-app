/**
 * Contrato de `POST {API}/certificados/consulta` (SPEC 07 del back), copiado tal cual.
 */

export type TipoDocumento = 'certificado_ecg' | 'ecg' | 'certificado_bio' | 'bio';

export interface IDocumentoCertificado {
    tipo   : TipoDocumento;
    /** 'YYYY-MM-DD'; la UI muestra «—» si es null. */
    fecha  : string | null;
    url    : string;
    /** ISO 8601 de vencimiento de la URL firmada; null en los archivos públicos. */
    expira : string | null;
}

export interface ICertificadosConsulta {
    rut        : string;
    nombre     : string | null;
    documentos : IDocumentoCertificado[];
}

export interface ICertificadosConsultaResponse {
    success : boolean;
    message : string;
    data    : ICertificadosConsulta | null;
}
