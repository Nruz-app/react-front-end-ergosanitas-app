# SPEC 05 — Chat «Ergosanito» conectado al backend real

> **Estado:** Implementado
> **Depende de:** SPEC 06 del **backend**, «Chat comercial Ergosanito», en `Back-end/ergosanitas-app/specs/06-chat-comercial-ergosanito.md` — estado **`Implementado`** (2026-11-09, rama `spec-06-chat-comercial-ergosanito`, sin commitear a la fecha de la revisión, así que el CI aún no pudo publicarla). **Pendiente confirmar el despliegue en producción** (código del back, sus dos migraciones y las tablas `cache` / `cache_locks`) **antes** de que esta spec llegue a `main`. También de la Spec 01 de `home-ergo` (el chat clonado).
> **Fecha:** 2026-11-09 (revisada el mismo día con la segunda ronda de decisiones del usuario; revisión contra el código con `/spec-ergo-front` el 2026-11-09, ver «Notas de revisión» al final)
> **Área afectada:** `src/home-ergo/` únicamente, más documentación (`CLAUDE_HOME_ERGO.md`, `CLAUDE.md`, `.claude/ARQUITECTURA.md`).
> **Objetivo:** Que el chat flotante de la portada deje de hacer eco y converse de verdad con «Ergosanito», el asistente comercial del back: con su nombre, sugerencias para empezar, el aviso de que no entrega datos de pacientes ni diagnósticos, límite de 500 caracteres visible, conversación que sobrevive a una recarga, botón de WhatsApp cuando el back pide derivar y errores amables (incluido el 429 por exceso de mensajes).

---

## 1. Por qué existe esta spec

El chat de la portada se construyó en la Spec 01 con el contrato ya fijado
(`POST {API}/chat-comercial/as-question`, `{ prompt, sessionId }` → `{ response }`) y con
`USAR_ECO = true` porque el endpoint no existía. Hoy le repite al visitante su propia pregunta.

La SPEC 06 del back crea el endpoint, le da una persona, «Ergosanito», y agrega dos cosas al
contrato: el `sessionId` que reconoce y una bandera `derivar` que indica que el asistente no supo
responder y mandó al visitante a hablar con una persona. Esta spec hace el lado del front.

### 1.1 Lo que se verificó en el código (2026-11-09)

