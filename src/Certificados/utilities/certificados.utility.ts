import type { IBotonTarjeta, ICertificadosConsulta, TipoDocumento } from '../interface';

/** Mismo formato que valida el back: 7 u 8 dígitos, guion y dígito verificador (0-9 o k). */
export const REGEX_RUT = /^\d{7,8}-[\dkK]$/;

/** Quita puntos y espacios: el usuario suele pegar el RUT con formato 11.111.111-1. */
export const limpiarRut = (valor: string): string => valor.replace(/[.\s]/g, '');

/** 'YYYY-MM-DD' → 'DD-MM-YYYY'; sin fecha se pinta «—». */
export const formatearFecha = (fecha: string | null): string => {

    if (!fecha) return '—';

    const [anio, mes, dia] = fecha.split('-');

    return anio && mes && dia ? `${dia}-${mes}-${anio}` : fecha;
};

/** Mensaje del back en un 4xx (sobre `{ success, message }`), si viene. Un 5xx usa el texto genérico. */
export const mensajeDelError = (problema: unknown): string | null => {

    const respuesta = (problema as { response?: { status?: number; data?: { message?: unknown } } })?.response;
    const mensaje = respuesta?.data?.message;

    return respuesta?.status && respuesta.status < 500 && typeof mensaje === 'string' ? mensaje : null;
};

/** Status HTTP que `descargarDocumento` adjunta al error, o null si fue un fallo de red. */
export const statusDelError = (problema: unknown): number | null => {

    const status = (problema as { status?: unknown })?.status;

    return typeof status === 'number' ? status : null;
};

/** «Paciente Ficticio» → «Paciente-Ficticio», solo ASCII para el nombre del archivo. */
export const nombreParaArchivo = (nombre: string | null): string =>
    (nombre ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^A-Za-z0-9-]/g, '');

/** Botones de una tarjeta: solo los `tipos` que vinieron en la respuesta y tienen texto en config. */
export const botonesDe = (
    resultado: ICertificadosConsulta,
    tipos: TipoDocumento[],
    config: Partial<Record<TipoDocumento, { etiqueta: string; ariaLabel: string }>>,
    prefijoArchivo: string,
): IBotonTarjeta[] => {

    const sufijo = nombreParaArchivo(resultado.nombre);

    return resultado.documentos
        .filter(({ tipo }) => tipos.includes(tipo) && config[tipo] !== undefined)
        .map((documento) => ({
            documento,
            etiqueta: config[documento.tipo]?.etiqueta ?? '',
            ariaLabel: config[documento.tipo]?.ariaLabel ?? '',
            nombreArchivo: `${prefijoArchivo}${sufijo ? `-${sufijo}` : ''}.pdf`,
        }));
};

/** La URL firmada ya venció según `expira` (ISO 8601). Los archivos públicos (`null`) no vencen. */
export const urlVencida = (expira: string | null): boolean =>
    expira !== null && new Date(expira).getTime() <= Date.now();

/** Guarda un blob como archivo sin navegar. */
export const guardarBlob = (blob: Blob, nombreArchivo: string): void => {

    const enlace = document.createElement('a');
    const objeto = URL.createObjectURL(blob);

    enlace.href = objeto;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    // Revocar en el mismo tick puede cancelar la descarga en algunos navegadores.
    setTimeout(() => URL.revokeObjectURL(objeto), 10000);
};
