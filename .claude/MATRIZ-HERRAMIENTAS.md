# Matriz de herramientas del flujo spec-driven (front-end)

> Fuente única del **kit de ejecución** que cargan `/spec-ergo-front`, `/spec-impl-ergo-front`,
> `/spec-verify-ergo-front` y el agente `spec-verify-ergo-front`. No es una skill: cada comando la
> **lee con `Read`** al arrancar. Para agregar, quitar o cambiar una pieza del kit se edita **este
> archivo**, no las tres skills.
>
> Ruta absoluta (para `ergo-father` y subagentes):
> `D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app/.claude/MATRIZ-HERRAMIENTAS.md`
>
> Mapa del archivo:
> - §0 cómo se usa · §0b las importadas fuera del flujo;
> - §1 base · §2 perfiles · §3 matriz perfil × fase · §4 adaptadores;
> - §5 MCP · §6 excluidos · §7 formato del bloque;
> - §8 quién usa qué (vista inversa) · §9 cómo mantenerla.
>
> Homólogo del back: `Back-end/ergosanitas-app/.claude/skills/spec-ergo-backend/references/enrutado.md`.
> Mismo concepto y misma sección `## Kit de ejecución` en las specs.

---

## 0. Cómo se usa (los tres comandos hacen lo mismo)

1. **Resolver la spec y su módulo** (`specs/<modulo>/NN-slug.md` → `src/<carpeta>/`).
2. **Partir del kit guardado.** Si la spec tiene la sección `## Kit de ejecución` (la escribe
   `/spec-ergo-front`), úsala. Recalcula igual los perfiles con §2: si la spec cambió y discrepan,
   **manda el recálculo**, y la diferencia se dice en la tabla.
3. **Spec sin kit** (las anteriores a esta matriz): derívalo con §2 y §3 y anótalo como
   «derivado por <comando>».
4. **Imprime la tabla del §7 y ejecútala sin pedir confirmación**:
   - las skills se invocan con `Skill`;
   - los MCP se cargan con **un solo** `ToolSearch` (lista del §5);
   - los agentes se lanzan en el punto de la fase que indica el §3.

   Lo único que se pregunta es lo que cada comando ya preguntaba: login, escrituras en la BD local,
   specs ambiguas y decisiones de producto.
5. **Si falta una pieza** (skill no instalada, MCP caído o sin autenticar), márcala ❌ en la tabla y
   sigue. Lo que dependía de ella queda «no ejecutado» en el informe y **nunca se reemplaza con
   memoria**.

**El kit no cambia las reglas de cada comando:**

- el bloqueo por estado y las pausas por paso de `/spec-impl`;
- solo local y login manual en la verificación;
- nada de commits sin pedirlo;
- las reglas duras de `CLAUDE.md` y de la guía del módulo.

**Jerarquía cuando chocan:** guía del módulo (`CLAUDE_<MODULO>.md`) > `CLAUDE.md` > skill propia del
módulo (`ergo-*`) > skills externas del kit. Si una skill externa recomienda algo que una decisión
documentada descarta, se anota «coherente con la decisión X de la guía», no como defecto.

## 0b. Fuera del flujo de specs: las importadas también pasan por su adaptador

Cuatro de las skills importadas son **invocables por el modelo**, así que se activan solas en
cualquier tarea del repo, no solo dentro de los `/spec-*-ergo-front`. Sus textos están escritos para
otros proyectos y **no se editan** (ver §9). Por eso, se activen donde se activen, se usan a través de
su adaptador del §4:

| Skill | Se activa sola cuando… | Regla en este repo |
|---|---|---|
| `brainstorming` | Se pide crear o cambiar algo («MUST use before any creative work») | Solo su técnica (§4.1). **Nunca** escribe en `docs/superpowers/` ni llama a `superpowers:writing-plans`. Si lo que sale es una feature, el siguiente paso es `/spec-ergo-front`, no un plan propio |
| `vercel-react-best-practices` | Se escribe o revisa código React | Solo las reglas del filtro §4.3. Nada de SWR, `next/*`, `server-*` ni APIs de React 19 |
| `frontend-design` / `interface-design` | Se construye o rediseña UI | Dentro de MUI 5 + `sx` + `config/tema.ts` del módulo (§4.2). Una fuente o un color nuevo se decide en una spec |
| `changelog-generator` | Se piden notas de versión | En español y en lenguaje de usuario (§4.9). No crea `CHANGELOG.md` sin pedirlo |

