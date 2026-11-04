/** Certificado ya emitido, tal como lo devuelve `GET /certificado/{rut}`. */
export interface ICertificadoUrl {
    id           : number;
    rut_paciente : string;
    url_pdf?     : string;
    name_pdf     : string;
    titulo       : string;
    created_at   : string;
    updated_at   : string;
}
