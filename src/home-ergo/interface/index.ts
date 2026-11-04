// Contenido del Home. Casi todas describen un archivo JSON de `config/`. La excepción son las
// imágenes de promociones, alianzas y galería, que desde la Spec 04 vienen de la API.
export type {
    IHeroHome,
    IIndicadorHome,
    IPortadaHome,
    IServicioHome,
    IImagenHome,
    IPromocionHome,
    IVideoHome,
    IContactoHome,
    ICanalContacto,
    SeccionImagenHome,
    IHomeImagenApi,
    IRespuestaHomeImagenes,
} from './home.interface';

// Chat comercial flotante. Clon conceptual del asistente, sin RUT y sin micrófono.
export type {
    IMensajeChatHome,
    IRespuestaChatHome,
} from './chat-home.interface';
