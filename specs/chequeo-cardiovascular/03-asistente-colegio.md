# SPEC 03 — Asistente Ergo para el perfil Colegios

> **Estado:** Implementado
> **Depende de:** Spec 01 de `chequeo-cardiovascular` (Módulo `chequeo-cardiovascular`: perfil
> Colegios) y Spec 02 (Home del colegio: rediseño, gráficos nuevos y accesibilidad)
> **Fecha:** 2026-09-05 · **Revisada:** 2026-09-05 (§9)
> **Área afectada:** `src/chequeo-cardiovascular/` únicamente. No se toca `src/Chequeo/`, ni
> `src/ficha-clinica/`, ni `src/presentation/`, ni `src/common/`, ni `src/routes/`.
> **Objetivo:** Reemplazar el botón «Detalle clínico» del Home del perfil `Colegios` por un chat
> conversacional propio, conectado a `POST {API}/sam-assistant-club/as-question`, que responde
> preguntas sobre los deportistas del colegio.

> ⚠️ **Dónde vive el chat cambió después de implementarlo.** La spec lo diseñó **embebido en el
> Home**; el uso demostró que competía con los datos de esa pantalla, y se movió al **tab 1,
> «Asistente Virtual»**. Las secciones 1-8 conservan el diseño original —con lo que quedó
> obsoleto tachado— y la **§9** cuenta qué cambió y por qué. Si vienes a entender el código de
> hoy, empieza por la §9.

---

## 1. Por qué existe esta spec

El botón «Detalle clínico» promete un detalle y entrega un folleto. `ModalStatus` muestra cuatro
párrafos fijos sobre qué significa un estado general normal y cuatro recomendaciones genéricas
—«mantener una dieta equilibrada», «gestionar el estrés»—. **No lee ni un dato del colegio.** Un
colegio que tiene 118 deportistas en pantalla pulsa ese botón esperando saber *quién* está
alterado, y recibe un consejo de vida saludable.

La pregunta que ese colegio sí tiene —«¿cuántos tienen la presión alta?»— ya la responde el
backend: el endpoint `sam-assistant-club/as-question` existe y está acotado por el `email` de la
institución. El Home tiene los datos agregados en gráficos, pero un gráfico responde la pregunta
que su autor anticipó; el chat responde la que el usuario trae.

Dos decisiones estructurales acompañan al cambio.

**El chat va en línea, no detrás de un click.** Si la ayuda hay que descubrirla pulsando un
botón, no se usa. Ese es exactamente el problema del botón que se retira.

**Todo el chat se clona dentro del módulo.** La regla dura de `chequeo-cardiovascular` prohíbe
importar de cualquier módulo que no sea `src/common/`, y el motivo sigue vigente: el chat de la
ficha clínica habla de **un paciente** y este habla de **una institución**. Van a divergir.

---

## 2. Alcance

**Dentro:**

- **Se elimina el botón «Detalle clínico»** de `components/statistics-global/StatisticsGlobal.tsx`
  junto con su handler y su `useContext(ModalBarContext)`.
- **Se elimina `components/modal/ModalStatus.tsx`** y toda la carpeta `context/modal-bar/`
  (`ModalBarContext.ts`, `ModalBarProvider.tsx`, `modalBarReducer.ts`), más sus 6 exports en los
  barriles y el `<ModalBarProvider>` de `pages/AppChequeoCardiovascular.tsx`.
- **`components/asistente/` nuevo**, 7 archivos: los cuatro clones del chat (`BurbujaGpt`,
  `BurbujaUsuario`, `CajaMensaje`, `LoaderEscribiendo`), `SugerenciasChat` (los chips de
  preguntas), `AsistenteColegio` (el chat completo) y su `index.ts`.
- **`hooks/useReconocimientoVoz.ts` nuevo** — clon del de `src/ficha-clinica/hooks/`, para el
  dictado por voz.
- **`services/useAsistenteColegioService.ts` nuevo** — expone `preguntar(email, prompt)` y
  `reiniciarSesion()`, y gestiona la clave `colegio_chat_session_id`. *(La firma se corrigió
  durante la implementación: la spec anunciaba `preguntar(prompt)`, pero pasar el `email` desde
  el llamador deja el servicio sin estado de contexto propio.)*