Si una de ellas choca con `CLAUDE.md` o con la guía del módulo, **gana el repo**, igual que dentro del
flujo.

---

## 1. Base: toda spec, toda fase

| Pieza | Cuándo | Cómo |
|---|---|---|
| `CLAUDE.md` + `.claude/ARQUITECTURA.md` | Al arrancar | Leer |
| `specs/<modulo>/CLAUDE_<MODULO>.md` | Al arrancar | Leer **entera**: manda sobre todo lo demás |
| graphify (CLI, o MCP `graphify`) | Antes de leer código. Tras modificar código: `graphify update .` | `graphify query "<pregunta>"`, `graphify explain "<símbolo>"`, `graphify path "<A>" "<B>"`. Sin `graphify-out/graph.json` → `graphify update .` (AST, sin coste) |
| engram (`mem_search` / `mem_save`) | **Arranque:** `mem_search` con `<modulo>` + slug de la spec para recuperar decisiones previas. **Cierre:** `mem_save` | Protocolo selectivo. Guarda **solo** lo que no queda escrito en el repo: una trampa descubierta, una causa raíz no obvia, una preferencia del usuario sobre el flujo. Lo que ya dice la spec o la guía no se duplica. `topic_key`: `spec-front/<modulo>/<NN-slug>` |
| Context7 (`resolve-library-id` → `query-docs`) | Antes de **usar o evaluar** la API de una librería | Con la versión de `package.json`: React 18.3, MUI 5, react-router-dom 6, react-hook-form 7 + yup 1, chart.js 4 + react-chartjs-2 5, axios 1, dayjs 1, mapbox-gl 3, @fullcalendar 6, exceljs 4. Una consulta por patrón concreto, no por librería |

---

## 2. Perfiles de spec

Una spec puede tener **varios perfiles**. Se detectan con tres fuentes:

- la carpeta de la spec;
- la línea `**Área afectada:**` de la cabecera;
- un `grep` sobre la spec (`grep -niE "<palabras>" specs/<modulo>/NN-slug.md`).

| Perfil | Carpeta / área | Palabras en la spec |
|---|---|---|
| `UI-PUBLICA` | `home-ergo`, `servicio-cart-flow`, `certificados` (`src/Certificados/`), `src/routes/routes.ts`, `src/Home/`, `src/Servicios/` | portada, landing, visitante, público, comercial |
| `UI-PRODUCTO` | `chequeo-cardiovascular`, `chequeo-administrador`, `src/Chequeo/`, `carrito-compra`, `ficha-clinica`, `pagos-mensual`, `Estadisticas`, `EmergenciaDeportivas`, `User`, `AgendarHora` | tab, tabla, panel, mantenedor, formulario, filtro |
| `GRAFICOS` | `Estadisticas`, Home de `chequeo-cardiovascular` | `chart`, gráfico, estadística, serie, pirámide, barra, torta |
| `CONTRATO` | `services/`, interfaz de Capa 1 (`api.interface.ts`) | endpoint, `POST`, `GET`, `{API}`, sobre, contrato, «Depende de: SPEC NN del back» |
| `SENSIBLE` | `src/Login/`, `src/LoginGoogle/`, `src/common/context/login/`, `AgendarHora` (WebPay) | sesión, `localStorage`, contraseña, token, pago, WebPay, RUT, correo, teléfono, `html:`, carga de archivo, URL firmada, Ley 21.719 |
| `TRANSVERSAL` | `src/common/`, `src/routes/`, `src/components/`, más de un módulo en «Área afectada» | `ApiAdapter`, `LoginContext`, navegador, perfil, modelo |
| `CLINICO` | `hooks/useCalculoIMC*`, escalas de `ficha-clinica`, `colorClinico` | IMC, percentil, umbral, escala, diagnóstico, color clínico |
| `FIGMA` | — | `figma.com` |

**El `grep` es una pista, no un veredicto.** Con cada coincidencia, lee la línea y decide:

- **`SENSIBLE`**: en este dominio casi todas las specs nombran el RUT, así que una mención de
  `rut_paciente` como clave **no basta**. Se activa cuando la spec **cambia cómo se guarda, se envía,
  se muestra o se expone** un dato personal o de sesión. Por ejemplo:
  - una clave nueva en `localStorage`;
  - enmascarado o desenmascarado de datos;
  - un `html:` de Swal;
  - una URL firmada;
  - un pago;
  - el login.
