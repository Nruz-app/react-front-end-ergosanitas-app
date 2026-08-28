/**
 * Modelo de contenido del Home comercial (Spec 01 de `home-ergo`).
 *
 * Todas estas interfaces describen **archivos JSON de `config/`**, no respuestas de un
 * backend. El Home no hace fetch de nada: su contenido es estático y se edita a mano.
 *
 * De ahí la regla que ordena el módulo: agregar una foto, un video o un servicio es
 * agregar un objeto al JSON. Ningún componente lleva rutas de archivo ni textos de
 * negocio escritos a mano.
 */

import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';

/**
 * Bloque superior de la página: foto de fondo, titular y llamado a la acción.
 *
 * `imagen` es una ruta **absoluta desde la raíz del sitio** (`/home-ergo/img/...`), no
 * un import de Vite. Es lo que permite cambiar la foto del hero editando el JSON, sin
 * tocar código ni recompilar.
 */
export interface IHeroHome {
    imagen    : string;
    titulo    : string;
    subtitulo : string;
    ctaTexto  : string;
    ctaTo     : string;
}

/**
 * Un dato de la barra de confianza.
 *
 * `valor` es el número grande y `texto` la etiqueta que lo explica. Se guarda como
 * string y no como number porque los valores reales llevan formato («+2.500») y
 * algunos no son cifras en absoluto («A domicilio»).
 */
export interface IIndicadorHome {
    valor : string;
    texto : string;
}

/**
 * Forma completa de `config/home-hero.json`.
 *
 * El hero y la barra de indicadores viven en el mismo archivo porque son el mismo
 * bloque: la barra va pegada bajo la foto y se lee como parte de ella. Separarlos en dos
 * JSON obligaría a abrir dos archivos para cambiar una sola cosa.
 */
export interface IPortadaHome {
    hero        : IHeroHome;
    indicadores : IIndicadorHome[];
}

/**
 * Un servicio de la grilla de tarjetas.
 *
 * `icono` es el **nombre** de un icono de MUI, no el componente: un JSON no puede
 * contener un componente de React. El mapa de `config/iconos.ts` lo traduce, y un
 * nombre desconocido cae a un icono por defecto en vez de romper el render.
 */
export interface IServicioHome {
    id          : string;
    nombre      : string;
    descripcion : string;
    icono       : string;
    activo      : boolean;
}

/**
 * Una imagen de la galería de operativos o del carrusel de promociones.
 *
 * `alt` es obligatorio a propósito. El Home existe para vender: sin texto alternativo
 * la imagen no la indexa un buscador ni la lee un lector de pantalla.
 */
export interface IImagenHome {
    id      : string;
    src     : string;
    alt     : string;
    caption : string;
    activo  : boolean;
}

/**
 * Una gráfica del carrusel de promociones.
 *
 * Extiende `IImagenHome` con `destacado`, que decide en qué carrusel aparece: `true` la
 * sube al bloque de promociones del inicio, `false` la deja en la franja de alianzas del
 * final. Es un campo aparte de `activo` porque responden a preguntas distintas: `activo`
 * es «¿se muestra?» y `destacado` es «¿dónde?».
 *
 * El reparto se hace por este campo y **nunca por el prefijo del `id`**. Una promoción
 * que mañana se llame distinto no debe cambiar de sitio sola.
 *
 * La galería de operativos sigue usando `IImagenHome` a secas: sus fotos no se reparten
 * entre dos bloques.
 */
export interface IPromocionHome extends IImagenHome {
    destacado : boolean;
}

/**
 * Un video de la sección de videos.
 *
 * `poster` apunta a una imagen de `/home-ergo/img/` y es lo que se ve antes de pulsar
 * play. Existe porque los siete videos suman 139 MB: sin carátula y sin
 * `preload="none"`, abrir el Home en un celular con datos móviles sería intolerable.
 */
export interface IVideoHome {
    id     : string;
    src    : string;
    poster : string;
    titulo : string;
    activo : boolean;
}

/**
 * Datos de contacto de la empresa.
 *
 * El teléfono viaja dos veces a propósito: `telefono` es el formato legible que se
 * muestra en pantalla y `telefonoWhatsapp` es el mismo número en dígitos corridos, que
 * es lo único que acepta la URL de `wa.me`. Derivar uno del otro en tiempo de render
 * sería una limpieza de string repetida en cada componente que lo use.
 *
 * Los mensajes también viajan dos veces, y por el mismo motivo: `mensajeWhatsapp` es el
 * saludo genérico de los botones de la portada, y `mensajeWhatsappPromo` es la plantilla
 * que se usa al pulsar una promoción. Esta última lleva el marcador `{promocion}`, que se
 * sustituye por el `caption` de la tarjeta pulsada para que el equipo reciba la consulta
 * sabiendo ya qué oferta vio la persona.
 */
export interface IContactoHome {
    telefono             : string;
    telefonoWhatsapp     : string;
    mensajeWhatsapp      : string;
    mensajeWhatsappPromo : string;
    email                : string;
    instagram            : string;
    facebook             : string;
    tiktok               : string;
}

/**
 * Un canal de contacto ya listo para pintar.
 *
 * A diferencia del resto de interfaces de este archivo, esta **no describe un JSON**:
 * describe lo que `config/canales-contacto.tsx` deriva de `home-contacto.json`. La URL
 * ya viene armada —con su `encodeURIComponent` donde hace falta— y el icono ya viene
 * resuelto. Quien la consume solo pinta.
 *
 * Existe porque tres componentes distintos —la franja, el rail y la sección de
 * contacto— necesitan exactamente los mismos seis canales. Sin este tipo, cada uno
 * armaría su propia URL de `wa.me`, y cambiar el número de teléfono obligaría a
 * acordarse de los tres.
 *
 * `grupo` separa las redes sociales de los canales directos: la sección de contacto los
 * pinta en dos bloques distintos, la franja y el rail los pintan todos juntos.
 */
export interface ICanalContacto {
    id       : 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'telefono' | 'correo';
    grupo    : 'red' | 'canal';
    etiqueta : string;
    valor    : string;
    url      : string;
    externo  : boolean;
    Icono    : ComponentType<SvgIconProps>;
}
