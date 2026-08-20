import { Alert, Box, Grid, Typography } from '@mui/material';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import StraightenIcon from '@mui/icons-material/Straighten';
import SpeedIcon from '@mui/icons-material/Speed';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AirIcon from '@mui/icons-material/Air';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import CalculateIcon from '@mui/icons-material/Calculate';

import { IElectrocardiograma, IPacienteBase } from '../../interface';
import { formatFechaCL, formatPresion } from '../../utilities/format';
import { PacienteHeader } from '../PacienteHeader';
import { KpiCard } from '../KpiCard';
import { AntecedentesCard } from '../AntecedentesCard';
import { ChartCard } from '../ChartCard';
import { EstadoNutricionalChart } from '../charts';

interface Props {
    paciente: IPacienteBase;
    // Electrocardiograma más reciente: de ahí salen los signos vitales y los
    // antecedentes. Es `null` cuando el paciente no tiene ningún control registrado.
    ultimoElectro: IElectrocardiograma | null;
}

export const TabHome = ({ paciente, ultimoElectro }: Props) => {

    // Caso degradado: sin controles no hay signos vitales ni antecedentes que mostrar.
    // Se muestra la cabecera y un aviso, nunca una fila de tarjetas vacías.
    if (!ultimoElectro) {
        return (
            <Box>
                <PacienteHeader paciente={paciente} />
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                    Este paciente aún no tiene controles registrados, así que no hay signos
                    vitales ni antecedentes clínicos que mostrar.
                </Alert>
            </Box>
        );
    }

    const e = ultimoElectro;

    const kpis = [
        { label: 'Peso', valor: e.pesoKg, unidad: 'kg', icon: <MonitorWeightIcon />, color: '#1976d2' },
        { label: 'Estatura', valor: e.estaturaCm, unidad: 'cm', icon: <StraightenIcon />, color: '#5c6bc0' },
        { label: 'IMC', valor: e.imc, icon: <CalculateIcon />, color: '#66bb6a' },
        {
            label: 'Presión arterial',
            valor: formatPresion(e.presionSistolica, e.presionDiastolica),
            unidad: 'mmHg',
            icon: <SpeedIcon />,
            color: '#ef5350',
        },
        { label: 'Frec. cardíaca', valor: e.frecuenciaCardiaca, unidad: 'ppm', icon: <FavoriteIcon />, color: '#ab47bc' },
        { label: 'Saturación O₂', valor: e.saturacionOxigeno, unidad: '%', icon: <AirIcon />, color: '#26c6da' },
        { label: 'Hemoglucotest', valor: e.hemoglucotest, unidad: 'mg/dL', icon: <BloodtypeIcon />, color: '#fb8c00' },
        { label: 'Temperatura', valor: e.temperatura, unidad: '°C', icon: <ThermostatIcon />, color: '#ec407a' },
    ];

    return (
        <Box>
            {/* Cabecera del paciente */}
            <PacienteHeader paciente={paciente} />

            {/* Signos vitales del último control. La fecha va a la vista: estos valores
                son del día del examen, no de hoy. */}
            <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Signos vitales
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Último control: {formatFechaCL(e.fecha)}
                </Typography>
            </Box>

            <Grid container spacing={2.5}>
                {kpis.map((kpi) => (
                    <Grid item xs={12} sm={6} md={3} key={kpi.label}>
                        <KpiCard
                            label={kpi.label}
                            valor={kpi.valor}
                            unidad={kpi.unidad}
                            icon={kpi.icon}
                            color={kpi.color}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Estado nutricional y antecedentes, ambos del mismo control */}
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 5, mb: 2, color: 'text.primary' }}>
                Evaluación
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    {/* El rótulo declara que los cortes son de adulto: el IMC pediátrico
                        se evalúa por percentiles según edad y sexo. */}
                    <ChartCard titulo="Estado nutricional" subtitulo="IMC adulto (OMS)">
                        <EstadoNutricionalChart imc={e.imc} />
                    </ChartCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <AntecedentesCard antecedentes={e.antecedentes} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TabHome;
