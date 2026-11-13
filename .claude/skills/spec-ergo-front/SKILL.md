---
name: spec-ergo-front
description: "Diseña o revisa una spec del front-end Ergosanitas. Delega el flujo de diseño en /spec (contexto, preguntas, redacción, guardado) y le añade las convenciones del repo — specs agrupadas por módulo en specs/<modulo>/NN-slug.md, guía CLAUDE_<MODULO>.md, contrato copiado del back real y su spec hermana, estados en español, reglas duras del proyecto. Detecta el perfil de la spec y carga solo el kit de ejecución que le corresponde según .claude/MATRIZ-HERRAMIENTAS.md (brainstorming, frontend-design / interface-design, dataviz, ergo-contrato-api, graphify, Context7, engram, agentes), lo deja escrito en la spec y cierra con un builder check. Con una spec existente como argumento entra en modo revisión: verifica hallazgos, contrato, criterios, plan y kit contra el código actual. Nunca escribe código ni aprueba la spec. Primer eslabón: /spec-impl-ergo-front y /spec-verify-ergo-front parten de su «## Kit de ejecución»."
disable-model-invocation: true
argument-hint: <descripción de la feature | ruta o NN-slug de una spec existente>
---

# /spec-ergo-front — diseñador y revisor de specs con convenciones Ergosanitas

Este comando **no reimplementa** el flujo de `/spec`: lo invoca tal cual y le añade el contexto,
las reglas y la verificación propios de este repositorio. Tiene dos modos:

```
/spec-ergo-front <descripción>         =  /spec  +  contexto y reglas Ergosanitas (front)   → spec nueva
/spec-ergo-front <spec existente>      =  modo revisión (Fase R)                            → spec corregida
```

**No escribe código** (nada en `src/`), **no implementa** y **nunca cambia el estado a
`Aprobado`**: eso lo hace el humano. Implementar es `/spec-impl-ergo-front`.

Responde y escribe siempre en español.

---

## Contexto de sesión

Estado del repositorio:
!`git status --short`

Rama actual:
!`git branch --show-current`

Fecha de hoy (úsala en la cabecera, nunca la inventes):
!`date +%F`

Specs disponibles, por módulo:
!`ls specs/*/ 2>/dev/null || echo "No existe la carpeta specs/"`

---

## Si te ejecuta `ergo-father` desde `D:\ErgoSanitas\Projectos`

El super agente `ergo-father` sigue esta skill leyendo este archivo (no puede invocarla con
`Skill`: tiene `disable-model-invocation`). En ese caso el directorio actual **no es este repo**,
así que el «Contexto de sesión» de arriba no se evaluó y `Skill("spec")` puede no encontrarse.
Entonces:

- Ejecuta a mano: `git -C "D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app" status --short`,
  `git -C … branch --show-current`, `date +%F` y lista `Front-end/ergosanitas-app/specs/*/`.
- Lee `Front-end/ergosanitas-app/.agents/skills/spec/SKILL.md` y su `template.md` (la copia de
  `.claude/skills/spec/` es un enlace que en Windows queda vacío) y sigue sus cuatro fases tal
  cual, con rutas absolutas para leer y escribir.
- Si corres como **subagente** no puedes preguntar al usuario: haz todo lo verificable con el
  código, aplica solo las correcciones **factuales** y devuelve las decisiones de producto como
  bloque de preguntas (3–5, con opciones y recomendación) en tu informe. No las inventes.
- El kit (Fase 0.5) se lee de
  `D:/ErgoSanitas/Projectos/Front-end/ergosanitas-app/.claude/MATRIZ-HERRAMIENTAS.md`. Si `Skill`
  no encuentra una skill del kit desde la raíz, **léela** por ruta: las importadas en
  `Front-end/ergosanitas-app/.agents/skills/<nombre>/SKILL.md` y las propias en
  `Front-end/ergosanitas-app/.claude/skills/<nombre>/SKILL.md`. Sin `Agent` (subagente), el
  *builder check* de 1.4 lo haces tú releyendo la spec con la mirada del implementador.
