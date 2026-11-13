---
name: spec-verify-ergo-front
description: "Verifica una o varias specs ya implementadas del front-end Ergosanitas y deja cada criterio de aceptación con su evidencia. Carga automáticamente el kit de ejecución de la spec según .claude/MATRIZ-HERRAMIENTAS.md. Mapea el código con graphify y LSP y analiza dependencias e impactos. Revisa la calidad con los agentes del proyecto (ergosanitas-developer + ergo-code + vercel-react-best-practices, el agente dueño del módulo, el architect), contrasta buenas prácticas con Context7 y pasa security-review si la spec es sensible. Recorre los criterios uno por uno, valida la interfaz con Playwright contra el entorno local, audita las capturas con frontend-design / interface-design / dataviz y actualiza los checks de la spec. Nunca implementa ni corrige código ni cambia el Estado de la spec: solo verifica y reporta. Es el tercer eslabón, después de /spec-ergo-front y /spec-impl-ergo-front; también lo ejecuta el agente spec-verify-ergo-front y, desde la raíz, ergo-father."
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
7. **El kit no relaja nada de lo anterior.** Las skills del kit (Fase 0.4b) producen
   **observaciones**, nunca marcan ni desmarcan criterios. Ninguna pieza del kit trabaja contra
   producción ni con el Chrome real del usuario: `claude-in-chrome` y Snyk están excluidos (§6 de la
   matriz).

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

Un subagente **no puede lanzar otros agentes** ni preguntar con `AskUserQuestion`. Por eso:

- en la Fase 2b emula a los revisores leyendo sus definiciones y skills, o integra los hallazgos
  que le pasó `ergo-father`;
- en las pausas de login **devuelve el control** con un mensaje claro de qué necesita antes de
  seguir.

El kit se lee de `D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app/.claude/MATRIZ-HERRAMIENTAS.md`.
Si `Skill` no encuentra una skill del kit, **léela** por ruta: las importadas en
`.agents/skills/<nombre>/SKILL.md` y las propias en `.claude/skills/<nombre>/SKILL.md`. Así la
aplicas igual.

---

## Fase 0 — Alcance y preparación

### 0.1 — Resolver el argumento

| Argumento | Qué se verifica |
|---|---|
| `NN-slug` o ruta (`specs/home-ergo/05-chat-ergosanito-real.md`) | Esa spec |
| Carpeta de módulo (`home-ergo`) | Todas las specs de `specs/home-ergo/` en orden |
| `todas` | Las 7 carpetas, módulo por módulo |

Las specs se numeran **dentro de cada carpeta**: hay siete `01`. Si el argumento es ambiguo
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
| `playwright` | Todos los criterios de UI quedan `⏸ (Playwright no disponible)`, y la Fase 5b, «no ejecutada». Se puede agregar con la entrada de `.mcp.json` del README §11.3. |
| `engram` | Sin memoria de verificaciones anteriores: se dice y se sigue. |
| `LSP` | Los consumidores (Fase 2.3) se buscan con `grep -rn`, y se dice. |
| Una skill del kit (`vercel-react-best-practices`, `frontend-design`, `interface-design`, `dataviz`, `security-review`…) | ❌ en la tabla del kit. La revisión que dependía de ella queda «no ejecutada» en el informe. |

Los MCP se cargan en **un solo `ToolSearch`**, con la query de `/spec-verify-ergo-front` del §5 de
`.claude/MATRIZ-HERRAMIENTAS.md`.

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

### 0.4b — Kit de ejecución (automático)

Por cada spec, **sin pedir confirmación**:

1. Lee `.claude/MATRIZ-HERRAMIENTAS.md`: perfiles (§2), columna *Verificar* (§3.2), adaptadores
   (§4) y exclusiones (§6).
2. Toma la sección `## Kit de ejecución` de la spec y recalcula los perfiles con el §2. Si la
   spec no la tiene, **derívala**, y anótalo en «Estado de verificación». Esta skill solo escribe en
   dos secciones de la spec, así que el kit derivado **no** se agrega como sección: se recomienda
   `/spec-ergo-front <spec>` (modo revisión) para escribirlo.
3. `mem_search` (engram) con el módulo y el slug, para recuperar verificaciones anteriores y
   trampas del entorno (un back que da 500, una cuenta de prueba por perfil).