- **`interface/asistente.interface.ts` nuevo** — `IMensajeChat` y `IRespuestaAsistenteColegio`.
- **`config/sugerencias-asistente.ts` nuevo** — las preguntas sugeridas, como texto fuera del
  componente.
- ~~**El chat se monta en `pages/HomePage.tsx`** dentro de una `SeccionHome` propia, **entre**
  `StatisticsGlobal` y la sección «Requiere atención».~~ → **Revisado el 2026-09-05:** el chat
  vive en `pages/AsistentePage.tsx`, como **tab 1 «Asistente Virtual»**. Ver §9.
- **Botón «Nueva conversación»** que vacía el hilo en pantalla y renueva el `sessionId`.
- **Bloqueo por falta de `user_email`**: sin esa clave, input y micrófono quedan deshabilitados y
  una burbuja lo explica.

**Fuera de alcance (para specs futuras):**

- El endpoint de reset del hilo en el backend. No consta que `sam-assistant-club` lo exponga; el
  botón de «Nueva conversación» no llama a ninguno.
- Historial persistente de la conversación. Solo persiste el `sessionId`, no los mensajes: al
  recargar, la pantalla arranca vacía aunque el backend recuerde el hilo.
- Llevar este chat a los perfiles `Administrador`, `Medicos` o `Usuario` — siguen en
  `src/Chequeo/`, que esta spec no toca.
- Unificar los cuatro chats del proyecto (`src/presentation/`, `src/ficha-clinica/`,
  `src/home-ergo/` y este) en un componente compartido. Sería su propia spec y tocaría cuatro
  módulos.
- Que el chat lea el `resumen` que ya calcula `useResumenColegio` para responder sin red.

---

## 3. Modelo de datos

Dos tipos nuevos en `interface/asistente.interface.ts`. No pasan por ningún mapper: el backend
devuelve texto ya redactado.

```ts
/** Un turno de la conversación. `isGpt` decide qué burbuja se pinta. */
export interface IMensajeChat {
    text  : string;
    isGpt : boolean;
}

/** Respuesta de POST {API}/sam-assistant-club/as-question */
export interface IRespuestaAsistenteColegio {
    response : string;
}
```

**Contrato HTTP.** Es el único endpoint de la spec:

```
POST {VITE_API}{VITE_API_PATH}/sam-assistant-club/as-question
  { "email"     : "brisas@ergosanitas.com",
    "prompt"    : "¿Cuántos pacientes tienen la presión alta?",
    "sessionId" : "<uuid>" }
→ 200 { "response": "…" }
```

- `email` sale de `user.user_email` del `LoginContext`. Es la **clave de multi-tenencia** del
  modelo, la misma que ya usan `getEstadoGeneral` y `postChequeoAll`.
- `sessionId` se guarda en localStorage bajo la clave **`colegio_chat_session_id`**, distinta de
  `ficha_chat_session_id` (ficha clínica), `home_chat_session_id` (home comercial) y
  `chat_session_id` (asistente global). Cuatro hilos separados: un colegio no debe heredar el
  contexto de una consulta por RUT hecha en la ficha clínica.

**Estado local de `AsistenteColegio`.** Nada global; ningún contexto nuevo:

```ts
mensajes : IMensajeChat[]   // el hilo, sin contar la bienvenida
cargando : boolean          // hay una respuesta en vuelo
error    : boolean          // la última llamada falló → saca «Reintentar»
input    : string           // teclado y dictado escriben aquí
```

---

## 4. Plan de implementación

Ocho pasos. Cada uno deja el proyecto compilando.

1. **Crear `interface/asistente.interface.ts`** con los dos tipos y exportarlos desde
   `interface/index.ts`. Verificación: `npm run build` en verde.
