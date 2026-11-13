---
name: spec-impl-ergo-front
description: "Implementa una spec aprobada de Ergosanitas. Delega el flujo completo en /spec-impl (validación del estado, rama, implementación por pasos) con el kit de ejecución de la spec cargado automáticamente según .claude/MATRIZ-HERRAMIENTAS.md (ergo-code, skill del módulo, vercel-react-best-practices, frontend-design / interface-design, dataviz, error-handling-patterns, graphify, Context7, LSP, engram) y al terminar ejecuta el cierre propio del proyecto: build + eslint, code-review, security-review si la spec es sensible, revisión por el agente dueño de cada módulo tocado, criterios de aceptación, documentación y changelog. Es el segundo eslabón: parte del «## Kit de ejecución» que dejó /spec-ergo-front (o lo deriva de la matriz) y termina recomendando /spec-verify-ergo-front."
disable-model-invocation: true
argument-hint: <NN-slug de la spec, ej. 03-imagen-ampliable>
---

# /spec-impl-ergo-front — implementador de specs con cierre Ergosanitas

Este comando **no reimplementa** el flujo de `/spec-impl`: lo invoca tal cual, le carga el kit de
herramientas que corresponde a la spec y le añade una fase de cierre con los agentes y skills de
este proyecto.

```
/spec-impl-ergo-front  =  /spec-impl  +  Kit de la spec (Fase 0)  +  Fase de cierre Ergosanitas
```

Responde y escribe siempre en español.

---

## Contexto de sesión

Estado del repositorio:
!`git status --short`

Rama actual:
!`git branch --show-current`

Specs disponibles:
!`ls specs/*/ 2>/dev/null || echo "No existe la carpeta specs/"`

---

## Si te ejecuta `ergo-father` desde `D:\ErgoSanitas\Projectos`

El super agente `ergo-father` sigue esta skill leyendo este archivo (no puede invocarla con
`Skill`: tiene `disable-model-invocation`). En ese caso el directorio actual **no es este repo**,
así que el «Contexto de sesión» de arriba no se evaluó y `Skill("spec-impl")` puede no
encontrarse. Entonces:

- Ejecuta a mano: `git -C "D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app" status --short`,
  `git -C … branch --show-current` y lista `Front-end/ergosanitas-app/specs/*/`.
- Lee `Front-end/ergosanitas-app/.agents/skills/spec-impl/SKILL.md` (la copia de
  `.claude/skills/spec-impl/` es un enlace que en Windows queda vacío) y sigue sus cuatro fases tal
  cual, usando `git -C <repo>` para git y rutas absolutas para leer y editar.
- `npm run build` y `npx eslint` se corren con `cd "D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app" && …`.
- Los agentes de la tabla 2.3 no son `subagent_type` desde la raíz: se lanzan con la plantilla de
  la skill `ergo-father` §5 (general-purpose que adopta `.claude/agents/<nombre>.md`). En su prompt
  van también las skills del kit que les tocan (2.3).
- El kit (Fase 0) se lee de
  `D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app/.claude/MATRIZ-HERRAMIENTAS.md`. Si `Skill`
  no encuentra una skill del kit desde la raíz, **léela** por ruta:
  - las importadas, en `Front-end/ergosanitas-app/.agents/skills/<nombre>/SKILL.md`;
  - las propias, en `Front-end/ergosanitas-app/.claude/skills/<nombre>/SKILL.md`.

  `graphify` se corre con `cd "D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app" && graphify …`.
- Todo lo demás (bloqueo por estado, pausas por paso, cierre Ergosanitas, nada de commits) se
  aplica **igual**.

---

## Fase 0 — Kit de ejecución (automático)

Se arma **después** de que `/spec-impl` identifique la spec y valide que está `Aprobado` (sus fases
1–2). Si la spec queda bloqueada por estado, no se carga nada. **No pidas confirmación**: imprime la
tabla y úsala.

1. **Lee `.claude/MATRIZ-HERRAMIENTAS.md`**: perfiles (§2), columna *Implementar* (§3.2),
   adaptadores (§4) y MCP (§5).
