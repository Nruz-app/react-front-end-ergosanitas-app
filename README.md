# Ergosanitas SPA — front-end

Aplicación web (SPA) de **Ergosanitas**: chequeos cardiovasculares y evaluaciones físicas a
deportistas —mayormente escolares— para colegios, clubes y ligas. Alrededor de ese acto clínico
giran bioimpedancia, electrocardiograma, certificados en PDF, incidentes y lesiones, reserva y
pago de horas, estadísticas por institución y asistentes de IA.

Este archivo es la **documentación general** del proyecto: qué es, cómo se instala, qué hay
dentro y cómo se despliega. Los otros documentos del repositorio son complementarios y **no se
repiten** aquí:

| Documento | Para qué |
|---|---|
| `CLAUDE.md` | **Convenciones y trampas** al escribir código. Guía operativa del día a día. |
| `.claude/ARQUITECTURA.md` | **Modelo de dominio**: entidades, las dos claves, catálogo de ~70 endpoints, patrón canónico de módulo. |
| `specs/<modulo>/CLAUDE_<MODULO>.md` | Guía viva de cada módulo construido por spec. |
| `specs/<modulo>/NN-slug.md` | Las especificaciones, con su estado y sus decisiones. |

El sistema **está en producción**. Toda funcionalidad nueva reutiliza la arquitectura existente,
respeta los permisos por perfil y evita romper los módulos actuales.

---

## 1. Puesta en marcha

### Requisitos

- **Node.js 18, 20 o 22** (la CI construye con las tres; el build que se publica usa 22.x. La
  imagen Docker usa `node:21-alpine3.19`).
- **npm** (el repositorio versiona `package-lock.json`).
- Un backend accesible en `VITE_API` — no vive en este repositorio.

### Instalación

```bash
git clone https://github.com/nruz176/react-front-end-ergosanitas-app.git
cd ergosanitas-app
npm install --legacy-peer-deps
cp .env.example .env        # completa los valores (ver §2)
npm run dev                 # http://localhost:5173
```

> ⚠️ **`--legacy-peer-deps` no es opcional.** La mezcla de MUI 5 con librerías React más nuevas
> genera conflictos de *peer dependencies*; la CI instala exactamente así. Un `npm install` a
> secas puede fallar o dejar un árbol distinto al de producción.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite con HMR (puerto 5173). |
| `npm run build` | `tsc -b` (type-check de los tres `tsconfig`) **y luego** `vite build` → `dist/`. |
| `npm run lint` | ESLint sobre todo el repositorio. |
| `npm run preview` | Sirve el `dist/` ya construido, para revisar el build. |
| `npx eslint src/<modulo>/` | Lint acotado a un módulo: lo habitual antes de commitear. |

**No hay framework de tests.** No existe script `test` ni runner (Jest/Vitest). La verificación
antes de commitear es `npm run build` en verde y `npx eslint src/<modulo>/` en 0 hallazgos.

`npm run build` **falla si hay errores de tipos**: `tsc -b` corre antes de Vite, así que un
cambio que no tipa no compila.

---

## 2. Variables de entorno

Todas llevan prefijo `VITE_` y quedan **expuestas al cliente** vía `import.meta.env`. No pongas
secretos de servidor aquí.

| Variable | Para qué | Ejemplo |
|---|---|---|
| `VITE_API` | Base del backend. | `http://127.0.0.1:8000/api` |
| `VITE_API_PATH` | Segmento que se **concatena** a `VITE_API` dentro de cada servicio. | `/v1` o vacío |
| `VITE_GOOGLE_CLIENT_ID` | OAuth de Google (`@react-oauth/google`). | `xxxx.apps.googleusercontent.com` |
| `VITE_MAPBOX_KEY` | Token público de Mapbox. | `pk.xxxx` |

Cada servicio arma su base así, en su propio archivo (no hay constante global):

```ts
const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
```

⚠️ **`.env.example` no incluye `VITE_API_PATH`**, pero el código sí lo usa: si falta, la URL
queda con un `undefined` pegado. Decláralo aunque sea vacío. `.env` está en `.gitignore`; en
producción la CI genera `.env.production` desde los *secrets* de GitHub.