- **`CLINICO`**: se activa si la spec **toca o roza** la lógica clínica. Una mención en «No entra»
  basta para declararlo como restricción.
- **`GRAFICOS`**: se activa si la spec crea o cambia un gráfico, no si solo lo menciona.

En la tabla del kit, cada perfil lleva la línea de la spec que lo justifica.

`CLINICO` **no añade skills**: añade una restricción. La lógica clínica no se toca, porque cambiarla es una
decisión médica que va en su propia spec. El diseño lo declara fuera de alcance, la implementación no
modifica esos archivos y la verificación lo comprueba con `git diff --stat` sobre ellos.

---

## 3. Matriz perfil × fase

### 3.1 Módulo → skill propia y agente dueño

| Módulo | Skill del módulo | Agente revisor (cierre de impl y Fase 2b de verify) |
|---|---|---|
| `src/Login/` | `ergo-login` | `ergo-login` |
| `src/Chequeo/` (perfiles `Medicos`, `Usuario`) | `ergo-chequeo` | `ergo-chequeo` |
| `src/chequeo-cardiovascular/` (perfil `Colegios`) | `ergo-chequeo-cardiovascular` | `ergo-chequeo-cardiovascular` |
| `src/common/` | `ergo-common` | `ergo-common` |
| `chequeo-administrador`, `ficha-clinica`, `home-ergo`, `carrito-compra`, `servicio-cart-flow`, `Certificados` | — (su guía `CLAUDE_<MODULO>.md`) | `ergosanitas-developer` + la guía |
| `src/routes/`, varios módulos, el modelo de dominio | — | `ergosanitas-architect` (además del developer) |
| Cualquier otro | — | `ergosanitas-developer` |

### 3.2 Qué carga cada perfil en cada fase

| Perfil | Diseñar (`/spec-ergo-front`) | Implementar (`/spec-impl-ergo-front`) | Verificar (`/spec-verify-ergo-front`) |
|---|---|---|---|
| **Siempre** | Técnica de `brainstorming` (§4.1) y *builder check* al guardar · skill del módulo (solo lectura) · graphify · engram · Context7 si la spec depende de una API de librería | `ergo-code` + skill del módulo **antes del primer `.ts/.tsx`** · `vercel-react-best-practices` con el filtro §4.3 · graphify antes de leer en cada paso · Context7 antes de usar una API · LSP `findReferences` al cambiar un export (§4.10) · **cierre:** `code-review medium` (§4.7), agente dueño (§3.1), `graphify update .`, `changelog-generator` (§4.9), engram | graphify (Fase 1–2) · Fase 2b con `ergosanitas-developer` + `ergo-code` + `vercel-react-best-practices` filtrada, y el agente dueño · Context7 (Fase 3) · Playwright (Fase 5) · LSP para consumidores · engram |
| `UI-PUBLICA` | `frontend-design` (§4.2): dirección visual, escrita en la spec como decisión | `frontend-design` al escribir componentes visibles | `frontend-design` para auditar las capturas de la Fase 5 (Fase 3b) |
| `UI-PRODUCTO` | `interface-design` (§4.2): jerarquía, densidad, estados (vacío, carga, error) | `interface-design` al escribir componentes visibles | `interface-design` para auditar las capturas (Fase 3b) |
| `GRAFICOS` | `dataviz` (§4.4) | `dataviz` antes del primer gráfico | `dataviz` en la revisión del developer (2b) y en la auditoría de capturas |
| `CONTRATO` | Spec hermana del back y contrato copiado del código real · `ergo-contrato-api` (raíz, se lee por ruta) · `api-design-principles` solo si el endpoint aún no existe (§4.6) | `error-handling-patterns` (§4.5) | Playwright `browser_network_requests` contra el contrato de la spec |
| `SENSIBLE` | La spec declara qué dato personal toca y cómo cumple la Ley 21.719 (enmascarado, nada en `localStorage` salvo lo que la guía permita) | **Cierre:** `security-review` (§4.8) | `security-review` (Fase 3b) · Playwright `browser_evaluate` sobre `localStorage` |
| `TRANSVERSAL` | Consulta a `ergosanitas-architect` | LSP `findReferences` obligatorio · `ergo-common` si toca `src/common/` · **cierre:** `ergosanitas-architect` | `ergosanitas-architect` en 2b |
| `CLINICO` | Fuera de alcance, declarado en la spec | No se modifican esos archivos | `git diff --stat` vacío sobre la lógica clínica |
| `FIGMA` | `figma:figma-design-to-code` solo para **leer** el diseño (§4.11) | `figma:figma-design-to-code` para traducirlo a MUI 5 | Captura de Playwright frente al frame |