- Todo lo demás (estado `Borrador`, nada de código, nada de commits) se aplica **igual**.

---

## Fase 0 — Elegir el modo

- `$ARGUMENTS` es la ruta de una spec existente (`specs/<modulo>/NN-slug.md`), o un `NN-slug`
  / `<modulo>/NN` que la identifica → **modo revisión**: salta a la **Fase R**.
- `$ARGUMENTS` es una descripción (o viene vacío) → **modo diseño**: Fase 1.
- Ambiguo (solo un número, o un slug que existe en dos carpetas): muestra las coincidencias con
  su módulo y **pregunta**. La numeración es por carpeta: hay varias specs `01`.

---

## Fase 0.5 — Kit de ejecución (automático)

Antes de la primera pregunta, arma el kit de esta spec. **No pidas confirmación**: imprime la tabla
y úsala.

1. **Lee `.claude/MATRIZ-HERRAMIENTAS.md` entera.** Es la fuente única del kit: perfiles (§2), qué
   carga cada perfil en la fase *Diseñar* (§3.2), adaptadores (§4) y exclusiones (§6).
2. **Detecta los perfiles** con las señales del §2:
   - **modo diseño**: de `$ARGUMENTS` y del módulo destino. Si el módulo aún no está claro, arma un
     kit provisional con lo que haya y **recalcúlalo** cuando el usuario lo confirme en el primer
     bloque de preguntas;
   - **modo revisión**: de la spec (`Área afectada`, carpeta, `grep -niE` del §2), comparándolo con
     su sección `## Kit de ejecución` si ya la tiene.
3. **Memoria y mapa**:
   - `mem_search` (engram) con el módulo y el tema, para recuperar decisiones de sesiones anteriores
     que no estén en la guía;
   - `graphify query "<feature> en src/<modulo>/"` para ubicar el código antes de leerlo.
4. **Carga los MCP en un solo `ToolSearch`**, con la query de `/spec-ergo-front` del §5 de la matriz.
5. **Invoca con `Skill`** las skills de diseño que tocan a este perfil (§3.2, columna *Diseñar*):
   - **siempre** `brainstorming`, para usar su técnica según el adaptador §4.1 (no su flujo);
   - `frontend-design` (`UI-PUBLICA`) o `interface-design` (`UI-PRODUCTO`), nunca las dos sobre la
     misma pantalla;
   - `dataviz` (`GRAFICOS`), `api-design-principles` (`CONTRATO` con endpoint inexistente) y
     `figma:figma-design-to-code` (`FIGMA`);
   - la skill propia del módulo (`ergo-*`), **solo para conocer lo intocable**.

   `ergo-contrato-api` vive en la raíz y se **lee por ruta**:
   `D:/ErgoSanitas/Projectos/.claude/skills/ergo-contrato-api/SKILL.md`.
6. **Imprime la tabla** con el formato del §7 de la matriz y una columna «Estado» (✅ / ❌ ausente /
   — no aplica). Lo que falte se dice y se sigue (§5 de la matriz).

Cada skill del kit se aplica **a través de su adaptador** (§4 de la matriz). Si choca con la guía del
módulo o con `CLAUDE.md`, gana la guía.

---

## Fase 1 — Delegar en /spec (modo diseño)

**Invoca la skill `spec` pasándole el argumento recibido tal cual:**

```
Skill(skill: "spec", args: "$ARGUMENTS")
```

Y **sigue sus cuatro fases** (contexto → preguntas → redacción → guardado) con estas precisiones
propias del front, que la skill genérica no conoce:

### 1.1 Contexto antes de la primera pregunta

Antes de preguntar nada, lee — en este orden:

1. `CLAUDE.md` (convenciones y trampas) y `.claude/ARQUITECTURA.md` (las dos claves
   `rut_paciente` / `user_email`, entidades, catálogo de endpoints, patrón de módulo).
2. El **módulo destino**: si no está claro en qué carpeta de `src/` vive la feature, pregúntalo
   en el primer bloque (o consulta al agente `ergosanitas-architect`, que diseña, no implementa).
