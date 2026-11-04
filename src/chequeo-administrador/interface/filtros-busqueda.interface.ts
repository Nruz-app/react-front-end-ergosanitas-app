/**
 * Cuerpo de búsqueda que `search-chequeo` recibe junto al `user_email`.
 *
 * Vive en `interface/` y no en el contexto para que el servicio no dependa de React: el
 * `LikeTextProvider` del módulo usa este mismo tipo como estado.
 */
export interface IFiltrosBusqueda {
    /** Texto libre: RUT o nombre. */
    textoValue    : string;
    /** Fecha de atención en texto, `''` si no se filtra por fecha. */
    fechaCalendar : string;
    /** `user_email` del club elegido, `''` si no se filtra por club. */
    selectClub    : string;
}