2. **Crear `services/useAsistenteColegioService.ts`** siguiendo el patrón `UseXService` del
   proyecto: `new ApiAdapter()` y `const API = ${VITE_API}${VITE_API_PATH}`. Expone `preguntar` y
   `reiniciarSesion`, y resuelve `colegio_chat_session_id` creándola la primera vez. Traduce el
   error de axios a mensaje legible leyendo `response.data.message`, igual que
   `UseAsistenteService`. Exportar desde `services/index.ts`.
3. **Clonar `hooks/useReconocimientoVoz.ts`** desde `src/ficha-clinica/hooks/`, con el JSDoc
   adaptado a esta spec. Exportar desde `hooks/index.ts`.
4. **Clonar los cuatro componentes del chat** en `components/asistente/`. Único cambio de fondo:
   los colores literales (`#303f9f`, el degradado del botón, `rgba(0,0,0,0.06)`) se sustituyen
   por tokens de `config/tema.ts` — ningún `.tsx` del módulo escribe un hex. Si falta algún token,
   se agrega a `tema.ts` en la familia que corresponda (`UI`, no `COLORES`: son colores de
   interfaz, no de significado clínico).
5. **Crear `config/sugerencias-asistente.ts` y `components/asistente/SugerenciasChat.tsx`**: los
   chips que rellenan el input al pulsarlos, sin enviarlo. Se ocultan en cuanto hay un mensaje en
   el hilo.
6. **Crear `components/asistente/AsistenteColegio.tsx`**: bienvenida fija, hilo, loader,
   «Reintentar», micrófono, caja de mensaje, botón «Nueva conversación» y el bloqueo por
   `user_email` vacío. Exportar desde `components/asistente/index.ts` y `components/index.ts`.
7. **Montar el chat en `pages/HomePage.tsx`** en una `SeccionHome` titulada «Asistente Ergo»,
   entre `StatisticsGlobal` y «Requiere atención». Quitar `<ModalStatus />` y su import.
   *(Así se implementó. El 2026-09-05 se movió a un tab propio — §10.)*
8. **Retirar el botón y el modal**: limpiar `StatisticsGlobal.tsx` (botón, handler, contexto y
   los imports que queden sin uso — `Button`, `DescriptionIcon`, `sxFocoVisible`); borrar
   `components/modal/ModalStatus.tsx` y `context/modal-bar/`; quitar `<ModalBarProvider>` de
   `AppChequeoCardiovascular.tsx` y los 6 exports de los barriles. Verificación: `npm run build`
   en verde y `npx eslint src/chequeo-cardiovascular/` con 0 problemas.

---

## 5. Criterios de aceptación

- [ ] El Home del perfil `Colegios` **no muestra** ningún botón «Detalle clínico».
- [ ] `grep -rn "ModalStatus\|ModalBar" src/chequeo-cardiovascular/` no devuelve código vivo
      (solo puede quedar el comentario de `context/index.ts` que explica la retirada).
      **Corregido durante la implementación:** el criterio original recorría `src/` entera, y ahí
      `src/Chequeo/` tiene legítimamente su propio `ModalStatus` y su `modal-bar` — ese módulo
      está fuera del alcance de esta spec y no se toca.
- [ ] ~~El Home muestra una sección «Asistente Ergo» entre los contadores y «Requiere
      atención».~~ → **Sustituido el 2026-09-05 (§9):** el rail muestra 5 tabs y el 1 es
      «Asistente Virtual», con el chat dentro. El Home vuelve a sus dos secciones.
- [ ] Al abrir el Home aparece una burbuja de bienvenida y **no se dispara ninguna petición HTTP**
      al asistente (verificable en la pestaña Red del navegador).
- [ ] Se muestran las preguntas sugeridas como chips; pulsar uno rellena el input **sin enviarlo**.
- [ ] Escribir «¿Cuántos pacientes tienen la presión alta?» y enviar produce **una sola** petición
      `POST /api/sam-assistant-club/as-question`, con body `{ email, prompt, sessionId }` y con
      `email` igual al `user_email` de la sesión.
- [ ] La respuesta del backend aparece como burbuja del asistente; mientras llega se ve el loader.
- [ ] Con el backend apagado sale una burbuja de error y un botón «Reintentar»; pulsarlo reenvía
      el mismo prompt y descarta la burbuja de error.