2. **Toma el kit de la spec** (sección `## Kit de ejecución`) y recalcula los perfiles con el §2.
   - Si la spec no tiene kit (es anterior a la matriz), **derívalo** y dilo.
   - Si el recálculo discrepa del kit guardado, manda el recálculo; lo anotas para el informe.
3. **Carga los MCP en un solo `ToolSearch`**, con la query de `/spec-impl-ergo-front` del §5 de la
   matriz (graphify, Context7, engram y `LSP`).
4. **`mem_search`** (engram) con el módulo y el slug, para recuperar trampas o decisiones de sesiones
   anteriores.
5. **Antes del primer paso**, invoca con `Skill`, en este orden:
   1. `ergo-code` (siempre);
   2. la skill del módulo, si existe (`ergo-login`, `ergo-chequeo`, `ergo-chequeo-cardiovascular`,
      `ergo-common`), y si no, lee la guía `specs/<modulo>/CLAUDE_<MODULO>.md`;
   3. `vercel-react-best-practices`, aplicando **solo** las reglas del filtro §4.3 (React 18 + Vite
      SPA: nada de `server-*`, SWR ni React 19);
   4. según el perfil: `frontend-design` (`UI-PUBLICA`), `interface-design` (`UI-PRODUCTO`),
      `dataviz` (`GRAFICOS`), `error-handling-patterns` (`CONTRATO`) y `figma:figma-design-to-code`
      (`FIGMA`).
6. **Imprime la tabla del kit** (§7 de la matriz, con columna «Estado»). Lo que falte se marca ❌ y
   se sigue (§5 de la matriz).

Las skills se aplican **a través de su adaptador** (§4 de la matriz). Si una choca con la guía del
módulo o con `CLAUDE.md`, gana la guía: por ejemplo, `vercel` sugiere SWR y aquí está prohibido.

---

## Fase 1 — Delegar en /spec-impl

**Invoca la skill `spec-impl` pasándole el argumento recibido tal cual:**

```
Skill(skill: "spec-impl", args: "$ARGUMENTS")
```

Y a partir de ahí **sigue sus cuatro fases al pie de la letra**, sin alterarlas:

1. Identificar la spec.
2. Validar que el estado significa **Aprobado** — si es `Borrador`, `En revisión`,
   `Implementado` u `Obsoleto`, **se detiene ahí y este comando también termina**. No inventes
   una vía alternativa: el bloqueo es intencional y el cambio a `Aprobado` lo hace el humano.
3. Crear la rama `spec-NN-slug` y mostrar el resumen de la spec.
4. Implementar paso a paso, **con pausa y confirmación del usuario después de cada paso**.

**Precisiones propias de este repositorio**, que la skill genérica no conoce:

- **Las specs se agrupan por módulo**, en siete carpetas: `specs/ficha-clinica/`,
  `specs/home-ergo/`, `specs/chequeo-cardiovascular/`, `specs/chequeo-administrador/`,
  `specs/carrito-compra/`, `specs/servicio-cart-flow/` y `specs/certificados/`.
  - La numeración es correlativa **dentro de cada carpeta**, así que hay siete specs `01`
    distintas.
  - Si el argumento es ambiguo (solo un número, o un slug que aparece en dos carpetas), **muestra
    las coincidencias y pregunta cuál es**, indicando el módulo. No elijas por tu cuenta.
- **Entre la validación del estado y el primer paso, corre la Fase 0 (kit).** Implementar sin
  `ergo-code` ni la skill del módulo obliga a rehacer trabajo en la Fase 2.
- **En cada paso del plan**, además de lo que pide `/spec-impl`:
  - **antes de leer código**: `graphify query` / `graphify explain` para ubicar archivos y líneas;
    se lee solo lo que el grafo señaló;
  - **antes de usar una API de librería** que el paso no haya usado aún (un prop de MUI 5, un
    resolver de yup, una opción de chart.js 4): Context7 con la versión de `package.json`;
  - **al crear, cambiar o renombrar un export**: LSP `findReferences` (o `grep -rn` si no hay LSP)
    para ver a todos sus consumidores **antes** de tocarlo;
  - **al escribir componentes visibles**: la skill de diseño del perfil, dentro de MUI 5 + `sx` y de
    la paleta del módulo. Un color o una fuente que la spec no decidió **no se inventa**: se para y
    se pregunta;
  - **al escribir hooks y componentes**, las reglas aplicables de `vercel-react-best-practices`
    (filtro §4.3). Si una regla cambia una decisión de la spec, se propone corregir la spec, no el
    código por sorpresa;
  - en el resumen de cada paso, una línea `Kit:` con las skills que guiaron el paso.

