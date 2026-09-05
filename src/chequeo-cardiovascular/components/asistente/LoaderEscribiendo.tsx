import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Indicador de «el asistente está respondiendo» (Spec 03).
 *
 * Clon de `src/ficha-clinica/components/asistente/LoaderEscribiendo.tsx`. Va con `role="status"`
 * para que un lector de pantalla anuncie la espera: el `CircularProgress` a secas no dice nada.
 */
export const LoaderEscribiendo = () => {

    return (
        <Box
            role="status"
            sx={{
                display        : 'flex',
                justifyContent : 'center',
                alignItems     : 'center',
                gap            : 1,
                py             : 2,
            }}
        >
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                El asistente está respondiendo…
            </Typography>
        </Box>
    );
};
