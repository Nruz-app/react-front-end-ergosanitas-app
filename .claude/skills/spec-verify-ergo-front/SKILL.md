---
name: spec-verify-ergo-front
description: Verifica una o varias specs ya implementadas del front-end Ergosanitas y deja cada criterio de aceptación con su evidencia. Mapea el código con graphify, analiza dependencias e impactos, contrasta buenas prácticas con Context7, recorre los criterios uno por uno, valida la interfaz con Playwright contra el entorno local y actualiza los checks de la spec. Nunca implementa ni corrige código ni cambia el Estado de la spec: solo verifica y reporta.
disable-model-invocation: true
argument-hint: <NN-slug | carpeta de módulo | todas>
---

# /spec-verify-ergo-front — verificador de specs implementadas con evidencia

Tercer eslabón del flujo spec-driven del repo:

```
/spec-ergo-front       → diseña la spec            (Borrador)
   (una persona aprueba)                           (Aprobado)
/spec-impl-ergo-front  → la implementa y la cierra  (Implementado)
/spec-verify-ergo-front → comprueba cada criterio y deja evidencia   ← este
```

`/spec-impl-ergo-front` marca `Implementado` cuando el código está completo y revisado, pero
**no deja evidencia por criterio**: al 2026-11-10 las 18 specs del front están en `Implementado`
con ~490 criterios y solo 13 marcados `[x]`. Este comando cierra esa brecha.

Responde y escribe siempre en español.

---

## Reglas que no se negocian

1. **Solo entorno local con datos ficticios.** Playwright navega contra `http://localhost:5173`
   con `VITE_API` apuntando a un back local (`127.0.0.1` / `localhost`). **Nunca contra
   `ergosanitas.com`**: lo que Playwright ve entra en la conversación, y la Ley 21.719 prohíbe
   llevar datos reales de pacientes a herramientas de IA. Si `.env` apunta a producción, **para**.
2. **El login lo hace la persona.** Abres la ventana de Playwright, te detienes y pides
   «Inicia sesión como `<perfil>` y avísame». Nunca pidas, leas, escribas ni guardes credenciales.
   Tampoco leas `src/Login/config/keys.json`.
3. **Solo se reporta.** Un criterio que falla queda `❌` con su evidencia. **No tocas `src/`**, ni
   `.env`, `package.json` o la configuración, y **no cambias el `Estado:` de la spec**. Si hay ❌,
   recomiendas `En revisión` en el informe; la decisión es humana.
4. **Solo lectura del negocio.** En Playwright no envías formularios de alta o edición, ni cargas
   masivas, ni borras nada (`chequeo-administrador` tiene dos borrados), ni pagas. Si un criterio
   solo se comprueba ejecutando una acción así, **pregunta antes** y explica qué se va a escribir
   en la BD local. Sin un sí explícito, el criterio queda `⏸`.
5. **Un ✅ exige evidencia reproducible**: el comando con su salida real, la petición de red o
   una captura. Si no la hay, no es ✅. Un `⏸` bien explicado vale más que un ✅ supuesto.
6. **Capturas solo con datos ficticios.** Antes de guardarla, **mira** la captura: si aparece un
   nombre, RUT, correo o teléfono que no sea claramente ficticio («Paciente Demo», `11111111-1`,
   `12.345.678-9`), descártala y deja la evidencia en texto.

---

## Contexto de sesión

Estado del repositorio:
!`git status --short`

Rama y último commit:
!`git branch --show-current && git log -1 --format="%h %s"`

Specs y estados:
!`grep -H -m1 -i "estado:" specs/*/[0-9]*.md 2>/dev/null || echo "No existe specs/"`

Destino del back en `.env` (solo el host, sin secretos):
!`grep -E "^VITE_API=" .env 2>/dev/null | sed -E 's#^VITE_API=(https?://[^/]+).*#VITE_API → \1#' || echo "sin .env"`

---

## Si te ejecuta `ergo-father` o el agente `spec-verify-ergo-front`

