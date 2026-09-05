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

Vite + React 18 + TypeScript (SPA, `"type": "module"`). UI principalmente **MUI 5** (`@mui/material`, `@mui/x-data-grid`, `@mui/x-date-pickers`) con `@emotion`. También react-bootstrap en partes. Formularios con react-hook-form + yup y en módulos antiguos formik. HTTP con axios. Gráficos con chart.js. PDFs con react-pdf / @react-pdf-viewer. Mapas con mapbox-gl. Feedback al usuario con sweetalert2 (Swal) en casi todo el repo.

**Gestión de estado — la realidad, no el `package.json`:** `@tanstack/react-query` y
`@reduxjs/toolkit` están declarados como dependencias pero **no se usan en ni un solo archivo de
`src/`** (verificado). El patrón real es:

- **Estado de servidor**: llamada directa al servicio (`await UseXService()`) desde un `useEffect`
  o un handler, guardada con `useState`. Sin caché ni invalidación.
- **Estado global**: React Context + reducer (los tres providers de `src/common/context/`).

No introduzcas react-query ni Redux "porque ya están": sería estrenar una arquitectura nueva
dentro de una tarea que pedía otra cosa. Si crees que hace falta, plantéalo como decisión aparte.

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
| `Colegios`            | `NavigationCol` | `routesCOL.tsx`|
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

**Los perfiles de las rutas no son todos los perfiles.** `user_perfil` es un **string libre**, no
un enum, y llega del backend. En los `routes*` aparecen `Administrador`, `Medicos`, `Paciente`,
`Emergencia Deportiva`, `Usuario`, `Colegios` y el comodín `'All'` (`Colegios` entró en
`routesCOL.tsx` con la Spec 01 de `chequeo-cardiovascular`; antes **no figuraba en ninguna
ruta** y existía solo como valor que ramifica la UI dentro de `src/Chequeo/`). Se declara además
como opción en `src/User/config/custom-form.json`. Al buscar dónde se decide qué ve un rol, mira
también las comparaciones `user_perfil === "..."` dentro de los módulos, no solo los `routes*`:
`src/Chequeo/` sigue ramificando por `Colegios` para los perfiles que aún no se han migrado.

### Sesión / autenticación

- Estado global de login en `src/common/context/login` (Context + reducer). `LoginProvider` expone `{ valid, user, ValidLogin }`. `ValidLogin(false, {...})` cierra sesión (se dispara al hacer click en el avatar).
- Providers globales en `src/App.tsx`, en este orden: `HelmetProvider → LoginProvider → ModalProvider → SubMenuProvider`.
- Helpers de persistencia en `src/common/services/local-storage/storage.service.ts` (`setLocalStorage`/`getLocalStorage`/`removeLocalStorage`; solo `getLocalStorage` es defensivo — comprueba `window` y envuelve el `JSON.parse`, devolviendo `null`).
- ⚠️ **La sesión NO se persiste**: `LoginProvider` arranca siempre en `INITIAL_STATE`, así que
  **un F5 desloguea al usuario**. El único que escribe en localStorage es
  `LoginGoogle/components/GoogleOAuth.tsx` (clave `"AuthRegister"`) y **nadie la lee al arrancar**.
  Si hay que mantener la sesión, el trabajo es en `src/common/context/login/` y hay que decidir
  qué se guarda — nunca la contraseña.
- **No hay interceptor de axios ni header `Authorization` global** en el front. La autenticación efectiva va por cookie/sesión del backend; no asumas un patrón Bearer al tocar servicios.

### Capa HTTP y servicios

- `src/common/api/api.adapter.ts` define la interfaz `HttpAdapter` y la clase `ApiAdapter` que envuelve axios (`getToken/get/post/put/delete`). `get` acepta `limit`/`offset` (paginación por query params, defaults `10`/`1`); `getToken` es un `get` sin params — el nombre engaña, no gestiona tokens. **No hay manejo de errores**: un 4xx/5xx propaga la excepción de axios al llamador, por eso los módulos envuelven las llamadas en `try/catch` + Swal. El genérico `<T>` no valida nada: si el backend cambia de forma, TypeScript no se entera.
- **El catálogo completo de endpoints está en `.claude/ARQUITECTURA.md`.** Patrones: los listados por institución terminan en `/{user_email}`, los históricos por persona en `/{rut_paciente}`, y los PDF se abren con `window.open(url, '_blank', 'noopener,noreferrer')` en vez de descargarse por axios.
- Patrón de servicio por módulo: una función `UseXService` (async) que instancia `new ApiAdapter()`, arma `const API = ${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}` y expone métodos que llaman al adapter. Ver `src/Chequeo/services/useChequeoService.ts` como referencia. Sigue este patrón para nuevos endpoints en vez de usar axios directo.

