/**
 * Tokens visuales del Home comercial.
 *
 * El proyecto no tiene `createTheme`: usa el tema por defecto de MUI. Estos valores no
 * lo reemplazan, lo extienden solo dentro de `home-ergo`. El ancla es `azulErgo`, que es
 * el mismo azul que ya pintan el `AppBar` de `Navigation.tsx` y el `Footer` global — la
 * portada tiene que verse parte del sistema, no un injerto.
 *
 * `pulso` es rojo de electrocardiograma y está reservado: solo el trazo ECG y un acento
 * puntual. Repartirlo por la página lo convertiría en decoración y perdería el vínculo
 * con lo que la empresa realmente vende.
 */
export const TEMA_HOME = {
    azulErgo     : '#1976d2',
    azulProfundo : '#0B2C4D',
    pulso        : '#E53935',
    hueso        : '#F5F7FA',
    grafito      : '#1C2733',
    borde        : '#DDE4EC',
} as const;

/** Ancho máximo de la columna de contenido. Coincide con el `maxWidth="xl"` del AppBar. */
export const ANCHO_MAXIMO = 1400;

/**
 * Estilo de las microetiquetas en mayúsculas que encabezan cada sección.
 *
 * La personalidad tipográfica de esta página tiene que salir del tratamiento y no de la
 * familia: agregar una fuente exigiría tocar `index.html`, que está fuera del alcance de
 * la Spec 01. De ahí el contraste fuerte entre estas etiquetas de 12 px muy espaciadas y
 * los titulares de peso 800 con tracking negativo.
 */
export const ETIQUETA_SECCION = {
    fontSize      : 12,
    fontWeight    : 700,
    letterSpacing : '0.18em',
    textTransform : 'uppercase',
} as const;

/** Titular de sección: pesado y compacto, para que contraste con la etiqueta. */
export const TITULAR_SECCION = {
    fontWeight    : 800,
    letterSpacing : '-0.02em',
    lineHeight    : 1.1,
} as const;
