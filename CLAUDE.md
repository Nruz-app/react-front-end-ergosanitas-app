# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responde y escribe en español. El dominio, los perfiles y gran parte del código y comentarios están en español.

## Comandos

```bash
npm run dev        # Servidor de desarrollo Vite (HMR)
npm run build      # tsc -b (type-check de todos los tsconfig) && vite build → dist/
npm run lint       # ESLint sobre todo el repo
npm run preview    # Sirve el build de dist/ localmente
```

- **No hay framework de tests configurado.** No existe script `test` ni runner (Jest/Vitest). No inventes comandos de test.
- `npm run build` falla si hay errores de tipos: `tsc -b` corre antes de Vite. Un cambio que no tipa no compila.
- Instalación de dependencias: usa `npm install --legacy-peer-deps` (la CI lo hace así; hay conflictos de peer deps por la mezcla de MUI 5 y librerías React).

## Stack

Vite + React 18 + TypeScript (SPA, `"type": "module"`). UI principalmente **MUI 5** (`@mui/material`, `@mui/x-data-grid`, `@mui/x-date-pickers`) con `@emotion`. También react-bootstrap en partes. Estado servidor con `@tanstack/react-query` y algo de Redux Toolkit. Formularios con react-hook-form + yup y en módulos antiguos formik. HTTP con axios. Gráficos con chart.js. PDFs con react-pdf / @react-pdf-viewer. Mapas con mapbox-gl.

## Variables de entorno (`.env`)

Todas con prefijo `VITE_` (expuestas al cliente vía `import.meta.env`):

- `VITE_API` — base del backend (ej. `http://127.0.0.1:8000/api`).
- `VITE_API_PATH` — segmento adicional que se **concatena** a `VITE_API` en los servicios (`${VITE_API}${VITE_API_PATH}`).
- `VITE_GOOGLE_CLIENT_ID` — OAuth de Google (`@react-oauth/google`).
- `VITE_MAPBOX_KEY` — token de Mapbox.

## Arquitectura

### Navegación por perfil de usuario (concepto central)

La app no tiene un router único. `src/routes/NavigationApp.tsx` elige el **navegador raíz** según `user.user_perfil` del `LoginContext`:

| Perfil                | Navegador       | Rutas          |
|-----------------------|-----------------|----------------|
| `Emergencia Deportiva`| `NavigationED`  | `routesED.ts`  |
| `Paciente`            | `NavigationPA`  | `routesPA.tsx` |
| `Medicos`             | `NavigationMe`  | `routesME.tsx` |
| (autenticado, resto)  | `NavigationErgo`| `routesErgo.ts`|
| (no autenticado)      | `Navigation`    | `routes.ts`    |

- Cada navegador usa **`HashRouter`** (importante: el deploy es estático por FTP, sin reescrituras del servidor; por eso rutas con `#`).
- Dentro de un navegador, el menú se filtra por perfil con `validatePerfil`: `Administrador` ve todo, `perfil: 'All'` es visible para todos, y cada ruta declara `perfil` y `status` (activar/desactivar sin borrar). Ver `NavigationErgo.tsx` como patrón de referencia (incluye submenús vía `children`).
- Al agregar una vista para un rol, edita el `routes*.ts` correspondiente **y** verifica el filtrado por perfil, no solo la ruta.

### Sesión / autenticación

- Estado global de login en `src/common/context/login` (Context + reducer). `LoginProvider` expone `{ valid, user, ValidLogin }`. `ValidLogin(false, {...})` cierra sesión (se dispara al hacer click en el avatar).
- Providers globales en `src/App.tsx`, en este orden: `HelmetProvider → LoginProvider → ModalProvider → SubMenuProvider`.
- Helpers de persistencia en `src/common/services/local-storage/storage.service.ts` (`setLocalStorage`/`getLocalStorage`/`removeLocalStorage`, con `JSON.parse` defensivo).
- **No hay interceptor de axios ni header `Authorization` global** en el front. La autenticación efectiva va por cookie/sesión del backend; no asumas un patrón Bearer al tocar servicios.

### Capa HTTP y servicios

- `src/common/api/api.adapter.ts` define la interfaz `HttpAdapter` y la clase `ApiAdapter` que envuelve axios (`getToken/get/post/put/delete`). `get` acepta `limit`/`offset` (paginación por query params).
- Patrón de servicio por módulo: una función `UseXService` (async) que instancia `new ApiAdapter()`, arma `const API = ${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}` y expone métodos que llaman al adapter. Ver `src/Chequeo/services/useChequeoService.ts` como referencia. Sigue este patrón para nuevos endpoints en vez de usar axios directo.

### Módulos de features

