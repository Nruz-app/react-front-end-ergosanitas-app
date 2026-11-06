import { Box, Paper, Skeleton, Typography } from '@mui/material';

import { COLORES } from '../config/tema';
import type { IResumen } from '../interface';
import { formatoClp } from '../utilities';

interface Props {
    resumen: IResumen | null;
}

/** KPIs del carro (SPEC 05 §3.3 `admin/resumen`). */
export const ResumenTarjetas = ({ resumen }: Props) => {

    const tarjetas = resumen ? [
        { titulo: 'Pedidos de hoy', valor: String(resumen.pedidos_hoy), detalle: 'creados hoy' },
        { titulo: 'Pendientes de pago', valor: String(resumen.pendientes_pago.cantidad), detalle: formatoClp(resumen.pendientes_pago.monto) },
        { titulo: 'Pagados este mes', valor: String(resumen.pagados_mes.cantidad), detalle: formatoClp(resumen.pagados_mes.monto) },
        { titulo: 'Visitas próximas', valor: String(resumen.proximas_visitas), detalle: 'en los próximos 7 días' },
        { titulo: 'Cotizaciones nuevas', valor: String(resumen.cotizaciones_nuevas), detalle: 'sin contactar' },
    ] : [];

    return (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' } }}>
            {(resumen ? tarjetas : Array.from({ length: 5 }, () => null)).map((t, i) => (
                <Paper key={t?.titulo ?? i} variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: COLORES.borde, borderTop: `4px solid ${COLORES.primario}` }}>
                    {t ? (
                        <>
                            <Typography variant="caption" color={COLORES.textoSuave}>{t.titulo}</Typography>
                            <Typography variant="h5" fontWeight="bold" color={COLORES.primarioOsc}>{t.valor}</Typography>
                            <Typography variant="body2" color={COLORES.textoSuave}>{t.detalle}</Typography>
                        </>
                    ) : <Skeleton height={64} />}
                </Paper>
            ))}
        </Box>
    );
};