Cuando `/spec-impl` llegue a su mensaje final ("todos los pasos del plan están implementados"),
**no termines**: continúa con la Fase 2.

---

## Fase 2 — Cierre Ergosanitas

Anuncia el arranque de esta fase para que el usuario sepa que el comando sigue:

```
✅ Implementación terminada. Inicio el cierre Ergosanitas.
```

### 2.1 — Detectar qué se tocó

```bash
git diff --name-only main...HEAD
git status --short
```

Agrupa los archivos por módulo (`src/<modulo>/`). Esa lista manda en los pasos siguientes.

### 2.2 — Verificación mecánica

```bash
npm run build                  # tsc -b && vite build, tiene que salir en verde
npx eslint src/<modulo>/       # una vez por cada módulo tocado, en 0
```

Si algo falla, **arréglalo antes de seguir** y muestra el error real, no un resumen de memoria.
No hay tests en este proyecto: **nunca inventes un comando de test**.

### 2.2b — Revisión de corrección (`code-review`)

Sobre el diff sin commitear, `Skill(skill: "code-review", args: "medium")`. Nunca `max` ni `ultra`:
esos niveles solo se usan si el usuario los pide.

- Verifica cada hallazgo en la línea citada antes de aceptarlo.
- Corrige los que caen **dentro de «Área afectada»** de la spec.
- Los que contradicen la guía del módulo o `CLAUDE.md` se descartan, y se dice cuántos (por ejemplo,
  «añadir react-query» o «unificar el chat clonado»).
- Si una corrección toca algo fuera del perímetro de la spec, **no la apliques**: va a «Pendiente».

Si la skill no está disponible, se dice y se sigue (§5 de la matriz).

### 2.2c — Seguridad (solo perfil `SENSIBLE`)

Si el kit marca `SENSIBLE`, `Skill(skill: "security-review")` sobre el diff. Es local: no sube
código a ningún servicio. Foco (adaptador §4.8):

- datos personales o credenciales en `localStorage` o en logs;
- `html:` de Swal sin escapar;
- URLs firmadas expuestas;
- validación de RUT y correo;
- `.env` o secretos en el código.

Lo bloqueante se corrige antes de seguir. Snyk **no** forma parte del kit (§6 de la matriz).

### 2.3 — Revisión por el agente dueño de cada módulo

Para **cada módulo tocado**, lanza su agente con la herramienta Agent. El mapa es el §3.1 de la
matriz:

| Módulo tocado | `subagent_type` |
|---|---|
| `src/Login/` | `ergo-login` |
| `src/Chequeo/` (perfiles `Medicos`, `Usuario`) | `ergo-chequeo` |
| `src/chequeo-cardiovascular/` (perfil `Colegios`) | `ergo-chequeo-cardiovascular` |
| `src/common/` | `ergo-common` |
| `src/chequeo-administrador/`, `src/ficha-clinica/`, `src/home-ergo/`, `src/carrito-compra/`, `src/servicio-cart-flow/`, `src/Certificados/` | `ergosanitas-developer` (y su guía `specs/<modulo>/CLAUDE_<MODULO>.md`) |
| Cualquier otro módulo | `ergosanitas-developer` |
| Cambios que cruzan varios módulos, tocan `src/routes/` o el modelo de datos (perfil `TRANSVERSAL`) | añade `ergosanitas-architect` |

⚠️ **`ergo-chequeo` y `ergo-chequeo-cardiovascular` son dueños de módulos distintos** y ninguno
puede tocar el del otro.

- `ergo-chequeo` lleva `src/Chequeo/` (perfiles `Medicos` y `Usuario`). El `Administrador` migró a
  `src/chequeo-administrador/`, que lleva `ergosanitas-developer`.