---

## 3. Stack

Verificado contando importaciones reales en `src/`, no leyendo el `package.json`.

- **Vite 5 + React 18 + TypeScript 5** (SPA, `"type": "module"`).
- **UI: MUI 5** — `@mui/material` (229 archivos), `@mui/icons-material` (85),
  `@mui/x-data-grid` y `-premium`, `@mui/x-date-pickers`. Estilos con la prop `sx`; Emotion entra
  como *peer* de MUI y nunca se importa directo.
- **Ruteo:** `react-router-dom` 6 con **`HashRouter`** — el deploy es estático por FTP, sin
  reescrituras de servidor: por eso las URLs llevan `#`.
- **Formularios:** `react-hook-form` + `yup` (23 y 13 archivos) es el patrón vigente. **Formik
  sobrevive en 5 archivos antiguos** (Certificados, LikeText de Chequeo, Home): no lo propagues.
- **HTTP:** `axios`, importado **en un solo archivo** (`src/common/api/api.adapter.ts`). Todo lo
  demás pasa por ese adaptador.
- **Gráficos:** `chart.js` + `react-chartjs-2` (18 archivos).
- **Excel:** `exceljs` + `file-saver`. **Fechas:** `dayjs`. **Mapas:** `mapbox-gl`.
  **Calendario:** `@fullcalendar/*`. **Google OAuth:** `@react-oauth/google`.
- **Feedback al usuario:** `Swal` de **`sweetalert2`** en 25 archivos (ver el aviso de §4).
- **PDF:** no se renderizan en el front. Se abren con
  `window.open(url, '_blank', 'noopener,noreferrer')`.

### Estado de la aplicación — la realidad, no el `package.json`

**`@tanstack/react-query` y `@reduxjs/toolkit` están declarados como dependencias y no se usan
en ni un solo archivo de `src/`.** El patrón real es:

- **Estado de servidor:** llamada directa al servicio (`await UseXService()`) desde un
  `useEffect` o un handler, guardada con `useState`. Sin caché ni invalidación.
- **Estado global:** React Context + reducer. Tres providers anidados en `src/App.tsx`:
  `HelmetProvider → LoginProvider → ModalProvider → SubMenuProvider`.

No introduzcas react-query ni Redux "porque ya están": sería estrenar una arquitectura nueva
dentro de una tarea que pedía otra cosa.

---

## 4. Dependencias

### En uso, por número de archivos que las importan

| Paquete | Archivos | Paquete | Archivos |
|---|---|---|---|
| `@mui/material` | 229 | `@mui/x-date-pickers` | 6 |
| `react` | 225 | `formik` *(legado)* | 5 |
| `@mui/icons-material` | 85 | `exceljs`, `file-saver`, `react-helmet-async` | 4 |
| `sweetalert2` | 25 | `@mui/x-data-grid`, `@fullcalendar/react`, `@tabler/icons-react` | 3 |
| `react-hook-form` | 23 | `@mui/x-data-grid-premium`, `@fullcalendar/core`, `react-dom`, `react-fast-marquee`, `swiper` | 2 |
| `react-router-dom` | 19 | `axios` *(solo en `api.adapter.ts`)*, `mapbox-gl`, `@react-oauth/google`, `react-player`, `react-multi-carousel`, `react-grid-gallery`, `react-slideshow-image`, `react-type-animation`, `@ramonak/react-progress-bar` | 1 |
| `chart.js`, `react-chartjs-2` | 18 | | |
| `dayjs`, `yup` | 13 | | |
| `@hookform/resolvers` | 10 | | |
| `react-device-detect` | 9 | | |

### 🔴 `sweetalert2` es una dependencia fantasma

Se importa en **25 archivos** (`import Swal from 'sweetalert2'`) pero **no está declarada en
`package.json`**. Funciona porque `react-sweetalert2` la arrastra como dependencia transitiva
(`^11.7.5`; instalada 11.14.1). Es frágil: el día que se quite `react-sweetalert2` —que en sí
mismo **no se usa en ningún archivo**— la aplicación deja de compilar. Declararla de forma
explícita es la corrección, y merece su propio commit.

### Declaradas y sin uso en `src/`

