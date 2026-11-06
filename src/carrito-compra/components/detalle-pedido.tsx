import type { ReactNode } from 'react';
import {
    Alert, Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Table, TableBody, TableCell, TableHead,
    TableRow, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';

import { COLORES } from '../config/tema';
import type { AccionPedido, IPedidoDetalle } from '../interface';
import { etiquetaEstado, etiquetaMedio, formatoClp, formatoFecha, formatoFechaHora } from '../utilities';
import { AccionesEstado } from './acciones-estado';
import { ChipEstado } from './chip-estado';

interface Props {
    abierto   : boolean;
    pedido    : IPedidoDetalle | null;
    cargando  : boolean;
    onCerrar  : () => void;
    onAccion  : (accion: AccionPedido, motivo?: string) => void;
    onVerOrden: (id: number) => void;
}

const Seccion = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
    <Box>
        <Typography variant="overline" color={COLORES.textoSuave} fontWeight={700}>{titulo}</Typography>
        {children}
    </Box>
);

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) => (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.25 }}>
        <Typography variant="body2" color={COLORES.textoSuave}>{etiqueta}</Typography>
        <Typography variant="body2" textAlign="right" component="div">{valor ?? '—'}</Typography>
    </Stack>
);

/** Panel lateral con todo el pedido y sus acciones. No pierde los filtros ni la página de la tabla. */
export const DetallePedido = ({ abierto, pedido, cargando, onCerrar, onAccion, onVerOrden }: Props) => (

    <Drawer anchor="right" open={abierto} onClose={onCerrar} PaperProps={{ sx: { width: { xs: '100%', md: 640 }, p: 3 } }}>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" color={COLORES.primarioOsc}>
                {pedido ? `Pedido ${pedido.numero}` : 'Pedido'}
            </Typography>
            <IconButton aria-label="Cerrar" onClick={onCerrar}><CloseIcon /></IconButton>
        </Stack>

        {!pedido && <Box textAlign="center" sx={{ py: 6 }}><CircularProgress /></Box>}

        {pedido && (
            <Stack spacing={3} divider={<Divider flexItem />}>

                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <ChipEstado estado={pedido.estado} />
                        <ChipEstado estado={pedido.estado_pago} />
                        <Typography variant="body2" color={COLORES.textoSuave}>
                            {etiquetaMedio(pedido.medio_pago)} · creado {formatoFechaHora(pedido.creado)}
                        </Typography>
                    </Stack>
                    {pedido.anulado_motivo && <Alert severity="error">Anulado: {pedido.anulado_motivo}</Alert>}
                    <AccionesEstado acciones={pedido.acciones} cargando={cargando} onAccion={onAccion} />
                </Stack>

                <Seccion titulo="Contacto y visita">
                    <Dato etiqueta="Contacto" valor={pedido.contacto.nombre} />
                    <Dato etiqueta="Correo" valor={pedido.contacto.email} />
                    <Dato etiqueta="Teléfono" valor={pedido.contacto.telefono} />
                    <Dato etiqueta="Visita" valor={`${formatoFecha(pedido.visita.fecha)} · ${pedido.visita.bloque}`} />
                    <Dato etiqueta="Dirección" valor={`${pedido.visita.direccion}, ${pedido.visita.comuna} (zona ${pedido.visita.zona ?? '—'})`} />
                    <Dato etiqueta="Referencia" valor={pedido.visita.referencia} />
                    <Dato etiqueta="Plan" valor={pedido.plan} />
                    {pedido.observaciones && <Dato etiqueta="Observaciones" valor={pedido.observaciones} />}
                </Seccion>

                <Seccion titulo={`Pacientes (${pedido.pacientes.length})`}>
                    <Stack spacing={2}>
                        {pedido.pacientes.map((p) => (
                            <Box key={p.orden} sx={{ p: 2, borderRadius: 2, background: COLORES.fondoSutil, border: `1px solid ${COLORES.borde}` }}>
                                <Typography fontWeight="bold">{p.nombre}</Typography>
                                <Typography variant="body2" color={COLORES.textoSuave}>
                                    RUT {p.rut} · nac. {formatoFecha(p.fecha_nac)} · {p.sexo ?? '—'} · {p.prevision ?? '—'}
                                    {p.apoderado_nombre ? ` · apoderado ${p.apoderado_nombre} (${p.apoderado_rut})` : ''}
                                </Typography>
                                <Table size="small" sx={{ mt: 1 }}>
                                    <TableBody>
                                        {p.lineas.map((l) => (
                                            <TableRow key={`${l.sku}-${l.automatica}`}>
                                                <TableCell sx={{ pl: 0 }}>{l.cantidad > 1 ? `${l.cantidad} × ` : ''}{l.nombre}{l.automatica ? ' (automática)' : ''}</TableCell>
                                                <TableCell align="right" sx={{ pr: 0 }}>{formatoClp(l.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {p.preparacion && p.preparacion.indicaciones.length > 0 && (
                                    <Typography variant="caption" component="p" sx={{ mt: 1 }}>
                                        <strong>Preparación:</strong> {p.preparacion.indicaciones.join(' · ')}
                                    </Typography>
                                )}
                                {p.ordenes_medicas.map((o) => (
                                    <Button key={o.id} size="small" startIcon={<DescriptionIcon />} sx={{ mt: 1 }} onClick={() => onVerOrden(o.id)}>
                                        Ver orden médica ({o.nombre_original})
                                    </Button>
                                ))}
                                {p.preparacion?.requiere_orden_medica && p.ordenes_medicas.length === 0 && (
                                    <Alert severity="warning" sx={{ mt: 1 }}>Requiere orden médica y no se adjuntó.</Alert>
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Seccion>

                <Seccion titulo="Desglose">
                    <Dato etiqueta="Laboratorio" valor={formatoClp(pedido.desglose.subtotal_lab)} />
                    <Dato etiqueta="Toma de muestra" valor={formatoClp(pedido.desglose.toma_muestra)} />
                    <Dato etiqueta="Insumos" valor={formatoClp(pedido.desglose.insumos)} />
                    <Dato etiqueta="Servicios" valor={formatoClp(pedido.desglose.subtotal_servicios)} />
                    <Dato etiqueta="Domicilio" valor={formatoClp(pedido.desglose.cargo_domicilio)} />
                    {pedido.desglose.descuento_plan > 0 && <Dato etiqueta="Descuento plan" valor={`−${formatoClp(pedido.desglose.descuento_plan)}`} />}
                    <Dato etiqueta="Redondeo" valor={formatoClp(pedido.desglose.ajuste_redondeo)} />
                    <Dato etiqueta="Total" valor={<strong>{formatoClp(pedido.desglose.total)}</strong>} />
                </Seccion>

                <Seccion titulo="Pagos">
                    {pedido.pagos.length === 0
                        ? <Typography variant="body2" color={COLORES.textoSuave}>Sin intentos de pago.</Typography>
                        : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ pl: 0 }}>Medio</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Orden / código</TableCell>
                                        <TableCell align="right" sx={{ pr: 0 }}>Monto</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pedido.pagos.map((pg) => (
                                        <TableRow key={pg.id}>
                                            <TableCell sx={{ pl: 0 }}>{etiquetaMedio(pg.medio)}<br /><Typography variant="caption" color={COLORES.textoSuave}>{formatoFechaHora(pg.actualizado)}</Typography></TableCell>
                                            <TableCell><ChipEstado estado={pg.estado} /></TableCell>
                                            <TableCell>
                                                <Typography variant="caption" component="div">{pg.buy_order ?? '—'}</Typography>
                                                <Typography variant="caption" color={COLORES.textoSuave} component="div">
                                                    {pg.status ?? '—'}{pg.response_code !== null ? ` · código ${pg.response_code}` : ''}{pg.authorization_code ? ` · aut. ${pg.authorization_code}` : ''}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ pr: 0 }}>{formatoClp(pg.monto)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                </Seccion>

                <Seccion titulo="Historial">
                    {pedido.historial.length === 0
                        ? <Typography variant="body2" color={COLORES.textoSuave}>Sin cambios manuales.</Typography>
                        : pedido.historial.map((h, i) => (
                            <Typography key={i} variant="body2" sx={{ py: 0.5 }}>
                                <strong>{formatoFechaHora(h.fecha)}</strong> · {h.campo === 'estado' ? 'Estado' : 'Pago'}: {etiquetaEstado(h.anterior)} → {etiquetaEstado(h.nuevo)}
                                {' · '}{h.user_email}{h.motivo ? ` · «${h.motivo}»` : ''}
                            </Typography>
                        ))}
                </Seccion>
            </Stack>
        )}
    </Drawer>
);
