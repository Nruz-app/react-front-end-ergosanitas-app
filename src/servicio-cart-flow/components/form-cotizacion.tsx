import { useState } from 'react';
import { Alert, Button, Grid, Stack, TextField, Typography } from '@mui/material';

import { COLORES } from '../config/tema';
import type { ICotizacionForm } from '../interface';
import { REGEX_CELULAR } from '../utilities/paciente-validation.utility';

interface Props {
    inicial  : Partial<ICotizacionForm>;
    cargando : boolean;
    enviado  : boolean;
    onEnviar : (form: ICotizacionForm) => void;
    onVolver : () => void;
}

/** Formulario de cotización: operativos, empresas, eventos ErgoVitaSport y comunas fuera de RM. */
export const FormCotizacion = ({ inicial, cargando, enviado, onEnviar, onVolver }: Props) => {

    const [form, setForm] = useState<ICotizacionForm>({
        organizacion: '', comuna: '', personas: null, servicio: '', sku: '', fecha_tentativa: '',
        contacto_nombre: '', contacto_email: '', contacto_telefono: '', mensaje: '',
        ...inicial,
    });
    const [errores, setErrores] = useState<Partial<Record<keyof ICotizacionForm, string>>>({});

    const cambiar = <K extends keyof ICotizacionForm>(campo: K, valor: ICotizacionForm[K]) => {
        setForm((f) => ({ ...f, [campo]: valor }));
        setErrores((e) => ({ ...e, [campo]: undefined }));
    };

    const enviar = () => {

        const nuevos: Partial<Record<keyof ICotizacionForm, string>> = {};

        if (!form.comuna.trim()) nuevos.comuna = 'Indica la comuna';
        if (!form.servicio.trim()) nuevos.servicio = 'Indica el servicio de interés';
        if (!form.contacto_nombre.trim()) nuevos.contacto_nombre = 'Ingresa tu nombre';
        if (!/^\S+@\S+\.\S+$/.test(form.contacto_email)) nuevos.contacto_email = 'Correo no válido';
        if (!REGEX_CELULAR.test(form.contacto_telefono)) nuevos.contacto_telefono = 'Teléfono con código: +56912345678';

        setErrores(nuevos);

        if (Object.keys(nuevos).length === 0) onEnviar(form);
    };

    if (enviado) {
        return (
            <Stack spacing={2} sx={{ maxWidth: 640, mx: 'auto' }}>
                <Alert severity="success">Recibimos tu solicitud. Te contactaremos pronto con la cotización.</Alert>
                <Button variant="outlined" onClick={onVolver}>Volver a servicios</Button>
            </Stack>
        );
    }

    const campo = (nombre: keyof ICotizacionForm, etiqueta: string, extra: Record<string, unknown> = {}) => (
        <TextField fullWidth label={etiqueta} value={form[nombre] ?? ''}
            onChange={(e) => cambiar(nombre, (nombre === 'personas' ? (e.target.value ? Number(e.target.value) : null) : e.target.value) as never)}
            error={!!errores[nombre]} helperText={errores[nombre]} {...extra} />
    );

    return (
        <Stack spacing={3} sx={{ maxWidth: 760, mx: 'auto' }}>
            <Typography variant="h5" fontWeight="bold" color={COLORES.navy} textAlign="center">Solicitar cotización</Typography>
            <Typography color={COLORES.textoSuave} textAlign="center">
                Para operativos, empresas, eventos y comunas fuera de nuestra zona de despacho.
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>{campo('organizacion', 'Organización (opcional)')}</Grid>
                <Grid item xs={12} md={6}>{campo('comuna', 'Comuna')}</Grid>
                <Grid item xs={12} md={8}>{campo('servicio', 'Servicio de interés')}</Grid>
                <Grid item xs={12} md={4}>{campo('personas', 'N.º estimado de personas', { type: 'number', inputProps: { min: 1 } })}</Grid>
                <Grid item xs={12} md={4}>{campo('fecha_tentativa', 'Fecha tentativa', { type: 'date', InputLabelProps: { shrink: true } })}</Grid>
                <Grid item xs={12} md={8}>{campo('contacto_nombre', 'Nombre de contacto', { autoComplete: 'name' })}</Grid>
                <Grid item xs={12} md={6}>{campo('contacto_email', 'Correo', { type: 'email', autoComplete: 'email' })}</Grid>
                <Grid item xs={12} md={6}>{campo('contacto_telefono', 'Teléfono', { placeholder: '+56912345678', autoComplete: 'tel' })}</Grid>
                <Grid item xs={12}>{campo('mensaje', 'Mensaje (opcional)', { multiline: true, minRows: 3 })}</Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={onVolver}>Volver</Button>
                <Button variant="contained" disabled={cargando} onClick={enviar}
                    sx={{ background: COLORES.navy, fontWeight: 'bold', borderRadius: 3, '&:hover': { background: COLORES.navyHover } }}>
                    Enviar solicitud
                </Button>
            </Stack>
        </Stack>
    );
};