| Archivo | Hallazgo |
| --- | --- |
| `services/UseChatComercialService.ts` L36 | `const USAR_ECO = true;`. La rama real (L102–116) ya hace `apiAdapter.post<IRespuestaChatHome>(`${API}/chat-comercial/as-question`, { prompt, sessionId: obtenerSessionId() })` y lee solo `respuesta.response`. |
| `services/UseChatComercialService.ts` L55–68 | Clave `home_chat_session_id` en `localStorage`, creada con `crypto.randomUUID()`. Nunca se actualiza con lo que diga el back. `obtenerSessionId()` (L58–68) lee y escribe `localStorage` **sin** `try/catch`. |
| `services/UseChatComercialService.ts` L77–87 | `mensajeDeError()` muestra `response.data.message` del back o el `message` de axios (en inglés, p. ej. «Request failed with status code 429»). No distingue 429 ni falta de red. |
| `components/chat/ChatComercial.tsx` L20 | `BIENVENIDA = 'Hola. Soy el asistente de Ergo SaniTas…'`, escrita en el `.tsx`. |
| `components/chat/ChatComercial.tsx` L133 / L136 | Cabecera «Ergo SaniTas» / «Consulta por nuestros servicios», también en el `.tsx`. L107: `aria-label="Chat con Ergo SaniTas"`. |
| `components/chat/ChatComercial.tsx` L36 | El historial vive solo en `useState`: un F5 lo vacía, aunque el `sessionId` siga en `localStorage`. |
| `components/chat/ChatComercial.tsx` L86–93 (texto en L92) | El error se pinta como «No pude responder en este momento. ${detalle} Puedes escribirnos por WhatsApp mientras tanto.»: con un 429 saldría el texto técnico de axios en medio. |
| `components/chat/CajaMensaje.tsx` | `TextField` multilínea sin `maxLength` ni contador. El back rechaza con 422 más de 500 caracteres. |
| `components/chat/BurbujaBot.tsx` | Pinta texto plano con `whiteSpace: 'pre-wrap'`; no interpreta markdown. La SPEC 06 obliga al back a responder sin markdown. |
| `config/canales-contacto.tsx` L74 | `export const urlWhatsapp = urlWhatsappCon( mensajeWhatsapp );` — un `string` ya armado. Es la **única fuente** de `wa.me` del módulo; el número (`telefonoWhatsapp: "56961149975"`) sale de `config/home-contacto.json`. |
| `interface/chat-home.interface.ts` | `IMensajeChatHome { text, isGpt }` e `IRespuestaChatHome { response: string }`. |
| `CLAUDE_HOME_ERGO.md`, regla 6 | «El contenido vive en JSON o en la API, nunca en los componentes.» La bienvenida y la cabecera en el `.tsx` son una excepción heredada de la Spec 01. |
| `config/index.ts` L19–22 (comentario final) | Los JSON de contenido **no** se reexportan desde el barril: cada consumidor los importa por ruta directa. El comentario habla de «los cuatro JSON»; con `home-chat.json` serán cinco. |
| `services/index.ts` L1–2, `interface/chat-home.interface.ts` L25–31, `ChatComercial.tsx` L22–31 | Comentarios que dicen que el endpoint «todavía no existe» y que la conversación «no se persiste entre recargas». Quedan falsos con esta spec. |
| `wa.me` en el módulo | La URL solo se arma en `config/canales-contacto.tsx` L65–66, pero la cadena `wa.me` aparece también en comentarios (`SeccionContacto.tsx` L18, `config/index.ts` L9, `interface/home.interface.ts` L121). Un `grep "wa\.me"` no basta para el criterio; `grep "https://wa\.me"` sí. |
| `tsconfig.app.json` / `vite.config.ts` | `target: ES2020` y Vite 5 sin `build.target` (por defecto `safari14`, `chrome87`, `firefox78`). Los *lookbehind* `(?<!…)` de las regex del back no existen en Safari < 16.4. |
| `src/` | Ningún otro archivo llama a `chat-comercial` (grep). La app móvil tampoco. |

---

## 2. Alcance

**Dentro:**

- `USAR_ECO = false` y consumo real del endpoint.
- Guardar en `home_chat_session_id` el `sessionId` que devuelve el back.
- Persistir la conversación visible en `localStorage`, clave nueva `home_chat_mensajes` (últimos 20 turnos, con RUT, correo y teléfono enmascarados).
- Botón de WhatsApp bajo la burbuja cuando la respuesta trae `derivar: true`.
- Nombre «Ergosanito» en bienvenida, cabecera y `aria-label`.
- Textos del chat en un JSON nuevo, `config/home-chat.json`, en lugar de constantes en el `.tsx`.
- Chips de sugerencias: «Exámenes disponibles», «Precios», «¿Llegan a mi comuna?», «Preparación y ayuno».
- Aviso fijo y visible: «No entrego información de pacientes ni diagnósticos».
- Límite de 500 caracteres en `CajaMensaje`, con contador.
- Mensajes amables para 429, error de red y error del servidor.
- Tipos actualizados.

**Fuera:** ver §8.

---

## 3. Modelo de datos

### 3.1 Contrato con el back (SPEC 06 §3.3, verificado contra el código el 2026-11-09)

Fuentes: `routes/api.php` L206–208, `ChatComercialController::AsQuestionUseCase()` L27–30 y
L79–103, `ChatComercialServiceProvider::boot()` L30–39, `docs/openapi.yaml` (operación
`/chat-comercial/as-question`).

```
POST {VITE_API}{VITE_API_PATH}/chat-comercial/as-question      pública, middleware throttle:chat-comercial
body  { prompt: string, sessionId?: string | null }
      prompt     required|string|max:500  (el back hace trim y enmascara)
      sessionId  nullable|string|max:64   OPCIONAL: si falta o no es UUID (Str::isUuid), el back crea uno
200   { sessionId: string, response: string, derivar: boolean }   ← los tres siempre presentes
422   { message: "Los datos enviados no son válidos.", errors: {...} }   (textos de errors en inglés)
429   { message: "Estás enviando muchos mensajes seguidos. Espera un momento y vuelve a intentarlo." }
      + cabecera Retry-After; límites 20/min y 200/día por IP
500   { message: "No pude responder en este momento. Inténtalo de nuevo en unos minutos." }   (sin error/file/line)
```

