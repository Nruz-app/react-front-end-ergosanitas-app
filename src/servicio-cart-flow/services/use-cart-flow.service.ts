import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type {
    IAgenda, ICarrito, ICatalogo, ICheckoutForm, IComuna, ICotizacionForm,
    IPacienteForm, IPedido, IRespuesta, IWebPay, PlanCarro,
} from '../interface';

/**
 * Error del back con su `message` en español y el `error` del sobre (bloqueos del carro,
 * errores por paciente o códigos como `bloque_lleno`). Quien llama muestra `message`.
 */
export class CartFlowError extends Error {
    constructor(message: string, public readonly status: number | null, public readonly detalle: unknown) {
        super(message);
        this.name = 'CartFlowError';
    }
}

/**
 * Los endpoints `api/cart-flow/*` (SPEC 04 del back). Cada método devuelve la `data` del sobre o
 * lanza `CartFlowError`.
 *
 * El mensaje se lee por la forma del objeto y no con `axios.isAxiosError`: axios se importa en un
 * solo archivo del repo, `api.adapter.ts`. Los GET usan `getToken` (sin `limit`/`offset`).
 */
export const UseCartFlowService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}/cart-flow`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    const llamar = async <T>(peticion: () => Promise<IRespuesta<T>>, mensajePorDefecto: string): Promise<T> => {

        let response: IRespuesta<T>;

        try {
            response = await peticion();
        }
        catch (problema) {
            const respuesta = (problema as { response?: { status?: number; data?: { message?: unknown; error?: unknown } } } | null)?.response;
            const mensaje = respuesta?.data?.message;

            throw new CartFlowError(
                typeof mensaje === 'string' && mensaje ? mensaje : mensajePorDefecto,
                respuesta?.status ?? null,
                respuesta?.data?.error ?? null,
            );
        }

        if (response?.success !== true) {
            throw new CartFlowError(response?.message || mensajePorDefecto, null, response?.error ?? null);
        }

        return response.data;
    };

    const getComunas = () =>
        llamar<IComuna[]>(() => apiAdapter.getToken(`${API}/comunas`), 'No se pudieron cargar las comunas');

    const getCatalogo = () =>
        llamar<ICatalogo>(() => apiAdapter.getToken(`${API}/catalogo`), 'No se pudo cargar el catálogo');

    const crearCarrito = (comuna_id: number) =>
        llamar<ICarrito>(() => apiAdapter.post(`${API}/carritos`, { comuna_id }), 'No se pudo crear el carro');

    const getCarrito = (uuid: string) =>
        llamar<ICarrito>(() => apiAdapter.getToken(`${API}/carritos/${uuid}`), 'No se pudo cargar el carro');

    const actualizarCarrito = (uuid: string, datos: { comuna_id?: number; direccion?: string; referencia?: string; plan?: PlanCarro }) =>
        llamar<ICarrito>(() => apiAdapter.put(`${API}/carritos/${uuid}`, datos), 'No se pudo actualizar el carro');

    const agregarPaciente = (uuid: string) =>
        llamar<ICarrito>(() => apiAdapter.post(`${API}/carritos/${uuid}/pacientes`, {}), 'No se pudo agregar el paciente');

    const actualizarPaciente = (uuid: string, id: number, datos: Partial<IPacienteForm>) => {

        // Los vacíos viajan como null para no fallar la validación de formato del back.
        const limpio = Object.fromEntries(
            Object.entries(datos).map(([clave, valor]) => [clave, valor === '' ? null : valor]),
        );

        return llamar<ICarrito>(() => apiAdapter.put(`${API}/carritos/${uuid}/pacientes/${id}`, limpio), 'No se pudieron guardar los datos del paciente');
    };

    const quitarPaciente = (uuid: string, id: number) =>
        llamar<ICarrito>(() => apiAdapter.post(`${API}/carritos/${uuid}/pacientes/${id}/quitar`, {}), 'No se pudo quitar el paciente');

    const agregarLinea = (uuid: string, paciente_id: number, sku: string) =>
        llamar<ICarrito>(() => apiAdapter.post(`${API}/carritos/${uuid}/lineas`, { paciente_id, sku }), 'No se pudo agregar el producto');

    const actualizarLinea = (uuid: string, id: number, cantidad: number) =>
        llamar<ICarrito>(() => apiAdapter.put(`${API}/carritos/${uuid}/lineas/${id}`, { cantidad }), 'No se pudo cambiar la cantidad');

    const quitarLinea = (uuid: string, id: number) =>
        llamar<ICarrito>(() => apiAdapter.post(`${API}/carritos/${uuid}/lineas/${id}/quitar`, {}), 'No se pudo quitar el producto');

    const getBloques = (uuid: string) =>
        llamar<IAgenda>(() => apiAdapter.getToken(`${API}/agenda/bloques?carrito=${encodeURIComponent(uuid)}`), 'No se pudo cargar la agenda');

    /** Multipart: las órdenes médicas viajan como `ordenes[{paciente_id}]`. */
    const checkout = (uuid: string, form: ICheckoutForm) => {

        const datos = new FormData();

        datos.append('fecha', form.fecha);
        datos.append('bloque_id', String(form.bloque_id));
        datos.append('medio_pago', form.medio_pago);
        datos.append('contacto_nombre', form.contacto_nombre);
        datos.append('contacto_email', form.contacto_email);
        datos.append('contacto_telefono', form.contacto_telefono);
        datos.append('acepta_terminos', form.acepta_terminos ? '1' : '0');

        if (form.direccion) datos.append('direccion', form.direccion);
        if (form.referencia) datos.append('referencia', form.referencia);
        if (form.observaciones) datos.append('observaciones', form.observaciones);

        Object.entries(form.ordenes).forEach(([pacienteId, archivo]) => {
            if (archivo) datos.append(`ordenes[${pacienteId}]`, archivo);
        });

        return llamar<IPedido>(() => apiAdapter.post(`${API}/carritos/${uuid}/checkout`, datos), 'No se pudo confirmar el pedido');
    };

    const getPedido = (numero: string, token: string) =>
        llamar<IPedido>(() => apiAdapter.getToken(`${API}/pedidos/${encodeURIComponent(numero)}?t=${encodeURIComponent(token)}`), 'No se encontró el pedido');

    const iniciarWebPay = (numero: string, token: string) =>
        llamar<IWebPay>(() => apiAdapter.post(`${API}/pedidos/${encodeURIComponent(numero)}/webpay`, { t: token }), 'No se pudo iniciar el pago con Webpay');

    const cotizar = (form: ICotizacionForm) => {

        const datos = Object.fromEntries(
            Object.entries(form).filter(([, valor]) => valor !== '' && valor !== null),
        );

        return llamar<{ id: number; estado: string }>(() => apiAdapter.post(`${API}/cotizaciones`, datos), 'No se pudo enviar la solicitud');
    };

    return {
        getComunas,
        getCatalogo,
        crearCarrito,
        getCarrito,
        actualizarCarrito,
        agregarPaciente,
        actualizarPaciente,
        quitarPaciente,
        agregarLinea,
        actualizarLinea,
        quitarLinea,
        getBloques,
        checkout,
        getPedido,
        iniciarWebPay,
        cotizar,
    };
};