Cada carpeta de primer nivel en `src/` (ej. `Chequeo`, `Bioimpedancia`, `Certificados`, `AgendarHora`, `Incidentes`, `pagos-mensual`, `asistente-voz`, `ficha-clinica`, `User`, `Url`, `Estadisticas`, `EmergenciaDeportivas`) es un módulo autocontenido, típicamente con: `components/`, `config/`, `context/`, `hooks/`, `interface/` (tipos TS), `pages/`, `services/`, `utilities/` y un `index.ts` de barril. Mantén nuevas features dentro de esta estructura y reexporta desde el `index.ts` del módulo.

- `src/common/` — código transversal (api adapter, contexts, tabla, storage).
- `src/components/` — componentes compartidos (`forms/`).
- `src/presentation/` — módulo del asistente/IA (`pages/assistant`, `core/`, `hooks/`).

### `src/ficha-clinica/` — ficha clínica (módulo con guía propia)

Es el módulo más desarrollado por specs y el que más convenciones propias tiene.
**Antes de tocarlo, lee `specs/paciente/CLAUDE_PACIENTE.md`**: recoge el estado
consolidado de las tres specs, las decisiones tomadas y lo que no hay que romper.

Lo mínimo que hay que saber:

- **Regla dura heredada de la Spec 01:** el trabajo del módulo no toca nada fuera de
  `src/ficha-clinica/`.
- **Tres capas de datos.** Capa 1 (`api.interface.ts`, forma cruda del backend con sus
  typos) → mapper → Capa 2 (`ficha-clinica.interface.ts`, modelo de UI) → Capa 3
  (`segmentaria.interface.ts`, derivado en el front). Ningún componente importa la Capa 1.
- **Nunca mapear ausencia de dato a `0`.** Se usa `number | null` y la UI muestra `—`.
  Un cero en un signo vital es una medición, no un vacío.
- **`pages/app-pacientes.tsx` es el único que hace fetch**; los cuatro tabs reciben todo
  por props.
- **El servicio no está conectado al backend real**: resuelve `data/paciente.json` con
  `setTimeout` simulando latencia.
- **Los valores por segmento de la silueta son estimados, no medidos**, y la UI está
  obligada a declararlo con el chip de advertencia. El backend no entrega masa por
  extremidad.
- **Las escalas clínicas son de población adulta** y el paciente del mock tiene 9 años.
  Van rotuladas como tales; no son válidas en pediatría.

## Flujo Spec-Driven (skills `/spec` y `/spec-impl`)

El proyecto usa diseño guiado por especificación. Las skills viven en `.claude/skills/` y `.agents/skills/`:

- **`/spec <descripción>`** — diseña una spec por fases (nunca escribe código). Guarda en `specs/<modulo>/NN-slug.md` en estado `Borrador`. Lee `template.md` de la skill para la estructura.
- **`/spec-impl <NN-slug>`** — implementa una spec **ya aprobada** (`Aprobado`); crea/cambia a la rama `spec-NN-slug` (según `specs/.spec-config.yml`, `AutoCreateBranch: true` por defecto) e implementa por pasos con pausas para revisar diffs.

Convenciones del repo:

- **Las specs se agrupan por módulo**: `specs/paciente/01-…`, `02-…`, `03-…`. La
  numeración es correlativa dentro de cada carpeta.
- **Los estados van en español**: `Borrador` → `Aprobado` → `Implementado` (también
  `En revisión` / `Obsoleto`). La skill acepta ambos idiomas, pero mantén el español.
- **El cambio a `Aprobado` lo hace el humano**, nunca el agente. `/spec-impl` se niega a
  implementar una spec en `Borrador`.
- **Si durante la implementación una decisión de la spec resulta equivocada, se corrige
  en la spec**, no en el código por sorpresa.

Al arrancar una feature grande, prefiere pasar por `/spec` antes de codificar.

## CI/CD y versionado

`.github/workflows/github-action.build.yml` (push a `main`):

1. Calcula versión semántica desde los mensajes de commit — prefijo **`feat`** ⇒ bump minor, **`major`** ⇒ bump major (PaulHatch/semantic-version). Usa estos prefijos en los commits.
2. Construye y publica la imagen Docker en Docker Hub (`nruz176/react-front-end-ergosanitas-app`).
3. Genera `.env.production` desde secrets, corre `npm run build` y **despliega `dist/` por FTP** a `ergosanitas.com` (`/public_html`).

El sistema se considera **en producción**: reutiliza la arquitectura existente, respeta los permisos por perfil y evita romper módulos actuales (ver README.md para el contexto de negocio y los roles Administrador / Médico / Colegio / Check).
