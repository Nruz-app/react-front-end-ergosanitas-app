import { useCallback, useEffect, useState } from 'react';
import { Stack } from '@mui/material';

import { DetallePedido, FiltrosPedidos, ResumenTarjetas, TablaPedidos } from '../components';
import { FILTROS_VACIOS } from '../config/textos';
import type { AccionPedido, IFiltrosPedidos, IPaginaPedidos, IPedidoDetalle, IResumen } from '../interface';
import { UseCarritoCompraService } from '../services';
import { mostrarError } from '../utilities';

interface Props {
    userEmail: string;
}

/** Pestaña Pedidos: resumen, filtros, tabla paginada en el servidor y detalle con acciones. */
export const PedidosPanel = ({ userEmail }: Props) => {

    const [resumen, setResumen] = useState<IResumen | null>(null);
    const [filtros, setFiltros] = useState<IFiltrosPedidos>(FILTROS_VACIOS);
    const [pagina, setPagina] = useState<number>(1);
    const [datos, setDatos] = useState<IPaginaPedidos | null>(null);
    const [cargando, setCargando] = useState<boolean>(false);

    const [numero, setNumero] = useState<string | null>(null);
    const [detalle, setDetalle] = useState<IPedidoDetalle | null>(null);
    const [accionando, setAccionando] = useState<boolean>(false);

    const cargarResumen = useCallback(async () => {
        try { setResumen(await (await UseCarritoCompraService()).getResumen(userEmail)); }
        catch (problema) { mostrarError(problema); }
    }, [userEmail]);

    const cargarPedidos = useCallback(async () => {
        setCargando(true);
        try { setDatos(await (await UseCarritoCompraService()).getPedidos(userEmail, filtros, pagina)); }
        catch (problema) { mostrarError(problema); }
        finally { setCargando(false); }
    }, [userEmail, filtros, pagina]);

    useEffect(() => { cargarResumen(); }, [cargarResumen]);
    useEffect(() => { cargarPedidos(); }, [cargarPedidos]);

    const cambiarFiltros = useCallback((nuevos: IFiltrosPedidos) => {
        setFiltros(nuevos);
        setPagina(1);
    }, []);

    const abrir = async (n: string) => {
        setNumero(n);
        setDetalle(null);
        try { setDetalle(await (await UseCarritoCompraService()).getPedido(userEmail, n)); }
        catch (problema) { mostrarError(problema); setNumero(null); }
    };

    const accion = async (a: AccionPedido, motivo?: string) => {
        if (!numero) return;
        setAccionando(true);
        try {
            setDetalle(await (await UseCarritoCompraService()).cambiarEstado(userEmail, numero, a, motivo));
            await Promise.all([cargarPedidos(), cargarResumen()]);
        }
        catch (problema) { mostrarError(problema); }
        finally { setAccionando(false); }
    };

    const verOrden = async (id: number) => {
        // Se abre la pestaña antes del await para que el navegador no la bloquee como popup.
        const ventana = window.open('', '_blank');
        try {
            const { url } = await (await UseCarritoCompraService()).enlaceOrden(userEmail, id);
            if (ventana) { ventana.opener = null; ventana.location.href = url; }
            else window.open(url, '_blank', 'noopener,noreferrer');
        }
        catch (problema) { ventana?.close(); mostrarError(problema); }
    };

    return (
        <Stack spacing={3}>
            <ResumenTarjetas resumen={resumen} />
            <FiltrosPedidos filtros={filtros} onCambiar={cambiarFiltros} />
            <TablaPedidos pagina={datos} cargando={cargando} onPagina={setPagina} onAbrir={abrir} />
            <DetallePedido
                abierto={numero !== null}
                pedido={detalle}
                cargando={accionando}
                onCerrar={() => { setNumero(null); setDetalle(null); }}
                onAccion={accion}
                onVerOrden={verOrden}
            />
        </Stack>
    );
};
