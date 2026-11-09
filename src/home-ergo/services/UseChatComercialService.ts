import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import { IConfigChatHome, IMensajeChatHome, IRespuestaChatHome } from '../interface';
import homeChat from '../config/home-chat.json';

/**
 * Servicio del chat comercial del Home, «Ergosanito» (Specs 01 y 05 de `home-ergo`).
 *
 * Sigue el patrón `UseXService` del proyecto y es un clon conceptual de
 * `src/ficha-clinica/services/UseAsistenteService.ts`, que a su vez clonó el del
 * asistente global. La Spec 01 prohíbe depender de `src/presentation/` y de
 * `src/AsistenteVirtual/`, así que se duplica en lugar de importarse.
 *
 * Contrato con el backend (SPEC 06 del back, «Chat comercial Ergosanito»):
 *
 *   POST {API}/chat-comercial/as-question   { prompt, sessionId? } → { sessionId, response, derivar }
 *
 * Es un endpoint propio y público, con límite por IP (429). No se reutiliza el asistente
 * que resuelve pacientes por RUT (`sam-assistant/as-question`): exponerlo a un visitante
 * anónimo de la portada arriesga filtrar datos clínicos. La separación es de seguridad,
 * no de estilo.
 *
 * Además de preguntar, el servicio guarda la conversación visible en `localStorage`
 * (`home_chat_mensajes`) para que sobreviva a un F5, con los datos personales del
 * visitante enmascarados (Spec 05 §3.4).
 */

/** Textos del chat. Se tipan aquí para que un JSON mal editado no compile. */
const textos: IConfigChatHome = homeChat;

/**
 * Clave propia del hilo de la portada.
 *
 * Distinta de `chat_session_id` (asistente global) y de `ficha_chat_session_id`
 * (ficha clínica). Son tres chats con tres hilos: un hilo abierto en la ficha de un
 * paciente no debe filtrarse a lo que ve un visitante anónimo en el Home.
 */
const CLAVE_SESION = 'home_chat_session_id';

/** Conversación visible de la portada (Spec 05). Solo la escribe este servicio. */
const CLAVE_MENSAJES = 'home_chat_mensajes';

/**
 * Formato que acepta el back como `sessionId`. Cualquier otra cosa se descarta antes de
 * enviarla: un valor de más de 64 caracteres daría 422 en cada mensaje para siempre.
 */
const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Enmascara RUT, correo y teléfono chileno con la misma regla que
 * `ChatComercialService::enmascarar()` del back (L80–87).
 *
 * El orden importa: correo → teléfono → RUT, porque un celular sin espacios
 * (`961149975`) también calza con el patrón de RUT.
 *
 * El back usa *lookbehind* `(?<!…)`, que Safari < 16.4 no soporta y el *target* de Vite
 * incluye Safari 14. Aquí el carácter previo se captura en `(^|[^…])` y se repone con
 * `$1`. Diferencia aceptada: dos coincidencias separadas por un solo carácter pueden
 * dejar la segunda sin enmascarar; lo guardado nunca sale del navegador.
 */
const enmascarar = (texto: string): string => {

    let limpio = texto.replace( /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[EMAIL]' );
    limpio = limpio.replace( /(^|[^\d+])(?:\+?56\s?)?9\s?\d{4}\s?\d{4}(?!\d)/g, '$1[TELEFONO]' );
    limpio = limpio.replace( /(^|[^\w.])\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK](?!\w)/g, '$1[RUT]' );

    return limpio;
};

/** `true` si el valor tiene la forma mínima de un turno: `{ text: string, isGpt: boolean }`. */
const esMensajeValido = (valor: unknown): valor is IMensajeChatHome => {

    if (typeof valor !== 'object' || valor === null) return false;

    const candidato = valor as { text?: unknown; isGpt?: unknown };

    return typeof candidato.text === 'string' && typeof candidato.isGpt === 'boolean';
};

/**
 * Forma de un error de axios que sí llegó al servidor. Se inspecciona la forma en vez de
 * importar axios: el proyecto lo importa en un solo archivo (`common/api/api.adapter.ts`).
 */
const tieneRespuestaHttp = (problema: unknown): problema is { response: { status?: number } } => {

    if (typeof problema !== 'object' || problema === null) return false;

    const respuesta = (problema as { response?: unknown }).response;

    return typeof respuesta === 'object' && respuesta !== null;
};

/**
 * Traduce cualquier fallo de la petición a un texto amable de `home-chat.json` (Spec 05 §3.5).
 *
 * Nunca se muestra el `message` del back ni el de axios: el de axios está en inglés
 * («Request failed with status code 429») y no le dice nada al visitante.
 *
 * - 429 → `errores.limite` (cupo por minuto o por día; el texto es neutro a propósito).
 * - Con respuesta HTTP (422, 500, otro) → `errores.servidor`.
 * - Sin respuesta (red caída, CORS, timeout) → `errores.red`.
 */