`@reduxjs/toolkit` · `@tanstack/react-query` · `react-bootstrap` · `react-modal` ·
`react-markdown` · `react-pdf` · `@react-pdf-viewer/core` · `@react-pdf-viewer/default-layout` ·
`react-date-picker` · `react-sweetalert2` · `lodash` · `moment` · `animate.css` · `pro-gallery` ·
`@fortawesome/fontawesome-svg-core` · `@fortawesome/react-fontawesome`

Dos matices antes de borrar nada:

- **`@emotion/react` y `@emotion/styled` no se importan directamente pero son obligatorias**: son
  *peer dependencies* de MUI 5.
- **Font Awesome y el CSS de Mapbox entran por CDN** desde `index.html`, no por npm. Por eso los
  paquetes `@fortawesome/*` figuran sin uso mientras los iconos sí se ven en pantalla.

---

## 5. Estructura del repositorio

```
ergosanitas-app/
├── src/                      código de la aplicación (554 archivos, ~39.300 líneas TS/TSX)
├── public/                   estáticos servidos tal cual (incl. public/home-ergo/)
├── specs/                    especificaciones por módulo + guías CLAUDE_<MODULO>.md
├── .claude/                  agentes, skills y ARQUITECTURA.md del proyecto
├── .agents/skills/           skills spec y spec-impl importadas (Klerith/fernando-skills)
├── .github/workflows/        CI: build, Docker y despliegue FTP
├── k8s/app-ergosanitas/      chart de Helm (deployment + service)
├── nginx/nginx.conf          configuración del Nginx que sirve el build en Docker
├── dockerHub/                compose que consume la imagen publicada
├── dockerfile                build multi-etapa Node → Nginx
├── docker-compose.yml        build local del contenedor
├── CLAUDE.md                 convenciones de código y trampas conocidas
└── README.md                 este archivo
```

---

## 6. Inventario de módulos

Cada carpeta de primer nivel de `src/` es un **módulo autocontenido**, típicamente con
`components/`, `config/`, `context/`, `hooks/`, `interface/`, `pages/`, `services/`,
`utilities/` y un `index.ts` de barril.

### Módulos con guía propia (construidos por spec)

| Módulo | Tamaño | Qué es | Guía |
|---|---|---|---|
| `chequeo-cardiovascular/` | 84 arch. · 5.832 líneas | Reemplazo de `Chequeo/` construido **perfil por perfil**; hoy sirve solo a `Colegios`. 5 tabs de índice estable: Home, Asistente Virtual, Lista, Alta/Edición, Carga masiva. Tab propio de asistente virtual conversacional. | `specs/chequeo-cardiovascular/CLAUDE_CHEQUEO_CARDIOVASCULAR.md` |
| `ficha-clinica/` | 55 arch. · 5.681 líneas | Ficha clínica del paciente por RUT: 5 tabs, 3 capas de datos con mappers, silueta segmentaria en SVG y tab «Asistente Ergo». **La referencia de arquitectura de datos.** | `specs/ficha-clinica/CLAUDE_FICHA_CLINICA.md` |
| `home-ergo/` | 43 arch. · 2.920 líneas | Portada comercial pública (`/`): galería, promociones, videos, franja de contacto y chat de ventas. Todo el contenido vive en 6 JSON de `config/`. | `specs/home-ergo/CLAUDE_HOME_ERGO.md` |

### Módulos de negocio

