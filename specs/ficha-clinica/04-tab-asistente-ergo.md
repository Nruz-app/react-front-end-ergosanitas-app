# SPEC 04 — Tab «Asistente Ergo» con chat GPT autoconsultado

> **Estado:** Implementado
> **Depende de:** SPEC 01 — Módulo Paciente (Ficha Clínica), SPEC 02 — Ficha Clínica con Tabs
> **Fecha:** 2026-08-20
> **Área afectada:** exclusivamente `src/ficha-clinica/` (regla dura heredada de la Spec 01)
> **Objetivo:** Agregar un quinto tab a la ficha clínica con el chat del asistente virtual ya existente, clonado dentro del módulo y modificado para enviar automáticamente el RUT del paciente al abrirse, en vez de pedirlo por pantalla.

---

## Por qué existe esta spec

El proyecto ya tiene un chat funcional contra GPT en `src/AsistenteVirtual/`, que en
realidad es un wrapper de `src/presentation/pages/assistant/AssistantPage.tsx`. Ese chat
abre con la frase «Bienvenido a Ergosanitas Virtual. Indica el RUT o nombre del paciente»
y espera que la persona escriba el identificador.

Dentro de la ficha clínica ese paso sobra. El módulo ya sabe de quién es la ficha: el RUT
llega en `paciente.rut` y `app-pacientes.tsx` lo usa para el fetch. Pedirlo otra vez es
hacer que el usuario teclee un dato que la pantalla ya está mostrando en su encabezado.

La spec resuelve eso replicando el chat dentro del módulo y cambiando **un solo
comportamiento**: en lugar de saludar y esperar, envía el RUT solo y muestra la respuesta.
Todo lo demás del chat —burbujas, micrófono, input, llamadas al backend— se conserva.

El segundo condicionante es la regla dura del módulo: **nada fuera de
`src/ficha-clinica/`**. Por eso el código no se importa desde `src/presentation/`, se
clona. Se paga duplicación a cambio de que el tab quede inmune a cambios en el asistente
global, que es un módulo con otro dueño y otro ritmo.

---

## Alcance

**Dentro (In):**

**Clonado del chat**

- Copiar dentro de `src/ficha-clinica/` los seis componentes que hoy forman el chat:
  burbuja de GPT, burbuja del usuario, caja de texto, loader, hook de reconocimiento de
  voz y el caso de uso que habla con el backend.
- El clon conserva el contrato HTTP actual: `POST {API}/sam-assistant/as-question` con
  `{ prompt, sessionId }` y `POST {API}/sam-assistant/reset-patient` con `{ sessionId }`.
- El caso de uso clonado usa `ApiAdapter` de `src/common/api/api.adapter.ts`, igual que el
  original. Esa es una importación de lectura desde `common/`, no una modificación.

**Autoconsulta del RUT**

- El tab recibe `paciente` por props desde `pages/app-pacientes.tsx`, como los otros cuatro.
- Al montarse por primera vez, envía `paciente.rut` como prompt **sin intervención del
  usuario** y muestra el loader hasta que llega la respuesta.
- El envío es **silencioso**: no se pinta una burbuja `MyMessage` con el RUT. El usuario no
  escribió eso.
- El prompt es el RUT **a secas**, sin frase envolvente. Es exactamente el input que el
  asistente pide hoy, así que el backend lo procesa sin cambios.

**Conversación posterior**

- Tras la primera respuesta, el chat funciona igual que el asistente virtual: se escribe o
  se dicta, se envía, se ve el loader, aparece la respuesta.
- El botón de micrófono y el reconocimiento de voz en `es-CL` se conservan.
- El estado de la conversación vive en el componente del tab. Se mantiene mientras no se
  recargue la página.

**Registro en la ficha**

- Quinto `<Tab>` en `pages/app-pacientes.tsx`, rotulado **«Asistente Ergo»**, con icono de
  MUI ya disponible (`SmartToyIcon`).
- El tab se monta con `tab === 4`, siguiendo el patrón de los cuatro existentes.

**Estados de error y carga**

- Si la consulta inicial falla, se muestra una burbuja de error y un botón **Reintentar**
  que reenvía el RUT.
- Si el paciente no tiene RUT (`paciente.rut` vacío), el chat no dispara la consulta
  automática y muestra la caja de texto habilitada con una burbuja explicando que puede
  indicar el paciente a mano.

**Fuera de alcance (para futuras specs):**

- **Modificar `src/AsistenteVirtual/`, `src/presentation/` o `src/asistente-voz/`.** Esas
  tres carpetas quedan intactas. Explícito por pedido del usuario.
- Refactorizar el chat a un componente compartido entre el asistente global y la ficha.
  Se asume la duplicación; unificar es otra spec.
- Persistir el historial del chat entre recargas o entre sesiones.
- Exportar la conversación a PDF o adjuntarla a la ficha.
- Alimentar al asistente con los datos ya cargados de la ficha (bioimpedancias, electros)
  como contexto adicional del prompt. Hoy el backend resuelve la ficha por su cuenta a
  partir del RUT.
