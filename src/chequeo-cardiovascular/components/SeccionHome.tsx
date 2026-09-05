import { ReactNode } from 'react';
import { Box, Divider, Typography } from '@mui/material';

import { sxTituloSeccion } from '../config/tema';

interface Props {
    titulo      : string;
    descripcion : string;
    children    : ReactNode;
}

/**
 * Un bloque del Home con su encabezado.
 *
 * Con la lista de seguimiento y seis gráficos en una pantalla, una rejilla plana obliga a
 * leerlo todo para encontrar lo que importa. El encabezado convierte el scroll en dos
 * preguntas: «¿a quién hay que atender?» y «¿cómo está la población?».
 */
export const SeccionHome = ({ titulo, descripcion, children }: Props) => {

    return (
        <Box component="section" sx={{ mt: 4 }}>
            <Typography component="h2" sx={sxTituloSeccion}>
                { titulo }
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                { descripcion }
            </Typography>

            <Divider sx={{ my: 2 }} />

            { children }
        </Box>
    );
};
