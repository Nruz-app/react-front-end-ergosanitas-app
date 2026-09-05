import { Avatar, Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

import { COLORES, DEGRADADOS, SOMBRAS } from '../../config/tema';

interface Props {
    text: string;
}

/**
 * Turno del usuario en el chat del Home del colegio (Spec 03).
 *
 * Clon de `src/ficha-clinica/components/asistente/BurbujaUsuario.tsx`, con los colores movidos
 * a `config/tema.ts`.
 */
export const BurbujaUsuario = ({ text }: Props) => {

    return (
        <Box
            sx={{
                padding         : 2,
                display         : 'flex',
                justifyContent  : 'flex-start',
                flexDirection   : 'row-reverse',
                borderRadius    : '8px',
                backgroundColor : 'transparent',
            }}
        >
            <Avatar
                sx={{
                    bgcolor    : COLORES.primarioOsc,
                    width      : 36,
                    height     : 36,
                    flexShrink : 0,
                    boxShadow  : SOMBRAS.burbuja,
                }}
            >
                <PersonIcon fontSize="small" />
            </Avatar>
            <Box
                sx={{
                    marginRight  : 1.75,
                    padding      : '12px 18px',
                    background   : DEGRADADOS.burbujaUsuario,
                    color        : 'common.white',

                    // Espejo de la burbuja del asistente: la esquina recogida es la que mira a
                    // su avatar, aquí la superior derecha.
                    borderRadius : '16px 4px 16px 16px',
                    boxShadow    : SOMBRAS.burbujaUsuario,

                    maxWidth : { xs: '75%', sm: '70%', md: '60%' },

                    wordBreak    : 'break-word',
                    overflowWrap : 'break-word',
                    whiteSpace   : 'pre-wrap',

                    transition : 'box-shadow 0.3s ease',

                    '&:hover' : { boxShadow: SOMBRAS.burbujaUsuarioHover },

                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
            >
                <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: 14.5 }}>
                    { text }
                </Typography>
            </Box>
        </Box>
    );
};
