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
- **Cada `routes*` define su propio `interface Route` local**; no hay tipo compartido. Agregar un campo obliga a editar los cinco archivos.
- `status: boolean` sí es uniforme: los cuatro navegadores autenticados hacen `.filter(({ status }) => status)`, así que se desactiva una vista sin borrar la entrada.
- **El filtrado por perfil NO es uniforme, y es la trampa del área:**
  - `NavigationErgo` tiene el helper `validatePerfil`, que acepta tres casos: coincidencia exacta, `Administrador` (ve todo) y `perfil: 'All'` (visible para todos). Es el patrón de referencia e incluye submenús vía `children`.
  - `NavigationED`, `NavigationMe` y `NavigationPA` son copias entre sí y **no usan ese helper**: comparan inline con `(user_perfil == perfil)` más una rama suelta para `Administrador`. **No entienden `'All'`**, así que una ruta marcada así en `routesPA/ED/ME` no aparece en el menú.
  - `routes.ts` (no autenticado) ni siquiera declara `perfil`/`status`: todas sus rutas se renderizan siempre.
- Al agregar una vista para un rol, edita el `routes*` correspondiente **y** comprueba cómo filtra *ese* navegador, no solo la ruta.
- `NavigationApp` decide por `user_perfil` **antes** de mirar `valid`: los tres perfiles con nombre entran a su navegador aunque la sesión no sea válida. Hoy no se nota porque el estado inicial de `LoginProvider` trae `user_perfil: ''`, pero no te apoyes en `valid` para proteger una vista.

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
**Antes de tocarlo, lee `specs/ficha-clinica/CLAUDE_FICHA_CLINICA.md`**: recoge el estado
consolidado de las cuatro specs, las decisiones tomadas y lo que no hay que romper.

Lo mínimo que hay que saber:

- **Regla dura heredada de la Spec 01:** el trabajo del módulo no toca nada fuera de
  `src/ficha-clinica/`. Importar de `common/` (el `ApiAdapter`, el `LoginContext`) es
  lectura, no modificación, y sí está permitido.
- **Tres capas de datos.** Capa 1 (`api.interface.ts`, forma cruda del backend con sus
  typos) → mapper → Capa 2 (`ficha-clinica.interface.ts`, modelo de UI) → Capa 3
  (`segmentaria.interface.ts`, derivado en el front). Ningún componente importa la Capa 1.
- **Nunca mapear ausencia de dato a `0`.** Se usa `number | null` y la UI muestra `—`.
  Un cero en un signo vital es una medición, no un vacío.
- **`pages/app-pacientes.tsx` es el único que hace fetch de la ficha**; los cinco tabs
  reciben todo por props. La excepción es el tab «Asistente Ergo», que dispara sus
  propias llamadas al chat (no a la ficha).
- **El servicio ya apunta al backend real**: `GET {VITE_API}{VITE_API_PATH}/ficha-clinica/{rut}`,
  con `USAR_MOCK = false` en `UsePacienteService.ts`. Poniéndolo en `true` vuelve a
  resolver `data/paciente.json` con latencia simulada, útil para desarrollar sin backend.
- **Los valores por segmento de la silueta son estimados, no medidos**, y la UI está
  obligada a declararlo con el chip de advertencia. El backend no entrega masa por
  extremidad.
- **Las escalas clínicas son de población adulta** y el paciente de referencia tiene 9 años.
  Van rotuladas como tales; no son válidas en pediatría.
- **El chat del tab «Asistente Ergo» es un clon**, no un import de `src/presentation/`
  ni de `src/AsistenteVirtual/`. Esas carpetas no se tocan; la duplicación es deliberada
  (Spec 04) y usa su propia clave de sesión, `ficha_chat_session_id`.

### `src/home-ergo/` — portada comercial (módulo con guía propia)

Es la página que ve un visitante no autenticado en `/`. Sustituye a `src/Home/`, que sigue
en el repositorio **intacto y sin rutear** como vía de reversa.
**Antes de tocarlo, lee `specs/home-ergo/CLAUDE_HOME_ERGO.md`.**

Lo mínimo que hay que saber:

- **Regla dura:** el módulo solo toca `src/home-ergo/`, las dos líneas de la entrada `Home`
  en `src/routes/routes.ts`, y los archivos de `public/home-ergo/`. Nada más. `src/Home/`,
  `src/AsistenteVirtual/`, `src/presentation/`, `src/Servicios/` y `Navigation.tsx` quedan
  intactos.
- **El contenido vive en JSON**, en los seis archivos de `config/`. Agregar una foto, un
  video o un servicio es agregar un objeto al JSON: ningún `.tsx` lleva rutas de archivo ni
  textos de negocio escritos a mano. Galería, promociones y videos tienen campo `activo`
  para apagar una entrada sin borrarla; las promociones llevan además `destacado`, que
  decide en qué carrusel salen (`true` → promociones, arriba; `false` → alianzas, abajo).
  Ambos se comparan **explícitamente contra `true`/`false`**, nunca por verdad/falsedad ni
  por el prefijo del `id`.
