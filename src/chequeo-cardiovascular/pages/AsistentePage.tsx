import { Box, Typography } from '@mui/material';

import { COLORES } from '../config/tema';
import { AsistenteColegio } from '../components';

interface Props {
    /**
     * `true` mientras este tab está a la vista.
     *
     * `TabPanel` oculta los paneles con `display: none` en vez de desmontarlos —así la lista
     * conserva sus filtros y su página—, de modo que el cleanup de `useReconocimientoVoz` no se
     * dispara al cambiar de tab. Sin esta señal el micrófono seguiría grabando con el chat fuera
     * de pantalla.
     */
    activo?: boolean;
}

/**
 * Tab «Asistente Virtual».
 *
 * El chat vivía dentro del Home, entre los contadores y la lista de alterados. Se sacó a su
 * propio tab porque compite mal con el resto: el Home es una pantalla para **mirar** —cifras,
 * quién requiere atención, gráficos— y el chat es una pantalla para **hacer**. Mezclados, el
 * chat obligaba a bajar por encima de él para llegar a los datos, y el hilo de la conversación
 * se perdía en cuanto alguien hacía scroll.
 *
 * Aparte, aquí ocupa el alto completo del panel en vez de una franja: una conversación larga se
 * lee mucho mejor.
 */
export const AsistentePage = ({ activo = true }: Props) => {

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography
                component="h2"
                sx={{ fontWeight: 700, fontSize: { xs: 18, md: 20 }, color: COLORES.primarioOsc, mb: 0.5 }}
            >
                Asistente Virtual
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
                Consulta asistida sobre los deportistas de tu colegio.
            </Typography>

            <AsistenteColegio activo={activo} alto="completo" />
        </Box>
    );
};
