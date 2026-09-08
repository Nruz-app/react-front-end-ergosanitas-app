import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type {
    IConfiguracionJuego, IJuegoCarta, IListadoCartas, ISobreJuego,
} from '../interface';

/**
 * Los tres endpoints del juego de cartas por nivel (Spec 04).
 *
 *   GET {API}/juego-cartas/{user_email}?search=   → {club, search, total, cartas[]}
 *   GET {API}/juego-cartas/detalle/{rut}          → una carta, o null
 *   GET {API}/juego-cartas/niveles                → {clinico[], completitud[], atributos[]}
 *
 * El puntaje lo calcula al vuelo `SP_juego_cartas_club` contra los umbrales de la tabla
 * `juego_niveles`. **Aquí no se deriva ni un valor**: retunear una banda es un `UPDATE` en el
 * backend, y recalcular en el front crearía una segunda verdad.
 *
 * ⚠️ Estos tres endpoints van bajo el **sobre A** (`{success, message, data}`), a diferencia de
 * los otros 11 del módulo, que devuelven el dato pelado.
 */
export const UseJuegoCartasService = () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /**
     * Abre el sobre y comprueba que trae lo que dice traer.
     *
     * No es defensivo de más: en este backend hay endpoints que responden **200 con un sobre de
     * error** en vez de la carga esperada (ver `estadisticas/*`). Sin esto, un `.length` sobre
     * `undefined` revienta en el render y **un fallo del servicio tumba el tab entero**.
     */
    const abrirSobre = <T>(sobre: ISobreJuego<T> | undefined, valido: (data: T) => boolean): T => {

        if (!sobre?.success || !valido(sobre.data)) {
            throw new Error(sobre?.message ?? 'El servicio del juego de cartas no respondió.');
        }

        return sobre.data;
    };

    /**
     * Las cartas de un club, ya ordenadas por el backend.
     *
     * El orden viene decidido —puntaje descendente, desempate por `atributos_medidos` y las
     * `sin_evaluar` al final— y **no se reordena en el front**: duplicar ese criterio garantiza
     * que un día diverjan.
     *
     * `search` existe en el contrato pero la UI filtra en memoria (el club más grande son 147
     * cartas y llegan en una sola respuesta). Se deja expuesto para no tener que reabrir el
     * servicio el día que un club crezca lo suficiente.
     */
    const getCartasClub = async (user_email: string, search?: string): Promise<IListadoCartas> => {

        const filtro = search ? `?search=${encodeURIComponent(search)}` : '';

        // `getToken` es un GET **sin params** —el nombre engaña, no gestiona tokens—. Se usa en
        // vez de `get`, que inyecta siempre `limit`/`offset`, que estos endpoints no aceptan.
        const sobre = await apiAdapter.getToken<ISobreJuego<IListadoCartas>>(
            `${API}/juego-cartas/${user_email}${filtro}`,
        );

        return abrirSobre(sobre, (data) => Array.isArray(data?.cartas));
    };

    /**
     * El desglose de una carta por RUT.
     *
     * Devuelve `null` **sin lanzar** cuando el RUT no tiene chequeos: el backend responde 200 con
     * `data: null` y `message: "Paciente sin chequeos registrados"`. Es un caso normal, no un
     * error, y merece un mensaje propio en la UI.
     */
    const getCartaDetalle = async (rut: string): Promise<IJuegoCarta | null> => {

        const sobre = await apiAdapter.getToken<ISobreJuego<IJuegoCarta | null>>(
            `${API}/juego-cartas/detalle/${rut}`,
        );

        if (!sobre?.success) {
            throw new Error(sobre?.message ?? 'El servicio del juego de cartas no respondió.');
        }

        return sobre.data ?? null;
    };

    /**
     * La configuración de los dos ejes y el catálogo de atributos.
     *
     * Es lo que permite que el front **no escriba a mano** ni una banda, ni un color, ni un
     * icono: los chips de filtro y los nombres de los atributos se construyen desde aquí, así
     * que un `UPDATE` sobre `juego_niveles` se ve en la UI sin tocar código.
     */
    const getNiveles = async (): Promise<IConfiguracionJuego> => {

        const sobre = await apiAdapter.getToken<ISobreJuego<IConfiguracionJuego>>(
            `${API}/juego-cartas/niveles`,
        );

        return abrirSobre(
            sobre,
            (data) => Array.isArray(data?.clinico)
                && Array.isArray(data?.completitud)
                && Array.isArray(data?.atributos),
        );
    };

    return { getCartasClub, getCartaDetalle, getNiveles };
};