4. Imprime la tabla del kit (§7 de la matriz, con columna «Estado»). Las skills se **invocan
   después**, en la fase que las usa:
   - `vercel-react-best-practices` y las de diseño, en la Fase 2b, dentro del prompt de cada
     revisor;
   - `security-review`, en la Fase 3b;
   - la skill de diseño o `dataviz`, en la Fase 5b.

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
   | `certificados` | No importa de `Chequeo/`; una sola petición `POST /certificados/consulta` por búsqueda y nada al montar; sin hex ni `fontFamily` propia; sin `Swal`; firma de `getCertificadoRut` intacta (la usa `AppChequeo.tsx`); textos en `config/textos-certificados.json`. |

   Si el kit marca **`CLINICO`**: `git diff --stat <base>...<commit> -- <archivos de lógica clínica>`
   tiene que salir vacío. Si no, es un hallazgo bloqueante: es una decisión médica fuera de la spec.

3. **Consumidores de lo que la spec cambió** (firmas exportadas, tipos, claves de localStorage):
   `graphify explain "<símbolo>"` y LSP `findReferences` sobre el símbolo. Sin LSP,
   `grep -rn "<símbolo>" src/`.

4. **Revisión de calidad por los agentes del proyecto** → Fase 2b.

---

## Fase 2b — Revisión de calidad con los agentes del front

Los agentes de `.claude/agents/` son los que saben cómo se escribe buen código **en este repo**.
Esta fase los usa como revisores de lo que implementó la spec. Es obligatoria: no se salta porque
los criterios pasen.

### 2b.1 — Elegir los revisores

Con la lista de archivos de la Fase 1:

| Condición | Revisor | Qué mira, además de su definición |
|---|---|---|
| **Siempre** | `ergosanitas-developer` + skills `ergo-code` y `vercel-react-best-practices` (solo el filtro §4.3 de la matriz) | Estilo real del repo: TS estricto (sin `any` nuevos), arrow functions con `interface Props` local, `sx` de MUI 5, servicios `UseXService` por `ApiAdapter` (nunca axios directo), `getToken` vs `get`, `number \| null` y `—` (nunca `0` por ausencia), sin react-query ni Redux, `try/catch` + Swal en las llamadas (salvo que la guía diga otra cosa), comentarios en español que explican el porqué. Rendimiento React 18: `rerender-*` (componentes inline, dependencias, estado derivado en efecto), `async-parallel`, `bundle-conditional` / `React.lazy`, `client-*-event-listeners`. Cada hallazgo cita la regla por su id. |
| Toca `src/Login/` | `ergo-login` | Firmas públicas de `useRegister` e `IUser`, sin credenciales. |
| Toca `src/Chequeo/` | `ergo-chequeo` | Los tres bloques de tabs por perfil, lógica clínica de IMC intacta. |
| Toca `src/chequeo-cardiovascular/` | `ergo-chequeo-cardiovascular` | Sus cuatro reglas duras, constantes `TAB_*`, `tema.ts` como única fuente de color, `activo`. |
| Toca `src/common/` | `ergo-common` | Modo aditivo, ninguna firma cambiada (64 dependientes). |
| Toca `ficha-clinica`, `home-ergo`, `chequeo-administrador`, `carrito-compra`, `servicio-cart-flow` o `Certificados` | `ergosanitas-developer` + `specs/<modulo>/CLAUDE_<MODULO>.md` (manda) | Regla de aislamiento y reglas duras de la guía. |
| Cruza módulos, toca `src/routes/` o el modelo de dominio | `ergosanitas-architect` | Coherencia con `.claude/ARQUITECTURA.md`, filtrado por perfil del navegador tocado. |
| Perfil `UI-PUBLICA` / `UI-PRODUCTO` (kit) | El revisor del módulo, cargando además `frontend-design` / `interface-design` | En el **código**: estados vacío, carga, error y sin permiso; foco y `aria-*`; jerarquía; colores y fuentes solo del tema del módulo. Lo visual se audita aparte, en la Fase 5b. |
| Perfil `GRAFICOS` (kit) | El revisor del módulo, cargando además `dataviz` | Color clínico por etiqueta, colores de `tema.ts`, `TablaAccesible`, registro de componentes de Chart.js 4. |