Esta skill tiene `disable-model-invocation`, así que un agente no la invoca con `Skill`: la
**lee** y la sigue. En ese caso el «Contexto de sesión» de arriba no se evaluó: ejecuta tú esos
comandos (con `git -C "D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app"` y rutas absolutas si
el directorio actual no es este repo).

Un subagente **no puede lanzar otros agentes** ni preguntar con `AskUserQuestion`: en la Fase 2
la revisión del dueño del módulo la hace él mismo con graphify y `grep`, y en las pausas de login
**devuelve el control** con un mensaje claro de qué necesita antes de seguir.

---

## Fase 0 — Alcance y preparación

### 0.1 — Resolver el argumento

| Argumento | Qué se verifica |
|---|---|
| `NN-slug` o ruta (`specs/home-ergo/05-chat-ergosanito-real.md`) | Esa spec |
| Carpeta de módulo (`home-ergo`) | Todas las specs de `specs/home-ergo/` en orden |
| `todas` | Las 6 carpetas, módulo por módulo |

Las specs se numeran **dentro de cada carpeta**: hay seis `01`. Si el argumento es ambiguo
(solo un número, o un slug que se repite), **muestra las coincidencias con su módulo y pregunta**.

Solo se verifican specs en `Implementado` o `Aprobado` (en este último caso, solo si ya hay código
en la rama). `Borrador`, `En revisión` y `Obsoleto` se saltan y se dice por qué.

Con varias specs se trabaja **en secuencia**, nunca en paralelo: hay un solo navegador.

### 0.2 — Comprobar las herramientas

Antes de empezar, verifica y **reporta lo que falte** (no inventes resultados por una herramienta
ausente):

```bash
test -f graphify-out/graph.json && echo "grafo OK" || echo "FALTA grafo → graphify update ."
graphify --version
claude mcp list            # o /mcp en la sesión: context7, graphify, playwright
```

| Falta | Qué haces |
|---|---|
| `graph.json` | Propón `graphify update .` (AST, sin coste) y córrelo si el usuario acepta. Sin grafo, la Fase 1 se hace con `git log` + `grep` y se dice en el informe. |
| `context7` | La Fase 3 queda «no ejecutada» en el informe. No se reemplaza con memoria. |
| `playwright` | Todos los criterios de UI quedan `⏸ (Playwright no disponible)`. Se puede agregar con la entrada de `.mcp.json` del README §11.3. |

### 0.3 — Comprobar el entorno

1. `VITE_API` del contexto de sesión **debe** ser `localhost` o `127.0.0.1`. Si es
   `ergosanitas.com` u otro host público: **detente** y pide al usuario que apunte `.env` al back
   local. No sigas «solo con lo estático» sin decirlo.
2. Pregunta si el back local está arriba y comprueba que responde:
   `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/` (cualquier código HTTP
   sirve; «connection refused» significa caído). Sin back, los criterios de UI que dependen de
   datos quedan `⏸ (sin back local)`.
3. Levanta el front en segundo plano (si no está ya en el 5173):

   ```bash
   MSYS_NO_PATHCONV=1 npm run dev     # en Git Bash; sin MSYS_NO_PATHCONV, VITE_API_PATH=/api se convierte en ruta de Windows
   ```

### 0.4 — Leer la spec y su contexto

Por cada spec: léela entera y lee la guía del módulo `specs/<modulo>/CLAUDE_<MODULO>.md`, que
**manda** sobre las skills si discrepan. Anota: módulo, perfiles afectados, rutas (`#/...`),
endpoints y la lista de criterios de la sección «Criterios de aceptación».

---

## Fase 1 — Mapa del código con graphify

Objetivo: la **lista real de archivos** que implementan la spec.

```bash
graphify query "componentes, hooks y servicios de <feature de la spec> en src/<modulo>/"
graphify explain "<Componente o servicio que nombra la spec>"
```

Crúzalo con git, que dice qué tocó la implementación:

```bash
git log --oneline --all -- specs/<modulo>/<NN-slug>.md          # commits de la spec
git log --name-only --format="--- %h %s" --grep="<NN o slug>"   # archivos de esos commits
```

Si el grafo y git discrepan (un archivo que la spec nombra y no existe, o uno que se tocó y la
spec no menciona), anótalo como hallazgo.

---

## Fase 2 — Dependencias e impactos

1. **Hacia fuera del módulo**:

   ```bash
   graphify path "<archivo de la spec>" "ApiAdapter"
   graphify path "<archivo de la spec>" "NavigationApp"
   grep -rnE "from ['\"](\.\./)+" src/<modulo>/ | grep -vE "from ['\"](\.\./)+common/"
   ```

   Todo import fuera de `src/<modulo>/` y de `src/common/` es un hallazgo **si la guía del módulo
   lo prohíbe**.

2. **Reglas duras de la guía del módulo**, verificadas con `grep` y citando la salida. Ejemplos:

   | Módulo | Comprobación |
   |---|---|
   | `chequeo-cardiovascular` | Sin imports de `Chequeo/`, `Estadisticas/`, `Certificados/`, `components/`; sin `DeleteIcon` ni borrado; ningún hex en `.tsx` (`grep -rnE "#[0-9a-fA-F]{3,6}\b" --include=*.tsx`). |
   | `chequeo-administrador` | Solo importa de `common/`. |
   | `ficha-clinica` | Ningún componente importa la Capa 1 (`api.interface`); nada mapea ausencia a `0`. |
   | `home-ergo` | No importa de `presentation/` ni `AsistenteVirtual/`; `wa.me`/`tel:`/`mailto:` solo en `config/canales-contacto.tsx`; `preload="none"` y sin `autoplay` en los `<video>`. |
   | `servicio-cart-flow` | El front no calcula precios; en `localStorage` solo el `uuid` del carro. |
   | `carrito-compra` | Solo importa de `common/`; nada se borra. |

3. **Consumidores de lo que la spec cambió** (firmas exportadas, tipos, claves de localStorage):
   `graphify explain "<símbolo>"` y `grep -rn "<símbolo>" src/`.

4. **Revisión del dueño del módulo**, solo si te ejecuta la sesión principal: lanza en **solo
   lectura** al agente de la tabla, con el prompt de abajo. Si eres un subagente, haz tú la
   revisión con su skill (léela en `.claude/skills/<skill>/SKILL.md`) y dilo en el informe.

   | Módulo | Agente |
   |---|---|
   | `src/Login/` | `ergo-login` |
   | `src/Chequeo/` | `ergo-chequeo` |
   | `src/chequeo-cardiovascular/` | `ergo-chequeo-cardiovascular` |
   | `src/common/` | `ergo-common` |
   | `ficha-clinica`, `home-ergo`, `chequeo-administrador`, `carrito-compra`, `servicio-cart-flow`, `routes` | `ergosanitas-developer` + la guía `CLAUDE_<MODULO>.md` |
   | Cambios que cruzan módulos o tocan el modelo | además `ergosanitas-architect` |

   > Estoy verificando la spec `specs/<modulo>/<NN-slug>.md`, ya implementada. Archivos de la
   > spec: `<lista de la Fase 1>`. **Revisa sin modificar nada**: carga tu skill y dime si esos
   > archivos rompen alguna regla de tu módulo, alguna firma que consumen otros módulos, o algo
   > que tu skill marque como intocable. Devuélveme hallazgos con archivo:línea.

---

## Fase 3 — Buenas prácticas con Context7

Por cada librería que use el código de la spec (lo dicen los imports de la Fase 1: MUI 5,
react-hook-form + yup, react-router-dom 6, chart.js / react-chartjs-2, axios, dayjs, sweetalert2,
mapbox-gl, @fullcalendar…):

1. `mcp__context7__resolve-library-id` con el nombre de la librería y **la versión de
   `package.json`** (MUI **5**, no 6/7; react-router **6**).
