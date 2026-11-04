/**
 * Títulos de las secciones en las que se agrupa `custom-form.json`.
 *
 * El orden de este array es el orden en que se pintan. Una sección sin campos visibles **no se
 * renderiza** (ver `SeccionCampos`), pero el Administrador ve los 25 campos, así que para él
 * salen siempre las cinco.
 *
 * Copia de la de `chequeo-cardiovascular`, no un import: los dos módulos son hermanos
 * independientes.
 */
export const SECCIONES_FORMULARIO: { id: string; titulo: string }[] = [
    { id : 'identificacion',  titulo : 'Identificación' },
    { id : 'signos-vitales',  titulo : 'Signos vitales' },
    { id : 'antropometria',   titulo : 'Antropometría' },
    { id : 'anamnesis',       titulo : 'Anamnesis' },
    { id : 'gestion',         titulo : 'Gestión' },
];

/**
 * La sección cuyos campos son obligatorios (D4 b). El resto solo se valida en formato, y solo
 * si viene relleno, para no bloquear las fichas parciales que hoy se guardan.
 */
export const SECCION_OBLIGATORIA = 'identificacion';