---

## 4. Adaptadores: cómo se usa cada skill externa en este repo

Las skills externas se escribieron para otros proyectos. Se usan **a través de** estos adaptadores.

### 4.1 `brainstorming` (`.agents/skills/brainstorming/`, de `obra/superpowers`)

**Se usa su técnica, no su flujo.** Lo que sí se usa:

- **Leer antes de preguntar**: nunca preguntar lo que el código, la guía o la spec hermana ya responden.
- **Una pregunta a la vez**, concreta, en los términos del usuario. Si el «por qué» no está claro,
  primero una pregunta abierta, sin opciones.
- **Mensaje de enfoques** antes de redactar el plan de la spec: 2–3 formas reales de construirlo,
  ancladas en lo que el módulo ya hace, con lo que cede cada una y una recomendación. El usuario elige,
  y la elección se anota en la sección de decisiones de la spec.
- ***Builder check*** al guardar. Se lanza un subagente `general-purpose` con el prompt de
  `.agents/skills/brainstorming/builder-check-prompt.md` y estos valores:
  - `[DOMAIN]` = «desarrollador senior de React 18 + TypeScript + MUI 5 que implementará esta spec
    con /spec-impl-ergo-front y no puede hablar con su autor»;
  - `[DOCUMENT_PATH]` = la spec, más `CLAUDE.md` y la guía del módulo.

  Sus dudas se reparten en tres grupos:
  - **ya respondidas**: la respuesta se escribe en la spec;
  - **menores**: se resuelven y se marcan «decisión del diseñador»;
  - **del usuario**: van al bloque de preguntas.

  Si no hay herramienta `Agent` (subagente), lees la spec tú, con esa mirada.

Lo que **no** se usa:

- su ruta `docs/superpowers/specs/`: la spec va en `specs/<modulo>/NN-slug.md`;
- la llamada a `superpowers:writing-plans`: el plan es la sección del plan de `/spec`;
- su *hard-gate*: aquí manda el estado `Aprobado` de `/spec-impl`;
- su *visual companion*: abre un servidor local, y solo se usa si el usuario lo pide.

### 4.2 `frontend-design` y `interface-design` (`.agents/skills/`)

Reparto: `frontend-design` es para UI **pública y comercial**, e `interface-design` para UI **de
producto** (paneles, tablas, mantenedores). Nunca las dos sobre la misma pantalla.

Siempre dentro del stack y de las reglas del repo:

- **MUI 5 + `sx`.** Nada de CSS-in-JS nuevo, Tailwind ni librerías de componentes nuevas.
- **La paleta sale de la configuración del módulo** (`config/tema.ts`, donde exista). Un color o una
  tipografía nueva **es una decisión de la spec**, no del implementador. Las fuentes entran por
  `index.html` (fuera del módulo), así que una fuente nueva va en «Área afectada».
- Respetan las decisiones de cada guía, entre ellas:
  - en `Certificados`, sin colores fijos ni `fontFamily` propia: botones del tema;
  - color clínico **por etiqueta**, nunca por posición;
  - `contain` en promociones y videos verticales;
  - `preload="none"` y nada de `autoplay`;
  - `—` para los datos ausentes.
- Accesibilidad: foco visible, contraste, `TablaAccesible` en los gráficos donde la guía la exige.
- `interface-design` sugiere renderizar especímenes en un widget. En Claude Code no lo hay: se describe
  en la spec y se valida con las capturas de Playwright en la verificación.
- En **diseño**, su resultado es un texto breve en la spec: intención, foco de la pantalla,
  densidad, estados y lo que se descarta. En **implementación** guía los componentes. En
  **verificación** solo produce **observaciones** con severidad, que nunca marcan ni desmarcan
  criterios.

### 4.3 `vercel-react-best-practices` (`.agents/skills/`, de `vercel-labs/agent-skills`)