3. La guía del módulo, si existe, **entera**: `specs/<modulo>/CLAUDE_<MODULO>.md`. Manda sobre la
   skill homónima.
4. Las **dos specs más recientes de esa carpeta** (no de otra): de ahí salen el idioma, los
   encabezados, el formato de cabecera y el estilo de la tabla «lo verificado en el código».
5. La skill del módulo si la tiene (`ergo-login`, `ergo-chequeo`, `ergo-chequeo-cardiovascular`,
   `ergo-common`) — para conocer lo intocable, no para escribir código.
6. Lo que trajo el kit (Fase 0.5): las decisiones previas de engram y el mapa de graphify.

### 1.1b Cómo se conversa (técnica de `brainstorming`, adaptador §4.1 de la matriz)

Las preguntas de la Fase 2 de `/spec` siguen la técnica de `brainstorming`:

- **Nunca preguntes lo que ya responden** el código, la guía o la spec hermana.
- **Una pregunta a la vez**, concreta y anclada en algo que encontraste.
- Si el porqué no está claro, la primera pregunta es abierta y sin opciones.
- Lo que decides tú (rutas, nombres de archivo, dónde va algo) **lo dices como propuesta**; no lo
  preguntas.

Antes de redactar el plan de implementación, manda **un mensaje solo de enfoques**:

- 2–3 formas reales de construirlo, ancladas en lo que el módulo ya hace, con lo que cede cada una;
- tu recomendación y su porqué;
- se descartan los enfoques que rompen las reglas de 1.3 o la guía del módulo.

El elegido y los descartados van a la sección de decisiones de la spec.

Con perfil de UI, la skill de diseño (`frontend-design` o `interface-design`) aporta a la spec un
bloque breve de **dirección visual**: a quién sirve la pantalla, su foco principal, densidad,
estados (vacío, carga, error, sin permiso) y lo que se descarta. Siempre dentro de MUI 5 + `sx` y la
paleta del módulo (adaptador §4.2). Un color o una fuente nueva queda como **decisión explícita** de
la spec.

### 1.2 Si la feature consume un endpoint

- Localiza la **spec hermana del back** en `D:/ErgoSanitas/Projectos/Back-end/ergosanitas-app/specs/`
  y anota su **estado**. Si está en `Borrador`/`En revisión`, la spec del front depende de algo
  que aún puede cambiar: dilo en la cabecera.
- Copia el **contrato real** —ruta, método, body, sobre de éxito, códigos y sobre de error— desde
  el código del back (`routes/api.php`, el controlador) y `docs/openapi.yaml`. **Nunca de
  memoria** ni del `CLAUDE.md`: conviven siete sobres distintos en la API.
- Si el endpoint aún no existe, la spec lo declara como dependencia («Depende de: SPEC NN del
  back») y propone su forma, marcada como provisional.
- Mira si `ApiAdapter.get` sirve (inyecta `limit`/`offset`) o hace falta `getToken`.

### 1.3 Reglas que el diseño debe respetar (si una pregunta lleva a romperlas, avísalo)

- **Aislamiento del módulo**: solo se importa de `src/common/`; lo que haga falta de otro módulo
  se clona. Si la feature exige tocar algo fuera, enuméralo en «Área afectada».
- **Contenido de negocio en JSON** (`config/*.json`), no en `.tsx`.
- **`number | null`** para numéricos ausentes; la UI muestra `—`. Nunca `0` por ausencia.
- **Nada de borrados** de datos clínicos (Ley 21.719): ni endpoint, ni handler, ni botón. Se
  rectifica, bloquea o anonimiza. Nada de datos reales de pacientes en ejemplos.
- **Sin react-query ni Redux**: estado de servidor con `useState` + servicio `UseXService`.
- **Sin tests inventados**: el repo no tiene runner. Los criterios se comprueban con
  `npm run build`, `npx eslint src/<modulo>/`, `grep` y pasos manuales en el navegador **con el
  perfil afectado**.
- Si toca `src/Chequeo/`, los tres bloques de perfil; si toca un `routes*`, cómo filtra ese
  navegador por perfil.