- `response` llega ya **sin** el marcador interno `[DERIVAR]` y sin markdown (el back lo limpia
  con `limpiarMarkdown()`); el front no lo busca ni lo quita. Puede llegar `""` si el modelo no
  devolvió contenido: ese caso es `errores.vacia`.
- `derivar` es `true` si el modelo cerró con `[DERIVAR]` **o** si el texto contiene el teléfono
  del contacto (`config('services.chat_comercial.contacto')`, hoy `+56 9 6114 9975`, el mismo
  número que `telefonoWhatsapp` de `home-contacto.json`).
- ⚠️ Un `sessionId` de **más de 64 caracteres** no se descarta: da **422**. Por eso el front
  valida el formato UUID antes de enviarlo y, si el guardado no lo es, envía **sin** `sessionId`
  (decisión del usuario, 2026-11-09; ver §4 paso 3).

### 3.2 Tipos (`interface/chat-home.interface.ts`)

```ts
export interface IMensajeChatHome {
    text     : string;
    isGpt    : boolean;
    /** Solo en turnos del asistente: pinta el botón de WhatsApp bajo la burbuja. */
    derivar? : boolean;
}

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
```

`sessionId` y `derivar` son opcionales a propósito: el `<T>` del `ApiAdapter` no valida nada. Si
falta `sessionId`, el front conserva el que tenía; si falta `derivar`, se trata como `false`
(`derivar === true`, comparación explícita).

### 3.3 `config/home-chat.json`

```json
{
  "titulo": "Ergosanito",
  "subtitulo": "Asistente virtual de Ergo SaniTas",
  "bienvenida": "Hola, soy Ergosanito, el asistente virtual de Ergo SaniTas. Te oriento sobre exámenes, precios, cobertura por comuna y preparación. ¿En qué te ayudo?",
  "aviso": "No entrego información de pacientes ni diagnósticos.",
  "placeholder": "Escribe tu consulta…",
  "maxCaracteres": 500,
  "maxTurnos": 20,
  "botonDerivar": "Escribir por WhatsApp",
  "sugerencias": [
    { "etiqueta": "Exámenes disponibles", "pregunta": "¿Qué exámenes tienen disponibles?" },
    { "etiqueta": "Precios",              "pregunta": "¿Cuáles son los precios de los exámenes más pedidos?" },
    { "etiqueta": "¿Llegan a mi comuna?", "pregunta": "¿Llegan a mi comuna?" },
    { "etiqueta": "Preparación y ayuno",  "pregunta": "¿Qué preparación o ayuno necesito para un examen de sangre?" }
  ],
  "errores": {
    "limite": "Estás enviando muchos mensajes seguidos. Espera un momento y vuelve a intentarlo.",
    "red": "No pude conectarme. Revisa tu conexión o escríbenos por WhatsApp.",
    "servidor": "No pude responder en este momento. Inténtalo de nuevo en unos minutos o escríbenos por WhatsApp.",
    "vacia": "No recibí respuesta. Inténtalo de nuevo o escríbenos por WhatsApp."
  }
}
```

### 3.4 Persistencia en `localStorage`

| Clave | Contenido | Quién la escribe |
| --- | --- | --- |
| `home_chat_session_id` | UUID del hilo (ya existe). Se reemplaza por el `sessionId` que devuelva el back. | `UseChatComercialService` |
| `home_chat_mensajes` (**nueva**) | `IMensajeChatHome[]` en JSON, **últimos 20 turnos** (`maxTurnos`), con el `text` de los turnos del visitante enmascarado | `ChatComercial`, a través de dos funciones del servicio: `leerMensajes()` y `guardarMensajes()` |

- Al montar, `ChatComercial` inicializa `mensajes` con `leerMensajes()`. Así un F5 o una visita
  posterior en el mismo navegador muestra la conversación, y el back, con el mismo
  `home_chat_session_id`, recuerda el mismo hilo (SPEC 06: últimos 10 mensajes de esa sesión).
