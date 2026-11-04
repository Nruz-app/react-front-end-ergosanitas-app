import { useState } from 'react';
import { Alert, Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { COLORES } from '../config/tema';
import type { IComuna } from '../interface';
import { formatoClp } from '../utilities';

interface Props {
    comunas     : IComuna[];
    seleccionada: IComuna | null;
    cargando    : boolean;
    onElegir    : (comuna: IComuna) => void;
    onCotizar   : (comuna: IComuna) => void;
}

/**
 * Paso 1: la comuna decide la zona y el cargo de domicilio. Fuera de RM solo se cotiza.
 */
export const SelectorComuna = ({ comunas, seleccionada, cargando, onElegir, onCotizar }: Props) => {

    const [comuna, setComuna] = useState<IComuna | null>(seleccionada);

    return (
        <Stack spacing={3} sx={{ maxWidth: 560, mx: 'auto' }}>

            <Box textAlign="center">
                <LocationOnIcon sx={{ fontSize: 48, color: COLORES.primario }} />
                <Typography variant="h5" fontWeight="bold" color={COLORES.navy}>
                    ¿Dónde será la visita?
                </Typography>
                <Typography color={COLORES.textoSuave}>
                    Elige la comuna para ver el cargo de domicilio de tu zona.
                </Typography>
            </Box>

            <Autocomplete
                options={comunas}
                value={comuna}
                onChange={(_, valor) => setComuna(valor)}
                getOptionLabel={(c) => c.comuna}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                noOptionsText="Sin coincidencias"
                renderInput={(params) => <TextField {...params} label="Comuna" />}
            />

            {comuna && !comuna.a_cotizar && (
                <Alert severity="info">
                    <strong>Zona {comuna.zona}</strong>. Domicilio de servicios: {formatoClp(comuna.cargo_servicio)} ·
                    laboratorio con toma de muestra: {formatoClp(comuna.cargo_laboratorio)}. Si en la visita hay
                    laboratorio y otro servicio, se cobra un solo traslado (el mayor). Los demás pacientes de la
                    misma dirección no pagan domicilio.
                </Alert>
            )}

            {comuna?.a_cotizar && (
                <Alert severity="warning"
                    action={<Button color="inherit" size="small" onClick={() => onCotizar(comuna)}>Solicitar cotización</Button>}>
                    {comuna.comuna} está fuera de nuestra zona de despacho: te enviamos una cotización.
                </Alert>
            )}

            <Button
                variant="contained"
                size="large"
                disabled={!comuna || comuna.a_cotizar || cargando}
                onClick={() => comuna && onElegir(comuna)}
                sx={{ background: COLORES.navy, fontWeight: 'bold', borderRadius: 3, '&:hover': { background: COLORES.navyHover } }}
            >
                Ver servicios y exámenes
            </Button>
        </Stack>
    );
};
