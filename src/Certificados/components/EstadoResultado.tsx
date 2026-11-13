import { Alert, AlertTitle, Box, Button, CircularProgress, Typography } from '@mui/material';

import textos from '../config/textos-certificados.json';

interface Props {
    estado: 'cargando' | 'vacio' | 'error';
    /** Mensaje del back (p. ej. el del 429); si falta se usa el texto genérico. */
    mensaje?: string | null;
    onReintentar?: () => void;
}

/**
 * Estados de la búsqueda que no son «hay documentos». Todo en línea: sin alertas modales ni redirección,
 * para que el usuario pueda corregir el RUT.
 */
export const EstadoResultado = ({ estado, mensaje, onReintentar }: Props) => {

    if (estado === 'cargando') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 4 }}>
                <CircularProgress size={28} />
                <Typography>{textos.resultados.cargando}</Typography>
            </Box>
        );
    }

    if (estado === 'vacio') {
        return (
            <Alert severity="info" variant="outlined">
                <AlertTitle>{textos.resultados.vacioTitulo}</AlertTitle>
                {textos.resultados.vacioTexto}
            </Alert>
        );
    }

    return (
        <Alert
            severity="error"
            variant="outlined"
            action={onReintentar && (
                <Button color="inherit" size="small" onClick={onReintentar}>
                    {textos.resultados.reintentar}
                </Button>
            )}
        >
            <AlertTitle>{textos.resultados.errorTitulo}</AlertTitle>
            {mensaje ?? textos.resultados.errorTexto}
        </Alert>
    );
};
