import { ReactNode } from 'react';
import { Box, Card, Typography } from '@mui/material';

interface Props {
    label: string;
    // `null` significa que el backend no entregó el dato: se pinta '—', nunca 0.
    valor: number | string | null;
    unidad?: string;
    icon: ReactNode;
    // Color de acento (borde/ícono). Por defecto azul primario.
    color?: string;
}

export const KpiCard = ({ label, valor, unidad, icon, color = '#1976d2' }: Props) => {

    const sinDato = valor === null;

    return (
        <Card
            sx={{
                borderRadius: 4,
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
                p: 2.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderLeft: `5px solid ${color}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.14)',
                },
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: `${color}1A`, // color con ~10% de opacidad
                    color,
                }}
            >
                {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, lineHeight: 1.2, color: sinDato ? 'text.disabled' : 'inherit' }}
                >
                    {sinDato ? '—' : valor}
                    {/* Sin valor no se muestra la unidad: '— mmHg' no significa nada. */}
                    {!sinDato && unidad && (
                        <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 0.5 }}>
                            {unidad}
                        </Typography>
                    )}
                </Typography>
            </Box>
        </Card>
    );
};

export default KpiCard;
