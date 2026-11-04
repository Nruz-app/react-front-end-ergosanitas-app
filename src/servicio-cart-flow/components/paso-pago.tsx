import { useState } from 'react';
import {
    Alert, Box, Button, Checkbox, FormControlLabel, Grid, Paper, Radio, RadioGroup, Stack, TextField, Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { MEDIOS_PAGO } from '../config/textos';
import { COLORES } from '../config/tema';
import type { ICarrito, ICheckoutForm, MedioPago } from '../interface';
import { formatoFecha, nombrePaciente } from '../utilities';
import { REGEX_CELULAR } from '../utilities/paciente-validation.utility';
import type { SeleccionAgenda } from './agenda-bloques';
import { AvisosCarro } from './avisos-carro';
import { DesgloseTotal } from './desglose-total';

interface Props {
    carrito   : ICarrito;
    agenda    : SeleccionAgenda;
    cargando  : boolean;
    onConfirmar: (form: ICheckoutForm) => void;
}

const TIPOS_ORDEN = '.pdf,.jpg,.jpeg,.png';
const MAX_ORDEN_MB = 5;

/**
 * Paso 6: contacto, medio de pago, orden médica por paciente cuando alguna línea la pide y
 * aceptación. El total que se muestra es el del back; el checkout lo vuelve a calcular.
 */
export const PasoPago = ({ carrito, agenda, cargando, onConfirmar }: Props) => {

    const primero = carrito.pacientes.find((p) => p.lineas.length > 0);
    const conOrden = carrito.pacientes.filter((p) => p.preparacion?.requiere_orden_medica);

    const [medio, setMedio] = useState<MedioPago>('webpay');
    const [nombre, setNombre] = useState<string>(primero?.nombre ?? '');
    const [email, setEmail] = useState<string>(primero?.email ?? '');
    const [telefono, setTelefono] = useState<string>(primero?.telefono ?? '');
    const [observaciones, setObservaciones] = useState<string>('');
    const [acepta, setAcepta] = useState<boolean>(false);
    const [ordenes, setOrdenes] = useState<Record<number, File | null>>({});
    const [errores, setErrores] = useState<Record<string, string>>({});

    const elegirArchivo = (pacienteId: number, archivo: File | null) => {

        if (archivo && archivo.size > MAX_ORDEN_MB * 1024 * 1024) {
            setErrores((e) => ({ ...e, [`orden-${pacienteId}`]: `El archivo supera ${MAX_ORDEN_MB} MB` }));
            return;
        }

        setOrdenes((o) => ({ ...o, [pacienteId]: archivo }));
        setErrores((e) => ({ ...e, [`orden-${pacienteId}`]: '' }));
    };

    const confirmar = () => {

        const nuevos: Record<string, string> = {};

        if (!nombre.trim()) nuevos.nombre = 'Ingresa un nombre de contacto';
        if (!/^\S+@\S+\.\S+$/.test(email)) nuevos.email = 'Ingresa un correo válido';
        if (!REGEX_CELULAR.test(telefono)) nuevos.telefono = 'Teléfono con código: +56912345678';
        if (!acepta) nuevos.acepta = 'Debes aceptar las condiciones';
        conOrden.forEach((p) => { if (!ordenes[p.id]) nuevos[`orden-${p.id}`] = 'Adjunta la orden médica'; });

        setErrores(nuevos);

        if (Object.values(nuevos).some(Boolean)) return;

        onConfirmar({
            fecha: agenda.fecha,
            bloque_id: agenda.bloque.id,
            medio_pago: medio,
            contacto_nombre: nombre.trim(),
            contacto_email: email.trim(),
            contacto_telefono: telefono.trim(),
            direccion: carrito.direccion ?? '',
            referencia: carrito.referencia ?? '',
            observaciones: observaciones.trim(),
            acepta_terminos: acepta,
            ordenes,
        });
    };

    const bloqueado = carrito.bloqueos.length > 0;

    return (
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">

            <Stack spacing={3} sx={{ flex: 1, width: '100%' }}>

                <AvisosCarro bloqueos={carrito.bloqueos} avisos={carrito.avisos} />

                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: COLORES.borde }}>
                    <Typography fontWeight="bold" color={COLORES.navy} sx={{ mb: 2 }}>Contacto para coordinar la visita</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
                                error={!!errores.nombre} helperText={errores.nombre} autoComplete="name" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                error={!!errores.email} helperText={errores.email} autoComplete="email" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Teléfono" placeholder="+56912345678" value={telefono}
                                onChange={(e) => setTelefono(e.target.value)} error={!!errores.telefono} helperText={errores.telefono} autoComplete="tel" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline minRows={2} label="Observaciones (opcional)" value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)} />
                        </Grid>
                    </Grid>
                </Paper>

                {conOrden.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: COLORES.borde }}>
                        <Typography fontWeight="bold" color={COLORES.navy} sx={{ mb: 1 }}>Orden médica</Typography>
                        <Typography variant="body2" color={COLORES.textoSuave} sx={{ mb: 2 }}>
                            PDF o foto (JPG, PNG), hasta {MAX_ORDEN_MB} MB. Se guarda de forma privada.
                        </Typography>
                        <Stack spacing={2}>
                            {conOrden.map((p) => (
                                <Box key={p.id}>
                                    <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                                        {ordenes[p.id]?.name ?? `Adjuntar orden de ${nombrePaciente(p)}`}
                                        <input hidden type="file" accept={TIPOS_ORDEN}
                                            onChange={(e) => elegirArchivo(p.id, e.target.files?.[0] ?? null)} />
                                    </Button>
                                    {errores[`orden-${p.id}`] && (
                                        <Typography variant="caption" color="error" component="p">{errores[`orden-${p.id}`]}</Typography>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                )}

                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: COLORES.borde }}>
                    <Typography fontWeight="bold" color={COLORES.navy} sx={{ mb: 1 }}>Medio de pago</Typography>
                    <RadioGroup value={medio} onChange={(e) => setMedio(e.target.value as MedioPago)}>
                        {MEDIOS_PAGO.map((m) => (
                            <FormControlLabel key={m.valor} value={m.valor} control={<Radio />}
                                label={<Box><Typography>{m.etiqueta}</Typography><Typography variant="caption" color={COLORES.textoSuave}>{m.detalle}</Typography></Box>}
                                sx={{ mb: 1, alignItems: 'flex-start', '& .MuiRadio-root': { pt: 0.5 } }} />
                        ))}
                    </RadioGroup>
                </Paper>

                <Box>
                    <FormControlLabel
                        control={<Checkbox checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />}
                        label="Confirmo que los datos son correctos y acepto las condiciones del servicio. Los precios incluyen IVA."
                    />
                    {errores.acepta && <Typography variant="caption" color="error" component="p">{errores.acepta}</Typography>}
                </Box>
            </Stack>

            <Stack spacing={2} sx={{ width: { xs: '100%', lg: 360 }, position: { lg: 'sticky' }, top: { lg: 16 } }}>
                <Alert severity="info" icon={false}>
                    <strong>{formatoFecha(agenda.fecha)}</strong> · bloque {agenda.bloque.bloque}<br />
                    {carrito.direccion}, {carrito.comuna?.comuna}
                </Alert>

                <DesgloseTotal desglose={carrito.desglose} />

                <Button variant="contained" size="large" disabled={cargando || bloqueado} onClick={confirmar}
                    sx={{ background: COLORES.navy, fontWeight: 'bold', borderRadius: 3, py: 1.5, '&:hover': { background: COLORES.navyHover } }}>
                    {medio === 'webpay' ? 'Pagar con Webpay' : 'Confirmar pedido'}
                </Button>
            </Stack>
        </Stack>
    );
};
