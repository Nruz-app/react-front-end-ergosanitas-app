import * as Yup from 'yup';

import {
    ACCEPT_IMAGEN, MAXIMO_ALT, MAXIMO_CAPTION, MIME_IMAGEN_ACEPTADOS, SECCIONES_IMAGEN, TAMANO_MAXIMO_IMAGEN,
} from '../config/imagenes-home';
import type { IImagenHome, IImagenHomeForm, IImagenHomeValores } from '../interface';

/**
 * ¿Es un tipo aceptado? Por `type` (MIME) y, si el navegador lo entrega vacío —pasa con `.webp`
 * en algunos Windows—, por la extensión del nombre. El back lo vuelve a validar igual.
 */
const esImagenAceptada = (archivo: File): boolean => {

    if (archivo.type) return MIME_IMAGEN_ACEPTADOS.includes(archivo.type);

    const extension = archivo.name.slice(archivo.name.lastIndexOf('.')).toLowerCase();

    return ACCEPT_IMAGEN.split(',').includes(extension);
};

/** Entero ≥ 0 escrito a mano. Vacío también vale: el back pone la imagen al final. */
const ENTERO_NO_NEGATIVO = /^\d+$/;

/**
 * Esquema del diálogo «Agregar» / «Editar» imagen (Spec 02), con los mismos límites que valida
 * el back (SPEC 03). Rechazar en el front evita subir 5 MB para recibir un 422.
 *
 * `archivo` solo se exige al **agregar**: al editar el archivo no cambia (para cambiarlo se
 * elimina y se vuelve a agregar).
 */
export const imagenHomeValidationSchema = (agregando: boolean) => Yup.object({

    archivo: Yup.mixed<File>()
        .nullable()
        .test('requerido', 'Debe adjuntar una imagen', (archivo) => !agregando || archivo instanceof File)
        .test('tipo', 'La imagen debe ser JPG, PNG o WEBP', (archivo) =>
            !(archivo instanceof File) || esImagenAceptada(archivo))
        .test('tamano', 'La imagen no puede superar los 5 MB', (archivo) =>
            !(archivo instanceof File) || archivo.size <= TAMANO_MAXIMO_IMAGEN),

    seccion: Yup.mixed<IImagenHomeValores['seccion']>()
        .oneOf(SECCIONES_IMAGEN, 'Elija una sección')
        .required('La sección es obligatoria'),

    alt: Yup.string()
        .trim()
        .required('El texto alternativo es obligatorio')
        .max(MAXIMO_ALT, `El texto alternativo no puede superar los ${MAXIMO_ALT} caracteres`),

    caption: Yup.string()
        .trim()
        .max(MAXIMO_CAPTION, `El título no puede superar los ${MAXIMO_CAPTION} caracteres`),

    orden: Yup.string()
        .trim()
        .test('entero', 'El orden debe ser un número entero mayor o igual a 0', (orden) =>
            !orden || ENTERO_NO_NEGATIVO.test(orden)),
});

/** Valores con que se abre el diálogo: vacíos al agregar, los de la carta al editar. */
export const valoresInicialesImagen = (imagen: IImagenHome | null): IImagenHomeValores => ({
    archivo : null,
    seccion : imagen?.seccion ?? 'promocion',
    alt     : imagen?.alt ?? '',
    caption : imagen?.caption ?? '',
    orden   : imagen ? String(imagen.orden) : '',
});

/** Del formulario al cuerpo del servicio: textos recortados y `orden` vacío como `null`. */
export const aFormularioImagen = (valores: IImagenHomeValores): IImagenHomeForm => {

    const orden = valores.orden.trim();

    return {
        archivo : valores.archivo,
        seccion : valores.seccion,
        alt     : valores.alt.trim(),
        caption : valores.caption.trim(),
        orden   : orden === '' ? null : Number(orden),
    };
};
