import { useState } from 'react';
import { Button, Grid, Stack, TextField, Typography } from '@mui/material';

import { COLORES } from '../config/tema';
import { useFormPacientes } from '../hooks';
import type { ICarrito, IPacienteForm } from '../interface';
import { PACIENTE_VACIO } from '../utilities';
import { FormPaciente } from './form-paciente';

interface Props {
    carrito  : ICarrito;
    cargando : boolean;
    onGuardar: (datos: Record<number, IPacienteForm>, direccion: string, referencia: string) => void;
}

/**
 * Paso 4: dirección de la visita y datos de cada paciente con servicios. Los pacientes sin
 * líneas no pasan al pedido, así que no se les piden datos.
 */
export const PasoPacientes = ({ carrito, cargando, onGuardar }: Props) => {

    const conServicios = carrito.pacientes.filter((p) => p.lineas.length > 0);
    const { valores, errores, cambiar, validar } = useFormPacientes(conServicios);

    const [direccion, setDireccion] = useState<string>(carrito.direccion ?? '');
    const [referencia, setReferencia] = useState<string>(carrito.referencia ?? '');
    const [errorDireccion, setErrorDireccion] = useState<string>('');

    const continuar = async () => {

        const limpios = await validar();
        const direccionValida = direccion.trim().length >= 5;

        setErrorDireccion(direccionValida ? '' : 'Ingresa la dirección de la visita');

        if (limpios && direccionValida) onGuardar(limpios, direccion.trim(), referencia.trim());
    };

    return (
        <Stack spacing={3}>

            <Stack spacing={2}>
                <Typography fontWeight="bold" color={COLORES.navy}>
                    Dirección de la visita en {carrito.comuna?.comuna}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                        <TextField fullWidth label="Calle, número, depto." value={direccion} autoComplete="street-address"
                            onChange={(e) => { setDireccion(e.target.value); setErrorDireccion(''); }}
                            error={!!errorDireccion} helperText={errorDireccion} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <TextField fullWidth label="Referencias (opcional)" value={referencia}
                            onChange={(e) => setReferencia(e.target.value)} />
                    </Grid>
                </Grid>
            </Stack>

            {conServicios.map((paciente) => (
                <FormPaciente
                    key={paciente.id}
                    paciente={paciente}
                    valores={valores[paciente.id] ?? PACIENTE_VACIO}
                    errores={errores[paciente.id] ?? {}}
                    onCambiar={(campo, valor) => cambiar(paciente.id, campo, valor)}
                />
            ))}

            <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" size="large" disabled={cargando} onClick={continuar}
                    sx={{ background: COLORES.navy, fontWeight: 'bold', borderRadius: 3, '&:hover': { background: COLORES.navyHover } }}>
                    Guardar y elegir horario
                </Button>
            </Stack>
        </Stack>
    );
};