El repo es **React 18 + Vite, SPA, sin servidor**. Antes de aplicar una regla, comprueba que esté en la
lista de las que aplican.

| Aplican | No aplican (y por qué) |
|---|---|
| `async-parallel`, `async-defer-await`, `async-cheap-condition-before-await` | Todas las `server-*`, `async-api-routes`, `async-suspense-boundaries`, `rendering-hydration-*`: no hay SSR ni RSC |
| `bundle-conditional`, `bundle-preload`, `bundle-defer-third-party`; `bundle-dynamic-imports` **como `React.lazy`** (no `next/dynamic`) | `client-swr-dedup`: choca con «sin react-query/SWR/Redux» (`CLAUDE.md`) |
| `client-event-listeners`, `client-passive-event-listeners`, `client-localstorage-schema` | `rendering-activity`, `advanced-effect-event-deps`: son de React 19 |
| Todas las `rerender-*` (en especial `rerender-no-inline-components`, `rerender-derived-state-no-effect`, `rerender-dependencies`) | `bundle-barrel-imports`: los barriles `index.ts` son convención del repo. Solo se respeta la excepción documentada (`src/routes/` importa de `pages/` para no perder el chunk lazy) |
| `rendering-conditional-render`, `rendering-content-visibility`, `rendering-hoist-jsx`, `rendering-svg-precision`, `rendering-usetransition-loading` | — |
| Todas las `js-*` | — |

Una regla que aplica se cita por su id (`rerender-dependencies`) en el hallazgo o en el comentario
del paso. El detalle está en `.agents/skills/vercel-react-best-practices/rules/<id>.md`.

### 4.4 `dataviz` (skill de usuario)

Colores desde `config/tema.ts` (`COLORES` clínicos frente a `UI`), nunca con la paleta de la skill.
Color clínico por etiqueta (`colorClinico`). Cada gráfico mantiene su `TablaAccesible`. Chart.js 4 con
registro de componentes. Si la skill no está instalada, se dice y se sigue con la guía del módulo.

### 4.5 `error-handling-patterns` (skill de usuario)

Solo dentro del patrón del repo: `try/catch` + `Swal` en el llamador, y `Array.isArray(response?.data)`
donde el back devuelve 200 con sobres de error. Si la guía del módulo dice otra cosa, gana la guía:
`Certificados`, por ejemplo, muestra los errores **en línea, sin SweetAlert**. Distinguir «servicio no disponible» de «sin datos».
**No** se añaden interceptores, reintentos ni manejo global en `src/common/api/` sin una spec propia.

### 4.6 `api-design-principles` (skill de usuario)

Solo en **diseño**, y solo cuando el endpoint aún no existe y la spec propone su forma provisional.
Si el endpoint existe, el contrato se copia del código del back, **nunca** se «mejora» desde el front.
Los siete sobres conviven y no se unifican desde aquí.

### 4.7 `code-review` (skill integrada de Claude Code)

En el cierre de `/spec-impl-ergo-front`, sobre el diff sin commitear:
`Skill(skill: "code-review", args: "medium")`. **Nunca** `max` ni `ultra` (lo dice su propia
descripción: solo si el usuario lo pide). Los hallazgos se verifican en la línea citada. Se corrige lo
que está **dentro de «Área afectada»**. Lo que contradice la guía del módulo se descarta y se dice.

### 4.8 `security-review` (skill integrada)

Para specs `SENSIBLE`: en el cierre de impl, sobre el diff, y en la Fase 3b de verify, sobre los
archivos de la spec. Es **local**. Mira en especial:

- credenciales o datos personales en `localStorage` o en logs;
- `html:` de Swal sin escapar;
- URLs firmadas expuestas;
- validación de RUT y correo;
- nada de `.env` en el código.

### 4.9 `changelog-generator` (`.agents/skills/`, de `composiohq/awesome-claude-skills`)

En el cierre de impl, a partir de la spec y del diff (aún no hay commits). Se escribe en español, en
lenguaje de usuario final: qué cambia para un colegio, un médico o un visitante, nunca nombres de
archivos.

- **Si existe `CHANGELOG.md`** en la raíz del repo, se añade la entrada bajo `## [Sin publicar]`.
- **Si no existe, no se crea**: la entrada va en el informe final.

