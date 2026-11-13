import type { IDocumentoCertificado } from './certificados-consulta.interface';

/** Un botón de descarga dentro de una tarjeta de examen. */
export interface IBotonTarjeta {
    documento     : IDocumentoCertificado;
    etiqueta      : string;
    ariaLabel     : string;
    /** Nombre con que se guarda el PDF, p. ej. «Certificado-Paciente-Ficticio.pdf». */
    nombreArchivo : string;
}
