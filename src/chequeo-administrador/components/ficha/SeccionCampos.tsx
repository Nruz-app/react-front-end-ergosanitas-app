import { ReactNode } from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';

import { COLORES, sxTituloSeccion } from '../../config/tema';

interface Props {
    titulo   : string;
    /** Cuántos campos visibles tiene la sección. Si es 0, la sección entera no se pinta. */
    cantidad : number;
    children : ReactNode;
}

/**
 * Cabecera + grilla de una sección del formulario de chequeo (§6.4).
 *
 * **Sin campos visibles no renderiza nada**, para no dejar cabeceras huérfanas. Para el
 * Administrador, que ve los 25 campos, las cinco secciones salen siempre; la regla se mantiene
 * porque es la que hace correcto el agrupado si mañana se oculta un campo.
 */
export const SeccionCampos = ({ titulo, cantidad, children }: Props) => {

    if (cantidad === 0) return null;

    return (
        <Box component="section" sx={{ mb: 4 }}>
            <Typography
                component="h2"
                sx={{
                    ...sxTituloSeccion,
                    textTransform : 'uppercase',
                    letterSpacing : '0.06em',
                    mb            : 1,
                }}
            >
                { titulo }
            </Typography>

            <Divider sx={{ mb: 3, borderColor: COLORES.divisor }} />

            <Grid container spacing={3}>
                { children }
            </Grid>
        </Box>
    );
};