Junto a ella, el **mensaje de commit propuesto**, con prefijo `feat` (bump minor en la CI) o `fix`.
El commit no se hace sin pedirlo.

### 4.10 LSP (`LSP`, plugin `typescript-lsp`)

Para todo símbolo **exportado** que la spec cree, cambie o renombre (tipos, hooks, servicios, barriles):
`findReferences` antes y después del cambio. Complementa a `graphify explain`. Sin LSP disponible:
`grep -rn "<símbolo>" src/`, y se dice.

### 4.11 `figma:figma-design-to-code` (plugin)

Solo si la spec cita un enlace de `figma.com` y el MCP de Figma está autenticado. Se traduce a MUI 5
+ `sx` + `tema.ts` del módulo, nunca a los estilos que genere Figma tal cual.

---

## 5. MCP: carga en un solo `ToolSearch` por comando

| Comando | `ToolSearch` (query `select:` exacta) |
|---|---|
| `/spec-ergo-front` | `select:mcp__graphify__query_graph,mcp__graphify__get_neighbors,mcp__graphify__shortest_path,mcp__context7__resolve-library-id,mcp__context7__query-docs,mcp__engram__mem_search,mcp__engram__mem_get_observation,mcp__engram__mem_save` |
| `/spec-impl-ergo-front` | Lo anterior + `LSP` |
| `/spec-verify-ergo-front` | Lo anterior + `LSP` + `mcp__playwright__browser_navigate,mcp__playwright__browser_snapshot,mcp__playwright__browser_click,mcp__playwright__browser_type,mcp__playwright__browser_press_key,mcp__playwright__browser_wait_for,mcp__playwright__browser_resize,mcp__playwright__browser_take_screenshot,mcp__playwright__browser_network_requests,mcp__playwright__browser_console_messages,mcp__playwright__browser_evaluate,mcp__playwright__browser_close` |

graphify se usa **preferentemente por su CLI** (`graphify query|explain|path|update`). El MCP es la
alternativa si la CLI no está en el `PATH`.

| Falta | Qué pasa |
|---|---|
| `graphify-out/graph.json` | `graphify update .` (AST, sin coste) y se dice |
| `context7` | Sin consulta de librerías: «no ejecutada» en el informe |
| `engram` | Sin memoria entre sesiones: se dice y se sigue |
| `LSP` | `grep` en su lugar, y se dice |
| `playwright` | Criterios de UI en `⏸ (Playwright no disponible)` |
| Una skill del kit | ❌ en la tabla del kit; la fase que dependía de ella queda «no ejecutada» |

---

## 6. Excluidos a propósito

| Pieza | Motivo |
|---|---|
| `claude-in-chrome` | Actúa en el Chrome real del usuario, con sus sesiones: riesgo de producción y de datos reales de pacientes (Ley 21.719). Para la UI se usa Playwright, solo contra local |
| Snyk (MCP) | Sube el código a un servicio externo. Para seguridad se usa `security-review`, que es local. Se puede correr a mano si una persona lo decide |
| `mysql-server` (MCP) | Es del back y lee producción |
| `product-management:write-spec`, `superpowers:writing-plans` | Chocan con `/spec` y `/spec-impl` |
| `engineering:testing-strategy`, cualquier comando de test | El repo no tiene runner de tests: no se inventan |
| `brainstorming` → *visual companion* | Levanta un servidor; solo si el usuario lo pide |

Las skills de usuario (`dataviz`, `api-design-principles`, `error-handling-patterns`) y las integradas
(`code-review`, `security-review`) **no viajan con el repo**. Si no aparecen en la lista de skills, se
marca ❌ y se sigue. Las cinco importadas (`brainstorming`, `frontend-design`, `interface-design`,
`vercel-react-best-practices`, `changelog-generator`) sí viajan: están en `.agents/skills/` y en
`skills-lock.json`. Se reinstalan con `npx skills@latest add <origen>`.

---

## 7. Formato del bloque «Kit de ejecución»

`/spec-ergo-front` lo **escribe en la spec**, al final y antes de «Estado de verificación» si existe.
Los otros dos comandos lo **imprimen** al arrancar, con la columna «Estado».