### Módulos de features

Cada carpeta de primer nivel en `src/` (ej. `Chequeo`, `Bioimpedancia`, `Certificados`, `AgendarHora`, `Incidentes`, `pagos-mensual`, `asistente-voz`, `ficha-clinica`, `User`, `Url`, `Estadisticas`, `EmergenciaDeportivas`) es un módulo autocontenido, típicamente con: `components/`, `config/`, `context/`, `hooks/`, `interface/` (tipos TS), `pages/`, `services/`, `utilities/` y un `index.ts` de barril. Mantén nuevas features dentro de esta estructura y reexporta desde el `index.ts` del módulo.

- `src/common/` — código transversal (api adapter, contexts, tabla, storage).
- `src/components/` — componentes compartidos (`forms/`). ⚠️ `InputText` está acoplado a Chequeo:
  recalcula el IMC en cada cambio llamando a `Chequeo/hooks/UseCalculoIMC`.
- `src/presentation/` — módulo del asistente/IA (`pages/assistant`, `core/`, `hooks/`).

### Modelo de datos: las dos claves (concepto central)

Casi ninguna entidad se cruza con un id relacional. El modelo se articula sobre **dos claves de
texto**, y entenderlo ahorra la mitad del trabajo al diseñar algo nuevo:

| Clave | Qué identifica |
|---|---|
| `rut_paciente` (o `rut`) | **La persona evaluada.** Clave natural del paciente. |
| `user_email` | **El dueño de los datos** — colegio, club o médico. Funciona como clave de multi-tenencia. |

Por eso los endpoints terminan en `/{rut_paciente}` o `/{user_email}`. **No inventes un
`id_institucion` ni un `id_paciente` relacional: el backend no los tiene.** Los RUT viajan como
`string` sin normalización garantizada, y `IUser.rut_paciente` es opcional (solo el perfil
`Paciente` lo trae).

Entidades centrales: `IChequeo` (la núcleo, casi todo `string` opcional — deuda heredada),
`IBioimpedanciaAll` (la mejor tipada, `number | null` en todos los numéricos: **el modelo a
imitar**), `IIncidentes` (con la jerarquía liga → club → categoría), `IAgendaHora`/`IServicios`,
e `IFichaClinica` (el agregado con tres capas). **Nunca mapees ausencia de dato a `0`**: se usa
`number | null` y la UI muestra `—`. El detalle completo está en `.claude/ARQUITECTURA.md`.

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

### `src/chequeo-cardiovascular/` — chequeo por perfil (skill `ergo-chequeo-cardiovascular`)

Reemplazo autocontenido de `src/Chequeo/`, que se está construyendo **perfil por perfil**. Hoy
sirve solo a `Colegios`; `Administrador`, `Medicos` y `Usuario` siguen en el módulo viejo, que
queda intacto. **Antes de tocarlo, lee `specs/chequeo-cardiovascular/CLAUDE_CHEQUEO_CARDIOVASCULAR.md`**
—la guía viva, que manda si discrepa de la skill— y carga la skill `ergo-chequeo-cardiovascular`.
Tiene además agente propio con perímetro cerrado, `ergo-chequeo-cardiovascular`; el ruteo queda
fuera de él.

Lo mínimo que hay que saber:

- **Regla dura:** el módulo **no importa nada de `src/Chequeo/`**, ni de `src/Estadisticas/`,
  `src/Certificados/` o `src/components/`. Lo único externo es `src/common/`. Clona lo que
  necesita (los 4 gráficos, `getCertificadoRut`, `InputText`) para no quedar atado al módulo
  que algún día se retirará.
- **Ninguna operación de borrado**: ni endpoint, ni handler, ni botón. `Colegios` tampoco la
  tenía. El botón de limpiar el buscador usa `ClearIcon`, nunca `DeleteIcon`.
