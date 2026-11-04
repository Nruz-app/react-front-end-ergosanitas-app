import type { SxProps, Theme } from '@mui/material';

/**
 * Tokens visuales del módulo: **la única fuente de color**. Ningún `.tsx` escribe un hex.
 *
 * Igual que en `chequeo-cardiovascular`, se separan dos familias: `COLORES` (marca y armazón)
 * y `UI` (acciones y realces). El verde de un botón no significa «normal»: significa «pulsa
 * aquí». Los valores son los que hoy pinta `src/Chequeo/` para el Administrador, solo que
 * reunidos en un sitio. Los pasos siguientes agregan aquí lo que necesiten sus componentes.
 */
export const COLORES = {
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
    /** Texto sobre el tab activo. */
    textoSobrePrimario : '#ffffff',
    /** Anillo de foco visible. Se usa en todo elemento clicable del módulo. */
    foco          : '#90caf9',
};

/** Colores de interfaz: acciones, realces y fondos. */
export const UI = {
    /** Indicador lateral de una fila «reciente» en la lista (`esReciente`). */
    atencion      : '#d32f2f',
    /** Fondo de fila alterna, zona de arrastre y campos de solo lectura. */
    fondoSutil    : '#fafafa',
    bordeSuave    : '#eeeeee',
    /** Borde punteado de la zona de arrastre de archivos. */
    bordePunteado : '#c5cae9',
    /** Caja que muestra el nombre del archivo elegido en `InputFileUpload`. */
    fondoArchivo  : '#f5f5f5',

    /**
     * Acciones de la lista, con los colores de hoy (paridad 1:1; el rediseño de la lista va en
     * la Spec 03). Verde para ver/editar/ECG foto/revisión, azul para descargar y subir.
     */
    accionVerde   : 'green',
    accionAzul    : 'blue',
    /**
     * Fila «reciente» (`esReciente`): fondo rojo pleno, como hoy. El agente de revisión en vivo
     * lo marcó como ilegible; el indicador lateral de Colegios entra con la Spec 03.
     */
    filaReciente      : 'red',
    filaRecienteHover : 'darkred',
    /** Botón de confirmar un borrado y de cancelar en los diálogos de Swal. */
    peligro       : '#d32f2f',
    cancelar      : '#3085d6',
    /** Cabeceras verdes de los tres acordeones de filtros. */
    filtro        : '#66bb6a',
    filtroClaro   : '#81c784',
    filtroOsc     : '#4caf50',
    /** Fondo de los campos del buscador y del detalle. */
    fondoCampo    : '#f9f9f9',
    /** Título del modal de detalle. */
    tituloModal   : '#3f51b5',
    textoFuerte   : '#333333',

    /** Revisión médica: cabecera del paciente, velo del visor y fondo de la vista completa. */
    cabeceraEcgDesde : '#f5f7fa',
    cabeceraEcgHasta : '#e4ecf7',
    veloVisor        : 'rgba(0, 0, 0, 0.45)',
    fondoVisor       : '#000000',

    /** Botones de la carga masiva Excel al pasar por encima. */
    accionCarga      : '#4caf50',
    /** Grilla de resultados de la carga masiva ECG. */
    bordeGrilla      : '#e5e7eb',
    cabeceraGrilla   : '#f8fafc',
    celdaGrilla      : '#f1f5f9',

    /** «Mi cuenta»: el verde de «Cargar Logo» y de los lápices, en reposo, encima y al pulsar. */
    accionCuenta      : '#66bb6a',
    accionCuentaHover : '#81c784',
    accionCuentaActiva: '#4caf50',
    /** Botón «Aceptar» de los Swal informativos (resultado del IMC). */
    confirmar         : '#3085d6',
    /** Clasificación del IMC en el resultado de la calculadora. */
    resultadoImc      : '#d9534f',
};

/**
 * Mantenedor de imágenes del Home (Spec 02): un color por sección para el chip de la carta y el
 * filtro, el estado «Visible» / «Oculta» y el fondo del marco donde la imagen va con `contain`.
 */
export const IMAGENES = {
    seccionPromocion : '#1976d2',
    seccionAlianza   : '#7b1fa2',
    seccionGaleria   : '#00897b',
    visible          : '#2e7d32',
    oculta           : '#757575',
    /** Fondo del marco 2:3: el flyer se ve con `contain` y deja franjas. */
    fondoMarco       : '#f5f5f5',
    /** Opacidad de una carta oculta: se ve, pero se lee como apagada. */
    opacidadOculta   : 0.45,
};