- `ergo-chequeo-cardiovascular` lleva `src/chequeo-cardiovascular/` (perfil `Colegios`).
- El **ruteo** (`routesCOL.tsx`, `NavigationCol.tsx`, `NavigationApp.tsx`, `ChequeoSegunPerfil.tsx`)
  queda fuera de ambos perímetros y lo revisa `ergosanitas-developer`.

**Los agentes de módulo tienen perímetro cerrado** (solo modifican su carpeta), así que son
seguros para esto. Lanza en paralelo los que sean independientes.

Prompt para cada agente. Dale contexto suficiente, porque **arranca en frío**:

> Se acaba de implementar la spec `specs/<modulo>/<NN-slug>.md` en la rama `spec-NN-slug`.
> Archivos tocados en tu módulo: `<lista>`.
> Perfiles de la spec: `<perfiles del kit>`.
> Carga tu skill y además **estas skills del kit**:
> - `ergo-code` y `vercel-react-best-practices`, solo las reglas del filtro §4.3 de
>   `.claude/MATRIZ-HERRAMIENTAS.md`;
> - `<frontend-design | interface-design | dataviz, según el perfil>`.
>
> Usa `graphify query` antes de leer código. Revisa esos cambios y corrige dentro de tu perímetro
> lo que no cumpla las convenciones del módulo. Verifica que no se haya roto nada de lo que tu
> skill marca como intocable, ni las firmas que consumen otros módulos.
> Si una skill externa choca con la guía del módulo, **gana la guía**.
> Informa de lo que corregiste (citando la regla y su fuente) y de lo que haya que arreglar fuera
> de tu perímetro.

Cuando vuelvan, **relata al usuario lo que reportaron** (su informe no se le muestra solo) y
aplica o escala lo que hayan dejado pendiente fuera de su alcance.

### 2.4 — Criterios de aceptación de la spec

Vuelve a abrir la spec y **recorre su checklist de criterios de aceptación uno por uno**.
Para cada uno di si se cumple y **cómo lo comprobaste**. Si algo no se puede verificar sin
levantar la app o sin backend, dilo explícitamente en vez de darlo por bueno.

Recuerda las reglas de verificación manual del proyecto: probar **con el perfil de usuario
afectado**, no solo con Administrador — y si el cambio toca `src/Chequeo/`, revisar los tres
bloques de perfil (`Colegios`, `Medicos`, resto), porque los índices de tab no coinciden.

Según el kit, comprueba además:

- **`CLINICO`**: `git diff --stat` sobre la lógica clínica tiene que salir vacío.
- **`TRANSVERSAL`**: LSP `findReferences` (o `grep -rn`) de cada export cambiado, con todos sus
  consumidores compilando.
- Los criterios de UI no se dan por buenos de memoria: quedan «pendientes de
  `/spec-verify-ergo-front`», que los demuestra con Playwright en local.

### 2.5 — Documentación

1. **Si el módulo tiene guía propia**, actualízala con lo que la spec decidió:
   `CLAUDE_FICHA_CLINICA.md` · `CLAUDE_HOME_ERGO.md` · `CLAUDE_CHEQUEO_CARDIOVASCULAR.md` ·
   `CLAUDE_CHEQUEO_ADMINISTRADOR.md` · `CLAUDE_CARRITO_COMPRA.md` · `CLAUDE_SERVICIO_CART_FLOW.md` ·
   `CLAUDE_CERTIFICADOS.md`, cada una en su `specs/<modulo>/`.
2. **Si la spec cambió el modelo de datos, un endpoint o una convención transversal**,
   actualiza `.claude/ARQUITECTURA.md`; si cambió una regla de estilo o de proyecto, `CLAUDE.md`.
3. **Si aparecieron entidades, trampas o deuda nuevas en un módulo con skill propia**, actualiza
   esa skill (`.claude/skills/ergo-*/SKILL.md`) — o pídeselo a su agente, que es su dueño.
4. **Marca la spec como `Implementado`** solo si todos los criterios de aceptación pasaron. Si
   alguno quedó pendiente, **déjala como está** y di cuál falta.
5. **Si durante la implementación una decisión de la spec resultó equivocada, se corrige en la
   spec**, no en el código a escondidas.
