import { Box, Chip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { COLORES, SOMBRAS, sxFocoVisible, UI } from '../../config/tema';

interface Props {
    sugerencias : string[];
    onElegir    : (pregunta: string) => void;
    /** Sin `user_email` no hay consulta posible, así que los ejemplos tampoco se pueden usar. */
    disabled?   : boolean;
}

/**
 * Preguntas de ejemplo del chat (Spec 03).
 *
 * Presentacional: recibe las sugerencias y avisa cuál se pulsó. **Rellena el input, no envía.**
 * Enviar directamente al pulsar quitaría la oportunidad de matizar la pregunta, que es
 * justamente lo que hace útil un ejemplo.
 *
 * El padre lo deja de renderizar en cuanto hay un mensaje en el hilo: una vez que la
 * conversación empezó, los ejemplos estorban.
 */
export const SugerenciasChat = ({ sugerencias, onElegir, disabled = false }: Props) => {

    if (sugerencias.length === 0) return null;

    // El sangrado izquierdo alinea los chips con la burbuja de bienvenida en vez de con su
    // avatar: así se leen como continuación de lo que el asistente acaba de decir.
    return (
        <Box sx={{ pl: { xs: 2, sm: 9.25 }, pr: 2, pb: 2, mt: -0.5 }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                <AutoAwesomeIcon
                    sx={{ fontSize: 15, color: COLORES.primarioClaro }}
                    aria-hidden="true"
                />
                <Typography
                    component="p"
                    sx={{
                        fontSize      : 11.5,
                        fontWeight    : 700,
                        color         : COLORES.primario,
                        letterSpacing : '0.06em',
                        textTransform : 'uppercase',
                    }}
                >
                    Prueba con una de estas
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                { sugerencias.map((pregunta) => (
                    <Chip
                        key={pregunta}
                        label={pregunta}
                        clickable={!disabled}
                        disabled={disabled}
                        onClick={() => onElegir(pregunta)}
                        sx={{
                            backgroundColor : UI.burbujaGpt,
                            border          : `1px solid ${COLORES.divisor}`,
                            color           : COLORES.primarioOsc,
                            fontSize        : 13,
                            fontWeight      : 500,
                            height          : 'auto',
                            py              : 0.85,
                            borderRadius    : 5,
                            boxShadow       : SOMBRAS.burbuja,
                            transition      : 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                            '& .MuiChip-label': { whiteSpace: 'normal', px: 1.75 },
                            '&:hover': {
                                backgroundColor : COLORES.fondoSuave,
                                borderColor     : COLORES.primarioClaro,
                                transform       : 'translateY(-1px)',
                            },
                            ...sxFocoVisible,
                            '@media (prefers-reduced-motion: reduce)': {
                                transition : 'none',
                                '&:hover'  : { transform: 'none' },
                            },
                        }}
                    />
                )) }
            </Box>
        </Box>
    );
};
