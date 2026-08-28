import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import { IRespuestaChatHome } from '../interface';

/**
 * Servicio del chat comercial del Home (Spec 01 de `home-ergo`).
 *
 * Sigue el patrón `UseXService` del proyecto y es un clon conceptual de
 * `src/ficha-clinica/services/UseAsistenteService.ts`, que a su vez clonó el del
 * asistente global. La Spec 01 prohíbe depender de `src/presentation/` y de
 * `src/AsistenteVirtual/`, así que se duplica en lugar de importarse.
 *
 * Contrato que fija esta spec para el backend:
 *
 *   POST {API}/chat-comercial/as-question   { prompt, sessionId } → { response }
 *
 * Ese endpoint **todavía no existe**. Es deliberado: el asistente que sí existe
 * (`sam-assistant/as-question`) resuelve pacientes por RUT, y exponerlo a un visitante
 * anónimo de la portada arriesga filtrar datos clínicos. La separación es de seguridad,
 * no de estilo.
 */
export const UseChatComercialService = () => {

    /**
     * Único cambio necesario para conectar el backend real.
     *
     * En `true` el servicio responde con un eco: devuelve la misma pregunta tras una
     * latencia simulada. Sirve para construir y probar el chat completo sin backend.
     *
     * ⚠️ En `true` el chat le repite al visitante su propia pregunta. Antes de desplegar
     * a producción con el backend listo, esto va en `false`.
     *
     * Los DOS caminos son código real y `tsc -b` los type-checkea. La llamada HTTP no
     * está comentada a propósito: un comentario no compila y se pudre sin que nadie se
     * entere.
     */
    const USAR_ECO = true;

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /** Latencia simulada (ms) del eco, para que el loader alcance a verse. */
    const LATENCIA_MS = 700;

    const esperar = (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms));

    /**
     * Clave propia del hilo de la portada.
     *
     * Distinta de `chat_session_id` (asistente global) y de `ficha_chat_session_id`
     * (ficha clínica). Son tres chats con tres hilos: un hilo abierto en la ficha de un
     * paciente no debe filtrarse a lo que ve un visitante anónimo en el Home.
     */
    const CLAVE_SESION = 'home_chat_session_id';

    /** Recupera el hilo de esta pestaña, creándolo la primera vez. */
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
     * En un 500 axios lanza «Request failed with status code 500» y se traga el cuerpo de
     * la respuesta, que es donde el backend explica qué pasó. Ese cuerpo es el que
     * termina en la burbuja de error.
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
     * Envía una pregunta y devuelve la respuesta.
     *
     * El `sessionId` viaja en cada turno para que el backend pueda mantener el contexto
     * de la conversación cuando exista.
     */
    const preguntar = async (prompt: string): Promise<string> => {

        if (USAR_ECO) {
            await esperar(LATENCIA_MS);
            return prompt;
        }

        try {
            const respuesta = await apiAdapter.post<IRespuestaChatHome>(
                `${API}/chat-comercial/as-question`,
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

    return {
        preguntar,
    };
};