2. `mcp__context7__query-docs` sobre **el patrón concreto que usa el código**, no sobre la
   librería en general. Ejemplos: «`TabPanel` sin desmontar y carga perezosa en MUI 5 Tabs»,
   «`yupResolver` validando solo campos condicionales», «accesibilidad de `Dialog` y foco al
   abrir», «`Chart.js` registrar componentes con tree-shaking».

Los hallazgos son **observaciones**, no criterios: van al informe y a la sección de verificación,
**nunca marcan ni desmarcan un check**. Cita la fuente que devolvió Context7. Respeta las
decisiones documentadas en la guía del módulo: una práctica «mejor» que contradice una decisión
deliberada (por ejemplo, la duplicación de los chats o la lógica clínica de IMC clonada con su
bug) se anota como «coherente con la decisión X de la guía», no como un defecto.

---

## Fase 4 — Clasificar y verificar los criterios

Recorre **uno por uno** los `- [ ]` (y los `- [x]` previos, para revalidarlos) de la sección
«Criterios de aceptación». Clasifica cada uno:

| Tipo | Cómo se verifica | Ejemplos |
|---|---|---|
| **estático** | Se ejecuta ahora y se cita la salida real. | `grep`, `git diff --stat main...<rama>`, `npm run build`, `npx eslint src/<modulo>/`, «no existe el archivo X». |
| **UI** | Playwright, Fase 5. | «el tab se llama…», «la petición lleva…», «a 360 px…», «tras F5…». |
| **externo** | No se verifica: `⏸` con el motivo. | Producción, Postman contra `ergosanitas.com`, despliegue FTP, datos reales, decisión médica. |

`npm run build` y `npx eslint src/<modulo>/` se corren **una sola vez por módulo** y la salida se
reutiliza en todos los criterios que los piden.

Un criterio estático que en la spec hacía referencia a la rama de implementación
(`git diff main...spec-NN-slug`) se verifica contra el commit de merge si la rama ya no existe:
`git log --merges --grep="spec-NN"` o el commit `feat:` correspondiente. Dilo en la evidencia.

---

## Fase 5 — Validar la interfaz con Playwright

Herramientas del MCP `playwright` (cárgalas con `ToolSearch` si están diferidas, todas en una
llamada): `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`,
`browser_press_key`, `browser_wait_for`, `browser_resize`, `browser_take_screenshot`,
`browser_network_requests`, `browser_console_messages`, `browser_evaluate`, `browser_close`.

1. **Abrir**: `browser_navigate` → `http://localhost:5173/` (la app usa `HashRouter`: las rutas
   son `#/...`).
2. **Login por perfil**: si el criterio pide un perfil autenticado (`Colegios`, `Paciente`,
   `Administrador`, `Medicos`…), **detente** y escribe:

   > 🔐 Inicia sesión como **`<perfil>`** en la ventana de Playwright (cuenta de prueba local) y
   > avísame cuando veas la pantalla de inicio.

   No sigas hasta que confirme. Recuerda que **un F5 desloguea** (la sesión no se persiste): los
   criterios que piden recargar obligan a repetir el login, agrúpalos al final de cada perfil.
3. **Por cada criterio de UI**, reúne la evidencia que corresponda:
   - **Texto o estructura** → `browser_snapshot` y cita el nodo exacto («tab `Asistente Ergo`, 5.º
     de 5»).
   - **Peticiones** → `browser_network_requests`: método, URL y cuerpo. Es la evidencia de «una
     sola petición», «lleva `prompt` igual al RUT», «sin `limit`/`offset`».
   - **Errores** → `browser_console_messages`: que no haya errores nuevos de React ni de red.
   - **localStorage** → `browser_evaluate` con `() => ({...localStorage})`, filtrando las claves
     que nombra el criterio (`home_chat_session_id`, `ficha_chat_session_id`…).
   - **Responsive** → `browser_resize` a 360×740 cuando el criterio hable de móvil o de 360 px;
     vuelve a 1440×900 después.
   - **Back caído** → solo si el usuario acepta detener el back local un momento.
   - **Captura** → `browser_take_screenshot` y cópiala a
     `specs/<modulo>/evidencias/<NN>/<n>-<slug-corto>.png` (`<n>` = número del criterio). Mírala
     antes de guardarla (regla 6).
