---
name: spec-impl-ergo
description: Implementa una spec aprobada de Ergosanitas. Delega el flujo completo en /spec-impl (validación del estado, rama, implementación por pasos) y al terminar ejecuta el cierre propio del proyecto: verificación, revisión por el agente dueño de cada módulo tocado, criterios de aceptación y documentación.
disable-model-invocation: true
argument-hint: <NN-slug de la spec, ej. 03-imagen-ampliable>
---

# /spec-impl-ergo — implementador de specs con cierre Ergosanitas

Este comando **no reimplementa** el flujo de `/spec-impl`: lo invoca tal cual y le añade una
fase de cierre con los agentes y skills de este proyecto.

```
/spec-impl-ergo  =  /spec-impl  +  Fase de cierre Ergosanitas
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

**Dos precisiones propias de este repositorio**, que la skill genérica no conoce:

- **Las specs se agrupan por módulo**: `specs/ficha-clinica/` y `specs/home-ergo/`. La numeración
  es correlativa **dentro de cada carpeta**, así que existen dos specs `01` distintas. Si el
  argumento es ambiguo (solo un número, o un slug que aparece en dos carpetas), **muestra las
  coincidencias y pregunta cuál es**, indicando el módulo. No elijas por tu cuenta.
- **Mientras implementas, aplica las skills del proyecto**: invoca `ergo-code` antes de escribir
  el primer archivo `.ts`/`.tsx`, y la skill del módulo si existe (`ergo-login`, `ergo-chequeo`,
  `ergo-common`). Implementar en el estilo equivocado obliga a rehacer trabajo en la Fase 2.

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

### 2.3 — Revisión por el agente dueño de cada módulo

Para **cada módulo tocado**, lanza su agente con la herramienta Agent. Este es el mapa:

| Módulo tocado | `subagent_type` |
|---|---|
| `src/Login/` | `ergo-login` |
| `src/Chequeo/` | `ergo-chequeo` |
| `src/common/` | `ergo-common` |
| `src/ficha-clinica/`, `src/home-ergo/` | `ergosanitas-developer` (y su guía `specs/<modulo>/CLAUDE_<MODULO>.md`) |
| Cualquier otro módulo | `ergosanitas-developer` |
| Cambios que cruzan varios módulos o tocan el modelo de datos | añade `ergosanitas-architect` |

**Los agentes de módulo tienen perímetro cerrado** (solo modifican su carpeta), así que son
seguros para esto. Lanza en paralelo los que sean independientes.

Prompt para cada agente — dale contexto suficiente, porque **arranca en frío**:

> Se acaba de implementar la spec `specs/<modulo>/<NN-slug>.md` en la rama `spec-NN-slug`.
> Archivos tocados en tu módulo: `<lista>`.
> Carga tu skill, revisa esos cambios y corrige dentro de tu perímetro lo que no cumpla las
> convenciones del módulo. Verifica que no se haya roto nada de lo que tu skill marca como
> intocable, ni las firmas que consumen otros módulos. Informa de lo que corregiste y de lo que
> haya que arreglar fuera de tu perímetro.

Cuando vuelvan, **relata al usuario lo que reportaron** (su informe no se le muestra solo) y
aplica o escala lo que hayan dejado pendiente fuera de su alcance.

### 2.4 — Criterios de aceptación de la spec

Vuelve a abrir la spec y **recorre su checklist de criterios de aceptación uno por uno**.
Para cada uno di si se cumple y **cómo lo comprobaste**. Si algo no se puede verificar sin
levantar la app o sin backend, dilo explícitamente en vez de darlo por bueno.

Recuerda las reglas de verificación manual del proyecto: probar **con el perfil de usuario
afectado**, no solo con Administrador — y si el cambio toca `src/Chequeo/`, revisar los tres
bloques de perfil (`Colegios`, `Medicos`, resto), porque los índices de tab no coinciden.

### 2.5 — Documentación

1. **Si el módulo tiene guía propia**, actualízala con lo que la spec decidió:
   `specs/ficha-clinica/CLAUDE_FICHA_CLINICA.md` · `specs/home-ergo/CLAUDE_HOME_ERGO.md`.
2. **Si la spec cambió el modelo de datos, un endpoint o una convención transversal**,
   actualiza `.claude/ARQUITECTURA.md`; si cambió una regla de estilo o de proyecto, `CLAUDE.md`.
3. **Si aparecieron entidades, trampas o deuda nuevas en un módulo con skill propia**, actualiza
   esa skill (`.claude/skills/ergo-*/SKILL.md`) — o pídeselo a su agente, que es su dueño.
4. **Marca la spec como `Implementado`** solo si todos los criterios de aceptación pasaron. Si
   alguno quedó pendiente, **déjala como está** y di cuál falta.
5. **Si durante la implementación una decisión de la spec resultó equivocada, se corrige en la
   spec**, no en el código a escondidas.

### 2.6 — Commit

**No commitees ni hagas push salvo que el usuario te lo pida.** Si te lo pide: prefijo `feat`
(bump minor) o `fix`, mensaje en español, y recuerda que **un push a `main` despliega a
producción por FTP** — eso se confirma aparte.

---

## Informe final

Cierra con este resumen, sin adornos:

```
✅ Spec implementada: specs/<modulo>/<NN-slug>.md
   Rama:          spec-NN-slug
   Módulos:       <lista>
   Build:         ✅ / ❌ (+ error real si falló)
   ESLint:        ✅ / ❌ por módulo
   Agentes:       <cuáles revisaron y qué corrigieron>
   Criterios:     N/M verificados  (detalla los que no)
   Documentación: <qué archivos actualizaste>
   Estado spec:   Implementado / sigue en Aprobado porque <razón>
   Pendiente:     <lo que quedó fuera y por qué>
```

Reporta con honestidad: si algo falló o no se pudo verificar, dilo. Un ✅ sin comprobación vale
menos que un ❌ explicado.

---

## Nota sobre dónde viven los agentes y las skills

Todos los agentes y skills de Ergosanitas están **en este repositorio**, no en la carpeta
personal del usuario:

- Agentes → `.claude/agents/` : `ergo-login`, `ergo-chequeo`, `ergo-common`,
  `ergosanitas-developer`, `ergosanitas-architect`.
- Skills → `.claude/skills/` : `ergo-code`, `ergo-login`, `ergo-chequeo`, `ergo-common`,
  `spec`, `spec-impl` (estas dos, enlazadas a `.agents/skills/`).
- Referencia de arquitectura → `.claude/ARQUITECTURA.md`.

En `~/.claude/skills/` solo hay skills genéricas ajenas al proyecto (`frontend-design`,
`find-skills`). **No las uses en este flujo.**