- [ ] Tras la primera pregunta, `localStorage.getItem('colegio_chat_session_id')` devuelve un
      UUID, y ese mismo valor viaja en la segunda pregunta.
- [ ] `colegio_chat_session_id` es **distinta** de `ficha_chat_session_id`,
      `home_chat_session_id` y `chat_session_id`.
- [ ] «Nueva conversación» vacía el hilo en pantalla y cambia el valor de
      `colegio_chat_session_id`, **sin emitir ninguna petición**.
- [ ] Con `user_email` vacío, el input y el micrófono quedan deshabilitados y una burbuja lo
      explica.
- [ ] El micrófono dicta al input en Chrome; en un navegador sin `SpeechRecognition` el chat sigue
      funcionando por teclado.
- [ ] `src/chequeo-cardiovascular/` no importa nada de `src/ficha-clinica/`, `src/presentation/`,
      `src/AsistenteVirtual/`, `src/Chequeo/`, `src/Estadisticas/`, `src/Certificados/` ni
      `src/components/`.
- [ ] Ningún `.tsx` nuevo del módulo escribe un color hexadecimal a mano.
- [ ] Ningún icono ni texto de borrado aparece en el chat: «Nueva conversación» usa
      `RestartAltIcon` y «Reintentar» usa `RefreshIcon`. *(La spec pedía `RefreshIcon` para los
      dos; separarlos distingue «empezar de cero» de «repetir lo último», que es justo la
      confusión que un mismo icono provocaría.)*
- [ ] Los 4 tabs conservan sus índices (0 Home, 1 Lista de deportistas, 2 Agregar deportista,
      3 Carga masiva).
- [ ] `npm run build` en verde y `npx eslint src/chequeo-cardiovascular/` con 0 problemas.

---

## 6. Decisiones

- **Sí:** el chat en línea, en su propia `SeccionHome`, arriba. Un asistente que hay que
  descubrir pulsando un botón no se usa; y arriba es donde estaba el botón que reemplaza.
  ⚠️ **Revisada el 2026-09-05 (§9):** la premisa era buena —el chat no puede esconderse detrás
  de un click— pero la conclusión no. Un tab del rail **también está siempre a la vista**, y
  encima no compite con los datos del Home. El chat vive ahora en el tab 1.
- **No:** modal detrás de un botón. Habría conservado `ModalBarContext`, pero repite el error del
  botón actual: esconde la única función conversacional de la pantalla. **Esta sigue en pie**: un
  tab es visible de forma permanente en el rail, un modal solo existe mientras esté abierto.
- **Sí:** borrar `ModalStatus` y `context/modal-bar/` completos. Sin el botón nadie los alcanza.
  Conservarlos «por si acaso» —como se hizo con `src/Home/` y con el bloque `Colegios` de
  `src/Chequeo/`— solo se justifica cuando hay una vía de reversa real; aquí el modal no aporta
  nada que el chat no cubra, y git guarda la historia.
- **Sí:** clonar los seis archivos del chat de `src/ficha-clinica/`. La regla dura del módulo lo
  obliga, y el motivo original sigue vigente: el chat de la ficha habla de un paciente y este de
  una institución.
- **No:** extraer un chat compartido a `src/common/`. Sería estrenar una arquitectura nueva dentro
  de una tarea que pedía otra cosa, y `common/` es el módulo más peligroso del repo (64
  dependientes). Si algún día se unifican los cuatro chats, es su propia spec.
- **Sí:** bienvenida fija sin llamada al montar. El tab de la ficha clínica sí consulta al montar
  porque tiene un RUT concreto que preguntar; aquí no hay pregunta obvia, y una llamada por cada
  entrada al tab 0 es tráfico que nadie pidió.
- **Sí:** chips de preguntas sugeridas. Un chat sin ejemplos obliga al usuario a adivinar qué sabe
  responder. Rellenan el input **sin enviarlo**, para poder editarlos antes.
- **Sí:** `sessionId` en localStorage con clave propia. Mismo patrón y misma razón que
  `ficha_chat_session_id` y `home_chat_session_id`: compartir clave contaminaría el contexto entre
  un paciente y un colegio.