| Módulo | Tamaño | Qué es |
|---|---|---|
| `Chequeo/` | 75 arch. · 5.887 líneas | El módulo más grande y antiguo: chequeo preventivo cardiovascular para `Administrador`, `Medicos` y `Usuario`. Tabla de deportistas, alta/edición, ECG, carga masiva, IMC, exportación a Excel. |
| `EmergenciaDeportivas/` | 24 arch. · 2.026 líneas | Panel del perfil `Emergencia Deportiva`: estadísticas de incidentes por liga, club, categoría, gravedad y parte del cuerpo. |
| `AgendarHora/` | 23 arch. · 1.036 líneas | Reserva de horas y catálogo de servicios; pago por Transbank WebPay. |
| `Servicios/` | 22 arch. · 1.859 líneas | Página pública de servicios ofrecidos. |
| `Certificados/` | 21 arch. · 995 líneas | Emisión, validación y descarga de certificados en PDF por RUT. |
| `Home/` | 21 arch. · 1.354 líneas | Portada anterior. **Intacta y sin rutear** desde que entró `home-ergo`: es la vía de reversa. |
| `pagos-mensual/` | 14 arch. · 1.798 líneas | Resumen mensual de pagos y su variante MDC (perfil `Administrador`). |
| `asistente-voz/` | 13 arch. · 1.336 líneas | Asistente por voz sobre `GPT/asistente-voz` (perfil `Usuario`). |
| `presentation/` | 13 arch. · 610 líneas | Asistente clínico SAM (`sam-assistant/as-question`). |
| `Estadisticas/` | 12 arch. · 807 líneas | Gráficos agregados por institución (IMC, presión, saturación, hemoglucotest). |
| `LoginGoogle/` | 10 arch. · 293 líneas | Ingreso con Google. Único punto que escribe en localStorage (clave `AuthRegister`). |
| `User/` | 10 arch. · 428 líneas | Alta y edición de usuarios; formulario declarado en `config/custom-form.json`. |
| `reserva-hora/` | 10 arch. · 412 líneas | Agenda mensual con FullCalendar. **Su ruta está comentada** en `routesErgo.ts`. |
| `Bioimpedancia/` | 8 arch. · 825 líneas | Composición corporal. `IBioimpedanciaAll` es **la entidad mejor tipada del repo**. |
| `Incidentes/` | 8 arch. · 411 líneas | Registro de lesiones deportivas con jerarquía liga → club → categoría. |
| `Url/` | 8 arch. · 304 líneas | Resolución de URLs de certificados. |
| `Maps/` | 4 arch. · 111 líneas | Mapa con Mapbox. |
| `AsistenteVirtual/` | 2 arch. · 19 líneas | Envoltorio del asistente. |
| `Footer/` | 1 arch. · 79 líneas | Pie de página. |

### Infraestructura y transversales

| Módulo | Tamaño | Qué es |
|---|---|---|
| `routes/` | 14 arch. · 2.706 líneas | Los 6 navegadores y sus 6 tablas de rutas. Ver §7. |
| `common/` | 21 arch. · 929 líneas | `ApiAdapter`, los 3 contextos globales, localStorage y la tabla genérica. **64 archivos dependen de él.** |
| `Login/` | 13 arch. · 481 líneas | Modal dual login/registro. `UseRegister` es API pública consumida por 5 módulos. |
| `components/` | 10 arch. · 887 líneas | Componentes de formulario compartidos. ⚠️ `InputText` está acoplado a Chequeo: recalcula el IMC en cada cambio. |
| `assets/`, `types/` | 18 arch. | Imágenes y tipos globales. |

---

## 7. Arquitectura en seis conceptos

### 7.1 Navegación por perfil

No hay un router único. `src/routes/NavigationApp.tsx` elige el **navegador raíz** según
`user.user_perfil` del `LoginContext`:

| Perfil | Navegador | Rutas | Qué ve |
|---|---|---|---|
| `Colegios` | `NavigationCol` | `routesCOL.tsx` | Chequeo Cardiovascular (módulo nuevo) |
| `Medicos` | `NavigationMe` | `routesME.tsx` | Home + Chequeos |
| `Paciente` | `NavigationPA` | `routesPA.tsx` | Home |
| `Emergencia Deportiva` | `NavigationED` | `routesED.ts` | Home de incidentes |
| Autenticado, resto | `NavigationErgo` | `routesErgo.ts` | Chequeos, Bioimpedancia, Incidentes, Pagos, Asistente de voz |
| No autenticado | `Navigation` | `routes.ts` | Portada, Agendar, Certificados, Servicios |

Tres trampas conocidas, detalladas en `CLAUDE.md`:

1. **Cada `routes*` declara su propio `interface Route`**: no hay tipo compartido.
2. **El filtrado por perfil no es uniforme.** Solo `NavigationErgo` entiende el comodín `'All'`;
   `ED`, `Me` y `PA` comparan inline y una ruta marcada `'All'` no les aparece.
