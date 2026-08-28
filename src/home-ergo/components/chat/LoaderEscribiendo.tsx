import Box from '@mui/material/Box';

import { TEMA_HOME } from '../../config/tema-home';

/**
 * Indicador de «estamos respondiendo».
 *
 * Tres puntos que laten, en el mismo hueco donde va a aparecer la respuesta. Así el
 * espacio no salta cuando el texto llega, que es lo que ocurre con un spinner centrado.
 *
 * El movimiento se detiene con `prefers-reduced-motion`: los puntos quedan visibles y
 * quietos, de modo que la señal de espera se conserva sin la animación.
 */
export const LoaderEscribiendo = () => {
    return (
        <Box
            role="status"
            aria-label="Escribiendo una respuesta"
            sx={{
                display     : 'inline-flex',
                alignItems  : 'center',
                gap         : 0.75,
                px          : 2,
                py          : 1.5,
                mb          : 1.75,
                bgcolor     : '#fff',
                border      : `1px solid ${ TEMA_HOME.borde }`,
                borderRadius: '4px 14px 14px 14px',
                ml          : '44px', // Alineado con las burbujas del bot, que llevan avatar.
                '@keyframes latir': {
                    '0%, 80%, 100%': { opacity: 0.25, transform: 'translateY(0)' },
                    '40%'          : { opacity: 1, transform: 'translateY(-3px)' },
                },
            }}
        >
            { [ 0, 1, 2 ].map( ( i ) => (
                <Box
                    key={ i }
                    sx={{
                        width       : 7,
                        height      : 7,
                        borderRadius: '50%',
                        bgcolor     : TEMA_HOME.azulErgo,
                        animation   : `latir 1.3s ${ i * 0.16 }s infinite ease-in-out`,
                        '@media (prefers-reduced-motion: reduce)': {
                            animation: 'none',
                            opacity  : 0.55,
                        },
                    }}
                />
            ) ) }
        </Box>
    );
};
