import type { SeccionImagenHome } from '../interface';
import { IMAGENES } from './tema';

/**
 * Configuración del mantenedor de imágenes del Home (Spec 02).
 *
 * Etiquetas, orden de las secciones y límites de la subida viven aquí para que ningún `.tsx`
 * los escriba a mano. Los límites son **los mismos del back** (SPEC 03: `mimes:jpg,jpeg,png,webp`,
 * `max:5120`): se validan en el front para rechazar antes de subir, y el back los vuelve a validar.
 */

/** Secciones en el orden en que el back las lista y el filtro las muestra. */
export const SECCIONES_IMAGEN: SeccionImagenHome[] = ['promocion', 'alianza', 'galeria'];

/** Nombre corto para el chip de la carta y el filtro. */
export const ETIQUETA_SECCION: Record<SeccionImagenHome, string> = {
    promocion : 'Promociones',
    alianza   : 'Alianzas',
    galeria   : 'Galería de operativos',
};

/** Color de cada sección en el chip de la carta y en el filtro. El hex vive en `tema.ts`. */
export const COLOR_SECCION: Record<SeccionImagenHome, string> = {
    promocion : IMAGENES.seccionPromocion,
    alianza   : IMAGENES.seccionAlianza,
    galeria   : IMAGENES.seccionGaleria,
};

/** Tipos de archivo aceptados por el back. */
export const MIME_IMAGEN_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp'];

/** Valor del `accept` del `<input type="file">`. */
export const ACCEPT_IMAGEN = '.jpg,.jpeg,.png,.webp';

/** 5 MB, el `max:5120` (KB) del back. */
export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

/** Límites de texto del back. */
export const MAXIMO_ALT = 255;
export const MAXIMO_CAPTION = 150;

/** Cartas por tanda en la grilla («Ver más»). */
export const IMAGENES_POR_PAGINA = 24;