3. **`NavigationApp` decide por perfil antes de mirar `valid`**: no te apoyes en `valid` para
   proteger una vista.

`status: boolean` sí es uniforme: los navegadores autenticados filtran por él, así que una vista
se desactiva sin borrar su entrada.

### 7.2 Sesión

`LoginProvider` (Context + reducer) expone `{ valid, user, ValidLogin }`.
⚠️ **La sesión no se persiste**: el provider arranca siempre vacío, así que **un F5 desloguea**.
No hay interceptor de axios ni header `Authorization`: la autenticación efectiva va por
cookie/sesión del backend.

### 7.3 Capa HTTP

`src/common/api/api.adapter.ts` define `HttpAdapter` y la clase `ApiAdapter`, envoltorio fino de
axios con `getToken/get/post/put/delete`. Sin interceptores, sin retry, sin `baseURL`, **sin
manejo de errores**: un 4xx/5xx propaga la excepción, por eso los módulos envuelven las llamadas
en `try/catch` + `Swal`. `get` inyecta `limit`/`offset` (defaults `10`/`1`); `getToken` es un
`get` sin params — el nombre engaña, no gestiona tokens.

Patrón de servicio por módulo: una función `UseXService` asíncrona que instancia `new ApiAdapter()`,
arma `API` y expone métodos tipados. Nunca axios suelto en un componente.

### 7.4 Las dos claves del modelo

Casi ninguna entidad se cruza con un id relacional:

| Clave | Qué identifica |
|---|---|
| `rut_paciente` (o `rut`) | **La persona evaluada.** Clave natural del paciente. |
| `user_email` | **El dueño de los datos** — colegio, club o médico. Clave de multi-tenencia. |

Por eso los endpoints terminan en `/{rut_paciente}` o `/{user_email}`. **No inventes un
`id_institucion` ni un `id_paciente`: el backend no los tiene.** El catálogo completo de
endpoints está en `.claude/ARQUITECTURA.md`.

### 7.5 Nunca mapear ausencia de dato a `0`

Se usa `number | null` y la UI muestra `—`. Un cero en un signo vital es una medición, no un
vacío. `IBioimpedanciaAll` y la ficha clínica son el modelo a imitar.

### 7.6 Patrón canónico de módulo

Página contenedora que hace **todo** el fetch → componentes presentacionales por props →
servicio con `ApiAdapter` → tipos en `interface/` (cruda → mapper → modelo de UI si el backend
viene sucio) → barril `index.ts` con la página `lazy`. El checklist para dar de alta un módulo
está en `.claude/ARQUITECTURA.md` §7.

---

## 8. Roles del sistema

| Rol | Alcance |
|---|---|
| **Administrador** | Administración completa: usuarios, configuración, permisos y todos los módulos. |
| **Médico** | Pacientes, revisión de exámenes, diagnósticos, informes y seguimiento clínico. |
| **Colegio** | Solo la información autorizada de los pacientes de su institución, y la gestión de sus procesos. |
| **Check (recepción)** | Registro de pacientes, validación, control de ingreso, agenda y confirmación de asistencia. |
| **Paciente** | Su propia información clínica. |
| **Emergencia Deportiva** | Incidentes y lesiones de sus ligas y clubes. |

⚠️ `user_perfil` es un **string libre** que llega del backend, no un enum. Además de los
navegadores, hay comparaciones `user_perfil === "..."` dentro de los módulos: al buscar qué ve un
rol, revisa ambos sitios.

---

## 9. Funcionalidades principales

- Administración de pacientes y de sus datos personales.
- Chequeo preventivo cardiovascular: alta, edición, estados clínicos y carga masiva.
- Fichas clínicas con antecedentes, bioimpedancia y electrocardiogramas.
- Registro de ECG y análisis asistido por IA.
- Bioimpedancia y composición corporal.
- Certificados en PDF: emisión, validación y descarga.
- Incidentes y lesiones deportivas, con estadísticas por liga, club y categoría.
- Agenda de horas, reservas y pago en línea por Transbank WebPay.
- Estadísticas agregadas por institución.
- Exportación a Excel.
- Asistentes de IA: clínico (SAM), por voz, comercial (portada), el de la ficha clínica y el del
  Home del colegio.