- **No ramifica por perfil.** `AppChequeoCardiovascular` tiene 4 tabs fijos con índices
  estables, que es justo lo que hacía insoportable a `AppChequeo`.
- **El formulario se agrupa por el campo `seccion`** de `custom-form.json` —el único cambio de
  forma respecto al JSON original—, y una sección sin campos visibles **no se renderiza**. Para
  `Colegios` eso deja solo «Identificación», con 7 de los 25 campos.
- ⚠️ **El esquema yup valida solo los campos visibles.** Ocho campos ocultos declaran `required`;
  validarlos todos haría el formulario imposible de enviar. El módulo viejo esquivaba esto no
  validando nada (su botón saltaba `handleSubmit`).
- ⚠️ **El backend devuelve 200 con sobres de error** en estadísticas, y `estadistica-saturacion`
  da 500. Los gráficos comprueban `Array.isArray(response?.data)`: sin eso, un gráfico caído
  tumba el Home entero.
- **La lógica clínica de IMC se clonó sin corregir**, bug de adultos incluido, documentado en un
  JSDoc. Cambiar un umbral es una decisión médica y va en su propia spec.
- Ruteo: `src/routes/routesCOL.tsx` + `NavigationCol.tsx` + un `case 'Colegios'` en
  `NavigationApp.tsx`. Son los únicos tres archivos fuera del módulo.

### `src/common/` — infraestructura transversal (skill `ergo-common`)

21 archivos, 929 líneas, y **64 archivos del proyecto dependen de él**. Es el módulo más pequeño
y el más peligroso de tocar. **Trabaja en modo aditivo**: agregar es seguro, cambiar una firma
rompe en cadena y `tsc -b` no siempre lo atrapa (hay `any` en el adapter y en `setLocalStorage`).

- `api/api.adapter.ts` (19 consumidores) — sin interceptores, sin retry, sin `baseURL`, sin
  manejo de errores. `get` inyecta `limit`/`offset` con defaults `10`/`1`. `getToken` es un `get`
  sin params: el nombre engaña, no gestiona tokens.
- `context/` (47 consumidores) — Login, Modal y SubMenu. **`isDateModalOpen` es un solo booleano
  compartido** por el modal de login, los modales de video de `src/Home/` y el `FormUpload` de
  Chequeo; y `ModalProvider` se monta **tres veces anidado** (App, AppChequeo, HomePage) para
  aislarlos a propósito.
- **La sesión no se persiste**: `LoginProvider` arranca siempre vacío, así que un F5 desloguea.
  `LoginGoogle` escribe la clave `"AuthRegister"` en localStorage y **nadie la lee**.
- **Dependencia invertida**: `common/context/login` importa `IUser` desde `src/Login/interface`.
- **`table/` es código muerto**: de sus 595 líneas solo se usa el tipo `IColumnsTable`. El propio
  código explica por qué (`ERROR EN theme?.breakpoints?.up("lg")…` en `Filters.tsx`) y viene de
  un proyecto Next.js. **No es el patrón de tablas del repo**: para un listado nuevo mira
  `ChequeoTable` o `AgendarHoraTable` (MUI + `TablePagination`).

### `src/Login/` — autenticación (skill `ergo-login`)

13 archivos, 580 líneas. `AppLoginPages` se monta en `App.tsx` **fuera del router**, siempre
presente, y renderiza un `<Modal>` de MUI que abre `routes/Navigation.tsx`.

- **`services/useRegister.ts` es API pública del proyecto**: `getUserEmail` lo consumen 4 archivos
  externos y `loadLogoUser` uno más. Cambiar sus firmas rompe Chequeo y los forms compartidos.
- **`IUser` (en `interface/user.ts`) es el tipo más transversal de la app.**
- El formulario está en `config/custom-form.json`; **`userName` es en realidad el email**.
- **`REGEX_RUN` y `email` se declaran en el JSON pero no se implementan** en
  `utilities/user.utility.ts` (solo `required`): hoy no se valida el formato del RUT ni del email.
- ⚠️ `config/keys.json` tiene usuario y contraseña en texto plano, versionado y **sin uso**
  (el login por JSON quedó comentado). Candidato a borrar.

### `src/Chequeo/` — chequeo cardiovascular (skill `ergo-chequeo`)

75 archivos, ~5.900 líneas: el módulo más grande y antiguo. Se monta en **dos rutas**
(`routesErgo` `/Chequeos/*` con perfil `'All'`, y `routesME` `/chequeos/*` con perfil `Medicos`).