- `guardarMensajes()` se llama tras cada turno completo (pregunta + respuesta). Recorta a los
  últimos `maxTurnos` y enmascara el `text` de los turnos **del visitante** (`isGpt === false`) con
  la misma regla del back: RUT → `[RUT]`, correo → `[EMAIL]`, teléfono chileno → `[TELEFONO]`. Los
  turnos del asistente se guardan tal cual, igual que en el back. En pantalla, durante la sesión, el
  visitante ve lo que escribió; lo guardado ya va enmascarado.
- **Regla de enmascarado** (copiada de `ChatComercialService::enmascarar()`, L80–87 del back; el
  §3.5 de la SPEC 06 cita una versión anterior sin *lookbehind*). Orden obligatorio: correo →
  teléfono → RUT (un celular sin espacios, `961149975`, también calza con el patrón de RUT):

  ```php
  // Back (PHP / PCRE), fuente de verdad
  '/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/u'          → '[EMAIL]'
  '/(?<![\d+])(?:\+?56\s?)?9\s?\d{4}\s?\d{4}(?!\d)/u'            → '[TELEFONO]'
  '/(?<![\w.])\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK](?![\w])/u'         → '[RUT]'
  ```

  En el front se usan **equivalentes sin *lookbehind*** (el *target* de Vite incluye Safari 14,
  que no lo soporta; ver §1.1): el carácter previo se captura y se repone.

  ```ts
  texto = texto.replace( /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g, '[EMAIL]' );
  texto = texto.replace( /(^|[^\d+])(?:\+?56\s?)?9\s?\d{4}\s?\d{4}(?!\d)/g, '$1[TELEFONO]' );
  texto = texto.replace( /(^|[^\w.])\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK](?!\w)/g, '$1[RUT]' );
  ```

  Diferencia aceptada: dos coincidencias separadas por un solo carácter pueden dejar la segunda
  sin enmascarar (el carácter separador ya se consumió). Es un caso marginal y lo guardado nunca
  sale del navegador.
- **Solo se enmascaran los turnos del visitante**, como en el back, que guarda la respuesta del
  asistente tal cual. Así el teléfono de contacto de una derivación sigue legible tras un F5
  (decisión del usuario, 2026-11-09).
- **No se guardan los turnos de error** del front (429, red, servidor): tras un F5 serían ruido.
- `leerMensajes()` es defensiva: si la clave no existe, el JSON está roto o no es un arreglo de
  `{ text: string, isGpt: boolean }`, devuelve `[]` y no rompe el Home. Todo acceso a
  `localStorage` va en `try/catch` (modo privado, cuota llena).
- Las claves `chat_session_id` y `ficha_chat_session_id` no se tocan.

### 3.5 Errores

El servicio traduce el fallo a uno de los textos de `errores` y lanza `Error(texto)`.
`ChatComercial` pinta ese texto **tal cual** como turno del asistente (sin el prefijo actual ni el
detalle técnico de axios):

| Situación | Cómo se detecta | Texto |
| --- | --- | --- |
| 429 | `error.response?.status === 429` | `errores.limite` |
| Sin red / CORS / timeout | error de axios **sin** `response` | `errores.red` |
| 422, 500 u otro código | `error.response` presente | `errores.servidor` |
| 200 sin `response` | `!respuesta?.response` | `errores.vacia` |

El 422 no debería ocurrir porque el front no deja pasar de 500 caracteres; si ocurre, se trata
como error del servidor.

---

## 4. Plan de implementación

Se ejecuta con `/spec-impl-ergo-front` (o, desde la raíz, con `ergo-father` siguiendo
`spec-impl-ergo-front`), con pausa y confirmación entre pasos. Lo hace `ergosanitas-developer` (FE)
con `ergo-code` y esta guía del módulo; `home-ergo` no tiene agente propio.

1. **Tipos.** Ampliar `IMensajeChatHome` e `IRespuestaChatHome` y agregar `ISugerenciaChatHome` e
   `IConfigChatHome` (§3.2) en `interface/chat-home.interface.ts`, y exportarlos desde
   `interface/index.ts`.
2. **Textos.** Crear `config/home-chat.json` (§3.3). **No** se reexporta desde `config/index.ts`:
   como los otros cuatro JSON del módulo (comentario final de ese barril), lo importan por ruta
   directa quienes lo usan (`ChatComercial.tsx` y `UseChatComercialService.ts`), tipado con
   `const textos: IConfigChatHome = homeChat;`. Actualizar el comentario final de
   `config/index.ts` (L19–22): pasan a ser cinco JSON.