const traducirError = (problema: unknown): string => {

    if (!tieneRespuestaHttp(problema)) return textos.errores.red;

    if (problema.response.status === 429) return textos.errores.limite;

    return textos.errores.servidor;
};

export const UseChatComercialService = () => {

    /**
     * Interruptor del modo sin backend.
     *
     * En `true` el servicio responde con un eco: devuelve la misma pregunta tras una
     * latencia simulada, con `derivar: false`. Sirve para desarrollar el chat sin back,
     * igual que `USAR_MOCK` en ficha clínica. En producción va en `false`.
     *
     * Los DOS caminos son código real y `tsc -b` los type-checkea. La llamada HTTP no
     * está comentada a propósito: un comentario no compila y se pudre sin que nadie se
     * entere.
     */
    const USAR_ECO = false;

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /** Latencia simulada (ms) del eco, para que el loader alcance a verse. */
    const LATENCIA_MS = 700;

    const esperar = (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms));

    /**
     * Recupera el hilo guardado, creándolo la primera vez.
     *
     * Devuelve `null` —y la petición va sin `sessionId`— si lo guardado no es un UUID
     * (editado a mano o corrupto) o si `localStorage` no está disponible (modo privado).
     * En ambos casos el back crea un hilo nuevo y `guardarSessionId` lo deja guardado.
     */
    const obtenerSessionId = (): string | null => {

        try {
            const guardado = localStorage.getItem(CLAVE_SESION);

            if (guardado) return REGEX_UUID.test(guardado) ? guardado : null;

            const nuevo = crypto.randomUUID();
            localStorage.setItem(CLAVE_SESION, nuevo);
            return nuevo;

        } catch {
            return null;
        }
    };

    /** Adopta el hilo que reconoce el back si es distinto del que se envió. */
    const guardarSessionId = (devuelto: unknown, enviado: string | null): void => {

        if (typeof devuelto !== 'string' || devuelto === '' || devuelto === enviado) return;

        try {
            localStorage.setItem(CLAVE_SESION, devuelto);
        } catch {
            // Sin almacenamiento el chat sigue funcionando; solo pierde el hilo al recargar.
        }
    };

    /**
     * Envía una pregunta y devuelve la respuesta de Ergosanito.
     *
     * `derivar` es `true` solo si el back lo dice explícitamente: en ese turno el chat
     * pinta el botón de WhatsApp. Cualquier fallo se lanza como `Error` con un texto de
     * `home-chat.json` listo para pintarse tal cual.
     */
    const preguntar = async (prompt: string): Promise<{ texto: string; derivar: boolean }> => {

        if (USAR_ECO) {
            await esperar(LATENCIA_MS);
            return { texto: prompt, derivar: false };
        }

        const sessionId = obtenerSessionId();

        let respuesta: IRespuestaChatHome;

        try {
            respuesta = await apiAdapter.post<IRespuestaChatHome>(
                `${API}/chat-comercial/as-question`,
                sessionId ? { prompt, sessionId } : { prompt },
            );
        } catch (problema) {
            throw new Error(traducirError(problema));
        }

        // Fuera del `try`: un 200 vacío no es un error de red y no debe traducirse como tal.
        if (!respuesta?.response) {
            throw new Error(textos.errores.vacia);
        }

        guardarSessionId(respuesta.sessionId, sessionId);

        return {
            texto   : respuesta.response,
            derivar : respuesta.derivar === true,
        };
    };

    /**
     * Conversación guardada, o `[]` si no hay, el JSON está roto o algún turno no tiene
     * la forma esperada. Nunca lanza: un `localStorage` corrupto no puede tumbar el Home.
     */
    const leerMensajes = (): IMensajeChatHome[] => {

        try {
            const crudo = localStorage.getItem(CLAVE_MENSAJES);
            if (!crudo) return [];

            const datos: unknown = JSON.parse(crudo);
            if (!Array.isArray(datos) || !datos.every(esMensajeValido)) return [];

            return datos.slice(-textos.maxTurnos).map(({ text, isGpt, derivar }) =>
                typeof derivar === 'boolean' ? { text, isGpt, derivar } : { text, isGpt },
            );

        } catch {
            return [];
        }
    };

    /**
     * Guarda los últimos `maxTurnos` turnos. Solo se enmascaran los del visitante, como
     * hace el back: así el teléfono de contacto de una derivación sigue legible tras un F5.
     * Los turnos de error no deben llegar aquí: los filtra quien llama.
     */
    const guardarMensajes = (mensajes: IMensajeChatHome[]): void => {

        const recortados = mensajes
            .slice(-textos.maxTurnos)
            .map((mensaje) => mensaje.isGpt ? mensaje : { ...mensaje, text: enmascarar(mensaje.text) });

        try {
            localStorage.setItem(CLAVE_MENSAJES, JSON.stringify(recortados));
        } catch {
            // Modo privado o cuota llena: la conversación sigue en pantalla, solo no se guarda.
        }
    };

    return {
        preguntar,
        leerMensajes,
        guardarMensajes,
    };
};