- **Los assets están en `public/home-ergo/`** en `kebab-case` ASCII con prefijo que indica
  su uso: `promo-`, `alianza-`, `operativo-`, `respaldo-`, `info-`, `logo-`. Las 26
  imágenes (`img/`) sí están versionadas; los 7 videos **no**.
- **El material es vertical**, medido: los 7 videos son 9:16 o 4:5 y los flyers son 2:3. Por
  eso cada sección elige su ajuste — `cover` en la galería porque son fotografías, y
  **`contain` en promociones y videos**, porque `cover` recortaría el texto quemado de los
  flyers.
- **Los videos no están en el repositorio.** `public/home-ergo/video/` está en `.gitignore`
  y los `.mp4` se subieron a mano por FTP a `/public_html/home-ergo/video/`. Como las rutas
  del JSON son absolutas desde la raíz del sitio y `lftp mirror` corre sin `--delete`,
  sobreviven a cada despliegue. **Agregar un video son dos pasos:** subirlo por FTP *y*
  agregar su entrada en `home-videos.json`. Quien clone el repo desde cero verá las
  carátulas sin reproducción.
- **`preload="none"` en los `<video>` es obligatorio y nunca hay `autoplay`.** Los siete
  videos suman 139 MB; sin eso el Home es inusable con datos móviles.
- **Contacto siempre visible = dos piezas** (Spec 02): `FranjaRedes` en el flujo y
  `RailContacto` fijo al borde izquierdo desde 1200 px (`z-index` 1090, por debajo del
  `AppBar` y del chat). En móvil no hay rail: moverlo obligaría a reubicar el FAB del chat.
- **Los enlaces de contacto salen solo de `config/canales-contacto.tsx`.** Ningún
  componente arma por su cuenta una URL de `wa.me`, `tel:` ni `mailto:`.
- **El chat comercial es un clon**, no un import de `src/presentation/`. Usa endpoint propio
  `POST /chat-comercial/as-question` —que **todavía no existe**— y su propia clave de
  sesión, `home_chat_session_id`. Reutilizar `sam-assistant/as-question` aquí expondría
  datos de pacientes a visitantes anónimos: la separación es de seguridad.
- **`USAR_ECO = true` en `UseChatComercialService.ts`**: hoy el chat devuelve la misma
  pregunta. Se pone en `false` cuando exista el backend.
- **`dist/` ronda los 60 MB** (las 26 imágenes pesan 30 MB) y el CI lo sube entero por FTP
  en cada push a `main`. Sacar los videos del repositorio es justo lo que evita que sean
  139 MB más, subidos tres veces en paralelo por la matriz de Node.

## Flujo Spec-Driven (skills `/spec` y `/spec-impl`)

El proyecto usa diseño guiado por especificación. Las skills viven en `.claude/skills/` y `.agents/skills/`:

- **`/spec <descripción>`** — diseña una spec por fases (nunca escribe código). Guarda en `specs/<modulo>/NN-slug.md` en estado `Borrador`. Lee `template.md` de la skill para la estructura.
- **`/spec-impl <NN-slug>`** — implementa una spec **ya aprobada** (`Aprobado`); crea/cambia a la rama `spec-NN-slug` (según `specs/.spec-config.yml`, `AutoCreateBranch: true` por defecto) e implementa por pasos con pausas para revisar diffs.

Convenciones del repo:

- **Las specs se agrupan por módulo**: hoy hay dos carpetas,
  `specs/ficha-clinica/` (`01-…` a `04-…`) y `specs/home-ergo/` (`01-…` y `02-…`).
  La numeración es correlativa **dentro de cada carpeta**, así que existen dos specs `01`
  distintas y hay que nombrarlas con su módulo. Si el módulo tiene guía propia
  (`CLAUDE_<MODULO>.md`), vive en la misma carpeta y se actualiza al cerrar cada spec:
  `CLAUDE_FICHA_CLINICA.md` y `CLAUDE_HOME_ERGO.md`.
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
3. Genera `.env.production` desde secrets, corre `npm run build` y **despliega `dist/` por FTP** a `ergosanitas.com` (`/public_html`) con `lftp … mirror -R`, transferencia serial.

Dos detalles del workflow que importan al tocar assets:

- **El job corre en matriz `[18.x, 20.x, 22.x]` y la matriz aplica al job completo**: hoy son
  tres builds de Docker y **tres subidas FTP en paralelo** al mismo servidor por cada push.
- **`mirror` va sin `--delete`**, así que no borra en el servidor lo que no viene en `dist/`.
  Por eso lo subido a mano (los videos del Home) sobrevive a los despliegues.

Verificación local antes de commitear: `npm run build` en verde y `npx eslint src/<modulo>/` en 0.

El sistema se considera **en producción**: reutiliza la arquitectura existente, respeta los permisos por perfil y evita romper módulos actuales (ver README.md para el contexto de negocio y los roles Administrador / Médico / Colegio / Check).
