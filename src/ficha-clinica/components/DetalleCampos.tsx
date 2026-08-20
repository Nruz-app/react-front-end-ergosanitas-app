import { ReactNode } from 'react';
import { Box, Grid, Typography } from '@mui/material';

/**
 * Piezas compartidas por los paneles de detalle de las tablas de exámenes
 * (`BioimpedanciaRow` y `ElectroRow`): un campo etiqueta/valor y un bloque
 * de campos agrupados bajo un título.
 */

interface DatoProps {
    label: string;
    valor: string;
}

export const Dato = ({ label, valor }: DatoProps) => (
    <Grid item xs={6} sm={4}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {valor}
        </Typography>
    </Grid>
);

interface BloqueProps {
    titulo: string;
    children: ReactNode;
}

export const Bloque = ({ titulo, children }: BloqueProps) => (
    <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            {titulo}
        </Typography>
        <Grid container spacing={1.5}>
            {children}
        </Grid>
    </Box>
);
