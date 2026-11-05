import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type {
    AccionPedido, ICotizacion, IFiltrosPedidos, IPaginaPedidos, IPedidoDetalle, IProductoAdmin, IRespuesta, IResumen,
} from '../interface';

/** Error del back con su código HTTP y el `error` del sobre (p. ej. `requiere_confirmacion`). */
export class ErrorCarritoCompra extends Error {
    constructor(message: string, public readonly status: number | null, public readonly codigo: unknown) {
        super(message);
        this.name = 'ErrorCarritoCompra';
    }
}

/**
 * Endpoints `api/cart-flow/admin/*` (SPEC 05 del back). Cada método devuelve la `data` o lanza un
 * `Error` con el `message` en español del back (403, 404, 409, 422 o 500).
 *
 * El mensaje se lee por la forma del objeto y no con `axios.isAxiosError`: axios se importa en un
 * solo archivo del repo. Los GET usan `getToken` (sin `limit`/`offset` inyectados).
 */
export const UseCarritoCompraService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}/cart-flow/admin`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    const llamar = async <T>(peticion: () => Promise<IRespuesta<T>>, mensajePorDefecto: string): Promise<T> => {

        let response: IRespuesta<T>;

        try {
            response = await peticion();
        }
        catch (problema) {
            const respuesta = (problema as { response?: { status?: number; data?: { message?: unknown; error?: unknown } } } | null)?.response;
            const mensaje = respuesta?.data?.message;

            throw new ErrorCarritoCompra(
                typeof mensaje === 'string' && mensaje ? mensaje : mensajePorDefecto,
                respuesta?.status ?? null,
                respuesta?.data?.error ?? null,
            );
        }

        if (response?.success !== true) throw new ErrorCarritoCompra(response?.message || mensajePorDefecto, null, response?.error ?? null);

        return response.data;
    };

    const query = (params: Record<string, string | number | undefined | null>) =>
        new URLSearchParams(
            Object.entries(params)
                .filter(([, v]) => v !== undefined && v !== null && v !== '')
                .map(([k, v]) => [k, String(v)]),
        ).toString();

    const getResumen = (user_email: string) =>
        llamar<IResumen>(() => apiAdapter.getToken(`${API}/resumen?${query({ user_email })}`), 'No se pudo cargar el resumen');

    const getPedidos = (user_email: string, filtros: IFiltrosPedidos, page: number) =>
        llamar<IPaginaPedidos>(
            () => apiAdapter.getToken(`${API}/pedidos?${query({ user_email, ...filtros, page })}`),
            'No se pudieron cargar los pedidos',
        );

    const getPedido = (user_email: string, numero: string) =>
        llamar<IPedidoDetalle>(
            () => apiAdapter.getToken(`${API}/pedidos/${encodeURIComponent(numero)}?${query({ user_email })}`),
            'No se pudo cargar el pedido',
        );

    const cambiarEstado = (user_email: string, numero: string, accion: AccionPedido, motivo?: string) =>
        llamar<IPedidoDetalle>(
            () => apiAdapter.put(`${API}/pedidos/${encodeURIComponent(numero)}/estado`, { user_email, accion, motivo }),
            'No se pudo cambiar el estado del pedido',
        );

    const enlaceOrden = (user_email: string, id: number) =>
        llamar<{ url: string; expira: string }>(
            () => apiAdapter.post(`${API}/ordenes/${id}/enlace`, { user_email }),
            'No se pudo abrir la orden médica',
        );

    const getCotizaciones = (user_email: string, estado: string, q: string) =>
        llamar<ICotizacion[]>(() => apiAdapter.getToken(`${API}/cotizaciones?${query({ user_email, estado, q })}`), 'No se pudieron cargar las cotizaciones');

    const cambiarEstadoCotizacion = (user_email: string, id: number, estado: string) =>
        llamar<ICotizacion>(() => apiAdapter.put(`${API}/cotizaciones/${id}/estado`, { user_email, estado }), 'No se pudo actualizar la cotización');

    const getProductos = (user_email: string, q: string, visible: string) =>
        llamar<IProductoAdmin[]>(() => apiAdapter.getToken(`${API}/productos?${query({ user_email, q, visible })}`), 'No se pudo cargar el catálogo');

    const cambiarVisibilidad = (user_email: string, sku: string, visible_tienda: boolean, confirmar = false) =>
        llamar<IProductoAdmin>(
            () => apiAdapter.put(`${API}/productos/${encodeURIComponent(sku)}/visibilidad`, { user_email, visible_tienda, confirmar }),
            'No se pudo cambiar la visibilidad',
        );

    return {
        getResumen, getPedidos, getPedido, cambiarEstado, enlaceOrden,
        getCotizaciones, cambiarEstadoCotizacion, getProductos, cambiarVisibilidad,
    };
};
