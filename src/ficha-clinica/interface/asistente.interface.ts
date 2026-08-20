/**
 * Modelo del chat del tab «Asistente Ergo» (Spec 04).
 *
 * Es una estructura de conversación, no de ficha clínica: no pasa por el mapper ni por
 * las tres capas de `api.interface.ts` → `ficha-clinica.interface.ts` →
 * `segmentaria.interface.ts`. El backend del asistente responde texto ya redactado.
 */

/**
 * Un turno de la conversación.
 *
 * `isGpt` distingue quién habla: `true` pinta una `BurbujaGpt`, `false` una
 * `BurbujaUsuario`. Los mensajes de error del propio front también viajan con
 * `isGpt: true` — se leen como una respuesta del asistente, que es lo que el usuario
 * espera ver en ese hueco. Que sean un error lo indica el estado `error` del tab, no
 * un campo de este tipo.
 */
export interface IMensajeChat {
    text  : string;
    isGpt : boolean;
}

/**
 * Respuesta de `POST {API}/sam-assistant/as-question`.
 *
 * Clon del contrato que ya usa el asistente global en
 * `src/presentation/interface/assistant-response.interface.ts`. Se duplica a propósito:
 * la Spec 04 prohíbe importar desde `src/presentation/`.
 */
export interface IRespuestaAsistente {
    response : string;
}