Un revisor por fila que aplique; no se lanzan dos veces con el mismo enfoque. Las dos filas de
perfil **no lanzan otro agente**: añaden skills al prompt del revisor del módulo.

### 2b.2 — Ejecutar la revisión

Según quién te ejecute:

| Modo | Qué haces |
|---|---|
| **Sesión principal** (`/spec-verify-ergo-front` o el agente lanzado con `--agent`, con la herramienta `Agent`) | Lanza a los revisores **en paralelo**, en solo lectura, con `subagent_type` igual al nombre del agente (en este repo están registrados) y el prompt de abajo. |
| **Subagente sin `Agent`** | Emula a cada revisor: lee `.claude/agents/<revisor>.md` y su skill, aplica su checklist con `graphify` y `grep` sobre los archivos de la spec, y en el informe di que la revisión fue emulada. |
| **El prompt que te lanzó trae hallazgos de revisores** (lo hace `ergo-father`) | Intégralos tal cual en 2b.3 y no repitas esa revisión; solo emula la de los revisores que falten. |

Prompt para cada revisor:

> Estoy verificando la spec `specs/<modulo>/<NN-slug>.md`, ya implementada. Archivos de la
> spec: `<lista de la Fase 1>`. Perfiles del kit: `<perfiles>`.
> **Revisa sin modificar nada**: ni código, ni specs, ni configuración; sin Playwright; sin leer
> `.env`.
> Carga tu skill, la guía del módulo si existe y **estas skills del kit**: `<ergo-code,
> vercel-react-best-practices, frontend-design | interface-design | dataviz, según la fila>`.
> De `vercel-react-best-practices` aplica **solo** las reglas del filtro §4.3 de
> `.claude/MATRIZ-HERRAMIENTAS.md`: es React 18 + Vite, sin SSR, sin SWR y sin APIs de React 19.
> Si una skill externa choca con la guía del módulo, gana la guía.
> Usa `graphify query` antes de leer código.
> Dime si esos archivos rompen alguna regla de tu módulo, de `ergo-code` o de las skills del kit,
> alguna firma que consumen otros módulos, o algo que tu skill marque como intocable. Devuélveme una
> tabla `archivo:línea · severidad (bloqueante|mayor|menor) · regla violada (con su fuente o id) ·
> sugerencia`. Si no hay hallazgos, dilo y lista las reglas que comprobaste.

### 2b.3 — Consolidar

- Une las tablas, quita duplicados y conserva qué agente vio cada hallazgo.
- **Severidad**: `bloqueante` = rompe una regla dura del `CLAUDE.md` o de la guía del módulo, una
  firma consumida por otros, o la Ley 21.719; `mayor` = se aparta del estilo o patrón del repo de
  forma que costará mantener; `menor` = detalle.
- Los hallazgos son **observaciones**: no marcan ni desmarcan criterios. Si hay al menos un
  `bloqueante`, la recomendación final es `En revisión`.
- Verifica cada hallazgo con `Read` en la línea citada antes de aceptarlo: un revisor puede
  equivocarse. Los que no se sostienen se descartan y se dice cuántos.

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

## Fase 3b — Seguridad (solo perfil `SENSIBLE`)

Si el kit marca `SENSIBLE`, invoca `Skill(skill: "security-review")` sobre los archivos de la spec
(adaptador §4.8). Es una revisión **local**, que no sube código a ningún servicio. Foco:

- datos personales o credenciales en `localStorage` o en logs;
- `html:` de Swal sin escapar;
- URLs firmadas expuestas o reutilizadas;
- validación de RUT y correo;
- secretos o `.env` en el código.

Los hallazgos se verifican en la línea citada y se suman a la tabla de calidad con el agente
«security-review». Uno que expone datos personales es **bloqueante**: Ley 21.719. En la Fase 5, la
evidencia de `localStorage` (`browser_evaluate`) completa esta revisión.

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
   Antes, haz la Fase 5b con las capturas en la mano.

---

## Fase 5b — Auditoría visual con la skill de diseño del kit

Solo si el kit marca `UI-PUBLICA`, `UI-PRODUCTO` o `GRAFICOS` y la Fase 5 se ejecutó.

