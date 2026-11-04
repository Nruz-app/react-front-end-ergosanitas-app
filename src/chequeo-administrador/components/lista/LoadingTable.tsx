import { Box, CircularProgress } from '@mui/material';

/** Indicador de carga de la lista, centrado dentro de la tabla. Los tres spinners de hoy. */
export const LoadingTable = () => {

    return (
        <Box
            role="status"
            aria-label="Cargando chequeos"
            sx={{
                display        : 'flex',
                justifyContent : 'center',
                alignItems     : 'center',
                width          : '100%',
                height         : '200px',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                <CircularProgress size={40} color="primary" />
                <CircularProgress size={40} color="secondary" />
                <CircularProgress size={40} color="success" />
            </Box>
        </Box>
    );
};
