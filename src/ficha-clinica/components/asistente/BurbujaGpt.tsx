import { Avatar, Box, Typography } from '@mui/material';

/**
 * Turno del asistente en el chat «Asistente Ergo» (Spec 04).
 *
 * Clon de `src/presentation/components/chat-bubbles/GptMessage.tsx`. Se duplica porque la
 * Spec 04 prohíbe importar desde `src/presentation/`.
 */

interface Props {
    text: string;
}

export const BurbujaGpt = ({ text }: Props) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: 2,
                borderRadius: '16px',
                backgroundColor: 'transparent',
            }}
        >
            <Avatar
                src="/logoTrans.png"
                alt="Asistente Ergo"
                sx={{
                    width: 50,
                    height: 50,
                    flexShrink: 0,
                    bgcolor: 'white',
                    border: '2px solid',
                    borderColor: 'primary.main',
                }}
            />
            <Box
                sx={{
                    marginLeft: 2,
                    padding: '16px',
                    backgroundColor: 'rgba(0, 0, 0, 0.06)',
                    borderRadius: '16px',
                    boxShadow: 2,
                    position: 'relative',

                    maxWidth: {
                        xs: '85%',
                        sm: '80%',
                        md: '75%',
                    },

                    // Las respuestas del asistente llegan con saltos de línea y pueden
                    // traer un RUT o un valor largo sin espacios: sin esto desbordan.
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                }}
            >
                <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.6 }}>
                    {text}
                </Typography>
            </Box>
        </Box>
    );
};