- **Perfil `SENSIBLE`**: la spec declara qué dato personal toca y cómo cumple la Ley 21.719
  (enmascarado, qué va y qué no va a `localStorage`, escape de `html:` en Swal).
- **Perfil `CLINICO`**: la lógica clínica (IMC, umbrales, escalas, color clínico) queda **fuera de
  alcance**, declarado en «No entra». Cambiarla es una decisión médica con spec propia.

### 1.4 Guardado (Fase 4 de `/spec`, adaptada)

- Ruta: `specs/<modulo>/NN-slug.md`. **NN es correlativo dentro de la carpeta del módulo** (el
  mayor existente + 1, dos dígitos). Carpeta nueva → `01`, y propone crear su
  `CLAUDE_<MODULO>.md` al implementar.
- Cabecera en español, en blockquote: `**Estado:** Borrador`, `**Depende de:**` (con la spec del
  back y su estado), `**Fecha:**` (la del contexto de sesión), `**Área afectada:**`,
  `**Objetivo:**` (una frase).
- Estados válidos: `Borrador` → `En revisión` → `Aprobado` → `Implementado` (y `Obsoleto`).
  **Se guarda en `Borrador`**; pasar a `Aprobado` lo hace el humano.
- Comprueba que cada dependencia citada existe (en `specs/<modulo>/` o en el back).
- No toques `specs/.spec-config.yml` si ya existe.
- **Sección `## Kit de ejecución`**, con el formato del §7 de la matriz. Va al final de la spec,
  antes de «Estado de verificación» si existe. Lleva los perfiles con la señal que activó cada uno,
  las skills, agentes y MCP por fase (*Diseñar*, *Implementar*, *Verificar*) y las restricciones
  (`CLINICO`). La leen después `/spec-impl-ergo-front` y `/spec-verify-ergo-front`, así que tiene
  que estar completa.

### 1.5 Builder check (antes del informe)

Con la spec ya guardada en `Borrador`, lanza **un subagente `general-purpose`** con el prompt de
`.agents/skills/brainstorming/builder-check-prompt.md` y estos valores:

- `[DOMAIN]` = «desarrollador senior de React 18 + TypeScript + MUI 5 que implementará esta spec con
  /spec-impl-ergo-front sin poder hablar con su autor»;
- `[DOCUMENT_PATH]` = la ruta absoluta de la spec, más `CLAUDE.md` y la guía del módulo como
  contexto.

Pídele que use `graphify` antes de leer código y que no modifique nada. Reparte sus dudas en tres
grupos:

| Grupo | Qué haces |
|---|---|
| Ya respondida por la conversación o el código | Escribe la respuesta en la spec |
| Menor (un buen implementador la resolvería sin cambiar el resultado) | Resuélvela tú y márcala en la spec como «decisión del diseñador» |
| Del usuario (cambia lo que se construye) | Va al bloque de preguntas, la más importante primero |

Es la **única** ronda de preguntas que produce el check. Sin herramienta `Agent`, haz tú esa lectura.

---

## Fase R — Modo revisión (argumento = spec existente)

No crea archivo nuevo. Revisa la spec contra la realidad y la deja **más cierta**, no más larga.

1. **Lee el contexto** de 1.1 (CLAUDE.md, ARQUITECTURA.md, guía del módulo) y la spec completa.
   Anota su estado. Si es `Implementado` u `Obsoleto`, avisa antes de editar.
2. **Hallazgos contra el código.** Recorre la sección de «lo verificado en el código» fila por
   fila y compruébala con Read/Grep sobre `src/<modulo>/`: archivo, **número de línea** y texto.
   Clasifica cada fila: ✅ cierta · ✏️ cierta con línea movida (corrige el número) · ❌ falsa.
3. **Contrato contra el back.** Si la spec consume un endpoint, contrástalo con el back real:
   `routes/api.php` (ruta, método, middleware como `throttle`), el controlador (validación del
   body, qué campos son opcionales, sobre de éxito y de cada error), el service si hay lógica que
   el front debe replicar (p. ej. una regla de enmascarado: copia las regex reales), y
   `docs/openapi.yaml`. Anota el **estado** de la spec del back y actualiza la cabecera
   «Depende de».