- Streaming de la respuesta token a token. Hoy la respuesta llega completa.
- Sincronizar el tab activo con la URL. Sigue vigente la decisión de la Spec 02.
- Reproducir la respuesta por voz (text-to-speech).
- Cambiar de paciente desde el chat.

---

## Modelo de datos

La spec introduce una sola estructura nueva, local al tab, y reutiliza la interfaz de
respuesta del asistente existente.

```ts
// src/ficha-clinica/interface/asistente.interface.ts

/** Un turno de la conversación. `isGpt` distingue quién habla. */
export interface IMensajeChat {
    text  : string;
    isGpt : boolean;
}

/** Respuesta del endpoint `sam-assistant/as-question`. Clon de la del asistente global. */
export interface IRespuestaAsistente {
    response : string;
}
```

Convenciones:

- El historial es `IMensajeChat[]` en `useState` dentro del tab. No hay contexto ni store.
- La burbuja de bienvenida **no** vive en el array: se renderiza fija, como hace hoy
  `AssistantPage`.
- La burbuja de error tampoco se distingue por tipo: es un `IMensajeChat` con `isGpt: true`.
  Un estado `error: boolean` separado controla si se muestra el botón Reintentar.

**Clave de `localStorage`:**

```
ficha_chat_session_id
```

Distinta de la `chat_session_id` que usa el asistente global, a propósito. Si compartieran
clave, un hilo abierto en el asistente virtual con otro paciente contaminaría el contexto
del chat de la ficha.

---

## Plan de implementación

Cada paso deja el proyecto compilando (`npm run build` en verde).

1. **Crear `interface/asistente.interface.ts`** con `IMensajeChat` e `IRespuestaAsistente`.
   Exportarlas desde `interface/index.ts` con `export type`.

2. **Crear `services/UseAsistenteService.ts`** clonando `create-thread.use.case.ts`.
   Sigue el patrón `UseXService` del proyecto. Expone `preguntar(prompt)` y
   `reiniciarPaciente()`. Genera y persiste el `sessionId` bajo `ficha_chat_session_id`.
   Reexportar desde `services/index.ts`.

3. **Crear `hooks/useReconocimientoVoz.ts`** clonando `use-speech-recognitionGPT.tsx`.
   Mismo comportamiento: `es-CL`, `continuous`, `interimResults`. Devuelve
   `{ textoFinal, textoTemporal, escuchando, iniciar, detener, limpiar }`.
   Si el navegador no soporta `SpeechRecognition`, `escuchando` queda en `false` y
   `iniciar` no hace nada.

4. **Crear `components/asistente/BurbujaGpt.tsx` y `BurbujaUsuario.tsx`** clonando
   `GptMessage` y `MyMessage`. Mismo aspecto visual, mismo avatar `/logoTrans.png`.

5. **Crear `components/asistente/CajaMensaje.tsx`** clonando `TextMessageBox`
   **sin** la prop `onResetPatient` ni el botón naranja de cambiar paciente.

6. **Crear `components/asistente/LoaderEscribiendo.tsx`** con los tres `CircularProgress`
   del `TypingLoader` original. No se usa `terminator.gif`.

7. **Crear `components/tabs/TabAsistenteErgo.tsx`.** Recibe `paciente` por props. Monta el
   chat, dispara la consulta inicial en un `useEffect` con guarda de ejecución única, y
   maneja los tres estados: cargando, respondido, error con Reintentar.

8. **Registrar el quinto tab en `pages/app-pacientes.tsx`**: `<Tab icon={<SmartToyIcon />}
   iconPosition="start" label="Asistente Ergo" />` y el bloque `{tab === 4 && ...}`.

9. **Actualizar los barriles**: `components/index.ts`, `interface/index.ts`,
   `services/index.ts` y, si aplica, `src/ficha-clinica/index.ts`.

---

## Criterios de aceptación

- [ ] `npm run build` termina sin errores (`tsc -b` incluido).
- [ ] `npx eslint src/ficha-clinica/` sale en 0.
- [ ] La ficha clínica muestra **cinco** tabs; el quinto se llama exactamente
      «Asistente Ergo».
- [ ] Al abrir el tab por primera vez aparece la burbuja de bienvenida y, debajo, el
      loader — **sin** ninguna burbuja de usuario con el RUT.
- [ ] La petición que sale al abrir el tab lleva `prompt` igual al RUT del paciente y
      nada más (verificable en la pestaña Network).
- [ ] Cuando llega la respuesta, el loader desaparece y se muestra una burbuja de GPT con
      el texto recibido.
- [ ] Escribir un mensaje y enviarlo agrega una burbuja de usuario y luego una de GPT.
- [ ] El botón de micrófono alterna entre `MicIcon` y `MicOffIcon`, y lo dictado aparece
      en el input.
- [ ] **No** existe el botón naranja de «Consultar por otro paciente» en este tab.
- [ ] Salir del tab y volver **no** reenvía el RUT: el historial sigue donde estaba.
- [ ] Recargar la página (F5) vuelve al tab Home y, al reabrir el tab, la conversación
      empieza de cero y reenvía el RUT.