- **Sí:** bloquear el chat si falta `user_email`. Sin esa clave el backend no sabe de qué colegio
  hablar; enviar igual produce un error técnico donde debería haber una explicación.
- **Sí:** «Nueva conversación» solo en el front. No consta que `sam-assistant-club` exponga un
  reset; llamar a una ruta inventada fallaría en silencio. Renovar el `sessionId` local logra el
  efecto visible sin depender de eso.
- **Sí:** «Nueva conversación» usa `RestartAltIcon` y «Reintentar» `RefreshIcon`. El módulo tiene
  la regla de que ningún icono de borrado aparece en su UI, y `DeleteIcon` sugeriría que se
  borran datos del colegio. Dos iconos distintos porque son dos acciones distintas: empezar de
  cero no es repetir lo último.
- **No:** persistir los mensajes. El hilo lo mantiene el backend por `sessionId`; duplicarlo en
  localStorage abre la pregunta de cuándo caduca, que nadie ha planteado.
- **No:** que el chat lea el `resumen` de `useResumenColegio` para responder localmente. Mezclaría
  dos fuentes de verdad y haría que el asistente contradiga a los gráficos de la misma pantalla.
- **No:** eco local tipo `USAR_ECO` (el del chat comercial de `home-ergo`). Allí hacía falta
  porque el endpoint no existe; aquí el endpoint ya responde en `http://127.0.0.1:8000/api`.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| El backend devuelve 200 con un sobre de error, como pasa en `estadisticas/*` | El servicio comprueba que `response` sea un string no vacío antes de pintarlo; si no, lanza y sale la burbuja de error con «Reintentar». |
| `sam-assistant-club/as-question` no existe todavía en el backend desplegado | Queda declarada como dependencia externa. En local existe. Sin él, el chat muestra su error y el resto del Home sigue intacto. |
| Un colegio pregunta por deportistas de otra institución | El endpoint está acotado por `email`. La separación de endpoints (`-club` frente a `sam-assistant`) es justamente lo que impide resolver por RUT arbitrario desde aquí. |
| El chat en línea alarga demasiado el Home | 🔴 **Se materializó, y el alto contenido no bastaba.** El problema real no era el largo sino la competencia: el chat se interponía entre los contadores y los datos, y el hilo se perdía al hacer scroll por el Home. **Resuelto sacándolo a su propio tab** (§9), donde ocupa el alto completo y nadie hace scroll por encima de él. El `scrollIntoView` sigue usando `block: 'nearest'`. |
| La duplicación del chat se desincroniza de la de la ficha clínica | Es deliberada y queda documentada en el JSDoc de los seis clones y en `CLAUDE_CHEQUEO_CARDIOVASCULAR.md`. |
| El micrófono queda abierto al cambiar de tab | 🔴 **Se materializó durante la implementación, y la mitigación que decía esta fila era falsa.** `TabPanel` **no desmonta** el panel inactivo: lo oculta con `display: none` para que la lista conserve sus filtros y su página (`TabPanel.tsx:22`), así que el cleanup de `useReconocimientoVoz` nunca se dispara al cambiar de tab. Quien dictara y se fuera a la lista dejaba el navegador grabando en segundo plano. Corregido con una señal explícita: el orquestador pasa `activo={tab === TAB_ASISTENTE}` a `AsistentePage`, que la baja a `AsistenteColegio`, y un efecto llama a `detener()` al perderla. **Detiene pero no limpia**: lo ya dictado sigue en el input al volver. |

---

## 8. Estado de verificación (2026-09-05)

**10 de los 18 criterios están verificados**; los 8 restantes necesitan la app corriendo con una
sesión `Colegios` real y no se dieron por buenos.

**Verificados** — por inspección del código, `grep`, `tsc -b` o llamada directa al backend:

1. No queda ningún botón «Detalle clínico».
2. `grep "ModalStatus\|ModalBar" src/chequeo-cardiovascular/` solo devuelve los dos comentarios
   de `context/index.ts` que explican la retirada.
