import { Avatar, Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Turno del usuario en el chat «Asistente Ergo» (Spec 04).
 *
 * Clon de `src/presentation/components/chat-bubbles/MyMessage.tsx`. Se duplica porque la
 * Spec 04 prohíbe importar desde `src/presentation/`.
 */

interface Props {
    text: string;
}

export const BurbujaUsuario = ({ text }: Props) => {
    return (
        <Box
            sx={{
                padding: 2,
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row-reverse',
                borderRadius: '8px',
                backgroundColor: 'transparent',
            }}
        >
            <Avatar
                sx={{
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                }}
            >
                <PersonIcon fontSize="small" />
            </Avatar>
            <Box
                sx={{
                    marginRight: 2,
                    padding: '12px 16px',

                    // Literal en vez de 'indigo.700' como el original: `indigo` no existe
                    // en la paleta por defecto de MUI, así que ese valor se emite como CSS
                    // inválido y la burbuja queda sin fondo. Este es el color que el
                    // original buscaba (Material Indigo 700).
                    backgroundColor: '#303f9f',
                    color: 'common.white',

                    borderRadius: '12px',
                    boxShadow: 2,

                    maxWidth: {
                        xs: '75%',
                        sm: '70%',
                        md: '60%',
                    },

                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',

                    transition: 'background-color 0.3s ease',

                    '&:hover': {
                        backgroundColor: '#283593',
                    },
                }}
            >
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    {text}
                </Typography>
            </Box>
        </Box>
    );
};