- [ ] Con el backend caído, el tab muestra una burbuja de error y un botón Reintentar que
      vuelve a disparar la consulta.
- [ ] `localStorage` contiene una clave `ficha_chat_session_id` y **no** se ha modificado
      `chat_session_id`.
- [ ] `git status` no reporta cambios en `src/AsistenteVirtual/`, `src/presentation/` ni
      `src/asistente-voz/`.

---

## Decisiones tomadas y descartadas

- **Sí:** clonar el código dentro de `src/ficha-clinica/`. La regla dura del módulo prohíbe
  depender de otras carpetas de features, y el usuario pidió explícitamente no tocar
  `src/presentation/` ni `src/asistente-voz/`. La duplicación es el precio conocido.
- **No:** importar los componentes desde `src/presentation/components`. Acoplaría la ficha
  a un módulo con otro dueño: un cambio de estilo allá se propagaría acá sin aviso.
- **No:** extraer un componente de chat compartido. Es el refactor correcto, pero toca
  `src/presentation/` y por tanto queda fuera de esta spec.
- **Sí:** el RUT sale de `paciente.rut` recibido por props. Mantiene el patrón «la página es
  el único que hace fetch» y garantiza que el chat consulta al mismo paciente que se está
  mostrando, incluso cuando la página cayó al `RUT_DEMO` por falta de sesión.
- **No:** leer `user.rut_paciente` del `LoginContext` dentro del tab. Serían dos fuentes de
  verdad para el mismo dato y podrían desalinearse.
- **Sí:** clave `ficha_chat_session_id` propia. Evita que un hilo abierto en el asistente
  global con otro paciente contamine el contexto del chat de la ficha.
- **No:** compartir `chat_session_id`. El ahorro no compensa el riesgo de mostrar datos del
  paciente equivocado.
- **Sí:** envío silencioso del RUT. El usuario no escribió nada; pintar una burbuja suya
  simularía una acción que no ocurrió.
- **Sí:** conservar la burbuja de bienvenida, reescrita para no pedir el RUT. Sin ella el
  panel se ve vacío durante el primer segundo de espera.
- **Sí:** eliminar el botón «Consultar por otro paciente». El módulo tiene un solo paciente
  por regla dura; ese botón podría dejar el chat hablando de alguien que no es el de la ficha.
- **No:** reconvertirlo en «Reiniciar conversación». Añade superficie sin necesidad
  demostrada. Si el hilo se enreda, F5 lo resuelve.
- **Sí:** conservar micrófono y hook de voz. Es parte del comportamiento que se pidió replicar.
- **Sí:** `TypingLoader` con `CircularProgress` en vez de `terminator.gif`. El GIF ocupa
  300×300 px dentro de un panel de chat de 400 px de alto y desentona con el resto del módulo.
- **Sí:** disparo único al montar el tab. Volver desde otro tab conserva el historial, que es
  lo que espera cualquiera que navegue entre pestañas.
- **No:** disparar la consulta junto con el fetch de la ficha. Gastaría una llamada a GPT
  aunque nadie abra el tab.
- **Sí:** prompt igual al RUT a secas. Es literalmente lo que el asistente pide hoy; cualquier
  frase envolvente arriesga no matchear su parser.

---

## Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| El backend no reconoce el RUT y responde pidiendo el paciente de nuevo | La caja de texto queda habilitada desde el inicio: el usuario puede responder a mano y el chat sigue funcionando |
| `paciente.rut` viene vacío o nulo | Se omite la consulta automática y se muestra una burbuja pidiendo el identificador, igual que el asistente global |
| El navegador no soporta `SpeechRecognition` (Firefox, Safari antiguo) | El hook clonado ya contempla el caso: `iniciar` no hace nada y el resto del chat funciona por texto |
| La respuesta de GPT tarda mucho y el usuario cambia de tab | El estado vive en el componente del tab; si se desmonta, la respuesta se pierde. Aceptado: reabrir el tab reenvía el RUT |
| El código clonado y el original divergen con el tiempo | Aceptado y documentado. Unificarlos es una spec futura, no un pendiente silencioso |
| El formato del RUT de la ficha (`16900918-k`, k minúscula) no coincide con el que espera el backend | El mismo RUT ya se usa para el fetch de la ficha; si el backend lo acepta ahí, lo acepta aquí |

---

## Lo que **no** entra en esta spec

- Cualquier cambio en `src/AsistenteVirtual/`, `src/presentation/` o `src/asistente-voz/`.
- Unificar el chat clonado con el asistente global.
- Persistir el historial de la conversación.
- Pasar los datos ya cargados de la ficha como contexto del prompt.
- Streaming de la respuesta.
- Text-to-speech de las respuestas.
- Exportar o adjuntar la conversación a la ficha.
- Cambiar de paciente desde el chat.
- Sincronizar el tab activo con la URL.

Cada una de esas, si entra alguna vez, va en su propia spec.
