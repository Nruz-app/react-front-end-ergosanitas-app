import { Box, Grid } from '@mui/material';

import {
    BarPresion, ModalStatus, PieChartHemoglucotest, PieChartImc, PieChartSaturacion,
    StatisticsGlobal,
} from '../components';

/**
 * Home del colegio: los contadores arriba y los cuatro gráficos debajo, en dos filas de dos.
 * `ModalStatus` cuelga del `ModalBarProvider` que monta el orquestador.
 */
export const HomePage = () => {

    return (
        <Box>
            <StatisticsGlobal />

            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}><BarPresion /></Grid>
                <Grid item xs={12} md={6}><PieChartHemoglucotest /></Grid>
                <Grid item xs={12} md={6}><PieChartImc /></Grid>
                <Grid item xs={12} md={6}><PieChartSaturacion /></Grid>
            </Grid>

            <ModalStatus />
        </Box>
    );
};