**Los asistentes están separados por endpoint a propósito, y es una separación de seguridad.**
Cada uno ve solo lo que su consumidor debe ver, y cada uno lleva su propia clave de sesión en
localStorage para que los hilos no se contaminen entre sí:

| Asistente | Endpoint | Alcance | Clave de sesión |
|---|---|---|---|
| Global / ficha clínica | `sam-assistant/as-question` | Un paciente, por RUT | `chat_session_id` · `ficha_chat_session_id` |
| Home del colegio | `sam-assistant-club/as-question` | Una institución, por `email` | `colegio_chat_session_id` |
| Comercial (portada) | `chat-comercial/as-question` (**no existe aún**, responde en eco) | Sin datos clínicos | `home_chat_session_id` |

Reutilizar uno en el sitio de otro expondría datos que ese consumidor no debe ver: el chat
comercial lo usa un visitante anónimo, y el del colegio no debe poder resolver por un RUT
arbitrario.

---

## 10. Despliegue

### Docker (local)

```bash
docker compose up --build      # build multi-etapa y Nginx en http://localhost:5173
```

`dockerfile` construye con `node:21-alpine3.19`, copia `dist/` a `nginx:alpine`, reemplaza la
configuración por defecto con `nginx/nginx.conf` (escucha en **5173** y hace
`try_files … /index.html`) y expone ese puerto.

### Imagen publicada

`dockerHub/docker-compose.yml` levanta la imagen ya publicada:
`nruz176/react-front-end-ergosanitas-app:latest`.

### Kubernetes

Chart de Helm en `k8s/app-ergosanitas/` (`Chart.yaml`, `values.yaml`, deployment y service).
Notas de uso en `k8s/k8s.README.md`.

### CI/CD — el camino real a producción

`.github/workflows/github-action.build.yml`, en cada **push a `main`**:

1. **Versión semántica** desde los mensajes de commit (PaulHatch/semantic-version):
   prefijo **`feat`** ⇒ *minor*, **`major`** ⇒ *major*. **Usa estos prefijos.**
2. **Docker**: build y push a Docker Hub con la versión nueva y `latest`.
3. **Node 22**, `npm install --legacy-peer-deps`, genera `.env.production` desde los secrets y
   corre `npm run build`.
4. **Despliegue por FTP**: `lftp … mirror -R dist/ /public_html` a `ergosanitas.com`.

*Secrets* que consume: `DOCKER_USER`, `DOCKER_PASSWORD`, `VITE_API`, `VITE_API_PATH`,
`VITE_GOOGLE_CLIENT_ID`, `VITE_MAPBOX_KEY`, `FTP_USERNAME`, `FTP_PASSWORD`.

Dos detalles que importan al tocar *assets*:

- **La matriz `[18.x, 20.x, 22.x]` aplica al job completo**: hoy son tres builds de Docker y
  **tres subidas FTP en paralelo** al mismo servidor por cada push.
- **`mirror` va sin `--delete`**: no borra en el servidor lo que no viene en `dist/`. Por eso lo
  subido a mano —los videos de la portada— sobrevive a cada despliegue.

### Assets que no están en el repositorio

`public/home-ergo/video/` está en `.gitignore`: los 7 videos (139 MB) se subieron por FTP a
`/public_html/home-ergo/video/`. **Agregar un video son dos pasos**: subirlo por FTP *y* añadir su
entrada en `home-videos.json`. Quien clone el repo verá las carátulas sin reproducción.

---

## 11. Herramientas de IA del repositorio

El proyecto está preparado para trabajar con **Claude Code**. Todo lo específico del proyecto
está versionado dentro del repositorio.

### Servidores MCP

Tres servidores configurados **a nivel de usuario para esta carpeta** (no hay `.mcp.json`
versionado, así que cada quien los instala en su máquina):

| Servidor | Paquete | Para qué |
|---|---|---|
| `context7` | `@upstash/context7-mcp` | Documentación actualizada de librerías (MUI, React, Vite…). |
| `github` | `@modelcontextprotocol/server-github` | Issues, PRs y búsqueda de código en GitHub. |
| `playwright` | `@playwright/mcp` | Manejo del navegador para revisar la UI en marcha. |