3. **Servicio.** En `UseChatComercialService.ts`: `USAR_ECO = false`; `preguntar()` pasa a devolver
   `{ texto: string; derivar: boolean }`; tras un 200, si `respuesta.sessionId` es un `string` no
   vacío y distinto del guardado, escribirlo en `home_chat_session_id`; reemplazar
   `mensajeDeError()` por la traducción de §3.5; agregar `enmascarar()`, `leerMensajes()` y
   `guardarMensajes()` (§3.4). `obtenerSessionId()` también pasa a `try/catch` (hoy L58–68 no lo
   tiene) y valida el formato: si el valor guardado no es un UUID
   (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`), la petición va **sin**
   `sessionId` y el que devuelva el back reemplaza al guardado. Actualizar el JSDoc del archivo (el endpoint ya existe) y el comentario de
   `services/index.ts` L1–2. La rama de eco se queda (devuelve `derivar: false`): sigue siendo el
   modo para desarrollar sin back.
4. **Caja de mensaje.** En `CajaMensaje.tsx`: prop `maxCaracteres: number`;
   `inputProps={{ maxLength: maxCaracteres }}` en el `TextField`; contador `n/500` pequeño,
   alineado a la derecha, que cambia a color de advertencia desde el 90 % del límite. El envío
   sigue bloqueado si está vacío o cargando.
5. **Sugerencias.** Crear `components/chat/SugerenciasChat.tsx` con `Chip` de MUI
   (`clickable`, `variant="outlined"`), una por sugerencia del JSON. Pulsar un chip llama a
   `onElegir(pregunta)`, que envía la pregunta como si el visitante la hubiera escrito. Se
   muestran **solo mientras no haya mensajes** en el historial y se ocultan mientras `cargando`.
   Exportarlo desde `components/chat/index.ts`.
6. **Botón de derivación.** Crear `components/chat/BotonDerivarWhatsapp.tsx`: un `Button` pequeño
   con `WhatsAppIcon`, alineado con la burbuja del bot, `href={ urlWhatsapp }` importado de
   `config/canales-contacto`, `target="_blank"` y `rel="noopener noreferrer"`, con el texto
   `botonDerivar`. **Ningún `wa.me` escrito en el componente.** Exportarlo desde
   `components/chat/index.ts`.
7. **Chat.** En `ChatComercial.tsx`: quitar la constante `BIENVENIDA` y leer `titulo`,
   `subtitulo`, `bienvenida`, `placeholder`, `maxCaracteres` y `botonDerivar` del JSON;
   `aria-label` armado desde el JSON (`` `Chat con ${ textos.titulo }` ``, que da «Chat con
   Ergosanito»; escrito literal en el `.tsx` rompería el criterio del `grep "Ergosanito"`);
   actualizar el JSDoc del componente (L22–31: la conversación ya se persiste);
   `useState` de `mensajes` inicializado con
   `leerMensajes()`; tras cada respuesta, agregar `{ text, isGpt: true, derivar }` y llamar a
   `guardarMensajes()`; pintar `BotonDerivarWhatsapp` bajo cada `BurbujaBot` cuyo mensaje tenga
   `derivar === true` (también los que vienen de `localStorage`); franja de aviso fija entre la
   cabecera y la lista de mensajes con `aviso` (icono `InfoOutlined`, 0,75 rem, fondo blanco,
   filete `TEMA_HOME.borde`), siempre visible aunque se haga scroll; montar `SugerenciasChat` bajo
   la bienvenida; en el `catch`, pintar el `message` del error tal cual (sin persistirlo).
8. **Documentación.** `CLAUDE_HOME_ERGO.md`: estado (añadir Specs 04 y 05 a la tabla), mapa de
   archivos (`home-chat.json`, `SugerenciasChat.tsx`, `BotonDerivarWhatsapp.tsx`), sección «El
   chat comercial» (L569: contrato; L574–577: `USAR_ECO` en `false`, «Ergosanito», contrato con `sessionId` y `derivar`,
   errores, la clave nueva `home_chat_mensajes` en la tabla de claves de sesión, y que
   «sin persistencia entre recargas», L614, deja de ser cierto) y quitar los dos pendientes del
   endpoint (L672–673).
   `CLAUDE.md`: el bullet de `USAR_ECO = true` de la sección `home-ergo` (L300) y el anterior, que
   dice que el endpoint «todavía no existe».
   `.claude/ARQUITECTURA.md` L156: `chat-comercial/as-question` deja de ser «no existe aún, eco».

---

## 5. Criterios de aceptación

Con el back local de la SPEC 06 levantado y `VITE_API` apuntando a él:

- [ ] `grep -n "USAR_ECO" src/home-ergo/services/UseChatComercialService.ts` muestra `const USAR_ECO = false;`.
- [ ] Preguntar «hola» genera **una** petición `POST .../chat-comercial/as-question` con `{ prompt, sessionId }` y la burbuja muestra la respuesta del back, no la pregunta.
- [ ] Tras la primera respuesta, `localStorage.home_chat_session_id` es igual al `sessionId` devuelto por el back; `chat_session_id` y `ficha_chat_session_id` no se tocaron.
- [ ] Escribiendo a mano en `home_chat_session_id` un valor que no es UUID (uno corto y otro de más de 64 caracteres), la petición sale **sin** `sessionId`, no hay 422, y la respuesta lo reemplaza por el que genera el back.
- [ ] Un mensaje con `11111111-1` en un turno del visitante se guarda como `[RUT]`; un turno del asistente que deriva conserva el teléfono de contacto legible en `home_chat_mensajes`.
- [ ] **El historial sobrevive a un F5**: tras dos preguntas, recargar `/` y abrir el chat muestra los cuatro turnos; una tercera pregunta del tipo «¿y eso necesita ayuno?» se responde con el contexto anterior (mismo hilo en el back).
- [ ] `localStorage.home_chat_mensajes` guarda como máximo 20 turnos; un mensaje con `11111111-1` o un correo ficticio aparece ahí como `[RUT]` / `[EMAIL]`; los turnos de error no se guardan.
- [ ] Con `home_chat_mensajes` corrupto a mano (`"no-es-json"`), el Home carga y el chat arranca vacío.
- [ ] **El botón de WhatsApp aparece solo cuando `derivar` es `true`**: preguntar «¿tienen convenio con mi isapre?» (el back deriva) muestra el botón bajo esa burbuja, y abre `wa.me/56961149975` en otra pestaña; una pregunta respondida («¿qué exámenes tienen?») no lo muestra. Tras un F5 el botón sigue en la burbuja que derivó.
- [ ] `grep -rn "https://wa\.me" src/home-ergo --include=*.tsx --include=*.ts` solo encuentra `config/canales-contacto.tsx` (hoy, L66). Con `"wa\.me"` a secas salen además tres comentarios previos.
- [ ] La cabecera dice «Ergosanito» / «Asistente virtual de Ergo SaniTas» y la bienvenida nombra a Ergosanito.
- [ ] El aviso «No entrego información de pacientes ni diagnósticos.» se ve siempre, también con la conversación larga y en 360 px.
- [ ] Con el historial vacío aparecen los cuatro chips («Exámenes disponibles», «Precios», «¿Llegan a mi comuna?», «Preparación y ayuno»); pulsar «Precios» envía «¿Cuáles son los precios de los exámenes más pedidos?» como mensaje del visitante; tras el primer mensaje los chips ya no se ven.
- [ ] No se pueden escribir ni pegar más de 500 caracteres; el contador muestra `n/500`.
- [ ] Con el back apagado: el turno de error dice exactamente `errores.red` y el Home sigue funcionando.
- [ ] Forzando un 429 (21 mensajes en un minuto, o un mock): el turno dice exactamente `errores.limite`, sin «Request failed with status code».
- [ ] Ningún texto de negocio del chat queda en `.tsx`: `grep -rn "Ergosanito\|No entrego información" src/home-ergo --include=*.tsx` sale vacío.
- [ ] `grep -rnE "from ['\"].*(presentation|AsistenteVirtual)" src/home-ergo` sale vacío (un `grep` sin `from` encuentra comentarios que ya existen).
- [ ] `git diff --stat main...HEAD` en la rama `spec-05-chat-ergosanito-real` solo muestra archivos dentro de `src/home-ergo/`, los tres documentos de §4.8 y esta spec; `package.json` sin cambios. (El working tree tenía cambios previos ajenos a esta spec, p. ej. `src/routes/Navigation.tsx`: no cuentan.)
- [ ] `npm run build` termina en verde y `npx eslint src/home-ergo/` da 0 errores.
- [ ] **Antes del push a `main` del front**: `POST https://ergosanitas.com/BackEnd/public/api/chat-comercial/as-question` con `{ "prompt": "hola" }` desde Postman responde 200 con `{ sessionId, response, derivar }` (código de la SPEC 06, sus dos migraciones y las tablas `cache` / `cache_locks` desplegados en producción).
- [ ] El FAB, el panel (`z-index` 1299/1300) y el rail de contacto se siguen apilando como antes; Escape cierra el panel y el foco va al campo al abrir.

---

## 6. Decisiones tomadas y descartadas

- **Sí:** persistir la conversación visible en `localStorage` (`home_chat_mensajes`, últimos 20 turnos). Decisión del usuario (ronda 2): tras un F5 o en otra visita, el visitante ve su historial y el back conserva el mismo hilo.
- **No:** `sessionStorage`. Descartado por el usuario: perdería la continuidad entre visitas.
- **Sí:** enmascarar RUT, correo y teléfono en lo guardado, con la misma regla que el back. Minimización de datos (Ley 21.719).
- **No:** persistir los turnos de error del front.
- **Sí:** botón de WhatsApp bajo la burbuja cuando `derivar` es `true`, con `urlWhatsapp` de `canales-contacto.tsx`. Decisión del usuario (ronda 2); respeta la fuente única de `wa.me` del módulo.
- **No:** detectar la derivación en el front buscando el teléfono en el texto. La decide el back y viaja como `derivar`.
- **No:** chip «Alianzas». El usuario confirmó que no hay alianzas ni convenios; los chips son «Exámenes disponibles», «Precios», «¿Llegan a mi comuna?» y «Preparación y ayuno».
- **Sí:** textos del chat en `config/home-chat.json`. Cumple la regla 6 de la guía del módulo, que la bienvenida de la Spec 01 se saltaba.
- **No:** dejar los chips como constantes en el `.tsx`. Son texto de negocio.
- **Sí:** el chip envía una **pregunta** completa, distinta de su etiqueta.
- **Sí:** chips solo con el historial vacío. Después estorban en un panel de 360 px.
- **Sí:** textos de error propios del front, sin mostrar el `message` del back ni el de axios.
- **No:** cuenta regresiva con `Retry-After`. Añade estado y temporizador por un caso raro.
- **Sí:** aviso fijo como franja, no como burbuja. Una burbuja se va con el scroll.
- **Sí:** se conserva la rama `USAR_ECO`. Es el modo para trabajar sin back, igual que `USAR_MOCK` en ficha clínica.
- **No:** reutilizar componentes de `src/presentation/` o `src/AsistenteVirtual/`. Regla 3 de la guía: el chat del Home es un clon.
- **Sí:** enmascarar en `localStorage` solo los turnos del visitante, como el back. Decisión del usuario (2026-11-09): el teléfono de la derivación sigue legible.
- **Sí:** validar el UUID de `home_chat_session_id` antes de enviarlo; si no lo es, enviar sin `sessionId`. Decisión del usuario (2026-11-09): evita el 422 permanente.
- **Sí:** texto neutro para el 429 («Espera un momento»), igual que el back, válido para el cupo por minuto y por día. Decisión del usuario (2026-11-09). **No:** dos textos según `Retry-After`.
- **No:** dependencias nuevas. `Chip`, `Button`, `InfoOutlined` y `WhatsApp` ya vienen con MUI.

---

## 7. Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Se despliega el front antes que el back y cada mensaje termina en `errores.red` o `errores.servidor` | La cabecera exige la SPEC 06 desplegada. Comprobar con Postman `POST https://ergosanitas.com/BackEnd/public/api/chat-comercial/as-question` antes del push a `main` del front. |
| Un equipo compartido muestra la conversación del visitante anterior | Es la consecuencia de persistir en `localStorage`, aceptada por el usuario. Lo guardado va enmascarado (RUT, correo, teléfono); síntomas o nombres escritos libremente sí quedan. |
| `home_chat_mensajes` crece o se corrompe | Tope de 20 turnos y lectura defensiva que cae a `[]`. |
| Si el hosting no entrega la IP real, todos los visitantes comparten el cupo de 20/min y verán `errores.limite` a menudo | Es del back (SPEC 06 §7). Aquí el mensaje al menos es claro. |
| El back marca `derivar` de más o de menos | Peor caso: un botón de WhatsApp de más o de menos; el texto de la respuesta ya trae el contacto. |
| El back responde con markdown pese a la regla | `BurbujaBot` lo pintaría con asteriscos visibles. Se reporta a la SPEC 06; el front no interpreta markdown. |
| `maxLength` cuenta unidades UTF-16 y Laravel `max:500` cuenta caracteres | Un emoji cuenta doble en el front: el front es más estricto que el back, nunca al revés. |
| `home_chat_session_id` editado a mano o corrupto con **más de 64 caracteres**: el back responde **422** (`sessionId max:64`) en cada mensaje | El front valida el UUID y, si no lo es, envía sin `sessionId` (§4 paso 3). |
| El cupo **diario** (200/día por IP) también responde 429 con `Retry-After` de horas | `errores.limite` es neutro («Espera un momento»), sin prometer un minuto. |
| La regex del front diverge de la del back si el back cambia `enmascarar()` | La spec cita la fuente (L80–87 del service). Cualquier cambio del back obliga a revisar §3.4. |

---

## 8. Lo que **no** entra en esta spec

- Cualquier cambio en el back (va en la SPEC 06).
- Alianzas, convenios, planes o descuentos.
- Streaming de respuestas o indicador de tokens.
- Interpretar markdown en `BurbujaBot`.
- Botón para reiniciar o borrar la conversación.
- Mover el FAB, tocar `Navigation.tsx`, `src/presentation/`, `src/AsistenteVirtual/` o `src/Home/`.
- Analítica de uso del chat.

---

## Notas de revisión

**2026-11-09 — revisión contra el código con `/spec-ergo-front` (modo revisión, vía `ergo-father`).**
Solo correcciones factuales; no cambia ninguna decisión de producto ni el estado.

- Hallazgos §1.1: los 14 originales siguen siendo ciertos; el `catch` de `ChatComercial.tsx` va de
  L86 a L93 (antes decía L89–93). Se añaden: `obtenerSessionId()` sin `try/catch`; comentarios que
  quedan falsos (`services/index.ts`, `chat-home.interface.ts`, JSDoc de `ChatComercial`,
  «cuatro JSON» de `config/index.ts`); `wa.me` en comentarios; *target* de Vite sin *lookbehind*.
- Cabecera «Depende de»: la SPEC 06 del back está `Implementado`; falta confirmar el despliegue
  en producción.
- §3.1: contrato copiado del back real (`sessionId` **opcional**, textos reales de 422/429/500,
  límites 20/min y 200/día, `derivar` también por teléfono de contacto, 422 con `sessionId` > 64).
- §3.4: regex reales de `ChatComercialService::enmascarar()` y su equivalente sin *lookbehind*
  para el front (comprobado con Node: mismo resultado en 8 casos ficticios).
- §4: pasos 2, 3, 7 y 8 nombran los comentarios y líneas de documentación que hay que actualizar;
  el `aria-label` se arma desde el JSON para no contradecir el criterio del `grep "Ergosanito"`.
- §5: criterios de `wa.me`, de imports de `presentation`/`AsistenteVirtual` y de `git diff`
  reescritos para que sean comprobables (los dos `grep` originales ya fallaban hoy por comentarios).
- §7: tres riesgos nuevos (sessionId > 64, cupo diario, divergencia de regex).

**2026-11-09 — preguntas de la revisión, resueltas por el usuario** (el usuario confirma además
el estado `Aprobado`):

1. Enmascarado en `home_chat_mensajes`: **solo los turnos del visitante**, como el back (§3.4, §6, §5).
2. `home_chat_session_id` que no es UUID: **el front lo valida y envía sin `sessionId`** (§3.1, §4 paso 3, §5, §7).
3. Texto del 429: **neutro, «Espera un momento»** (§3.3, §6, §7).
4. Despliegue del back: **criterio en §5** con la prueba Postman contra producción antes del push a `main` del front.
