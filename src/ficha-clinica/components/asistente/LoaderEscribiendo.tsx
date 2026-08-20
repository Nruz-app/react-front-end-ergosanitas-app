import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Indicador de «el asistente está respondiendo» (Spec 04).
 *
 * Clon de `src/presentation/components/loaders/TypingLoader.tsx`, no de `TypingLoaderTer`:
 * ese muestra un GIF de 300×300 px que dentro de un panel de chat de 400 px de alto se
 * come la vista entera y desentona con el resto de la ficha clínica.
 */

interface Props {
    className?: string;
}

export const LoaderEscribiendo = ({ className }: Props) => {
    return (
        <Box
            className={className}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                py: 2,
            }}
        >
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                El asistente está respondiendo…
            </Typography>
        </Box>
    );
};