```markdown
## Kit de ejecución

> Perfiles: `UI-PUBLICA` · `CONTRATO` · `SENSIBLE` — calculado el AAAA-MM-DD por `/spec-ergo-front`
> Módulo: `src/<carpeta>/` · guía `CLAUDE_<MODULO>.md` · agente dueño `<agente | ergosanitas-developer + guía>`
> Fuente: `.claude/MATRIZ-HERRAMIENTAS.md`

| Fase | Skills | Agentes | MCP |
|---|---|---|---|
| Diseñar | brainstorming (técnica), frontend-design, … | ergosanitas-architect (si hay duda de módulo) | graphify, context7, engram |
| Implementar | ergo-code, vercel-react-best-practices (filtro §4.3), frontend-design, error-handling-patterns · cierre: code-review, security-review, changelog-generator | <dueño> en el cierre | graphify, context7, engram, LSP |
| Verificar | ergo-code + vercel (2b), frontend-design (auditoría de capturas), security-review | ergosanitas-developer + <dueño> (2b) | graphify, context7, playwright, engram, LSP |

**Por qué:** <una línea por perfil con la señal que lo activó>
**Restricciones:** <CLINICO u otras: qué no se toca>
```

Al imprimirlo en impl o verify se añade una columna **Estado** por fila: ✅ cargado, ❌ ausente (con
el motivo) o — no aplica.

---

## 8. Quién usa qué (vista inversa)

La misma información del §3, leída desde cada pieza: quién la carga, en qué fase y con qué condición.
`D` = `/spec-ergo-front`, `I` = `/spec-impl-ergo-front`, `V` = `/spec-verify-ergo-front` (skill o
agente).

### 8.1 Comandos y documentos del flujo

| Pieza | Qué es | La usan | Relación |
|---|---|---|---|
| `spec-ergo-front` | Skill propia, manual | La persona; `ergo-father` (la lee) | Envuelve `spec`. Escribe `## Kit de ejecución` en la spec |
| `spec-impl-ergo-front` | Skill propia, manual | La persona; `ergo-father` (la lee) | Envuelve `spec-impl`. Lee el kit de la spec y cierra con revisión y changelog |
| `spec-verify-ergo-front` | Skill propia, manual | La persona; el agente homónimo; `ergo-father` | Lee el kit y deja evidencia por criterio. Solo escribe en `specs/` |
| `spec`, `spec-impl` | Importadas (`Klerith/fernando-skills`), manuales | `D` y `I` las invocan | Flujo genérico de fases; las envolturas le añaden el repo |
| Matriz (este archivo) | Documento | `D`, `I`, `V`, agente verificador, `ergo-father` | Fuente única del kit |
| `CLAUDE_<MODULO>.md` | Guía de módulo | Las tres fases y todos los revisores | **Manda** sobre todo el kit |
| `## Kit de ejecución` (en cada spec) | Sección de la spec | La escribe `D`; la leen `I` y `V` | Es el kit «congelado» de esa spec; el §2 se recalcula igual |

### 8.2 Skills

| Skill | Tipo | D | I | V | Condición |
|---|---|---|---|---|---|
| `ergo-code` | Propia | — | ✅ antes del primer `.ts/.tsx`; revisores del cierre | ✅ 2b | Siempre |
| `ergo-login` · `ergo-chequeo` · `ergo-chequeo-cardiovascular` · `ergo-common` | Propias | Lectura (lo intocable) | ✅ antes del primer paso; su agente en el cierre | ✅ 2b por su agente | La spec toca su módulo |
| `graphify` | Propia (instalador) | ✅ | ✅ cada paso + `update` al cerrar | ✅ Fases 1–2 | Siempre |
| `context7-mcp` | Propia (instalador) | Si hay API de librería | Antes de usar una API | ✅ Fase 3 | La spec usa una librería |
| `brainstorming` | Importada | ✅ técnica + *builder check* | — | — | Siempre en diseño |
| `frontend-design` | Importada | ✅ dirección visual | ✅ componentes | ✅ 2b + 5b | `UI-PUBLICA` |
| `interface-design` | Importada | ✅ dirección visual | ✅ componentes | ✅ 2b + 5b | `UI-PRODUCTO` |
| `vercel-react-best-practices` | Importada | — | ✅ filtro §4.3 | ✅ 2b | Siempre (filtrada) |
| `changelog-generator` | Importada | — | ✅ cierre 2.6 | — | Siempre al cerrar |
| `dataviz` | Usuario | ✅ | ✅ | ✅ 2b + 5b | `GRAFICOS` |
| `api-design-principles` | Usuario | ✅ | — | — | `CONTRATO` con endpoint inexistente |
| `error-handling-patterns` | Usuario | — | ✅ | — | `CONTRATO` |
| `code-review` | Integrada | — | ✅ cierre 2.2b (`medium`) | — | Siempre al cerrar |
| `security-review` | Integrada | — | ✅ cierre 2.2c | ✅ 3b | `SENSIBLE` |
| `figma:figma-design-to-code` | Plugin | ✅ leer | ✅ traducir | — | `FIGMA` |
| `ergo-contrato-api` | Raíz (se lee por ruta) | ✅ | — | — | `CONTRATO` |

