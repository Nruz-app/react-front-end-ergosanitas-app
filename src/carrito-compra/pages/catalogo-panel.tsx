import { useCallback, useEffect, useState } from 'react';
import { Grid, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Swal from 'sweetalert2';

import { TablaCatalogo } from '../components';
import type { IProductoAdmin } from '../interface';
import { ErrorCarritoCompra, UseCarritoCompraService } from '../services';
import { mostrarError } from '../utilities';

interface Props {
    userEmail: string;
}

/**
 * Pestaña Catálogo: interruptor «Mostrar en la tienda». Activar un producto no publicable
 * responde 409 `requiere_confirmacion`: se muestra el motivo del back y se reenvía con confirmar.
 */
export const CatalogoPanel = ({ userEmail }: Props) => {

    const [texto, setTexto] = useState<string>('');
    const [q, setQ] = useState<string>('');
    const [visible, setVisible] = useState<string>('');
    const [productos, setProductos] = useState<IProductoAdmin[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);

    useEffect(() => {
        const id = window.setTimeout(() => setQ(texto), 400);
        return () => window.clearTimeout(id);
    }, [texto]);

    const cargar = useCallback(async () => {
        setCargando(true);
        try { setProductos(await (await UseCarritoCompraService()).getProductos(userEmail, q, visible)); }
        catch (problema) { mostrarError(problema); }
        finally { setCargando(false); }
    }, [userEmail, q, visible]);

    useEffect(() => { cargar(); }, [cargar]);

    const cambiar = async (producto: IProductoAdmin, mostrar: boolean) => {

        const servicio = await UseCarritoCompraService();
        setCargando(true);

        try {
            let actualizado: IProductoAdmin;

            try {
                actualizado = await servicio.cambiarVisibilidad(userEmail, producto.sku, mostrar);
            }
            catch (problema) {
                if (!(problema instanceof ErrorCarritoCompra) || problema.codigo !== 'requiere_confirmacion') throw problema;

                const { isConfirmed } = await Swal.fire({
                    icon: 'warning',
                    title: 'Producto no publicable',
                    text: problema.message.replace(/ Envía confirmar.*$/, ''),
                    showCancelButton: true,
                    confirmButtonText: 'Mostrar igual',
                    cancelButtonText: 'Cancelar',
                });

                if (!isConfirmed) return;

                actualizado = await servicio.cambiarVisibilidad(userEmail, producto.sku, mostrar, true);
            }

            setProductos((lista) => lista.map((p) => (p.sku === producto.sku ? { ...p, visible_tienda: actualizado.visible_tienda } : p)));
        }
        catch (problema) { mostrarError(problema); }
        finally { setCargando(false); }
    };

    return (
        <Stack spacing={2}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" placeholder="Nombre o SKU" value={texto} onChange={(e) => setTexto(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField select fullWidth size="small" label="En tienda" value={visible} onChange={(e) => setVisible(e.target.value)}>
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="1">Visibles</MenuItem>
                        <MenuItem value="0">Ocultos</MenuItem>
                    </TextField>
                </Grid>
            </Grid>
            <TablaCatalogo productos={productos} cargando={cargando} onVisible={cambiar} />
        </Stack>
    );
};
