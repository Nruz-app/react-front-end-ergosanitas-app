import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';

import { IBioimpedancia } from '../../interface';
import { BioimpedanciaRow } from '../BioimpedanciaRow';
import { EmptyState } from '../EmptyState';
import { ChartCard } from '../ChartCard';
import { PesoImcChart } from '../charts';

interface Props {
    bioimpedancias: IBioimpedancia[];
}

export const TabBioimpedancias = ({ bioimpedancias }: Props) => {

    if (bioimpedancias.length === 0) {
        return (
            <EmptyState
                icon={<MonitorWeightIcon fontSize="inherit" />}
                mensaje="Sin bioimpedancias registradas"
                detalle="Cuando el paciente tenga exámenes de composición corporal, aparecerán aquí."
            />
        );
    }

    return (
        <Box>
            {/* Evolución: el eje X corre de la fecha más antigua a la más reciente,
                al revés que la tabla de abajo. */}
            <Box sx={{ mb: 4 }}>
                <ChartCard titulo="Peso e IMC" subtitulo="Evolución por examen">
                    <PesoImcChart bioimpedancias={bioimpedancias} />
                </ChartCard>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                Exámenes de bioimpedancia
            </Typography>

            {/* La tabla scrollea dentro de su contenedor: en móvil no desborda la página. */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table size="small" aria-label="Exámenes de bioimpedancia">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ width: 48 }} />
                            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">IMC</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Peso</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Grasa corporal</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Tipo corporal</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Orden descendente tal como los entrega el mapper: el más reciente arriba. */}
                        {bioimpedancias.map((bioimpedancia) => (
                            <BioimpedanciaRow key={bioimpedancia.id} bioimpedancia={bioimpedancia} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TabBioimpedancias;