- 🔴 **Los índices de tab NO coinciden entre perfiles.** `AppChequeo` ramifica toda la interfaz en
  tres bloques (`Colegios` 4 tabs, `Medicos` 2, resto 7), y el array de `<Tab>` está **separado**
  de los `<TabPanel>`. Agregar un tab obliga a revisar los tres bloques y ambas secciones.
- ⚠️ **El bloque `Colegios` de este módulo ya no se usa**: desde la Spec 01 ese perfil entra a
  `src/chequeo-cardiovascular/` por `NavigationCol`. El código sigue aquí, intacto y sin ruta que
  lo alcance, como vía de reversa. No lo borres ni lo "limpies": se retira cuando los cuatro
  perfiles estén migrados, y eso será su propia spec.
- **Dos "status" distintos**: el numérico (`0` alta / `1` edición / `3` ECG) es navegación interna
  de React; `estado_paciente` (`ingresado`, `Testiado`, `ECG FOTO`, `REVISION MEDICA`,
  `En Rev. Cardio`, `Diag. Card. - Normal|Alterado`) es el estado clínico del backend.
- Formularios en 5 JSON de `config/`; `custom-form.json` tiene 25 campos. Las validaciones se
  implementan en `utilities/*-validation.utility.ts` (aquí sí están `REGEX_RUN`, `MAX`,
  `NUMBER_DOT`; falta `LETRAS`, que el JSON declara).
- `services/useChequeoService.ts` tiene **23 métodos** y cruza dominios (bioimpedancia,
  certificados, GPT). Cinco módulos externos consumen este módulo.
- ⚠️ **Lógica clínica delicada** en `hooks/useCalculoIMC.ts`: `UseCalculoIMC` exige la estatura en
  **metros**; `UseCalcularPercentil` usa una aproximación lineal propia, **no tablas OMS/CDC**; y
  `UseIMCRecomendaciones` tiene un bug conocido — en adultos, la rama de IMC normal (`< 25`)
  devuelve las mismas recomendaciones que la de bajo peso. No toques fórmulas ni umbrales sin
  pedirlo: es una decisión médica, no una refactorización.

## Agentes y skills del proyecto (`.claude/`)

El repositorio trae sus propios agentes y skills, **todos versionados dentro del proyecto**. No
están en la carpeta personal del usuario: en `~/.claude/skills/` solo hay skills genéricas
(`frontend-design`, `find-skills`) que **no aplican a este proyecto**.

### Documento de referencia

- **`.claude/ARQUITECTURA.md`** — mapa del modelo de dominio extraído del código: las dos claves
  del modelo (`rut_paciente` y `user_email`), las entidades, el catálogo de ~70 endpoints, los
  perfiles y el patrón canónico de módulo. Complementa a este archivo: aquí están las
  convenciones, allí el modelo. Se actualiza cuando cambia el modelo o aparece un endpoint nuevo.

### Skills (`.claude/skills/`)

| Skill | Para qué |
|---|---|
| `ergo-code` | **Cómo se escribe código aquí**: TS estricto, componentes como arrow function con `interface Props` local, `sx` de MUI, servicios por `ApiAdapter`. Cárgala antes de crear o modificar cualquier `.ts`/`.tsx`. |
| `ergo-login` | Conocimiento completo de `src/Login/` (13 archivos): modal dual login/registro, `custom-form.json`, `UseRegister` y sus 5 consumidores externos, sesión. |
| `ergo-chequeo` | Conocimiento completo de `src/Chequeo/` (75 archivos): matriz de tabs por perfil, las dos máquinas de estados, los 5 JSON de formularios, servicio de 23 métodos, lógica clínica de IMC. |
| `ergo-chequeo-cardiovascular` | Conocimiento completo de `src/chequeo-cardiovascular/` (67 archivos): los 4 tabs de índice estable, el formulario agrupado por `seccion`, la validación de solo campos visibles, los 3 servicios, el blindaje de los gráficos y las cuatro reglas duras. **No confundir con `ergo-chequeo`**: son dos módulos distintos. |
| `ergo-common` | Conocimiento completo de `src/common/` (21 archivos, 64 dependientes): `ApiAdapter`, los tres contextos globales, localStorage, y por qué `table/` es código muerto. |
| `spec`, `spec-impl` | Flujo spec-driven genérico (enlazadas a `.agents/skills/`, ver sección siguiente). |
| `spec-impl-ergo` | `/spec-impl` + cierre propio del proyecto (ver sección siguiente). |

