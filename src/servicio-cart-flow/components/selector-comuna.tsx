import { useMemo, useState } from 'react';
import { Alert, Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import comunasRm from '../config/comunas-rm.json';
import { CAMPO_COMUNA, COLORES } from '../config/tema';
import type { IComuna } from '../interface';
import { formatoClp, normalizarComuna, opcionesComuna } from '../utilities';
import type { IOpcionComuna } from '../utilities';

interface Props {
    comunas       : IComuna[];
    seleccionada  : IComuna | null;
    cargando      : boolean;
    /** GET cart-flow/comunas falló: igual se lista la RM, pero no se puede crear el carro. */
    errorServidor : boolean;
    onElegir      : (comuna: IComuna) => void;
    onCotizar     : (nombre: string) => void;
}

/**
 * Paso 1: la comuna decide la zona y el cargo de domicilio.
 *
 * Replica el `InputAutoCompleteComuna` del flujo anterior: la lista sale siempre de un JSON
 * estático (`config/comunas-rm.json`, copia de `AgendarHora/config/comunas.json`) y se cruza por
 * nombre con las comunas del back, que aportan zona y cargos. Una comuna sin par en el back o
 * fuera de RM solo se cotiza.
 */
export const SelectorComuna = ({ comunas, seleccionada, cargando, errorServidor, onElegir, onCotizar }: Props) => {

    const opciones = useMemo(() => opcionesComuna(comunasRm.comunas, comunas), [comunas]);

    const [opcion, setOpcion] = useState<IOpcionComuna | null>(() =>
        seleccionada
            ? opciones.find((o) => normalizarComuna(o.nombre) === normalizarComuna(seleccionada.comuna)) ?? null
            : null,
    );

    const comuna = opcion?.comuna ?? null;
    const aCotizar = !!opcion && (!comuna || comuna.a_cotizar);

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

            {errorServidor && (
                <Alert severity="warning">
                    No pudimos consultar las zonas de despacho. Intenta en unos minutos o solicita una cotización.
                </Alert>
            )}

            <Autocomplete
                options={opciones}
                value={opcion}
                onChange={(_, valor) => setOpcion(valor)}
                getOptionLabel={(o) => o.nombre}
                isOptionEqualToValue={(a, b) => normalizarComuna(a.nombre) === normalizarComuna(b.nombre)}
                noOptionsText="Sin coincidencias"
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Ingrese una Comuna"
                        placeholder="Santiago"
                        helperText="Ingrese o Seleccione una Comuna"
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: CAMPO_COMUNA.fondo,
                                borderRadius: 2,
                                '&.Mui-focused fieldset': { borderColor: CAMPO_COMUNA.acento },
                                '&:hover fieldset': { borderColor: CAMPO_COMUNA.acento },
                            },
                            '& .MuiFormHelperText-root': { color: CAMPO_COMUNA.ayuda },
                        }}
                    />
                )}
                sx={{
                    '& .MuiAutocomplete-inputRoot': { padding: '6px' },
                    '& .MuiAutocomplete-popupIndicator': { color: CAMPO_COMUNA.acento },
                    '& .MuiAutocomplete-clearIndicator': { color: CAMPO_COMUNA.limpiar },
                }}
            />

            {comuna && !comuna.a_cotizar && (
                <Alert severity="info">
                    <strong>Zona {comuna.zona}</strong>. Domicilio de servicios: {formatoClp(comuna.cargo_servicio)} ·
                    laboratorio con toma de muestra: {formatoClp(comuna.cargo_laboratorio)}. Si en la visita hay
                    laboratorio y otro servicio, se cobra un solo traslado (el mayor). Los demás pacientes de la
                    misma dirección no pagan domicilio.
                </Alert>
            )}

            {aCotizar && !errorServidor && (
                <Alert severity="warning"
                    action={<Button color="inherit" size="small" onClick={() => onCotizar(opcion.nombre)}>Solicitar cotización</Button>}>
                    {opcion.nombre} está fuera de nuestra zona de despacho: te enviamos una cotización.
                </Alert>
            )}

            {errorServidor && opcion && (
                <Button variant="outlined" onClick={() => onCotizar(opcion.nombre)}>
                    Solicitar cotización para {opcion.nombre}
                </Button>
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
