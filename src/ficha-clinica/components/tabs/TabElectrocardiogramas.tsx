import {
    Box,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

import { IElectrocardiograma } from '../../interface';
import { ElectroRow } from '../ElectroRow';
import { EmptyState } from '../EmptyState';
import { ChartCard } from '../ChartCard';
import { HemoglucotestChart, PresionChart, SaturacionFcChart } from '../charts';

interface Props {
    electrocardiogramas: IElectrocardiograma[];
}

export const TabElectrocardiogramas = ({ electrocardiogramas }: Props) => {

    if (electrocardiogramas.length === 0) {
        return (
            <EmptyState
                icon={<MonitorHeartIcon fontSize="inherit" />}
                mensaje="Sin electrocardiogramas registrados"
                detalle="Cuando el paciente tenga controles cardiológicos, aparecerán aquí."
            />
        );
    }

    return (
        <Box>
            {/* Evolución: el eje X corre de la fecha más antigua a la más reciente,
                al revés que la tabla de abajo. */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <ChartCard titulo="Presión arterial" subtitulo="Sistólica vs diastólica">
                        <PresionChart electrocardiogramas={electrocardiogramas} />
                    </ChartCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <ChartCard titulo="Saturación y frecuencia cardíaca" subtitulo="SpO₂ y FC por control">
                        <SaturacionFcChart electrocardiogramas={electrocardiogramas} />
                    </ChartCard>
                </Grid>
                <Grid item xs={12}>
                    <ChartCard titulo="Hemoglucotest" subtitulo="Glicemia capilar por control">
                        <HemoglucotestChart electrocardiogramas={electrocardiogramas} />
                    </ChartCard>
                </Grid>
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                Controles de electrocardiograma
            </Typography>

            {/* La tabla scrollea dentro de su contenedor: en móvil no desborda la página. */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table size="small" aria-label="Controles de electrocardiograma">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ width: 48 }} />
                            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Presión (mmHg)</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">FC (ppm)</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">SpO₂</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Orden descendente tal como los entrega el mapper: el más reciente arriba. */}
                        {electrocardiogramas.map((electro) => (
                            <ElectroRow key={electro.idElectro} electro={electro} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TabElectrocardiogramas;
