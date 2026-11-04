/**
 * Tokens visuales del módulo `servicio-cart-flow` (Spec 01): **la única fuente de color**.
 * Ningún `.tsx` escribe un hex. Parte de la paleta que ya pinta `/servicios` (tarjetas celestes,
 * botón navy, chip de precio verde lima) para que el cambio de flujo no cambie la marca.
 */
export const COLORES = {
    primario       : '#0ea5e9',
    primarioClaro  : '#38bdf8',
    primarioOsc    : '#0284c7',
    navy           : '#082f49',
    navyHover      : '#0c4a6e',
    fondoApp       : '#e0f2fe',
    fondoAppSuave  : '#f8fafc',
    fondoPanel     : 'rgba(255,255,255,0.85)',
    bordePanel     : 'rgba(255,255,255,0.4)',
    borde          : '#e2e8f0',
    fondoSutil     : '#f1f5f9',
    texto          : '#0f172a',
    textoSuave     : '#64748b',
    blanco         : '#ffffff',
    sombraTarjeta  : 'rgba(14,165,233,0.25)',
};

export const UI = {
    precioFondo    : '#bef264',
    precioTexto    : '#365314',
    exito          : '#16a34a',
    exitoFondo     : '#dcfce7',
    alerta         : '#b45309',
    alertaFondo    : '#fef3c7',
    error          : '#b91c1c',
    errorFondo     : '#fee2e2',
    info           : '#0369a1',
    infoFondo      : '#e0f2fe',
};

/** Degradado de fondo de la página. */
export const FONDO_PAGINA = `linear-gradient(to bottom, ${COLORES.fondoApp}, ${COLORES.fondoAppSuave})`;

/** Degradado de una tarjeta de producto. */
export const FONDO_TARJETA = `linear-gradient(135deg, ${COLORES.primarioClaro} 0%, ${COLORES.primario} 100%)`;
