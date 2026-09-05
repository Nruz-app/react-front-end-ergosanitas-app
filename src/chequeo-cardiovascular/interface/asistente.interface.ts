/**
 * Modelo del chat «Asistente Ergo» del Home del colegio (Spec 03).
 *
 * Es una estructura de conversación, no de chequeo: no pasa por `IChequeo` ni por las
 * agregaciones de `resumen.interface.ts`. El backend responde texto ya redactado.
 */

/**
 * Un turno de la conversación.
 *
 * `isGpt` distingue quién habla: `true` pinta una `BurbujaGpt`, `false` una `BurbujaUsuario`.
 * Los mensajes de error del propio front también viajan con `isGpt: true` — se leen como una
 * respuesta del asistente, que es lo que el usuario espera ver en ese hueco. Que sean un error
 * lo indica el estado `error` del componente, no un campo de este tipo.
 */
export interface IMensajeChat {
    text  : string;
    isGpt : boolean;
}

/**
 * Respuesta de `POST {API}/sam-assistant-club/as-question`.
 *
 * Mismo campo útil que el asistente de la ficha clínica, pero **otro endpoint**: este resuelve
 * sobre la institución (`email`) y aquel sobre un paciente (`sessionId` + RUT). La separación
 * es la que impide que un colegio consulte por un RUT arbitrario.
 *
 * ⚠️ **El backend devuelve más de lo que se declara aquí.** Verificado contra
 * `http://127.0.0.1:8000/api` el 2026-09-05, la respuesta real es:
 *
 *     { sessionId: string, club: string, search: string | null, response: string }
 *
 * Solo se tipa `response` porque es lo único que el chat usa: `club` repite el `email` que ya
 * enviamos y `search` llegó `null` en todas las pruebas. Tiparlos sin usarlos ataría el front a
 * una forma que nadie lee — y `ApiAdapter` no valida nada en tiempo de ejecución, así que un
 * tipo de más no protege de nada.
 */
export interface IRespuestaAsistenteColegio {
    response : string;
}
