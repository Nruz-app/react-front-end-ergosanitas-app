// Tokens visuales y medidas compartidas por las secciones de la portada.
export { ANCHO_MAXIMO, ETIQUETA_SECCION, TEMA_HOME, TITULAR_SECCION } from './tema-home';

// Traductor de nombre de icono (string en el JSON) a componente de MUI.
export { ICONO_POR_DEFECTO, resolverIcono } from './iconos';
export type { IconoHome } from './iconos';

// Fuente única de los enlaces de contacto, derivada de `home-contacto.json`. Ningún
// componente arma por su cuenta una URL de `wa.me`, de `tel:` ni de `mailto:`.
export {
    CANALES_CONTACTO,
    CANALES_DIRECTOS,
    REDES_SOCIALES,
    IconoTiktok,
    urlWhatsapp,
    urlWhatsappPromo,
} from './canales-contacto';

// Los cinco JSON de contenido (hero, servicios, videos, contacto y los textos del chat) no se
// reexportan aquí a propósito: cada sección importa el suyo por ruta directa
// (`../config/home-videos.json`). Así, al abrir un componente se ve de un vistazo qué archivo
// edita quien quiera cambiar ese contenido. `home-chat.json` (Spec 05) lo importan el chat y su
// servicio. Promociones, alianzas y galería ya no tienen JSON: vienen de la API (Spec 04).
