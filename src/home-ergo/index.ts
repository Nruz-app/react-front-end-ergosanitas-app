/**
 * Módulo `home-ergo` — portada comercial de ergosanitas.com (Spec 01).
 *
 * El único punto de entrada que consume el resto de la aplicación es `AppHomeErgoPage`,
 * que `src/routes/routes.ts` monta en `/`. Todo lo demás se exporta para uso interno del
 * módulo y para que una spec futura pueda reutilizar piezas sin tener que bucear.
 */

export { AppHomeErgoPage, HomeErgoPage } from './pages';

export * from './components';

export { UseChatComercialService } from './services';

export { ANCHO_MAXIMO, ICONO_POR_DEFECTO, TEMA_HOME, resolverIcono } from './config';

export type {
    IContactoHome,
    IHeroHome,
    IImagenHome,
    IIndicadorHome,
    IMensajeChatHome,
    IPortadaHome,
    IRespuestaChatHome,
    IServicioHome,
    IVideoHome,
} from './interface';
