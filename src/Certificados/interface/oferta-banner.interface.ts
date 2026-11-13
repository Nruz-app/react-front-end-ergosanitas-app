/**
 * Fila cruda de `GET {API}/home-imagenes` (SPEC 03 del back).
 *
 * Es una copia, no un import: la regla de aislamiento del módulo prohíbe depender de las interfaces
 * de la portada. Mismo precedente que `chequeo-administrador/interface/imagen-home.interface.ts`.
 */
export interface IHomeImagenApi {
    id      : number;
    seccion : 'promocion' | 'alianza' | 'galeria';
    /** URL absoluta del back. */
    src     : string;
    alt     : string;
    caption : string | null;
    activo  : boolean;
    orden   : number;
}

/** Sobre `{ success, message, data }` con el que responde `GET home-imagenes`. */
export interface IRespuestaHomeImagenes {
    success : boolean;
    message : string;
    data    : IHomeImagenApi[];
}

/** Lo que pinta el banner de ofertas mientras se busca un RUT (SPEC 02 de certificados). */
export interface IOfertaBanner {
    id      : number;
    src     : string;
    alt     : string;
    /** `null` si el Administrador no le puso pie de foto: el banner usa el `alt` en su lugar. */
    caption : string | null;
}

/** Estado de la carga de ofertas. Con `error`, o `listo` sin ofertas, la búsqueda usa el spinner. */
export type EstadoOfertas = 'cargando' | 'listo' | 'error';
