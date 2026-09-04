import { ReactNode } from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';

interface Props {
    titulo   : string;
    /** Cuántos campos visibles tiene la sección. Si es 0, la sección entera no se pinta. */
    cantidad : number;
    children : ReactNode;
}

/**
 * Cabecera + grilla de una sección del formulario.
 *
 * **Si la sección no tiene campos visibles no renderiza nada.** Es lo que evita cabeceras
 * huérfanas: para el perfil `Colegios`, cuatro de las cinco secciones quedan vacías porque sus
 * campos son `disabledText: true`, y el formulario debe mostrar solo «Identificación».
 */
export const SeccionCampos = ({ titulo, cantidad, children }: Props) => {

    if (cantidad === 0) return null;

    return (
        <Box sx={{ mb: 4 }}>
            <Typography
                component="h2"
                sx={{
                    fontWeight    : 700,
                    fontSize      : { xs: 15, md: 16 },
                    color         : '#0d47a1',
                    textTransform : 'uppercase',
                    letterSpacing : '0.06em',
                    mb            : 1,
                }}
            >
                { titulo }
            </Typography>

            <Divider sx={{ mb: 3, borderColor: '#bbdefb' }} />

            <Grid container spacing={3}>
                { children }
            </Grid>
        </Box>
    );
};