4. **Cierra** con `browser_close` al terminar cada spec, y detén el `npm run dev` que lanzaste.

---

## Fase 6 — Escribir la evidencia en la spec

Edita **solo dos sitios** de la spec: la sección «Criterios de aceptación» y la sección final
«Estado de verificación». No reescribas el resto, no reordenes criterios y **no toques `Estado:`**.

### 6.1 — Cada criterio

Conserva el texto original del criterio y cambia solo la casilla. Debajo, una sublínea de evidencia:

```markdown
- [x] `npx eslint src/home-ergo/` sale en 0.
  - ✅ Evidencia (2026-11-10, spec-verify, `da7afb7`): `npx eslint src/home-ergo/` → 0 problemas.
- [x] La cabecera dice «Ergosanito».
  - ✅ Evidencia (2026-11-10, spec-verify): snapshot `heading "Ergosanito"` en el panel del chat. ![](evidencias/05/11-cabecera.png)
- [ ] La petición lleva `{ prompt, sessionId }`.
  - ❌ Evidencia (2026-11-10, spec-verify): `POST /api/chat-comercial/as-question` con cuerpo `{"prompt":"hola"}` — falta `sessionId` tras la primera respuesta.
- [ ] `POST https://ergosanitas.com/...` responde 200.
  - ⏸ No verificable (2026-11-10, spec-verify): exige producción; el verificador solo trabaja en local.
```

- `[x]` solo con ✅. `❌` y `⏸` dejan la casilla vacía.
- Si una verificación anterior ya dejó una sublínea, **reemplázala**, no apiles.
- Las rutas de imagen son relativas a la spec: `evidencias/<NN>/...`.

### 6.2 — Sección «Estado de verificación»

Añádela al final de la spec, o reemplázala si ya existe:

```markdown
## Estado de verificación

> Última verificación: 2026-11-10 · `/spec-verify-ergo-front` · commit `<hash>` · rama `<rama>`
> Entorno: front local `localhost:5173` + back local `127.0.0.1:8000` · perfiles: <lista>

| Resultado | Criterios |
|---|---|
| ✅ Verificados | N |
| ❌ Fallan | N — <números> |
| ⏸ No verificables | N — <motivo agrupado> |

**Mapa (graphify):** <archivos de la spec, y discrepancias con git>
**Impactos:** <consumidores externos, reglas duras comprobadas, hallazgos del agente dueño>
**Buenas prácticas (Context7):** <observaciones con su fuente; «coherente con decisión X» cuando aplique>
**Recomendación:** mantener `Implementado` | pasar a `En revisión` por <criterios ❌> — decide una persona.
```

---

## Informe final

Por cada spec, y al final un total:

```
🔎 Spec verificada: specs/<modulo>/<NN-slug>.md   (Estado: <sin cambios>)
   Commit:        <hash>        Entorno: local (front 5173 · back 8000 | sin back)
   Herramientas:  graphify ✅/❌ · context7 ✅/❌ · playwright ✅/❌
   Criterios:     ✅ N · ❌ N · ⏸ N   de M
   Fallan:        <número — resumen de una línea, cada uno>
   Impactos:      <lo relevante de la Fase 2>
   Context7:      <observaciones, o «sin observaciones»>
   Evidencias:    specs/<modulo>/evidencias/<NN>/ (K capturas)
   Recomendación: <mantener Implementado | En revisión>
```

No hagas commit ni push salvo que el usuario lo pida. Si lo pide: prefijo `docs:` (no bumpea
versión en la CI) y solo los archivos de `specs/`.
