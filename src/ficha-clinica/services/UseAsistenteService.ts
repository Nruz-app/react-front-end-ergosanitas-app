import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import { IRespuestaAsistente } from '../interface';

/**
 * Servicio del chat «Asistente Ergo» (Spec 04).
 *
 * Clon de `src/presentation/core/services/create-thread.use.case.ts`, adaptado al patrón
 * `UseXService` del proyecto. Se duplica en vez de importarse porque la Spec 04 prohíbe
 * depender de `src/presentation/`: así un cambio en el asistente global no altera la
 * ficha clínica sin aviso.
 *
 * El contrato HTTP es el mismo que usa el asistente virtual, sin cambios:
 *
 *   POST {API}/sam-assistant/as-question   { prompt, sessionId } → { response }
 *   POST {API}/sam-assistant/reset-patient { sessionId }
 */
export const UseAsistenteService = () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /**
     * Clave propia del hilo, distinta de la `chat_session_id` del asistente global.
     *
     * Si compartieran clave, un hilo abierto en el asistente virtual con OTRO paciente
     * contaminaría el contexto de esta ficha, y el chat respondería sobre alguien que no
     * es el de la pantalla.
     */
    const CLAVE_SESION = 'ficha_chat_session_id';

    /** Recupera el hilo de esta ficha, creándolo la primera vez. */
    const obtenerSessionId = (): string => {

        let sessionId = localStorage.getItem(CLAVE_SESION);

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem(CLAVE_SESION, sessionId);
        }

        return sessionId;
    };

    /**
     * Mensaje legible a partir de lo que sea que haya fallado.
     *
     * Mismo criterio que `UsePacienteService`: en un 500 axios lanza «Request failed with
     * status code 500» y se traga el cuerpo de la respuesta, donde el backend sí explica
     * qué pasó. Ese mensaje es el que se muestra en la burbuja de error.
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
     * Envía un prompt al asistente y devuelve su respuesta.
     *
     * El `sessionId` mantiene el contexto entre turnos: por eso la primera pregunta puede
     * ser el RUT a secas y las siguientes se resuelven sobre ese paciente.
     */
    const preguntar = async (prompt: string): Promise<string> => {

        try {
            const respuesta = await apiAdapter.post<IRespuestaAsistente>(
                `${API}/sam-assistant/as-question`,
                { prompt, sessionId: obtenerSessionId() },
            );

            if (!respuesta?.response) {
                throw new Error('La respuesta del asistente llegó vacía.');
            }

            return respuesta.response;

        } catch (problema) {
            throw new Error(mensajeDeError(problema));
        }
    };

    /**
     * Suelta el paciente que el hilo tenga cargado.
     *
     * El tab no expone hoy ningún botón que lo llame — la Spec 04 quitó el de «Consultar
     * por otro paciente» porque la ficha es de un solo paciente. Se conserva para no
     * romper la paridad con el contrato del backend y porque reiniciar el hilo es la
     * salida natural si alguna vez se enreda.
     */
    const reiniciarPaciente = async (): Promise<void> => {

        const sessionId = localStorage.getItem(CLAVE_SESION);

        // Sin hilo abierto no hay nada que reiniciar: llamar igual haría que el backend
        // creara una sesión solo para vaciarla.
        if (!sessionId) return;

        try {
            await apiAdapter.post(`${API}/sam-assistant/reset-patient`, { sessionId });
        } catch (problema) {
            throw new Error(mensajeDeError(problema));
        }
    };

    return {
        preguntar,
        reiniciarPaciente,
    };
};
