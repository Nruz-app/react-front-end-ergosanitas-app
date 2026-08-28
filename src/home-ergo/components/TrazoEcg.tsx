import Box from '@mui/material/Box';

import { TEMA_HOME } from '../config/tema-home';

interface Props {
    /** Color del trazo. Por defecto el rojo de electrocardiograma. */
    color?    : string;
    /** Alto en píxeles. El trazo se estira horizontalmente para llenar su contenedor. */
    alto?     : number;
    /** Dibuja el trazo de izquierda a derecha al montarse. Se ignora si el sistema pide menos movimiento. */
    animado?  : boolean;
}

/** Un latido: línea de base, onda P, complejo QRS y onda T. */
const LATIDO = 'h34 q6 -9 12 0 h14 l7 5 l5 -28 l7 44 l6 -21 h10 q8 -12 14 0 h11';

/** Encadena `veces` latidos en un solo `path`, empezando en el borde izquierdo. */
const construirTrazo = ( veces: number ) => `M0 30 ${ LATIDO.repeat( veces ) }`;

/**
 * Trazo de electrocardiograma. Es el elemento firma de la portada.
 *
 * Sale del instrumento propio del oficio: todo lo que vende Ergo SaniTas orbita el
 * corazón. Se usa como hairline entre secciones y una sola vez animado en el hero, nunca
 * como relleno decorativo — repetirlo por toda la página lo volvería un adorno.
 *
 * `preserveAspectRatio="none"` deja que el trazo se estire a lo ancho del contenedor sin
 * cambiar su altura, que es como se comporta el papel de un electrocardiógrafo real.
 */
export const TrazoEcg = ( { color = TEMA_HOME.pulso, alto = 60, animado = false }: Props ) => {
    return (
        <Box
            aria-hidden="true"
            component="svg"
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            sx={{
                display : 'block',
                width   : '100%',
                height  : alto,
                '@keyframes dibujarTrazo': {
                    from : { strokeDashoffset: 1 },
                    to   : { strokeDashoffset: 0 },
                },
            }}
        >
            <Box
                component="path"
                d={ construirTrazo( 12 ) }
                fill="none"
                stroke={ color }
                strokeWidth={ 2 }
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={ 1 }
                sx={{
                    ...( animado && {
                        strokeDasharray : 1,
                        strokeDashoffset: 1,
                        animation       : 'dibujarTrazo 2.4s ease-out forwards',
                    } ),
                    // Quien pide menos movimiento ve el trazo completo, sin dibujado.
                    '@media (prefers-reduced-motion: reduce)': {
                        strokeDasharray : 'none',
                        strokeDashoffset: 0,
                        animation       : 'none',
                    },
                }}
            />
        </Box>
    );
};
