// Contenido del Home. Cada interfaz describe un archivo JSON de `config/`, no una
// respuesta de backend: el Home no hace fetch de su contenido.
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
} from './home.interface';

// Chat comercial flotante. Clon conceptual del asistente, sin RUT y sin micrófono.
export type {
    IMensajeChatHome,
    IRespuestaChatHome,
} from './chat-home.interface';
