/** Respuesta de `POST /certificado/path-url`: la URL del ECG de un deportista. */
export interface IUrlCertificado {
    status   : number;
    url_pdf  : string;
    name_pdf : string;
    titulo   : string;
}