/** Degradados del armazón: el fondo y los dos estados del rail de tabs (§6.1). */
export const DEGRADADOS = {
    fondo    : `linear-gradient(135deg, ${COLORES.fondoApp}, ${COLORES.fondoAppSuave})`,
    hover    : `linear-gradient(135deg, ${COLORES.primarioClaro}, ${COLORES.primario})`,
    /** El degradado azul que hoy lleva el tab activo, movido aquí. */
    primario : `linear-gradient(135deg, ${COLORES.primario}, ${COLORES.primarioOsc})`,
    /** Cabecera de las columnas de datos de la lista. */
    cabeceraTabla : `linear-gradient(45deg, ${COLORES.primario}, ${COLORES.primarioClaro})`,
    /** Cabecera de los acordeones de filtros, en reposo y al pasar por encima. */
    filtro        : `linear-gradient(90deg, ${UI.filtro}, ${UI.filtroClaro})`,
    filtroHover   : `linear-gradient(90deg, ${UI.filtroOsc}, ${UI.filtro})`,
    /** Cabecera con los datos del paciente en la revisión médica. */
    cabeceraEcg : `linear-gradient(135deg, ${UI.cabeceraEcgDesde} 0%, ${UI.cabeceraEcgHasta} 100%)`,
    /** Botón «Cerrar» de los modales. */
    botonModal      : `linear-gradient(45deg, ${COLORES.primarioClaro} 30%, ${COLORES.primario} 90%)`,
    botonModalHover : `linear-gradient(45deg, ${COLORES.primario} 30%, ${COLORES.primarioClaro} 90%)`,
};

export const SOMBRAS = {
    tarjeta     : '0 10px 30px rgba(0, 0, 0, 0.08)',
    seleccion   : '0 10px 25px rgba(13, 71, 161, 0.35)',
    /** Botón principal de un formulario, en reposo y al pasar por encima. */
    boton       : '0 6px 16px rgba(25, 118, 210, 0.25)',
    botonHover  : '0 8px 20px rgba(13, 71, 161, 0.3)',
    /** Tabla, acordeones y campos de filtro. */
    tabla       : '0 4px 20px rgba(0, 0, 0, 0.08)',
    tablaHover  : '0 6px 30px rgba(0, 0, 0, 0.15)',
    campo       : '0px 6px 15px rgba(0, 0, 0, 0.15)',
    icono       : '0px 4px 10px rgba(0, 0, 0, 0.2)',
    /** Formulario de la ficha, y cabecera y visor de la revisión médica al pasar por encima. */
    formulario  : '0 4px 20px rgba(0, 0, 0, 0.06)',
    cabeceraEcg : '0 8px 25px rgba(0, 0, 0, 0.2)',
    visor       : '0 10px 30px rgba(0, 0, 0, 0.3)',
};

/**
 * Anillo de foco visible por teclado. Se compone dentro de otro `sx`, no lo sustituye.
 */
export const sxFocoVisible = {
    '&:focus-visible': {
        outline       : `3px solid ${COLORES.foco}`,
        outlineOffset : 2,
    },
};

/** La tarjeta blanca con borde suave que envuelve cada panel. */
export const sxTarjeta: SxProps<Theme> = {
    borderRadius    : 3,
    border          : `1px solid ${COLORES.fondoSuave}`,
    backgroundColor : COLORES.fondoTarjeta,
    boxShadow       : SOMBRAS.tarjeta,
};

/** Cabecera `h5` de cada panel: dice dónde está el usuario también en móvil (§6.1). */
export const sxTituloPanel: SxProps<Theme> = {
    fontWeight : 700,
    fontSize   : { xs: 20, md: 24 },
    color      : COLORES.primarioOsc,
};

/** Cabecera de una sección del formulario. */
export const sxTituloSeccion: SxProps<Theme> = {
    fontWeight : 700,
    fontSize   : { xs: 16, md: 18 },
    color      : COLORES.primarioOsc,
};

/**
 * Oculta un elemento en pantalla dejándolo disponible para el lector de pantalla. No se usa
 * `visuallyHidden` de `@mui/utils` porque ese paquete no está declarado en `package.json`.
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