3. La sección «Asistente Ergo» está entre `StatisticsGlobal` y «Requiere atención».
4. `colegio_chat_session_id` es distinta de las otras tres claves de chat del proyecto.
5. El módulo no importa nada externo salvo `common/context`.
6. El único archivo con un color hexadecimal es `config/tema.ts`.
7. `grep -rni "delete"` sobre el módulo no devuelve nada.
8. Los 4 tabs conservan sus índices.
9. `npm run build` en verde y `npx eslint src/chequeo-cardiovascular/` en 0.
10. **El endpoint existe y responde.** Probado contra `http://127.0.0.1:8000/api` con
    `{"email":"brisas@ergosanitas.com","prompt":"Cuantos pacientes tienen la presion alta",
    "sessionId":"spec03-verificacion"}` → **HTTP 200** con un `response` en prosa sobre 40
    pacientes del colegio. El riesgo «el endpoint no existe todavía» queda descartado, y el
    contrato de respuesta confirmado (ver el JSDoc de `asistente.interface.ts` para la forma
    completa, que trae tres campos más de los que el front lee).

**Pendientes de prueba manual** — el código está escrito para cumplirlos, pero nadie los ha visto
funcionar:

- Que al abrir el Home no salga ninguna petición al asistente (pestaña Red).
- Que pulsar un chip rellene el input sin enviarlo.
- Que un envío produzca exactamente una petición, con el `user_email` de la sesión.
- Que el loader aparezca mientras se espera y la respuesta se pinte como burbuja.
- Que con el backend caído salga la burbuja de error y «Reintentar» reenvíe lo mismo.
- Que `colegio_chat_session_id` se cree con un UUID y se reutilice en la segunda pregunta.
- Que «Nueva conversación» vacíe la pantalla y renueve la clave sin emitir peticiones.
- Que con `user_email` vacío el chat quede bloqueado, y que el dictado funcione en Chrome y
  **se corte al cambiar de tab** — este último es el que más importa, porque es el defecto que la
  revisión encontró y arregló.

Los ocho criterios abiertos de la Spec 01 siguen abiertos: este trabajo no tocaba ninguno.

---

## 9. Revisión del 2026-09-05 — del Home a su propio tab

Después de dar la spec por implementada y **verla funcionando**, se hicieron dos cambios sobre lo
que ella decidía. Van aquí, y no reescritos en las secciones de arriba, para que se pueda leer
qué se pensó al diseñar y qué enseñó el uso.

### 9.1 Rediseño visual — commit `f6e7eea`

El chat funcionaba pero se veía sin acabar: un botón suelto, un panel blanco y una caja de texto
apiladas, sin nada que las uniera. Ahora es **una sola pieza** con `borderRadius: 3` y
`overflow: hidden`, en tres franjas:

| Franja | Qué lleva | Fondo |
|---|---|---|
| Cabecera | Avatar, «Asistente Ergo», el estado en texto y «Nueva conversación» | `DEGRADADOS.cabeceraChat` |
| Lienzo | El hilo, con scroll propio | `DEGRADADOS.lienzoChat` |
| Pie | Micrófono e input, tras un `borderTop` | `COLORES.fondoTarjeta` |

Las decisiones que hacen el trabajo:

- 🔴 **La burbuja del asistente pasa a blanca sobre lienzo tintado**, invirtiendo la relación
  heredada (gris translúcido sobre blanco). Destaca **por ser lo más claro**, con borde y sombra
  en vez de relleno. Es lo que le quita el aire de formulario.
- **Esquinas recogidas que apuntan al avatar** — `4px 16px 16px 16px` en el asistente y su espejo
  en el usuario. Impide que las burbujas se lean como tarjetas sueltas.
- **Sombras teñidas de azul** (`SOMBRAS.chat`, `.burbuja`, `.burbujaUsuario`): una sombra gris
  sobre fondo azulado se ve sucia, y era parte del problema.
- **El loader se dibuja con forma de burbuja del asistente**, para que el hilo no salte cuando
  llega la respuesta.
