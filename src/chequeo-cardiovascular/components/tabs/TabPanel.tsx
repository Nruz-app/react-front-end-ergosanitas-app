import { ReactNode } from 'react';
import { Box } from '@mui/material';

interface Props {
    children? : ReactNode;
    index     : number;
    value     : number;
}

/**
 * Panel de un tab. Se oculta con `display: none` en vez de desmontarse, que es lo que permite
 * volver a la lista sin perder los filtros ni la página en la que estabas.
 */
export const TabPanel = ({ children, value, index }: Props) => {

    return (
        <Box
            role="tabpanel"
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            sx={{
                display : value !== index ? 'none' : 'block',
                p       : { xs: 1.5, md: 3 },
            }}
        >
            { children }
        </Box>
    );
};
