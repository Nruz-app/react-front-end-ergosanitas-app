import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type { IRespuestaAsistenteColegio } from '../interface';

/**
 * Servicio del chat «Asistente Ergo» del Home del colegio (Spec 03).
 *
 * Clon adaptado de `src/ficha-clinica/services/UseAsistenteService.ts`. Se duplica porque la
 * regla dura del módulo prohíbe importar de cualquier módulo que no sea `src/common/`, y porque
 * los dos chats van a divergir: aquel habla de **un paciente**, este de **una institución**.
 *
 * El contrato tiene un campo más que el del asistente de pacientes — `email`, la clave de
 * multi-tenencia del modelo:
 *
 *   POST {API}/sam-assistant-club/as-question  { email, prompt, sessionId } → { response }
 *
 * No hay endpoint de reset: no consta que `sam-assistant-club` lo exponga. `reiniciarSesion`
 * resuelve el caso en el front, renovando la clave local.
 */
export const UseAsistenteColegioService = () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /**
     * Clave propia del hilo, distinta de `ficha_chat_session_id` (ficha clínica),
     * `home_chat_session_id` (home comercial) y `chat_session_id` (asistente global).
     *
     * Si compartieran clave, un hilo abierto en la ficha con OTRO paciente contaminaría el
     * contexto del colegio, y el chat respondería sobre alguien que no es de esta institución.
     */
    const CLAVE_SESION = 'colegio_chat_session_id';

    /** Recupera el hilo de este colegio, creándolo la primera vez. */
    const obtenerSessionId = (): string => {

        let sessionId = localStorage.getItem(CLAVE_SESION);

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem(CLAVE_SESION, sessionId);
        }

        return sessionId;
    };

    /**
     * Abandona el hilo actual y abre uno nuevo.
     *
     * Solo toca el front: no llama a ningún endpoint de reset porque no consta que exista para
     * `sam-assistant-club`. El hilo viejo queda en el backend sin que nadie lo referencie.
     */
    const reiniciarSesion = (): string => {

        const sessionId = crypto.randomUUID();
        localStorage.setItem(CLAVE_SESION, sessionId);

        return sessionId;
    };

    /**
     * Mensaje legible a partir de lo que sea que haya fallado.
     *
     * En un 500 axios lanza «Request failed with status code 500» y se traga el cuerpo de la
     * respuesta, que es donde el backend sí explica qué pasó. Ese cuerpo es el que se muestra
     * en la burbuja de error.
     */
    const mensajeDeError = (problema: unknown): string => {

        const cuerpo = (problema as { response?: { data?: { message?: string } } })
            ?.response?.data?.message;

        if (cuerpo) return cuerpo;

        return problema instanceof Error
            ? problema.message
            : 'No hay respuesta del servidor.';
    };

    /**
     * Envía una pregunta al asistente del colegio y devuelve su respuesta.
     *
     * `email` acota la consulta a la institución del usuario logueado: es lo que impide que este
     * chat resuelva por un RUT arbitrario. El `sessionId` mantiene el contexto entre turnos.
     *
     * La comprobación de que `response` sea un string con contenido no es defensiva de más: en
     * este backend hay endpoints que responden **200 con un sobre de error** en vez de la carga
     * esperada (ver `estadisticas/*`). Sin ella, la burbuja se pintaría vacía.
     */
    const preguntar = async (email: string, prompt: string): Promise<string> => {

        try {
            const respuesta = await apiAdapter.post<IRespuestaAsistenteColegio>(
                `${API}/sam-assistant-club/as-question`,
                { email, prompt, sessionId: obtenerSessionId() },
            );

            if (typeof respuesta?.response !== 'string' || respuesta.response.trim() === '') {
                throw new Error('La respuesta del asistente llegó vacía.');
            }

            return respuesta.response;
        }
        catch (problema) {
            throw new Error(mensajeDeError(problema));
        }
    };

    return { preguntar, reiniciarSesion };
};
