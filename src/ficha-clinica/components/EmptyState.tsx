import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface Props {
    mensaje: string;
    detalle?: string;
    icon?: ReactNode;
}

/**
 * Estado vacío de una sección.
 *
 * Existe para que "no hay registros" se distinga de un fallo: una tabla sin filas
 * o un gráfico en blanco se leen igual que algo roto.
 */
export const EmptyState = ({ mensaje, detalle, icon }: Props) => {
    return (
        <Box
            sx={{
                py: 6,
                px: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 1,
                color: 'text.secondary',
            }}
        >
            <Box sx={{ fontSize: 56, lineHeight: 1, color: 'action.disabled' }}>
                {icon ?? <InboxIcon fontSize="inherit" />}
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {mensaje}
            </Typography>

            {detalle && (
                <Typography variant="body2">
                    {detalle}
                </Typography>
            )}
        </Box>
    );
};

export default EmptyState;
