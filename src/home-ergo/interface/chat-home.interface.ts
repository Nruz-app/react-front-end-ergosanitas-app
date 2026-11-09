/**
 * Modelo del chat comercial del Home (Spec 01 de `home-ergo`).
 *
 * Es un clon conceptual del chat del asistente, no un import. La Spec 01 prohíbe
 * depender de `src/presentation/` y de `src/AsistenteVirtual/`, igual que hizo la
 * Spec 04 de ficha clínica con su propio tab. La duplicación es deliberada.
 *
 * La diferencia de fondo con esos dos chats no es la forma de los datos —es idéntica—
 * sino a quién le habla: aquí el interlocutor es un visitante anónimo que pregunta por
 * servicios y precios, no un profesional consultando la ficha de un paciente por RUT.
 */

/**
 * Un turno de la conversación.
 *
 * `isGpt` distingue quién habla: `true` pinta una `BurbujaBot`, `false` una
 * `BurbujaVisitante`. Los mensajes de error del propio front también viajan con
 * `isGpt: true`, porque ocupan el mismo hueco visual que una respuesta.
 */
export interface IMensajeChatHome {
    text     : string;
    isGpt    : boolean;
    /** Solo en turnos del asistente: pinta el botón de WhatsApp bajo la burbuja. */
    derivar? : boolean;
}

/**
 * Respuesta de `POST {API}/chat-comercial/as-question` (SPEC 06 del back, «Ergosanito»).
 *
 * El back devuelve siempre los tres campos, pero `sessionId` y `derivar` se declaran
 * opcionales a propósito: el `<T>` del `ApiAdapter` no valida nada. Si falta `sessionId`,
 * el front conserva el que tenía; si falta `derivar`, se trata como `false`.
 * Con `USAR_ECO` en `true` el servicio fabrica esta misma forma localmente.
 */
export interface IRespuestaChatHome {
    response   : string;
    /** Hilo que el back reconoce. Puede ser distinto del enviado si el nuestro no era un UUID. */
    sessionId? : string;
    /** `true` cuando el asistente no supo responder y derivó a contacto. */
    derivar?   : boolean;
}

/** Una sugerencia: lo que se ve en el chip y lo que se envía al pulsarlo. */
export interface ISugerenciaChatHome {
    etiqueta : string;
    pregunta : string;
}

/** Textos del chat, desde config/home-chat.json. */
export interface IConfigChatHome {
    titulo         : string;
    subtitulo      : string;
    bienvenida     : string;
    aviso          : string;
    placeholder    : string;
    maxCaracteres  : number;
    maxTurnos      : number;
    botonDerivar   : string;
    sugerencias    : ISugerenciaChatHome[];
    errores        : {
        limite   : string;
        red      : string;
        servidor : string;
        vacia    : string;
    };
}