```bash
claude mcp add context7   -- npx -y @upstash/context7-mcp@latest
claude mcp add github     -- npx -y @modelcontextprotocol/server-github
claude mcp add playwright -- npx @playwright/mcp@latest
```

El servidor de GitHub necesita un token propio (`GITHUB_PERSONAL_ACCESS_TOKEN`); pásalo con
`--env` al agregarlo y **nunca lo escribas en un archivo versionado**.

### Skills

Las del proyecto viven en `.claude/skills/`; las genéricas de terceros se instalan aparte.

| Skill | Para qué |
|---|---|
| `ergo-code` | **Cómo se escribe código aquí**: TS estricto, componentes como arrow function con `interface Props` local, `sx` de MUI, servicios por `ApiAdapter`, comentarios en español que explican el porqué. |
| `ergo-chequeo` | `src/Chequeo/` completo (75 archivos): matriz de tabs por perfil, las dos máquinas de estados, los 5 JSON de formularios, el servicio de 23 métodos, la lógica clínica de IMC. |
| `ergo-chequeo-cardiovascular` | `src/chequeo-cardiovascular/` completo (84 archivos): los 4 tabs de índice estable, el formulario agrupado por `seccion`, la validación de solo campos visibles, el Home de chat + lista + 5 gráficos, las cuatro reglas duras. |
| `ergo-common` | `src/common/` completo (21 archivos, 64 dependientes): `ApiAdapter`, los tres contextos, localStorage, y por qué `table/` es código muerto. |
| `ergo-login` | `src/Login/` completo (13 archivos): modal dual, `custom-form.json`, `UseRegister` y sus 5 consumidores externos. |
| `spec-impl-ergo` | `/spec-impl` más el cierre propio del proyecto: build, lint, revisión por el agente dueño de cada módulo y actualización de la documentación. |
| `spec`, `spec-impl` | Flujo spec-driven genérico, importado de `Klerith/fernando-skills` (ver `skills-lock.json`). |

