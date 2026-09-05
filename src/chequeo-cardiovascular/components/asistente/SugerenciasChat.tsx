import { Box, Chip, Typography } from '@mui/material';

import { COLORES, sxFocoVisible } from '../../config/tema';

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

    return (
        <Box sx={{ px: 2, pb: 2 }}>
            <Typography
                component="p"
                sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}
            >
                Prueba con una de estas:
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                { sugerencias.map((pregunta) => (
                    <Chip
                        key={pregunta}
                        label={pregunta}
                        variant="outlined"
                        clickable={!disabled}
                        disabled={disabled}
                        onClick={() => onElegir(pregunta)}
                        sx={{
                            borderColor : COLORES.divisor,
                            color       : COLORES.primarioOsc,
                            fontSize    : 13,
                            height      : 'auto',
                            py          : 0.75,
                            '& .MuiChip-label': { whiteSpace: 'normal' },
                            '&:hover': { backgroundColor: COLORES.fondoSuave },
                            ...sxFocoVisible,
                        }}
                    />
                )) }
            </Box>
        </Box>
    );
};