6. **Kit de la spec.** Si la Fase 0 lo derivó o lo recalculó, escribe o corrige la sección
   `## Kit de ejecución` de la spec, para que `/spec-verify-ergo-front` parta de él.
7. **Grafo y memoria.**
   - `graphify update .` (solo AST, sin coste), para que el grafo refleje lo nuevo.
   - `mem_save` (engram, protocolo selectivo del §1 de la matriz) **solo** con lo durable que no
     quedó en la spec ni en la guía: una trampa del entorno, una causa raíz no obvia o una decisión
     del usuario tomada durante los pasos. `topic_key`: `spec-front/<modulo>/<NN-slug>`.

### 2.6 — Changelog y commit

1. **`changelog-generator`** (adaptador §4.9). Invoca la skill y redacta la entrada a partir de la
   spec y del diff (todavía no hay commits).
   - En español y en lenguaje del usuario final: qué cambia para un colegio, un médico o un
     visitante, sin nombres de archivo.
   - Si existe `CHANGELOG.md` en la raíz, añádela bajo `## [Sin publicar]`.
   - Si no existe, **no lo crees**: la entrada va en el informe final.
2. **Mensaje de commit propuesto**, en español, con prefijo `feat` (bump minor en la CI) o `fix`.
3. **No commitees ni hagas push salvo que el usuario te lo pida.** Recuerda que **un push a `main`
   despliega a producción por FTP**, y eso se confirma aparte.

---

## Informe final

Cierra con este resumen, sin adornos:

```
✅ Spec implementada: specs/<modulo>/<NN-slug>.md
   Rama:          spec-NN-slug
   Módulos:       <lista>
   Kit:           perfiles <…> · skills <…> · MCP <…> · ausentes <… o «ninguna»>
   Build:         ✅ / ❌ (+ error real si falló)
   ESLint:        ✅ / ❌ por módulo
   code-review:   N hallazgos · X corregidos · Y descartados (contradicen la guía) · Z pendientes
   Seguridad:     security-review ✅ sin bloqueantes / ❌ <…> / — (spec no sensible)
   Agentes:       <cuáles revisaron, con qué skills del kit, y qué corrigieron>
   Criterios:     N/M verificados  (detalla los que no)
   Documentación: <qué archivos actualizaste> · graphify update ✅ · engram <guardado | nada nuevo>
   Changelog:     <entrada en CHANGELOG.md | entrada abajo>  ·  commit propuesto: «feat: …»
   Estado spec:   Implementado / sigue en Aprobado porque <razón>
   Pendiente:     <lo que quedó fuera y por qué>
   Siguiente:     /spec-verify-ergo-front <NN-slug>  (evidencia por criterio con Playwright en local)
```

Reporta con honestidad: si algo falló o no se pudo verificar, dilo. Un ✅ sin comprobación vale
menos que un ❌ explicado.

---

## Nota sobre dónde viven los agentes y las skills

Todos los agentes y skills de Ergosanitas están **en este repositorio**, no en la carpeta
personal del usuario:

- Agentes → `.claude/agents/` : `ergo-login`, `ergo-chequeo`, `ergo-chequeo-cardiovascular`,
  `ergo-common`, `ergosanitas-developer`, `ergosanitas-architect`, `spec-verify-ergo-front`.
- Skills propias → `.claude/skills/` : `ergo-code`, `ergo-login`, `ergo-chequeo`,
  `ergo-chequeo-cardiovascular`, `ergo-common`, `graphify`, `context7-mcp` y las tres `spec-*-ergo-front`.
- Skills importadas → `.agents/skills/`, enlazadas desde `.claude/skills/` (origen y hash en
  `skills-lock.json`): `spec`, `spec-impl`, `brainstorming`, `frontend-design`, `interface-design`,
  `vercel-react-best-practices`, `changelog-generator`.
- **Qué se usa en cada spec lo decide `.claude/MATRIZ-HERRAMIENTAS.md`**: perfiles, matriz por
  fase, adaptadores y exclusiones. Las skills de usuario o integradas que cita (`dataviz`,
  `error-handling-patterns`, `code-review`, `security-review`) no viajan con el repo: si faltan, se
  marcan ❌ y se sigue.
- Referencia de arquitectura → `.claude/ARQUITECTURA.md`.
