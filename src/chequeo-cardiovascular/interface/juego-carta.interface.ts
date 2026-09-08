/**
 * Modelo del juego de cartas por nivel (Spec 04).
 *
 * Es un **espejo del contrato**, sin mapper. A diferencia de `src/ficha-clinica/`, aquí el
 * backend ya entrega el modelo de UI —etiquetas, colores y porcentajes ya calculados por
 * `SP_juego_cartas_club`—, así que una capa de traducción solo añadiría un sitio donde
 * equivocarse. Verificado contra `http://127.0.0.1:8000/api` el 2026-09-07.
 *
 * Los tres endpoints van bajo el **sobre A** (`{success, message, data}`), que es el único
 * sitio del módulo donde aparece: los otros 11 endpoints devuelven el dato pelado.
 */

/**
 * Una banda configurable de la tabla `juego_niveles`, en cualquiera de los dos ejes.
 *
 * La banda `sin_evaluar` usa `-1/-1` como **centinela**, no como puntaje: mantiene el badge
 * dentro de la tabla para que `nivel` nunca llegue `null`.
 */
export interface IJuegoNivel {
    slug        : string;
    nombre      : string;
    valor_min   : number;
    valor_max   : number;
    color_fondo : string;
    color_texto : string;
    orden       : number;
    /** Llega como `0`/`1`, no como boolean. */
    activo      : number;
}

/** El catálogo de `juego_atributos`: lo que da icono y nombre a un `slug` de la carta. */
export interface IJuegoAtributoCatalogo {
    slug        : string;
    nombre      : string;
    /** El emoji, tal cual llega del backend. */
    icono       : string;
    descripcion : string;
    orden       : number;
}

/**
 * Un atributo dentro de una carta.
 *
 * `valor` es `null` cuando el alumno no tiene **ningún** sub-indicador de ese atributo. Se
 * pinta `—`, nunca `0`: un cero sería una medición, y confundirlo con un vacío es justo lo que
 * el estado `SIN EVALUAR` existe para evitar.
 */
export interface IAtributoCarta {
    slug   : string;
    valor  : number | null;
    medido : boolean;
}

/** Los cinco bloques del eje de completitud. `chequeo` es siempre `true`: origina la carta. */
export interface ICompletitudCarta {
    chequeo        : boolean;
    signos_vitales : boolean;
    ecg            : boolean;
    bioimpedancia  : boolean;
    certificado    : boolean;
}

/**
 * La banda tal como viaja dentro de una carta: la etiqueta y sus colores, sin los rangos.
 *
 * Los colores vienen del backend a propósito. Es para lo que existe `juego_niveles`: retunear
 * la paleta con un `UPDATE` sin desplegar el front. Y no rompe la regla del módulo —ningún
 * `.tsx` escribe un hex—, porque aquí el color es un dato, no un literal.
 */
export interface IBadgeCarta {
    slug        : string;
    nombre      : string;
    color_fondo : string;
    color_texto : string;
}

/**
 * La carta de un alumno, calculada al vuelo por el SP sobre su chequeo más reciente.
 *
 * ⚠️ **El puntaje no es un diagnóstico**: es una heurística de gamificación sobre datos
 * incompletos, con bandas calibradas sobre la distribución real de la base, no sobre criterio
 * clínico. La UI está obligada a decirlo.
 */
export interface IJuegoCarta {
    rut               : string;
    club              : string;
    nombre            : string;
    /** `string`, igual que en `IChequeo`. No se hace aritmética con ella. */
    edad              : string;
    sexo              : string;
    /** El número de ficha ya formateado, con almohadilla: `'#003718'`. */
    ficha             : string;
    id_chequeo        : number;
    /** `null` ⇒ banda `SIN EVALUAR`: el alumno no tiene ni un atributo medido. */
    puntaje           : number | null;
    /** 0–10, proporcional a la **calidad** de la bioimpedancia, no a tenerla. */
    bonus             : number;
    /** 0–5. Solo es `0` cuando `puntaje` es `null`. */
    estrellas         : number;
    /** Múltiplo de 20, entre 20 y 100: `chequeo` siempre cuenta. */
    progreso          : number;
    /** `'InBody'` cuando existe fila de bioimpedancia. */
    insignia          : string | null;
    nivel             : IBadgeCarta;
    estado            : IBadgeCarta;
    atributos         : IAtributoCarta[];
    completitud       : ICompletitudCarta;
    /**
     * ⚠️ Llega como `YYYY-MM-DD HH:mm:ss.ffffff`, **no** como el `DD-MM-YYYY` de `chequeo-all`.
     * `parsearFecha` de `resumen.utility.ts` no sirve aquí.
     */
    fecha_atencion    : string | null;
    total_chequeos    : number;
    atributos_medidos : number;
    bloques_completos : number;
}

/** Lo que devuelve `GET /juego-cartas/niveles`: la configuración entera de los dos ejes. */
export interface IConfiguracionJuego {
    clinico     : IJuegoNivel[];
    completitud : IJuegoNivel[];
    atributos   : IJuegoAtributoCatalogo[];
}

/** Lo que devuelve `GET /juego-cartas/{user_email}`. */
export interface IListadoCartas {
    club   : string;
    search : string | null;
    total  : number;
    cartas : IJuegoCarta[];
}

/**
 * El sobre A del backend (`FichaClinicaController` y `JuegoCartasController`).
 *
 * Se tipa aquí porque ningún otro endpoint del módulo lo usa. `ApiAdapter` no valida nada en
 * tiempo de ejecución, así que el servicio comprueba `success` y la forma de `data` antes de
 * devolver: este backend responde **200 con sobres de error**.
 */
export interface ISobreJuego<T> {
    success : boolean;
    message : string;
    data    : T;
}
