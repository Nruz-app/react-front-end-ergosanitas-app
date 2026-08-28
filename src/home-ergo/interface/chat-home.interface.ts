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
    text  : string;
    isGpt : boolean;
}

/**
 * Respuesta de `POST {API}/chat-comercial/as-question`.
 *
 * El endpoint todavía no existe: mientras `USAR_ECO` esté en `true`, el servicio
 * fabrica esta misma forma localmente devolviendo la pregunta recibida. El contrato se
 * fija aquí para que el backend, cuando se escriba, tenga a qué ajustarse.
 */
export interface IRespuestaChatHome {
    response : string;
}
