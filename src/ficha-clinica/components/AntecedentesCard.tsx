import { ReactNode } from 'react';
import { Box, Card, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { IAntecedentes } from '../interface';

interface Props {
    antecedentes: IAntecedentes;
}

interface FilaProps {
    icon: ReactNode;
    label: string;
    valor: string | null;
    color: string;
}

const Fila = ({ icon, label, valor, color }: FilaProps) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${color}1A`,
                color,
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {valor ?? '—'}
            </Typography>
        </Box>
    </Stack>
);

export const AntecedentesCard = ({ antecedentes }: Props) => {
    return (
        <Card
            sx={{
                borderRadius: 6,
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                height: '100%',
            }}
        >
            <CardHeader
                title={
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.3px' }}>
                        Antecedentes clínicos
                    </Typography>
                }
            />
            <CardContent>
                <Stack spacing={2.5} divider={<Divider flexItem />}>
                    {/* El backend no envía alergias: no hay fila para ese antecedente. */}
                    <Fila
                        icon={<MonitorHeartIcon />}
                        label="Enfermedades crónicas"
                        valor={antecedentes.enfermedadesCronicas}
                        color="#e53935"
                    />
                    <Fila
                        icon={<MedicationIcon />}
                        label="Medicamentos diarios"
                        valor={antecedentes.medicamentosDiarios}
                        color="#1976d2"
                    />
                    <Fila
                        icon={<HistoryEduIcon />}
                        label="Enfermedades anteriores"
                        valor={antecedentes.enfermedadesAnteriores}
                        color="#8e24aa"
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};

export default AntecedentesCard;
