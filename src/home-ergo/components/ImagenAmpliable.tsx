import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

import type { MouseEvent, ReactNode } from 'react';

/** Segundos de cursor encima antes de ampliar. Decisión de la Spec 03. */
const RETARDO_POR_DEFECTO = 3000;

/**
 * Por encima del botón del chat (1300), que era lo más alto del módulo.
 *
 * Puede ocupar ese lugar sin discusión precisamente porque el overlay no intercepta un
 * solo clic: tapa durante el hover, pero todo lo que hay debajo se sigue pudiendo pulsar.
 */
const ALTURA_OVERLAY = 1400;

/** Fundido de entrada del overlay, en ms. Se anula con `prefers-reduced-motion: reduce`. */
const DURACION_FUNDIDO = 180;

interface Props {
    /** Ruta de la imagen que se muestra ampliada. Absoluta desde la raíz del sitio. */
    src        : string;
    /** Texto alternativo del overlay. Obligatorio, igual que en el resto del módulo. */
    alt        : string;
    /** Milisegundos de cursor encima antes de ampliar. */
    retardoMs ?: number;
    /** La imagen tal como ya se pinta en la tarjeta. */
    children   : ReactNode;
}

/**
 * Envuelve una imagen y la amplía en un overlay centrado tras unos segundos de cursor
 * encima (Spec 03).
 *
 * **Es un envoltorio, no un reemplazo de la imagen.** Recibe por `children` el
 * `<Box component="img">` que la tarjeta ya renderiza, con su `aspectRatio`, su
 * `objectFit`, su `loading` y su `sx`. No absorbe ninguna de esas decisiones: solo
 * escucha el puntero sobre lo que envuelve y pinta el overlay.
 *
 * Esa forma es la que lo hace reutilizable de verdad. La galería recorta con
 * `objectFit: 'cover'` y `objectPosition: 'center 35%'`; las promociones ajustan con
 * `contain`. Un componente que renderizara la imagen él mismo tendría que reexponer
 * todas esas props para servir a los dos casos.
 *
 * Hoy solo lo montan los dos carruseles de `CarruselPromociones`. La galería y las
 * carátulas de video quedaron fuera de la Spec 03 a propósito.
 *
 * ---
 *
 * **El portal no es opcional.** Swiper aplica `transform` a `.swiper-wrapper` en cada
 * deslizamiento, y un ancestro con `transform` se convierte en el bloque contenedor de
 * sus descendientes `position: fixed`. Sin sacar el overlay del árbol con `createPortal`,
 * se centraría respecto del carrusel —no de la pantalla— y quedaría recortado por el
 * borde del slide. Es un fallo que compila y que solo se ve al deslizar.
 *
 * **`pointer-events: none` tampoco es opcional.** Es lo que permite tener a la vez un
 * overlay a pantalla completa y un clic que sigue llegando al enlace de WhatsApp de la
 * tarjeta: el cursor nunca deja de estar sobre la tarjeta, así que el hover no se corta y
 * el overlay se cierra solo al salir. Si algún día hace falta un botón dentro del
 * overlay, hay que reabrir esa decisión antes de programar nada: son incompatibles.
 *
 * **Eventos de puntero, no de ratón ni de toque.** Un solo par `pointerenter` /
 * `pointerleave` da las dos conductas: en escritorio se dispara al pasar el cursor, y en
 * táctil al apoyar y levantar el dedo, que es la pulsación larga. No hay que ramificar
 * por `pointerType`.
 *
 * La alternativa —`onMouse*` más `onTouch*`— está descartada y no conviene volver a ella:
 * tras un *tap*, el navegador emite una secuencia de compatibilidad que incluye un
 * `mouseenter` sin `mouseleave` posterior, y con ella el overlay se abría solo tres
 * segundos después de tocar una promoción y ya no se cerraba.
 */
export const ImagenAmpliable = ( { src, alt, retardoMs = RETARDO_POR_DEFECTO, children }: Props ) => {

    const [ ampliada, setAmpliada ] = useState( false );

    // Vive en un `ref` y no en el estado: cambiarlo no debe repintar nada.
    const temporizador = useRef< number | null >( null );

    /**
     * Quien pide menos movimiento recibe el overlay igual, pero de golpe.
     *
     * La función **no se desactiva**: ampliar una imagen ilegible es funcional, no
     * decorativo. Lo que se quita es el fundido, que sí es decoración. Misma lectura del
     * `matchMedia` que hace el carrusel para su autoplay.
     */
    const reducirMovimiento = useMemo(
        () => typeof window !== 'undefined' && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches,
        []
    );

    const cancelarCuenta = useCallback( () => {
        if ( temporizador.current !== null ) {
            window.clearTimeout( temporizador.current );
            temporizador.current = null;
        }
    }, [] );

    /**
     * Cancelar antes de arrancar es lo que da el «reinicio del contador al cambiar de
     * tarjeta»: cada instancia limpia lo suyo y la nueva cuenta desde cero.
     */
    const iniciarCuenta = useCallback( () => {
        cancelarCuenta();

        temporizador.current = window.setTimeout( () => {
            temporizador.current = null;
            setAmpliada( true );
        }, retardoMs );
    }, [ cancelarCuenta, retardoMs ] );

    const cerrar = useCallback( () => {
        cancelarCuenta();
        setAmpliada( false );
    }, [ cancelarCuenta ] );

    /**
     * En táctil la ampliación se pide con una pulsación larga, y una pulsación larga
     * sobre una imagen dentro de un enlace abre el menú nativo del navegador («abrir
     * enlace», «guardar imagen»). Se cancela.
     *
     * **Va en el elemento, no en `document`.** Puesto a nivel de documento le quitaría el
     * menú contextual a toda la portada, incluidas las fotos de `GaleriaOperativos`, que
     * esta spec no toca.
     */
    const bloquearMenuContextual = useCallback( ( evento: MouseEvent< HTMLDivElement > ) => {
        evento.preventDefault();
    }, [] );

    // Un temporizador vivo tras el desmontaje dispara un `setState` sobre un componente
    // que ya no existe. Pasa de verdad: basta con navegar a otra ruta con la cuenta
    // corriendo.
    useEffect( () => cancelarCuenta, [ cancelarCuenta ] );

    return (
        <Box
            sx={{ display: 'block' }}
            onPointerEnter={ iniciarCuenta }
            onPointerLeave={ cerrar }
            onPointerCancel={ cerrar }
            onContextMenu={ bloquearMenuContextual }
        >
            { children }

            { ampliada && createPortal(
                <Fade in timeout={ reducirMovimiento ? 0 : DURACION_FUNDIDO }>
                    <Box
                        sx={{
                            position      : 'fixed',
                            inset         : 0,
                            zIndex        : ALTURA_OVERLAY,
                            pointerEvents : 'none',
                            bgcolor       : 'rgba(11,44,77,0.72)',
                            display       : 'flex',
                            alignItems    : 'center',
                            justifyContent: 'center',
                            p             : 2,
                        }}
                    >
                        <Box
                            component="img"
                            src={ src }
                            alt={ alt }
                            sx={{
                                maxHeight: '90vh',
                                maxWidth : '90vw',
                                objectFit: 'contain',
                                display  : 'block',
                            }}
                        />
                    </Box>
                </Fade>,
                document.body
            ) }
        </Box>
    );
};