### 8.3 Agentes

| Agente | D | I (cierre 2.3) | V (Fase 2b) | Condición |
|---|---|---|---|---|
| `ergosanitas-developer` | — | ✅ con `ergo-code` + guía | ✅ siempre, con `ergo-code` + `vercel` filtrada | Módulos sin agente propio; siempre en 2b |
| `ergosanitas-architect` | Consulta si hay duda de módulo | ✅ | ✅ | `TRANSVERSAL` |
| `ergo-login` · `ergo-chequeo` · `ergo-chequeo-cardiovascular` · `ergo-common` | — | ✅ corrigen en su perímetro | ✅ solo lectura | La spec toca su módulo |
| `spec-verify-ergo-front` | — | — | Es el verificador | Delegación de `V` |
| *Builder check* (`general-purpose`) | ✅ al guardar | — | — | Siempre en diseño |

Los revisores reciben en su prompt **las skills del kit que les tocan** (las de diseño, `dataviz` o
`vercel` filtrada) y las cargan además de la suya.

### 8.4 MCP y herramientas

| Pieza | D | I | V | Alcance |
|---|---|---|---|---|
| graphify | ✅ | ✅ | ✅ | Proyecto (`.mcp.json`) + CLI |
| context7 | ✅ | ✅ | ✅ | Proyecto (`.mcp.json`) |
| engram | `mem_search` | `mem_search` + `mem_save` | `mem_search` + `mem_save` | Usuario |
| LSP (`typescript-lsp`) | — | ✅ `findReferences` | ✅ consumidores | Plugin, local |
| playwright | — | — | ✅ Fase 5 (solo local) | Proyecto (`.mcp.json`) |
| Excluidos | `claude-in-chrome`, Snyk, `mysql-server` | | | Ver §6 |

---

## 9. Mantener la matriz

**Agregar una pieza al kit:**

1. Si es una skill importada: `npx skills@latest add <origen>`. Comprueba que entró en
   `skills-lock.json` y en `.agents/skills/`, y que `.claude/skills/<nombre>` es un enlace a ella.
2. En esta matriz:
   - el perfil que la activa (§2) y la fase donde entra (§3.2);
   - su adaptador (§4), si fue escrita para otro stack, y su fila en §0b si es invocable por el
     modelo;
   - su fila en §8;
   - su lugar en la query de `ToolSearch` (§5), si es un MCP.
3. La tabla de skills de `CLAUDE.md` (y, si cambia la relación, el diagrama del flujo).
4. README §11.6 (skills) o §11.3 (MCP), y §11.11 (relaciones).
5. `D:/ErgoSanitas/Projectos/.claude/skills/ergo-father/SKILL.md` §3 (y §2 si es un agente).

**Quitar una pieza:** el mismo recorrido, al revés. Las specs que la nombren en su
`## Kit de ejecución` se corrigen con `/spec-ergo-front <spec>` (modo revisión).

**No se editan las skills importadas** (`spec`, `spec-impl`, `brainstorming`, `frontend-design`,
`interface-design`, `vercel-react-best-practices`, `changelog-generator`), ni las que gestiona su
instalador (`graphify`, `context7-mcp`):

- cambiarlas rompe el hash de `skills-lock.json`;
- el próximo `npx skills@latest add` las pisa.

Todo lo que haya que adaptar va en el §4 de esta matriz.

**Las tres skills de spec no repiten la matriz**: la citan por sección (`§4.3`, `§5`…). Si renumeras
una sección, busca sus referencias con
`grep -rn "§<N>" .claude/skills/spec-*-ergo-front .claude/agents/spec-verify-ergo-front.md`.
