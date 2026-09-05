import { Avatar, Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

import { COLORES, UI } from '../../config/tema';

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
                    bgcolor    : COLORES.primario,
                    width      : 40,
                    height     : 40,
                    flexShrink : 0,
                }}
            >
                <PersonIcon fontSize="small" />
            </Avatar>
            <Box
                sx={{
                    marginRight     : 2,
                    padding         : '12px 16px',
                    backgroundColor : UI.burbujaUsuario,
                    color           : 'common.white',
                    borderRadius    : '12px',
                    boxShadow       : 2,

                    maxWidth : { xs: '75%', sm: '70%', md: '60%' },

                    wordBreak    : 'break-word',
                    overflowWrap : 'break-word',
                    whiteSpace   : 'pre-wrap',

                    transition : 'background-color 0.3s ease',

                    '&:hover' : { backgroundColor: UI.burbujaUsuarioHover },

                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
            >
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    { text }
                </Typography>
            </Box>
        </Box>
    );
};
