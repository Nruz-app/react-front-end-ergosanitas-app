/**
 * Títulos de las secciones en las que se agrupa `custom-form.json`.
 *
 * El orden de este array es el orden en que se pintan. Una sección cuyos campos estén todos
 * ocultos para el perfil actual **no se renderiza** (ver `SeccionCampos`): para `Colegios`,
 * que no ve ningún campo con `disabledText: true`, eso deja solo «Identificación».
 */
export const SECCIONES_FORMULARIO: { id: string; titulo: string }[] = [
    { id : 'identificacion',  titulo : 'Identificación' },
    { id : 'signos-vitales',  titulo : 'Signos vitales' },
    { id : 'antropometria',   titulo : 'Antropometría' },
    { id : 'anamnesis',       titulo : 'Anamnesis' },
    { id : 'gestion',         titulo : 'Gestión' },
];
