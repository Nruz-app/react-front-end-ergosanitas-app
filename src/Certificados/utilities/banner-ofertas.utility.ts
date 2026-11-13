import type { IOfertaBanner } from '../interface';

/**
 * Nombre con que se cita una oferta en el mensaje de WhatsApp y en el `aria-label` del CTA
 * (D10 de la SPEC 02 de certificados).
 *
 * `urlWhatsappPromo` de `home-ergo` exige un `string`, y el Administrador puede dejar el pie de
 * foto vacío. Con `caption = null` se usa el `alt`, que el back exige siempre. En el Home un
 * caption vacío deja el mensaje cortado en «me interesa la promoción: ».
 */
export const nombreDeOferta = (oferta: IOfertaBanner): string => oferta.caption ?? oferta.alt;

/** Promesa que se resuelve pasados `ms` milisegundos (permanencia mínima del banner, P1). */
export const esperar = (ms: number): Promise<void> =>
    new Promise((resolver) => {
        window.setTimeout(resolver, ms);
    });

/**
 * Índice al azar en `[0, cantidad)`, distinto de `excluido` cuando hay al menos dos opciones.
 *
 * Se sortea entre las `cantidad - 1` posiciones restantes y se salta la excluida, así todas
 * tienen la misma probabilidad. Repetir el sorteo hasta que salga otra también funcionaría, pero
 * con dos ofertas fallaría la mitad de las veces.
 */
export const sortearIndice = (cantidad: number, excluido = -1): number => {

    if (cantidad <= 1) return 0;

    if (excluido < 0 || excluido >= cantidad) return Math.floor(Math.random() * cantidad);

    const sorteado = Math.floor(Math.random() * (cantidad - 1));

    return sorteado >= excluido ? sorteado + 1 : sorteado;
};

/**
 * Descarga una imagen en segundo plano para que, cuando el banner la pinte, ya esté en la caché
 * del navegador. Se rechaza si la imagen no carga (URL rota o archivo borrado en el back).
 */
export const precargarImagen = (src: string): Promise<void> =>
    new Promise((resolver, rechazar) => {

        const imagen = new Image();

        imagen.decoding = 'async';
        imagen.onload = () => resolver();
        imagen.onerror = () => rechazar(new Error(`No se pudo precargar la imagen ${src}`));
        imagen.src = src;
    });

/** `true` si el sistema pide reducir el movimiento: sin autoplay, sin efectos ni fundidos. */
export const prefiereMenosMovimiento = (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
