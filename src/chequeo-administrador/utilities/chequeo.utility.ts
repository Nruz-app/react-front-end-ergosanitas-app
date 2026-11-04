import dayjs from 'dayjs';

import type { IEstadoProps } from '../interface';

/** «JUAN PEREZ GONZALEZ» → «Juan Perez Gonzalez». */
export const capitalizarPalabras = (texto?: string): string => {

    if (!texto) return '';

    return texto
        .toLowerCase()
        .split(' ')
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
};

/**
 * Fecha de la columna «Fech Aten»: la de atención, o la de creación si no hay. Solo el día,
 * en ISO. Devuelve `''` si no hay ninguna o no es una fecha válida (el original lanzaba
 * `RangeError` con una fecha inválida y tumbaba la tabla entera).
 */
export const fechaAtencionDeFila = (fecha_atencion?: string, created_at?: string): string => {

    const fecha = fecha_atencion ?? created_at;
    if (!fecha) return '';

    const d = new Date(fecha);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

/**
 * Color del chip por estado clínico.
 *
 * Son **strings literales del backend** (ver `EstadoPaciente`), con sus espacios y puntos: un
 * typo no rompe nada, simplemente cae en `default` y el estado pierde su color sin avisar.
 * Sin estado se pinta «—», el marcador de ausencia de todo el proyecto.
 */
export const getEstadoProps = (estado?: string): IEstadoProps => {

    if (!estado) return { label: '—', color: 'default' };

    switch (estado) {
        case 'ingresado'             : return { label: estado, color: 'default' };
        case 'Testiado'              : return { label: estado, color: 'primary' };
        case 'ECG FOTO'              : return { label: estado, color: 'secondary' };
        case 'REVISION MEDICA'       : return { label: estado, color: 'info' };
        case 'En Rev. Cardio'        : return { label: estado, color: 'info' };
        case 'Diag. Card. - Normal'  : return { label: estado, color: 'success' };
        case 'Diag. Card. - Alterado': return { label: estado, color: 'error' };
        default                      : return { label: estado, color: 'default' };
    }
};

/**
 * Marca como «reciente» solo lo que está en `ECG FOTO` de los últimos `dias` días. Es lo que
 * la lista destaca. Mismo criterio que `isRecent` de `src/Chequeo/`.
 */
export const esReciente = (
    fecha  : string | undefined,
    estado : string | undefined,
    dias   : number = 3,
): boolean => {

    if (!fecha || !estado) return false;
    if (estado !== 'ECG FOTO') return false;

    return dayjs().diff(dayjs(fecha), 'day') <= dias;
};

/**
 * ¿El certificado es un PDF? Decide si el visor usa `<iframe>` o `<img>`. Mismo criterio que el
 * original: la extensión tras el último punto, y sin URL se trata como imagen.
 */
export const esPdf = (url?: string): boolean => {

    if (!url) return false;

    const partes = url.split('.');
    return partes[partes.length - 1].toLowerCase() === 'pdf';
};

/**
 * Escapa texto para interpolarlo en el `html` de Swal.
 *
 * El informe de `GPT/analisis-ecg` es texto libre de un modelo; el módulo viejo lo metía tal
 * cual en el `html:`, así que un `<img onerror>` en la respuesta se ejecutaba en la sesión del
 * Administrador (§7.1). Con esto un `<b>` se ve literal, no en negrita.
 */
export const escaparHtml = (valor?: string | number | null): string => {

    if (valor === null || valor === undefined) return '';

    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};
