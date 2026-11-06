import { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { COLORES } from '../config/tema';
import { useAgenda } from '../hooks';
import type { IBloqueAgenda } from '../interface';
import { formatoFecha } from '../utilities';

export interface SeleccionAgenda {
    fecha  : string;
    bloque : IBloqueAgenda;
}

interface Props {
    uuid       : string;
    seleccion  : SeleccionAgenda | null;
    onElegir   : (seleccion: SeleccionAgenda) => void;
    onContinuar: () => void;
}

/** Paso 5: días y bloques con cupo libre. El back ya filtró la franja de mañana si corresponde. */
export const AgendaBloques = ({ uuid, seleccion, onElegir, onContinuar }: Props) => {

    const { agenda, estado, mensaje } = useAgenda(uuid);

    const dias = useMemo(() => (agenda?.dias ?? []).filter((d) => d.bloques.some((b) => b.libres > 0)), [agenda]);
    const [fecha, setFecha] = useState<string | null>(seleccion?.fecha ?? null);
    const diaActivo = dias.find((d) => d.fecha === fecha) ?? dias[0];

    if (estado === 'cargando') return <Box textAlign="center" sx={{ py: 6 }}><CircularProgress /></Box>;

    if (estado === 'error') return <Alert severity="error">{mensaje}</Alert>;

    if (dias.length === 0) return <Alert severity="warning">No quedan horarios disponibles en los próximos días. Escríbenos y te ayudamos a coordinar.</Alert>;

    return (
        <Stack spacing={3}>

            {agenda?.requiere_manana && (
                <Alert severity="info">Por la preparación de tu carro (ayuno o laboratorio) solo mostramos bloques de mañana.</Alert>
            )}

            <Box sx={{ overflowX: 'auto', pb: 1 }}>
                <ToggleButtonGroup exclusive value={diaActivo?.fecha ?? null} onChange={(_, v) => v && setFecha(v)}>
                    {dias.map((d) => (
                        <ToggleButton key={d.fecha} value={d.fecha} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
                            {formatoFecha(d.fecha)}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {diaActivo?.bloques.map((b) => {
                    const elegido = seleccion?.fecha === diaActivo.fecha && seleccion.bloque.id === b.id;

                    return (
                        <Button
                            key={b.id}
                            variant={elegido ? 'contained' : 'outlined'}
                            disabled={b.libres === 0}
                            onClick={() => onElegir({ fecha: diaActivo.fecha, bloque: b })}
                            sx={{ borderRadius: 3, minWidth: 160, py: 1.5, flexDirection: 'column' }}
                        >
                            <Typography fontWeight="bold">{b.bloque}</Typography>
                            <Chip size="small" sx={{ mt: 0.5 }}
                                label={b.libres === 0 ? 'Sin cupo' : `${b.libres} cupo${b.libres === 1 ? '' : 's'}`} />
                        </Button>
                    );
                })}
            </Stack>

            <Typography variant="caption" color={COLORES.textoSuave}>
                La ruta se confirma al completar los cupos de la zona; si hay cambios te avisamos con anticipación.
            </Typography>

            <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" size="large" disabled={!seleccion} onClick={onContinuar}
                    sx={{ background: COLORES.navy, fontWeight: 'bold', borderRadius: 3, '&:hover': { background: COLORES.navyHover } }}>
                    Continuar al pago
                </Button>
            </Stack>
        </Stack>
    );
};