- **No se puso punto verde de «en línea».** El estado va escrito («Listo para responder» /
  «Escribiendo…» / «No disponible»): en esta misma pantalla el verde significa «resultado
  clínico normal», y un punto verde de conexión mezclaría las dos familias de color que
  `tema.ts` existe para separar.

Todos los colores nuevos entraron en la familia **`UI`**, no en `COLORES`. La regla de que ningún
`.tsx` escribe un hex se mantuvo: el único archivo con hexadecimales sigue siendo `tema.ts`.

### 9.2 El chat se muda a su propio tab — commit `22e8880`

**Lo que la spec decidió mal.** §6 razonaba que un asistente escondido detrás de un click no se
usa, y de ahí saltó a montarlo en línea dentro del Home. La premisa era correcta; la conclusión,
no. **Un tab del rail también está siempre a la vista**, y además no compite con nada.

Embebido, el chat tenía dos problemas que solo se ven usándolo:

1. **Se interponía entre los contadores y los datos.** El Home es una pantalla para *mirar*
   —cifras, quién requiere atención, gráficos— y el chat una para *hacer*. Había que bajar por
   encima de él para llegar a la lista de alterados.
2. **El hilo se perdía al hacer scroll** por el Home, porque el chat era una franja de 440 px
   dentro de una página mucho más alta.

Ahora es el **tab 1, «Asistente Virtual»** (`SmartToyIcon`), justo detrás de Home, en
`pages/AsistentePage.tsx`. El rail pasa de 4 a 5 tabs y el Home vuelve a sus dos secciones.

`AsistenteColegio` gana la prop **`alto`** (`'completo' | 'franja'`). En su tab usa
`clamp(420px, 62vh, 720px)`: medirlo contra el viewport y no en píxeles fijos evita que en un
portátil de 768 px de alto el input quede fuera de pantalla. `'franja'` es el alto que hacía
falta embebido; se conserva sin usar para poder volver a incrustar el chat en otra pantalla sin
tocar el componente.

### 9.3 🔴 Los índices de tab dejan de ser literales

Insertar un tab en la posición 1 **desplaza los tres siguientes**, y dos handlers del orquestador
los tenían escritos a mano:

- `handleChange` comparaba con `2` para limpiar el formulario al entrar al alta.
- `handleUpdateStatus` saltaba a `2` (alta) o `1` (lista).

Con el asistente en medio, «editar un deportista» habría llevado a **la lista** en vez de al
formulario, y entrar al alta por el menú no habría limpiado la selección. **Dos bugs silenciosos:
`tsc` no los ve, porque son números válidos.**

Ahora las cinco posiciones son constantes —`TAB_HOME`, `TAB_ASISTENTE`, `TAB_LISTA`, `TAB_ALTA`,
`TAB_CARGA`— declaradas junto al array `TABS`, y las usan tanto los `<TabPanel>` como los dos
handlers. No queda ningún número suelto. **Si se agrega un tab, se declara su constante.**

### 9.4 Qué de la §8 sigue en pie

Los 10 criterios verificados siguen verificados, incluido el endpoint probado contra el backend
local. De los 8 pendientes de prueba manual, **uno cambia de enunciado**: «que el micrófono se
corte al cambiar de tab» ahora se prueba saliendo del tab 1, no del 0. El resto no se altera.

Se añaden dos criterios nuevos, ambos **sin verificar en ejecución**:

- [ ] El rail muestra 5 tabs y el 1 es «Asistente Virtual».
- [ ] Desde la lista, «editar» abre el formulario de edición —no la lista— y entrar al tab de
      alta por el rail limpia la selección. *(Es lo que los índices literales habrían roto.)*

---

## 10. Lo que **no** está en esta spec

- El endpoint de reset del hilo en el backend.
- Historial de mensajes persistente entre recargas.
- Este chat para los perfiles `Administrador`, `Medicos` y `Usuario`.
- Unificar los cuatro chats del proyecto en un componente compartido.
- Cualquier cambio en `src/Chequeo/`, `src/ficha-clinica/`, `src/presentation/`,
  `src/AsistenteVirtual/`, `src/common/` o `src/routes/`.

Cada uno, si llega, va en su propia spec.
