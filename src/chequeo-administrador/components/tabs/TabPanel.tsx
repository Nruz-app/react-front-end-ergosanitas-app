import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

import { sxTituloPanel } from '../../config/tema';

interface Props {
    children? : ReactNode;
    index     : number;
    value     : number;
    /** Nombre del tab: se pinta como cabecera `h5`, así la pantalla dice dónde estás (§6.1). */
    titulo    : string;
}

/**
 * Panel de un tab. Se oculta con `display: none` **sin desmontarse**: es lo que permite volver a
 * la lista sin perder filtros ni página, y es la razón de que exista la señal `activo` (§4).
 */
export const TabPanel = ({ children, value, index, titulo }: Props) => {

    return (
        <Box
            role="tabpanel"
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            sx={{
                display  : value !== index ? 'none' : 'block',
                p        : { xs: 1.5, md: 3 },
                minWidth : 0,
            }}
        >
            <Typography component="h1" variant="h5" sx={{ ...sxTituloPanel, mb: 2 }}>
                { titulo }
            </Typography>
            { children }
        </Box>
    );
};