```bash
npx skills@latest add Klerith/fernando-skills                       # /spec y /spec-impl
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

### Agentes

En `.claude/agents/`. Los cuatro de módulo tienen **perímetro cerrado**: leen lo que necesiten,
pero solo modifican su carpeta; si la tarea exige salir de ella, se detienen y lo reportan.

| Agente | Misión | Perímetro |
|---|---|---|
| `ergosanitas-developer` | Implementar, corregir y refactorizar respetando las convenciones. | Todo el repo |
| `ergosanitas-architect` | Diseñar módulos nuevos y revisar coherencia. Diseña, no implementa. | Todo el repo (diseño) |
| `ergo-chequeo` | Dueño del chequeo viejo (`Administrador`, `Medicos`, `Usuario`). | Solo `src/Chequeo/` |
| `ergo-chequeo-cardiovascular` | Dueño del chequeo nuevo (perfil `Colegios`). | Solo `src/chequeo-cardiovascular/` |
| `ergo-common` | Dueño de la infraestructura transversal. | Solo `src/common/` |
| `ergo-login` | Dueño de la autenticación. | Solo `src/Login/` |

⚠️ `ergo-chequeo` y `ergo-chequeo-cardiovascular` son **dos módulos distintos** y ninguno toca el
del otro. El **ruteo** queda fuera de ambos perímetros.

### Flujo spec-driven

Las features grandes pasan por especificación antes del código:

```bash
/spec <descripción>          # diseña la spec; nunca escribe código. Queda en Borrador.
/spec-impl-ergo <NN-slug>    # implementa una spec Aprobada, con el cierre del proyecto
```

Convenciones:

- Las specs se agrupan **por módulo** y la numeración es correlativa **dentro de cada carpeta**:
  hoy existen tres specs `01` distintas, así que nómbralas siempre con su módulo.
- Los estados van en español: `Borrador` → `Aprobado` → `Implementado` (también `En revisión` /
  `Obsoleto`).
- **El cambio a `Aprobado` lo hace una persona, nunca el agente.**
- Si durante la implementación una decisión de la spec resulta equivocada, **se corrige en la
  spec**, no en el código por sorpresa.

Estado actual:

| Carpeta | Specs |
|---|---|
| `specs/ficha-clinica/` | `01` a `04` — todas Implementadas |
| `specs/home-ergo/` | `01` a `03` — todas Implementadas |
| `specs/chequeo-cardiovascular/` | `01` a `03` — todas Implementadas |

⚠️ **`Implementado` significa «el código está completo y revisado», no «probado en ejecución».**
Varias specs cerraron con criterios de comportamiento pendientes de prueba manual, porque
verificarlos exige la app corriendo con una sesión del perfil afectado. Cada spec los lista en su
propia sección de estado de verificación — mírala antes de dar una funcionalidad por probada.

---

## 12. Deuda técnica conocida

Está documentada a propósito: son trampas reales, no pendientes que alguien deba "limpiar" de
paso.

- **La sesión no se persiste**: un F5 desloguea. `LoginGoogle` escribe `AuthRegister` en
  localStorage y nadie lo lee al arrancar.
- **`sweetalert2` no está declarada** en `package.json` (§4).
- **`src/common/table/` es código muerto**: de sus 595 líneas solo se usa el tipo
  `IColumnsTable`. Para un listado nuevo mira `ChequeoTable` o `AgendarHoraTable`.
- **`src/Chequeo/` ramifica toda su interfaz por perfil** y los índices de tab no coinciden entre
  bloques. Su bloque `Colegios` ya es inalcanzable: se conserva como vía de reversa hasta que
  termine la migración.
- **`IChequeo` es casi todo `string` opcional**, incluidos números como el peso y la presión.
- **Lógica clínica delicada**: `UseCalculoIMC` exige la estatura en metros, `UseCalcularPercentil`
  usa una aproximación lineal propia (no tablas OMS/CDC) y `UseIMCRecomendaciones` tiene un bug
  conocido en adultos. **No toques fórmulas ni umbrales sin pedirlo: es una decisión médica.**
- **Las escalas clínicas de la ficha son de población adulta** y el paciente de referencia tiene
  9 años. Van rotuladas como tales; no son válidas en pediatría.
- **`src/Login/config/keys.json`** tiene usuario y contraseña en texto plano, versionado y sin
  uso. Candidato a borrar.
- **`REGEX_RUN` y `email` se declaran** en el formulario de Login **pero no se implementan**: hoy
  no se valida el formato del RUT ni del email al registrarse.
- **El chat comercial responde en eco** (`USAR_ECO = true`): su endpoint
  `chat-comercial/as-question` todavía no existe en el backend.
- **`estadisticas/estadistica-saturacion` devuelve 500** desde siempre; el gráfico se deriva en
  el front. Además, **el backend responde 200 con sobres de error**: los gráficos comprueban
  `Array.isArray(response?.data)` antes de pintar.
- **`dist/` ronda los 60 MB** y el CI lo sube entero por FTP en cada push a `main`.

### Lo que este proyecto no tiene

Para que no se dé por supuesto ni se introduzca de contrabando: no hay tests, ni router único, ni
`BrowserRouter`, ni cliente HTTP con interceptores/retry/caché, ni tipo compartido de ruta, ni
enum de perfiles, ni constante global de API, ni react-query, ni Redux.

---

## 13. Cómo contribuir

1. **Rama por trabajo.** Las de spec siguen el patrón `spec-NN-slug` y las crea `/spec-impl`.
2. **Prefijo del commit**: `feat` para funcionalidad (bumpea *minor* en la CI), `fix`, `docs`,
   `chore`; `major` solo para cambios rompedores.
3. **Verifica antes de commitear**: `npm run build` en verde y `npx eslint src/<modulo>/` en 0.
4. **Respeta el perímetro del módulo.** Los módulos con guía propia (`ficha-clinica`,
   `home-ergo`, `chequeo-cardiovascular`) **no tocan nada fuera de su carpeta**; importar de
   `common/` es lectura y sí está permitido.
5. **Documenta el porqué, no el qué.** Los comentarios del repositorio explican decisiones; en
   español, como el resto del código.
6. Si el módulo tiene `CLAUDE_<MODULO>.md`, **actualízalo al cerrar el trabajo**.
