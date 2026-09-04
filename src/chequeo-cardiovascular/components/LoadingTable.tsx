import { Box, CircularProgress } from '@mui/material';

/** Indicador de carga de la lista, centrado dentro de la propia tabla. */
export const LoadingTable = () => {

    return (
        <Box
            sx={{
                display        : 'flex',
                justifyContent : 'center',
                alignItems     : 'center',
                width          : '100%',
                py             : 6,
            }}
        >
            <CircularProgress size={36} sx={{ color: '#1976d2' }} />
        </Box>
    );
};
