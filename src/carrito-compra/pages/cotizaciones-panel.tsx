import { useCallback, useEffect, useState } from 'react';
import { Grid, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { TablaCotizaciones } from '../components';
import { ESTADOS_COTIZACION } from '../config/textos';
import type { ICotizacion } from '../interface';
import { UseCarritoCompraService } from '../services';
import { etiquetaEstado, mostrarError } from '../utilities';

interface Props {
    userEmail: string;
}

/** Pestaña Cotizaciones: lista filtrable y cambio de estado nueva → contactada → cerrada. */
export const CotizacionesPanel = ({ userEmail }: Props) => {

    const [estado, setEstado] = useState<string>('');
    const [texto, setTexto] = useState<string>('');
    const [q, setQ] = useState<string>('');
    const [lista, setLista] = useState<ICotizacion[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);

    useEffect(() => {
        const id = window.setTimeout(() => setQ(texto), 400);
        return () => window.clearTimeout(id);
    }, [texto]);

    const cargar = useCallback(async () => {
        setCargando(true);
        try { setLista(await (await UseCarritoCompraService()).getCotizaciones(userEmail, estado, q)); }
        catch (problema) { mostrarError(problema); }
        finally { setCargando(false); }
    }, [userEmail, estado, q]);

    useEffect(() => { cargar(); }, [cargar]);

    const cambiarEstado = async (id: number, nuevo: string) => {
        setCargando(true);
        try {
            const actualizada = await (await UseCarritoCompraService()).cambiarEstadoCotizacion(userEmail, id, nuevo);
            setLista((l) => l.map((c) => (c.id === id ? actualizada : c)));
        }
        catch (problema) { mostrarError(problema); }
        finally { setCargando(false); }
    };

    return (
        <Stack spacing={2}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" placeholder="Organización, comuna, servicio o contacto" value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField select fullWidth size="small" label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <MenuItem value="">Todos</MenuItem>
                        {ESTADOS_COTIZACION.map((e) => <MenuItem key={e} value={e}>{etiquetaEstado(e)}</MenuItem>)}
                    </TextField>
                </Grid>
            </Grid>
            <TablaCotizaciones cotizaciones={lista} cargando={cargando} onEstado={cambiarEstado} />
        </Stack>
    );
};
