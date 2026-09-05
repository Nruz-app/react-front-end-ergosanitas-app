import { Avatar, Box, Typography } from '@mui/material';

import { COLORES, UI } from '../../config/tema';

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
                    width       : 50,
                    height      : 50,
                    flexShrink  : 0,
                    bgcolor     : COLORES.fondoTarjeta,
                    border      : '2px solid',
                    borderColor : COLORES.primario,
                }}
            />
            <Box
                sx={{
                    marginLeft      : 2,
                    padding         : '16px',
                    backgroundColor : UI.burbujaGpt,
                    borderRadius    : '16px',
                    boxShadow       : 2,
                    position        : 'relative',

                    maxWidth : { xs: '85%', sm: '80%', md: '75%' },

                    // Las respuestas llegan con saltos de línea y pueden traer un RUT o una
                    // cifra larga sin espacios: sin esto desbordan la burbuja.
                    wordBreak    : 'break-word',
                    overflowWrap : 'break-word',
                    whiteSpace   : 'pre-wrap',
                }}
            >
                <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.6 }}>
                    { text }
                </Typography>
            </Box>
        </Box>
    );
};
