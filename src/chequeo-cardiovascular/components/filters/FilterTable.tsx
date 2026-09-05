import { Box, Paper, Typography } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import { COLORES } from '../../config/tema';
import { DatePickerInput } from '../date-pickers/DatePickerInput';
import { LikeTextChequeo } from './LikeTextChequeo';

/**
 * Barra de filtros de la lista.
 *
 * Rediseño respecto al original: allí eran tres acordeones apilados y el filtro por fecha
 * estaba oculto para todo el mundo salvo `Administrador`. Aquí los dos filtros que este perfil
 * necesita están **siempre a la vista, en una sola fila**, y no hay filtro por club: `Colegios`
 * es un solo club por definición.
 */
export const FilterTable = () => {

    return (
        <Paper
            elevation={0}
            sx={{
                p            : { xs: 2, md: 2.5 },
                mb           : 2,
                borderRadius : 3,
                border       : `1px solid ${COLORES.fondoSuave}`,
                boxShadow    : '0 2px 12px rgba(0,0,0,0.05)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterAltIcon fontSize="small" sx={{ color: COLORES.primario }} aria-hidden="true" />
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: COLORES.primarioOsc }}>
                    Filtrar deportistas
                </Typography>
            </Box>

            <Box
                sx={{
                    display  : 'flex',
                    gap      : { xs: 2, md: 3 },
                    flexWrap : 'wrap',
                    alignItems: 'flex-start',
                }}
            >
                <LikeTextChequeo />
                <DatePickerInput />
            </Box>
        </Paper>
    );
};