1. Invoca la skill que corresponde: `frontend-design` (`UI-PUBLICA`), `interface-design`
   (`UI-PRODUCTO`) o `dataviz` (`GRAFICOS`).
2. Revisa las capturas ya guardadas y, si hace falta, una a 1440×900 y otra a 360×740 de la pantalla
   principal de la spec. Sigue la regla 6: solo datos ficticios.
3. Mira:
   - **foco**: lo que el usuario vino a hacer, ¿domina la pantalla?;
   - **jerarquía tipográfica** y densidad coherentes;
   - **estados** vacío, carga y error visibles y distintos;
   - **contraste y foco del teclado**, con `browser_press_key` `Tab`;
   - **móvil sin scroll horizontal**;
   - en gráficos, color por etiqueta y leyenda legible.
4. Cada observación se anota con severidad (`mayor` / `menor`; nunca `bloqueante`, salvo
   accesibilidad que impida usar la pantalla) y la decisión de la guía que la respalda o la
   contradice.

Son **observaciones**: nunca marcan ni desmarcan criterios. Se aplica el adaptador §4.2 de la
matriz: lo que la guía decidió a propósito (`contain` en flyers, sin `fontFamily` propia en
Certificados, paleta de `tema.ts`) se anota como «coherente con la decisión X», no como defecto.

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

**Kit usado:** perfiles <…> · skills <…> · MCP <…> · ausentes <… o «ninguna»> (<de la spec | derivado de la matriz>)
**Mapa (graphify):** <archivos de la spec, y discrepancias con git>
**Impactos:** <consumidores externos (graphify + LSP), reglas duras comprobadas>
**Revisión de calidad (agentes):** <revisores, skills del kit que cargó cada uno y modo (lanzados | emulados | del padre)>

| Archivo:línea | Severidad | Regla | Agente |
|---|---|---|---|
| … | bloqueante / mayor / menor | … | … |

**Buenas prácticas (Context7):** <observaciones con su fuente; «coherente con decisión X» cuando aplique>
**Seguridad (security-review):** <sin hallazgos | hallazgos en la tabla de calidad | — spec no sensible>
**Auditoría visual (<frontend-design | interface-design | dataviz>):** <observaciones con severidad | — sin perfil de UI | no ejecutada (sin Playwright)>
**Recomendación:** mantener `Implementado` | pasar a `En revisión` por <criterios ❌ y/o hallazgos bloqueantes> — decide una persona.
```

---

## Informe final

Por cada spec, y al final un total:

```
🔎 Spec verificada: specs/<modulo>/<NN-slug>.md   (Estado: <sin cambios>)
   Commit:        <hash>        Entorno: local (front 5173 · back 8000 | sin back)
   Herramientas:  graphify ✅/❌ · context7 ✅/❌ · playwright ✅/❌ · engram ✅/❌ · LSP ✅/❌
   Kit:           perfiles <…> · skills <…> · ausentes <… o «ninguna»> (<de la spec | derivado>)
   Criterios:     ✅ N · ❌ N · ⏸ N   de M
   Fallan:        <número — resumen de una línea, cada uno>
   Impactos:      <lo relevante de la Fase 2>
   Calidad:       <revisores + skills del kit · modo> — bloqueantes N · mayores N · menores N (detalle en la spec)
   Seguridad:     <security-review: sin hallazgos | N hallazgos | — no sensible>
   Visual:        <auditoría Fase 5b: N observaciones | — | no ejecutada>
   Context7:      <observaciones, o «sin observaciones»>
   Evidencias:    specs/<modulo>/evidencias/<NN>/ (K capturas)
   Recomendación: <mantener Implementado | En revisión>  ·  <si el kit fue derivado: «/spec-ergo-front <spec> para escribirlo»>
```

Al terminar, `mem_save` (engram, protocolo selectivo del §1 de la matriz) **solo** con lo durable que
no queda en la spec: una trampa del entorno local (un endpoint que siempre da 500, una cuenta de
prueba que falta para un perfil) o un patrón de fallo que se repite entre specs. El resultado de los
criterios ya está en la spec y no se duplica.

No hagas commit ni push salvo que el usuario lo pida. Si lo pide: prefijo `docs:` (no bumpea
versión en la CI) y solo los archivos de `specs/`.
