/**
 * Tipos del mantenedor de imágenes del Home (Spec 02 del módulo, SPEC 03 del back).
 *
 * Se declaran aquí y no se importan de `src/home-ergo/` por la regla dura 1 del módulo. Ojo:
 * `IImagenHome` de este módulo es la fila **cruda** del back (id numérico, `seccion`), no la
 * forma ya repartida que pinta el Home público y que allí se llama igual.
 */

/** Sección de una imagen. Decide en qué bloque del Home sale. */
export type SeccionImagenHome = 'promocion' | 'alianza' | 'galeria';

/** Una fila de `GET home-imagenes/admin`: activas e inactivas. `src` es una URL absoluta. */
export interface IImagenHome {
    id      : number;
    seccion : SeccionImagenHome;
    src     : string;
    alt     : string;
    caption : string | null;
    activo  : boolean;
    orden   : number;
}

/**
 * Valores del diálogo «Agregar» / «Editar».
 *
 * `archivo` solo se usa al agregar: al editar no se cambia el archivo. `orden` en `null` deja
 * que el back ponga la imagen al final de su sección (`MAX(orden) + 1`).
 */
export interface IImagenHomeForm {
    archivo? : File | null;
    seccion  : SeccionImagenHome;
    alt      : string;
    caption  : string;
    orden    : number | null;
}

/**
 * Valores **crudos** del formulario del diálogo, tal como los guarda react-hook-form.
 *
 * `orden` es texto porque sale de un `TextField`: `''` significa «sin orden» y se traduce a
 * `null` al armar el `IImagenHomeForm`. Así el campo vacío no se convierte en un `0`.
 */
export interface IImagenHomeValores {
    archivo : File | null;
    seccion : SeccionImagenHome;
    alt     : string;
    caption : string;
    orden   : string;
}

/**
 * Sobre `{ success, message, data }` de los seis endpoints de `home-imagenes`.
 *
 * En los errores `error` es un texto (`"forbidden"`, `"not_found"`, el mensaje de la excepción)
 * **o** la lista de mensajes de validación en un 422; por eso no es solo `string`. Lo que se
 * muestra al usuario es siempre `message`, que en el 422 ya trae el primer error.
 */
export interface IRespuestaImagenHome<T> {
    success : boolean;
    message : string;
    data    : T;
    error?  : string | string[];
}
