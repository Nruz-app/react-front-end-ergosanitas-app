import { useEffect, useState } from 'react';
import { Button, Grid, InputAdornment, MenuItem, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { ESTADOS_PAGO, ESTADOS_PEDIDO, FILTROS_VACIOS, MEDIOS_PAGO } from '../config/textos';
import type { IFiltrosPedidos } from '../interface';
import { etiquetaEstado, etiquetaMedio } from '../utilities';

interface Props {
    filtros  : IFiltrosPedidos;
    onCambiar: (filtros: IFiltrosPedidos) => void;
}

/** Filtros de la tabla de pedidos. El texto se aplica 400 ms después de dejar de escribir. */
export const FiltrosPedidos = ({ filtros, onCambiar }: Props) => {

    const [texto, setTexto] = useState<string>(filtros.q);

    useEffect(() => {
        if (texto === filtros.q) return;
        const id = window.setTimeout(() => onCambiar({ ...filtros, q: texto }), 400);
        return () => window.clearTimeout(id);
    }, [texto, filtros, onCambiar]);

    const select = (campo: keyof IFiltrosPedidos, etiqueta: string, opciones: string[], etiquetar: (v: string) => string) => (
        <TextField select fullWidth size="small" label={etiqueta} value={filtros[campo]}
            onChange={(e) => onCambiar({ ...filtros, [campo]: e.target.value })}>
            <MenuItem value="">Todos</MenuItem>
            {opciones.map((o) => <MenuItem key={o} value={o}>{etiquetar(o)}</MenuItem>)}
        </TextField>
    );

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" placeholder="N.º pedido, contacto o RUT" value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={6} md={1.6}>{select('estado', 'Estado', ESTADOS_PEDIDO, etiquetaEstado)}</Grid>
            <Grid item xs={6} md={1.4}>{select('estado_pago', 'Pago', ESTADOS_PAGO, etiquetaEstado)}</Grid>
            <Grid item xs={6} md={1.4}>{select('medio_pago', 'Medio', MEDIOS_PAGO, etiquetaMedio)}</Grid>
            <Grid item xs={6} md={1.2}>
                <TextField select fullWidth size="small" label="Fecha de" value={filtros.por}
                    onChange={(e) => onCambiar({ ...filtros, por: e.target.value as IFiltrosPedidos['por'] })}>
                    <MenuItem value="creacion">Creación</MenuItem>
                    <MenuItem value="visita">Visita</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={6} md={1.2}>
                <TextField fullWidth size="small" type="date" label="Desde" InputLabelProps={{ shrink: true }} value={filtros.desde}
                    onChange={(e) => onCambiar({ ...filtros, desde: e.target.value })} />
            </Grid>
            <Grid item xs={6} md={1.2}>
                <TextField fullWidth size="small" type="date" label="Hasta" InputLabelProps={{ shrink: true }} value={filtros.hasta}
                    onChange={(e) => onCambiar({ ...filtros, hasta: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={1}>
                <Button fullWidth onClick={() => { setTexto(''); onCambiar(FILTROS_VACIOS); }}>Limpiar</Button>
            </Grid>
        </Grid>
    );
};
