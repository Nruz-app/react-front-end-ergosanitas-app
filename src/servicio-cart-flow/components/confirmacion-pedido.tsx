import { Alert, Box, Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { AVISO_RESULTADOS, INSTRUCCIONES_EFECTIVO, INSTRUCCIONES_TRANSFERENCIA } from '../config/textos';
import { COLORES, UI } from '../config/tema';
import type { IPedido } from '../interface';
import { formatoClp, formatoFecha } from '../utilities';
import { DesgloseTotal } from './desglose-total';
import { PreparacionConsolidada } from './preparacion-consolidada';

interface Props {
    pedido     : IPedido;
    /** Resultado que trae la vuelta de Webpay (`?pago=`), si la hay. */
    resultado ?: string | null;
    cargando  ?: boolean;
    onPagar   ?: () => void;
    onNuevo    : () => void;
}

const titulo = (pedido: IPedido, resultado?: string | null) => {
    if (pedido.estado_pago === 'pagado') return 'Pago recibido: tu visita está agendada';
    if (resultado === 'rechazado' || resultado === 'cancelado' || pedido.estado_pago === 'rechazado') return 'El pago no se completó';
    if (pedido.medio_pago === 'webpay') return 'Pedido creado: falta el pago';
    return 'Pedido recibido';
};

/** Paso 7 y página de resultado: número, agenda, preparación por paciente y total. */
export const ConfirmacionPedido = ({ pedido, resultado, cargando, onPagar, onNuevo }: Props) => {

    const pagado = pedido.estado_pago === 'pagado';
    const reintentar = pedido.medio_pago === 'webpay' && !pagado && pedido.estado === 'pendiente_pago' && !!onPagar;

    return (
        <Stack spacing={3} sx={{ maxWidth: 820, mx: 'auto' }}>

            <Box textAlign="center">
                {pagado
                    ? <CheckCircleIcon sx={{ fontSize: 56, color: UI.exito }} />
                    : <ScheduleIcon sx={{ fontSize: 56, color: COLORES.primario }} />}
                <Typography variant="h5" fontWeight="bold" color={COLORES.navy}>{titulo(pedido, resultado)}</Typography>
                <Chip label={`Pedido ${pedido.numero}`} sx={{ mt: 1, fontWeight: 'bold' }} />
            </Box>

            {pedido.medio_pago === 'transferencia' && !pagado && <Alert severity="info">{INSTRUCCIONES_TRANSFERENCIA}</Alert>}
            {pedido.medio_pago === 'efectivo' && <Alert severity="info">{INSTRUCCIONES_EFECTIVO}</Alert>}
            {reintentar && (
                <Alert severity="warning" action={<Button color="inherit" disabled={cargando} onClick={onPagar}>Pagar con Webpay</Button>}>
                    Tu horario queda reservado mientras completas el pago.
                </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: COLORES.borde }}>
                <Typography fontWeight="bold" color={COLORES.navy}>
                    {formatoFecha(pedido.agenda.fecha)} · bloque {pedido.agenda.bloque}
                </Typography>
                <Typography color={COLORES.textoSuave}>{pedido.direccion}, {pedido.comuna}</Typography>
            </Paper>

            {pedido.pacientes.map((p) => (
                <Paper key={p.orden} variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: COLORES.borde }}>
                    <Typography fontWeight="bold" color={COLORES.navy} sx={{ mb: 1 }}>{p.nombre}</Typography>
                    <Stack divider={<Divider flexItem />} spacing={0.5} sx={{ mb: 2 }}>
                        {p.lineas.map((l) => (
                            <Stack key={`${l.sku}-${l.automatica}`} direction="row" justifyContent="space-between">
                                <Typography variant="body2">{l.cantidad > 1 ? `${l.cantidad} × ` : ''}{l.nombre}</Typography>
                                <Typography variant="body2">{formatoClp(l.subtotal)}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                    <PreparacionConsolidada titulo="Preparación para la visita" preparacion={p.preparacion} />
                </Paper>
            ))}

            <DesgloseTotal desglose={pedido.desglose} />

            <Typography variant="body2" color={COLORES.textoSuave} textAlign="center">{AVISO_RESULTADOS}</Typography>

            <Stack direction="row" justifyContent="center">
                <Button variant="outlined" onClick={onNuevo}>Hacer otro pedido</Button>
            </Stack>
        </Stack>
    );
};
