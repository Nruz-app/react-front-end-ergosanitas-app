import {
    Box, Button, Chip, Divider, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { PLANES } from '../config/textos';
import { COLORES, UI } from '../config/tema';
import type { ICarrito, ILineaCarro, PlanCarro } from '../interface';
import { formatoClp, nombrePaciente } from '../utilities';
import { AvisosCarro } from './avisos-carro';
import { DesgloseTotal } from './desglose-total';
import { PreparacionConsolidada } from './preparacion-consolidada';

interface Props {
    carrito          : ICarrito;
    cargando         : boolean;
    onCantidad       : (lineaId: number, cantidad: number) => void;
    onQuitarLinea    : (lineaId: number) => void;
    onAgregarPaciente: () => void;
    onQuitarPaciente : (pacienteId: number) => void;
    onPlan           : (plan: PlanCarro) => void;
    onSeguirComprando: () => void;
}

/** Solo los servicios admiten cantidad: el laboratorio va siempre de a uno. */
const admiteCantidad = (linea: ILineaCarro) => linea.tipo === 'servicio_domicilio' || linea.tipo === 'servicio_evento';

/**
 * Paso 3: líneas por paciente, «Agregar otro paciente en la misma dirección» (visita $0),
 * plan, preparación consolidada y desglose. Todo lo calcula el back.
 */
export const CarroResumen = ({
    carrito, cargando, onCantidad, onQuitarLinea, onAgregarPaciente, onQuitarPaciente, onPlan, onSeguirComprando,
}: Props) => (

    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">

        <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>

            <AvisosCarro bloqueos={carrito.bloqueos} avisos={carrito.avisos} omitir={['carro_vacio']} />

            {carrito.pacientes.map((paciente) => (
                <Paper key={paciente.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: COLORES.borde }}>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography fontWeight="bold" color={COLORES.navy}>{nombrePaciente(paciente)}</Typography>
                        {carrito.pacientes.length > 1 && (
                            <Button size="small" color="inherit" disabled={cargando} onClick={() => onQuitarPaciente(paciente.id)}>
                                Quitar paciente
                            </Button>
                        )}
                    </Stack>

                    {paciente.lineas.length === 0 && (
                        <Typography variant="body2" color={COLORES.textoSuave} sx={{ py: 1 }}>
                            Sin servicios todavía. <Button size="small" onClick={onSeguirComprando}>Ver catálogo</Button>
                        </Typography>
                    )}

                    <Stack divider={<Divider flexItem />} spacing={1}>
                        {paciente.lineas.map((linea) => (
                            <Stack key={`${linea.sku}-${linea.id ?? 'auto'}`} direction="row" alignItems="center" spacing={1}>

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={linea.automatica ? 'normal' : 'bold'}>
                                        {linea.nombre}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                        {linea.automatica && <Chip size="small" label="Se agrega solo" />}
                                        {linea.bloqueada && <Chip size="small" label="No aplica a este paciente" sx={{ background: UI.errorFondo, color: UI.error }} />}
                                        {linea.precio_unitario < linea.precio_lista && (
                                            <Chip size="small" label={`Antes ${formatoClp(linea.precio_lista)}`} sx={{ background: UI.exitoFondo, color: UI.exito }} />
                                        )}
                                    </Stack>
                                </Box>

                                {linea.id !== null && admiteCantidad(linea) && (
                                    <Stack direction="row" alignItems="center">
                                        <IconButton size="small" aria-label="Restar" disabled={cargando || linea.cantidad <= 1}
                                            onClick={() => onCantidad(linea.id!, linea.cantidad - 1)}>
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                        <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>{linea.cantidad}</Typography>
                                        <IconButton size="small" aria-label="Sumar" disabled={cargando || linea.cantidad >= 20}
                                            onClick={() => onCantidad(linea.id!, linea.cantidad + 1)}>
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )}

                                <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'right' }}>{formatoClp(linea.subtotal)}</Typography>

                                {linea.id !== null ? (
                                    <Tooltip title="Quitar">
                                        <span>
                                            <IconButton size="small" aria-label={`Quitar ${linea.nombre}`} disabled={cargando}
                                                onClick={() => onQuitarLinea(linea.id!)}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                ) : <Box sx={{ width: 34 }} />}
                            </Stack>
                        ))}
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                        <PreparacionConsolidada titulo={`Preparación de ${nombrePaciente(paciente)}`} preparacion={paciente.preparacion} />
                    </Box>
                </Paper>
            ))}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="outlined" startIcon={<PersonAddIcon />} disabled={cargando || carrito.pacientes.length >= 10} onClick={onAgregarPaciente}>
                    Agregar otro paciente en la misma dirección
                </Button>
                <Button variant="text" onClick={onSeguirComprando}>Seguir agregando servicios</Button>
            </Stack>

            <Typography variant="caption" color={COLORES.textoSuave}>
                Los demás pacientes de la misma dirección no pagan domicilio.
            </Typography>
        </Stack>

        <Stack spacing={2} sx={{ width: { xs: '100%', lg: 360 }, position: { lg: 'sticky' }, top: { lg: 16 } }}>
            <FormControl fullWidth>
                <InputLabel id="cf-plan">Plan</InputLabel>
                <Select labelId="cf-plan" label="Plan" value={carrito.plan} disabled={cargando}
                    onChange={(e) => onPlan(e.target.value as PlanCarro)}>
                    {PLANES.map((p) => (
                        <MenuItem key={p.valor} value={p.valor}>
                            <Box>
                                <Typography variant="body2">{p.etiqueta}</Typography>
                                <Typography variant="caption" color={COLORES.textoSuave}>{p.detalle}</Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <DesgloseTotal desglose={carrito.desglose} />

            {carrito.requiere_manana && (
                <Typography variant="caption" color={COLORES.textoSuave}>
                    Tu visita va en bloque de mañana (ayuno o laboratorio: la muestra se entrega antes del mediodía).
                </Typography>
            )}
        </Stack>
    </Stack>
);
