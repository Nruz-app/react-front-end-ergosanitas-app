import { Avatar, Box, Typography } from '@mui/material';

import { COLORES, SOMBRAS, UI } from '../../config/tema';

/**
 * Indicador de «el asistente está respondiendo» (Spec 03).
 *
 * Se dibuja **con la forma de una burbuja del asistente** —mismo avatar, misma esquina recogida,
 * misma sombra— en vez de como un spinner centrado. Así el hueco donde va a aparecer la
 * respuesta es el mismo que ocupa la espera, y la conversación no da un salto al llegar.
 *
 * Va con `role="status"` para que un lector de pantalla anuncie la espera: los tres puntos a
 * secas no dicen nada.
 */
export const LoaderEscribiendo = () => {

    return (
        <Box
            role="status"
            sx={{
                display    : 'flex',
                alignItems : 'flex-start',
                padding    : 2,
            }}
        >
            <Avatar
                src="/logoTrans.png"
                alt=""
                sx={{
                    width       : 42,
                    height      : 42,
                    flexShrink  : 0,
                    bgcolor     : COLORES.fondoTarjeta,
                    border      : '2px solid',
                    borderColor : COLORES.divisor,
                    boxShadow   : SOMBRAS.burbuja,
                }}
            />

            <Box
                sx={{
                    marginLeft      : 1.75,
                    padding         : '16px 20px',
                    backgroundColor : UI.burbujaGpt,
                    border          : `1px solid ${UI.burbujaGptBorde}`,
                    borderRadius    : '4px 16px 16px 16px',
                    boxShadow       : SOMBRAS.burbuja,
                    display         : 'flex',
                    alignItems      : 'center',
                    gap             : 0.75,
                }}
            >
                {/*
                    Tres puntos que laten por turnos. El `animationDelay` escalonado es lo único
                    que los distingue de un bloque parpadeante.
                */}
                { [0, 1, 2].map((punto) => (
                    <Box
                        key={punto}
                        sx={{
                            width           : 7,
                            height          : 7,
                            borderRadius     : '50%',
                            backgroundColor : COLORES.primarioClaro,
                            animation       : 'ergoLatido 1.4s ease-in-out infinite',
                            animationDelay  : `${punto * 0.18}s`,

                            '@keyframes ergoLatido': {
                                '0%, 80%, 100%' : { opacity: 0.28, transform: 'scale(0.8)' },
                                '40%'           : { opacity: 1, transform: 'scale(1)' },
                            },

                            // Sin animación el indicador sigue siendo legible: tres puntos
                            // atenuados más el texto de al lado.
                            '@media (prefers-reduced-motion: reduce)': {
                                animation : 'none',
                                opacity   : 0.6,
                            },
                        }}
                    />
                )) }

                <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', ml: 0.75, fontSize: 13.5 }}
                >
                    El asistente está respondiendo…
                </Typography>
            </Box>
        </Box>
    );
};
