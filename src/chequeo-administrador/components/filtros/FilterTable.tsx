import { ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { COLORES, DEGRADADOS, SOMBRAS, UI } from '../../config/tema';
import { DatePickerInput } from './DatePickerInput';
import { LikeTextChequeo } from './LikeTextChequeo';
import { SelectClub } from './SelectClub';

interface FiltroProps {
    id        : string;
    titulo    : string;
    abierto?  : boolean;
    children  : ReactNode;
}

/** Un acordeón de filtro, con la cabecera verde de hoy. */
const Filtro = ({ id, titulo, abierto = false, children }: FiltroProps) => (
    <Accordion
        disableGutters
        defaultExpanded={abierto}
        elevation={0}
        square
        sx={{
            mt           : 1,
            borderRadius : 3,
            boxShadow    : SOMBRAS.tabla,
            transition   : 'box-shadow 0.3s ease-in-out',
            '&:hover'    : { boxShadow: SOMBRAS.tablaHover },
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
    >
        <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: COLORES.textoSobrePrimario }} />}
            aria-controls={`${id}-content`}
            id={`${id}-header`}
            sx={{
                background   : DEGRADADOS.filtro,
                color        : COLORES.textoSobrePrimario,
                borderRadius : 3,
                px           : 3,
                typography   : 'h6',
                '&:hover'    : { background: DEGRADADOS.filtroHover },
            }}
        >
            { titulo }
        </AccordionSummary>
        <AccordionDetails
            sx={{
                backgroundColor : UI.fondoSutil,
                borderRadius    : 2,
                border          : `1px solid ${COLORES.borde}`,
                p               : { xs: 1.5, sm: 3 },
            }}
        >
            { children }
        </AccordionDetails>
    </Accordion>
);

/**
 * Los tres filtros de la lista: texto (abierto), fecha y club.
 *
 * En el original la fecha y el club se ocultaban con `display: none` para todo perfil que no
 * fuera Administrador. Aquí siempre es Administrador, así que se pintan siempre y sin ramificar.
 */
export const FilterTable = () => {

    return (
        <Box
            sx={{
                width        : '100%',
                maxWidth     : 800,
                mx           : 'auto',
                bgcolor      : 'background.paper',
                boxShadow    : 4,
                borderRadius : 3,
                overflow     : 'hidden',
                p            : { xs: 1, sm: 2 },
            }}
        >
            <Filtro id="filtro-texto" titulo="Filtrar Rut y/o Nombre" abierto>
                <LikeTextChequeo />
            </Filtro>
            <Filtro id="filtro-fecha" titulo="Filtrar Fecha">
                <DatePickerInput />
            </Filtro>
            <Filtro id="filtro-club" titulo="Filtrar Club">
                <SelectClub />
            </Filtro>
        </Box>
    );
};
