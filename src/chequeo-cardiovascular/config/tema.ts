import type { SxProps, Theme } from '@mui/material';

/**
 * Tokens visuales del módulo.
 *
 * Antes de la Spec 02 cada tarjeta y cada gráfico traía sus colores escritos a mano, y el verde
 * de «normal» no era el mismo en todas partes. Aquí el color **significa** algo y significa lo
 * mismo en todas las tarjetas del Home.
 *
 * Los cinco primeros se separan también en **luminosidad**, no solo en tono, para que sigan
 * distinguiéndose en deuteranopía. Aun así el color nunca es la única vía: cada gráfico lleva
 * su tabla accesible con los valores exactos.
 */
export const COLORES = {
    // Familia clínica: el significado de un resultado.
    normal        : '#1B9E77',
    limite        : '#E6A700',
    limiteAlto    : '#C2620A',
    alterado      : '#D64550',
    pendiente     : '#6C8EBF',
    neutro        : '#9AA5B1',

    // Familia de marca: el azul del módulo y sus derivados.
    primario      : '#1976d2',
    primarioClaro : '#42a5f5',
    primarioHover : '#115293',
    primarioOsc   : '#0d47a1',
    fondoSuave    : '#e3f2fd',
    divisor       : '#bbdefb',
    borde         : '#e0e0e0',
    fondoTarjeta  : '#ffffff',

    /** Los dos extremos del degradado de fondo del módulo. */
    fondoApp      : '#eef2ff',
    fondoAppSuave : '#f8fafc',
    /** Fondo del rail vertical de tabs. */
    fondoRail     : '#f9fafc',
    /** Texto de un tab en reposo. */
    textoSuave    : '#6b7280',
    /** Anillo de foco visible. Se usa en todo elemento clicable del módulo. */
    foco          : '#90caf9',
};

/**
 * Colores de **interfaz**: acciones, realces y fondos.
 *
 * Van aparte de `COLORES` a propósito. El verde de un botón de descarga no significa «normal»
 * ni el rojo de un realce significa «alterado»: significan «pulsa aquí» y «mira esto». Mezclar
 * las dos familias es justo lo que hacía que el mismo verde apareciera con dos sentidos
 * distintos en la misma pantalla.
 */
export const UI = {
    /** Botón de ver el detalle del deportista. */
    accionVer      : '#2e7d32',
    accionVerHover : '#1b5e20',
    /** Botón de descargar el certificado ECG. */
    accionEcg      : '#0288d1',
    accionEcgHover : '#01579b',
    /** Indicador lateral: fila «reciente» en la lista y deportista alterado en el Home. */
    atencion       : '#d32f2f',
    /** Fondo de fila alterna, zona de arrastre y campos de solo lectura. */
    fondoSutil     : '#fafafa',
    bordeSuave     : '#eeeeee',
    /** Borde punteado de la zona de arrastre del Excel. */
    bordePunteado  : '#c5cae9',

    /**
     * Los dos turnos del chat del Home (Spec 03).
     *
     * Van en `UI` y no en `COLORES` porque no significan nada clínico: separan quién habla. El
     * azul del usuario es Material Indigo 700 literal — el original de `src/presentation/` lo
     * pedía como `'indigo.700'`, que **no existe** en la paleta por defecto de MUI y se emitía
     * como CSS inválido, dejando la burbuja sin fondo.
     */
    burbujaGpt          : 'rgba(0, 0, 0, 0.06)',
    burbujaUsuario      : '#303f9f',
    burbujaUsuarioHover : '#283593',
};

/** Paleta para series sin orden clínico —cursos, meses—, donde el color solo separa. */
export const PALETA_CATEGORICA = [
    '#1976d2', '#1B9E77', '#E6A700', '#7B5EA7', '#C2620A', '#4C9F70', '#6C8EBF', '#B3589A',
];

/** Degradados del armazón del módulo: el fondo y los dos estados del rail de tabs. */
export const DEGRADADOS = {
    fondo    : `linear-gradient(135deg, ${COLORES.fondoApp}, ${COLORES.fondoAppSuave})`,
    hover    : `linear-gradient(135deg, ${COLORES.primarioClaro}, ${COLORES.primario})`,
    primario : `linear-gradient(135deg, ${COLORES.primario}, ${COLORES.primarioOsc})`,

    /** Los dos estados del botón de enviar del chat (Spec 03). */
    boton      : `linear-gradient(135deg, ${COLORES.primario}, ${COLORES.primarioHover})`,
    botonHover : `linear-gradient(135deg, ${COLORES.primarioHover}, ${COLORES.primarioOsc})`,
};

/** Sombras del módulo. Las dos que había, con nombre. */
export const SOMBRAS = {
    tarjeta   : '0 10px 30px rgba(0, 0, 0, 0.08)',
    seleccion : '0 10px 25px rgba(13, 71, 161, 0.35)',
};

/**
 * Anillo de foco visible, que hasta ahora se reescribía en cada elemento clicable.
 *
 * Va aparte de `sxTarjeta` y compañía porque se compone dentro de otro `sx`, no lo sustituye.
 */
export const sxFocoVisible = {
    '&:focus-visible': {
        outline       : `3px solid ${COLORES.foco}`,
        outlineOffset : 2,
    },
};

/** La tarjeta blanca con borde suave que usa todo el Home. */
export const sxTarjeta: SxProps<Theme> = {
    borderRadius    : 3,
    border          : `1px solid ${COLORES.fondoSuave}`,
    backgroundColor : COLORES.fondoTarjeta,
    height          : '100%',
};

/** Encabezado de una sección del Home. */
export const sxTituloSeccion: SxProps<Theme> = {
    fontWeight : 700,
    fontSize   : { xs: 18, md: 20 },
    color      : COLORES.primarioOsc,
};

/** Título de una tarjeta de gráfico. */
export const sxTituloTarjeta: SxProps<Theme> = {
    fontWeight : 700,
    fontSize   : 15,
    color      : COLORES.primarioOsc,
    mb         : 0.5,
};

/** Subtítulo de una tarjeta: el n sobre el que está calculada. */
export const sxSubtituloTarjeta: SxProps<Theme> = {
    fontSize : 12,
    color    : 'text.secondary',
    mb       : 2,
};

/**
 * Oculta un elemento en pantalla dejándolo disponible para el lector de pantalla.
 *
 * Es la técnica estándar de «visually hidden». No se usa `visuallyHidden` de `@mui/utils`
 * porque ese paquete **no está declarado en `package.json`**: llega solo como dependencia
 * transitiva de `@mui/material`, y apoyarse en eso es frágil.
 */
export const sxSoloLectores: SxProps<Theme> = {
    position   : 'absolute',
    width      : '1px',
    height     : '1px',
    padding    : 0,
    margin     : '-1px',
    overflow   : 'hidden',
    clip       : 'rect(0 0 0 0)',
    whiteSpace : 'nowrap',
    border     : 0,
};
