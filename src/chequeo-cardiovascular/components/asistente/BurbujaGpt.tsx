import { Avatar, Box, Typography } from '@mui/material';

import { COLORES, SOMBRAS, UI } from '../../config/tema';

interface Props {
    text: string;
}

/**
 * Turno del asistente en el chat del Home del colegio (Spec 03).
 *
 * Clon de `src/ficha-clinica/components/asistente/BurbujaGpt.tsx`, con los colores movidos a
 * `config/tema.ts`: ningún `.tsx` de este módulo escribe un hex.
 */
export const BurbujaGpt = ({ text }: Props) => {

    return (
        <Box
            sx={{
                display      : 'flex',
                alignItems   : 'flex-start',
                padding      : 2,
                borderRadius : '16px',
                backgroundColor : 'transparent',
            }}
        >
            <Avatar
                src="/logoTrans.png"
                alt="Asistente Ergo"
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
                    padding         : '14px 18px',
                    backgroundColor : UI.burbujaGpt,
                    border          : `1px solid ${UI.burbujaGptBorde}`,

                    // Esquina superior izquierda recogida: apunta al avatar y evita que la
                    // burbuja parezca una tarjeta suelta flotando al lado.
                    borderRadius    : '4px 16px 16px 16px',
                    boxShadow       : SOMBRAS.burbuja,
                    position        : 'relative',

                    maxWidth : { xs: '85%', sm: '80%', md: '75%' },

                    // Las respuestas llegan con saltos de línea y pueden traer un RUT o una
                    // cifra larga sin espacios: sin esto desbordan la burbuja.
                    wordBreak    : 'break-word',
                    overflowWrap : 'break-word',
                    whiteSpace   : 'pre-wrap',
                }}
            >
                <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ lineHeight: 1.7, fontSize: 14.5 }}
                >
                    { text }
                </Typography>
            </Box>
        </Box>
    );
};