### Agentes (`.claude/agents/`)

| Agente | Misión | Perímetro |
|---|---|---|
| `ergosanitas-developer` | Desarrolla, modifica, prueba y corrige respetando las convenciones. El agente de uso general para implementar. | Todo el repo |
| `ergosanitas-architect` | Conoce arquitectura y modelo; diseña módulos nuevos y revisa coherencia. Diseña, no implementa. | Todo el repo (diseño) |
| `ergo-login` | Dueño de `src/Login/` | **Solo `src/Login/`** |
| `ergo-chequeo` | Dueño de `src/Chequeo/` (módulo viejo, perfiles Administrador/Medicos/Usuario) | **Solo `src/Chequeo/`** |
| `ergo-chequeo-cardiovascular` | Dueño de `src/chequeo-cardiovascular/` (módulo nuevo, perfil Colegios) | **Solo `src/chequeo-cardiovascular/`** |
| `ergo-common` | Dueño de `src/common/` | **Solo `src/common/`** |

Los cuatro agentes de módulo tienen **perímetro cerrado**: leen lo que haga falta para entender el
flujo, pero solo modifican su carpeta. Si la tarea exige tocar algo fuera, se detienen y lo
reportan en vez de improvisar. Cada uno carga su skill homónima al arrancar.

⚠️ **`ergo-chequeo` y `ergo-chequeo-cardiovascular` son dueños de módulos distintos** y ninguno
puede tocar el del otro. El perfil decide a quién llamar: `Colegios` → el nuevo; `Administrador`,
`Medicos` y `Usuario` → el viejo. El **ruteo** (`routesCOL.tsx`, `NavigationCol.tsx`,
`NavigationApp.tsx`) queda fuera de ambos perímetros y lo lleva `ergosanitas-developer` o
`ergosanitas-architect`.

**Módulos sin agente propio pero con guía**: `src/ficha-clinica/` y `src/home-ergo/` usan
`ergosanitas-developer` más su `CLAUDE_<MODULO>.md` en `specs/`.

## Flujo Spec-Driven (skills `/spec`, `/spec-impl` y `/spec-impl-ergo`)

El proyecto usa diseño guiado por especificación. Las skills viven en `.claude/skills/` y `.agents/skills/`:

- **`/spec <descripción>`** — diseña una spec por fases (nunca escribe código). Guarda en `specs/<modulo>/NN-slug.md` en estado `Borrador`. Lee `template.md` de la skill para la estructura.
- **`/spec-impl <NN-slug>`** — implementa una spec **ya aprobada** (`Aprobado`); crea/cambia a la rama `spec-NN-slug` (según `specs/.spec-config.yml`, `AutoCreateBranch: true` por defecto) e implementa por pasos con pausas para revisar diffs.
- **`/spec-impl-ergo <NN-slug>`** — **el que conviene usar en este repo.** No reimplementa nada:
  invoca `/spec-impl` tal cual y le añade el cierre propio del proyecto — detectar módulos
  tocados, `npm run build` + `eslint`, **revisión por el agente dueño de cada módulo**, repaso de
  los criterios de aceptación, y actualización de `CLAUDE_<MODULO>.md` / `ARQUITECTURA.md` /
  estado de la spec. Marca `Implementado` solo si todos los criterios pasaron.

Convenciones del repo:

- **Las specs se agrupan por módulo**: hoy hay tres carpetas,
  `specs/ficha-clinica/` (`01-…` a `04-…`), `specs/home-ergo/` (`01-…` a `03-…`) y
  `specs/chequeo-cardiovascular/` (`01-…`).
  La numeración es correlativa **dentro de cada carpeta**, así que existen tres specs `01`
  distintas y hay que nombrarlas con su módulo. Si el módulo tiene guía propia
  (`CLAUDE_<MODULO>.md`), vive en la misma carpeta y se actualiza al cerrar cada spec:
  `CLAUDE_FICHA_CLINICA.md`, `CLAUDE_HOME_ERGO.md` y `CLAUDE_CHEQUEO_CARDIOVASCULAR.md`.
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