4. **Plan.** Cada archivo que el plan cita existe (o se declara como nuevo); los barriles
   (`index.ts`) que dice tocar existen; nada sale del perímetro de «Área afectada».
5. **Criterios de aceptación.** Cada uno es booleano y comprobable con los comandos del repo
   (`npm run build`, `npx eslint`, `grep`, pasos manuales concretos). Señala los que no lo son o
   los que dependen del back desplegado.
6. **Reglas de 1.3.** Que la spec no las rompa.
6b. **Kit de ejecución.** Compara la sección `## Kit de ejecución` con los perfiles que
   resultan hoy del §2 de la matriz.
   - Si **falta** (specs anteriores a la matriz), añádela.
   - Si está **desactualizada** (un perfil nuevo, una skill que ya no existe, un agente que cambió
     de perímetro), corrígela.
   - Con perfil de UI, revisa también si la spec tiene su bloque de dirección visual (1.1b) y, si
     falta, propónlo como pregunta.
7. **Aplica las correcciones factuales** (líneas, contrato, regex, cabecera, rutas de archivo y
   kit) directamente en la spec, y añade al final de la cabecera o en una sección «Notas de
   revisión» una línea con la fecha y qué se corrigió.
8. **Las decisiones de producto no se inventan.** Preséntalas como **un bloque de 3–5 preguntas**
   numeradas, cada una con 2–4 opciones y tu recomendación (con `AskUserQuestion` si está
   disponible). Con las respuestas, edita la spec (incluida la sección de decisiones).
9. Estado final: **`Borrador`** (o `En revisión` solo si el usuario lo pide). Nunca `Aprobado`.

---

## Informe final

Cierra con este resumen, sin adornos:

```
Spec:            specs/<modulo>/NN-slug.md   (nueva | revisada)
Estado:          Borrador
Depende de:      SPEC NN del back (<estado>) · …
Cambios:         <qué secciones se escribieron o corrigieron, y por qué>
Discrepancias:   <hallazgos falsos o movidos, contrato distinto, archivos inexistentes>
Kit:             perfiles <…> · skills usadas <…> · ausentes <… o «ninguna»> (sección «Kit de ejecución» escrita/corregida)
Builder check:   <N dudas: X respondidas en la spec · Y menores resueltas · Z al usuario>
Preguntas:       <las que quedaron abiertas, con su recomendación>
Siguiente paso:  el humano relee y cambia a «Aprobado» → /spec-impl-ergo-front NN-slug
```

Si en la conversación apareció algo durable que **no** quedó escrito en la spec ni en la guía (una
preferencia del usuario sobre el flujo, una trampa del entorno), guárdalo con `mem_save` siguiendo el
protocolo de engram (§1 de la matriz). Lo que ya está en la spec no se duplica.

Reporta con honestidad lo que no pudiste verificar (un endpoint que no está desplegado, un
comportamiento que solo se ve en el navegador).

---

## Nota sobre dónde viven las piezas

- Kit de ejecución por perfil: `.claude/MATRIZ-HERRAMIENTAS.md` (fuente única, compartida con
  `/spec-impl-ergo-front` y `/spec-verify-ergo-front`).
- Skills importadas del kit: `.agents/skills/{brainstorming,frontend-design,interface-design,vercel-react-best-practices,changelog-generator}/`
  (origen y hash en `skills-lock.json`).
- Flujo genérico: `.agents/skills/spec/SKILL.md` + `template.md` (importados de
  `Klerith/fernando-skills`, ver `skills-lock.json`).
- Implementador: `.claude/skills/spec-impl-ergo-front/SKILL.md`.
- Homólogo del back: `Back-end/ergosanitas-app/.claude/skills/spec-ergo-backend/SKILL.md`; su Kit de ejecución vive en `references/enrutado.md` (§8: mapa de relaciones) y la spec del back trae su sección `## Kit de ejecución`, útil para armar la hermana del front.
- Guías por módulo: `specs/<modulo>/CLAUDE_<MODULO>.md`.
