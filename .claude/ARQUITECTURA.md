# Arquitectura y modelo de Ergosanitas — referencia para módulos nuevos

Documento de referencia extraído **leyendo el código**, no de memoria. Complementa a
`CLAUDE.md` (convenciones y trampas): aquí está el **modelo de dominio, el catálogo de
endpoints y el patrón canónico de módulo** que sirve de plantilla al construir algo nuevo.

Verificado contra el repositorio el 2026-09-03. Si algo aquí no calza con el código, gana el
código: corrige este documento.

---

## 1. El negocio en una frase

Ergosanitas hace **chequeos cardiovasculares y evaluaciones físicas a deportistas** (mayormente
escolares), para colegios, clubes y ligas. Alrededor de ese acto clínico giran: bioimpedancia,
electrocardiograma, certificados en PDF, incidentes/lesiones, reserva y pago de horas,
estadísticas por institución y asistentes de IA.

## 2. Las dos claves del modelo (lo más importante de este documento)

Casi ninguna entidad usa un id relacional para cruzarse. El modelo real se articula sobre **dos
claves de texto**:

| Clave          | Qué identifica                                            | Dónde aparece |
|----------------|-----------------------------------------------------------|---------------|
| `rut_paciente` (o `rut`) | **La persona evaluada**. Es la clave natural del paciente. | `IChequeo.rut`, `IBioimpedanciaAll.rut`, `IIncidentes.rut_paciente`, `IAgendaHora.rut_paciente`, `IUser.rut_paciente?`, la ficha clínica |
| `user_email`   | **El dueño de los datos**: el colegio, club o médico que registró la atención. Funciona como clave de multi-tenencia. | `IChequeo.user_email`, `IIncidentes.user_email`, y **todos** los endpoints de estadísticas e incidentes |

**Consecuencia para un módulo nuevo:** si tu vista muestra datos de una institución, el filtro
casi seguro es `user_email` (el del usuario logueado, desde `LoginContext`), y si muestra el
historial de una persona, es `rut_paciente`. Esa es la razón de que tantos endpoints terminen en
`/{user_email}` o `/{rut_paciente}`. No inventes un `id_institucion` que no existe.

Ojo: los RUT viajan como `string` sin normalización garantizada, y `IUser.rut_paciente` es
opcional — solo el perfil `Paciente` lo trae poblado.

## 3. Identidad y perfiles

```ts
// src/Login/interface/user.ts
interface IUser {
  user_id: number; rut_paciente?: string; user_email: string;
  user_name: string; user_perfil: string; user_logo?: string;
}
```

`user_perfil` es **string libre**, no un enum. Los valores en uso hoy:

`Administrador` · `Medicos` · `Paciente` · `Emergencia Deportiva` · `Usuario` · `Colegios` ·
`'All'` (comodín de ruta, no un perfil real de usuario)

⚠️ **`Colegios` estuvo mucho tiempo sin ruta propia**: llegaba del backend y solo ramificaba la
UI dentro de `src/Chequeo/`. Desde la Spec 01 de `chequeo-cardiovascular` tiene su navegador
(`NavigationCol` + `routesCOL.tsx`) y entra al módulo nuevo. Los otros tres perfiles del chequeo
siguen en `src/Chequeo/`.

`src/routes/NavigationApp.tsx` hace `switch` sobre `user.user_perfil?.trim()` —hoy con cuatro
`case`: `Emergencia Deportiva`, `Paciente`, `Medicos` y `Colegios`— y solo cae a
`valid ? NavigationErgo : Navigation` en el `default`. Los detalles de filtrado están en
`CLAUDE.md` (la trampa nº1): **los seis navegadores no filtran igual y solo `NavigationErgo`
entiende `'All'`**.

Dos consecuencias del cambio, verificadas en el código: `Colegios` ya no ve la entrada
`/Chequeos` (`perfil: 'All'`) de `routesErgo`, y tampoco puede alcanzar por hash el resto de
rutas de ese navegador —`NavigationErgo` las renderiza **sin filtrar por perfil**; el filtro solo
aplica al menú—. Las ramas `user_perfil === "Colegios"` que quedan en `src/Chequeo/`
(`AppChequeo`, `ChequeoTable`, `ChequeoForm`) pasan a ser **código inalcanzable**: se conservan
a propósito hasta que la migración perfil por perfil termine.

Sesión: `LoginProvider` (Context + reducer) en `src/common/context/login/`, expuesto como
`{ valid, user, ValidLogin }`. No hay interceptor de axios ni header `Authorization`: la
autenticación efectiva es cookie/sesión del backend.

## 4. Entidades del dominio

Todas viven en `src/<modulo>/interface/`. Las centrales:

### `IChequeo` — la entidad núcleo (`src/Chequeo/interface/chequeo.interface.ts`)

El registro de una atención. Mezcla identificación (`nombre`, `rut`, `fechaNacimiento`, `edad`,
`sexo_paciente`), signos vitales (`presionArterial`, `presion_sistolica`, `saturacionOxigeno`,
`pulso`, `frecuencia_cardiaca_paciente`, `temperatura`, `hemoglucotest`), antropometría
(`estatura`, `peso`, `imc_paciente`), anamnesis (`enfermedadesCronicas`, `medicamentosDiarios`,
`sistemaOsteoarticular`, `sistemaCardiovascular`, `enfermedadesAnteriores`) y gestión
(`status`, `estado_paciente`, `division_paciente`, `medio_pago_paciente`, `derivacion_paciente`,
`fecha_atencion`, `user_email`).

**Casi todo es `string` opcional**, incluidos números como el peso y la presión. Es deuda
heredada del backend: al leerlos, parsea; al escribir, respeta el tipo que espera el endpoint.
Contrasta con la ficha clínica, que ya usa `number | null` — ese es el rumbo correcto.

Envoltorios de respuesta que conviene conocer, porque son dos formas distintas de paginar:
`IData { data, current_page, per_page, total }` e `IDataAll { data, status, mensaje }`.

### `IBioimpedanciaAll` — composición corporal (`src/Bioimpedancia/`)

La entidad **mejor tipada del repo** y el modelo a imitar: campos agrupados por bloque
(identificación, medidas base, fechas, composición corporal, metabolismo, grasas, indicadores,
objetivos) y **todos los numéricos como `number | null`**, nunca `0` por ausencia. Incluye
`imc`, `grasa_corporal_pct`, `masa_muscular_kg`, `masa_libre_grasa_kg`,
`tasa_metabolica_basal_kcal`, `grasa_visceral`, `smi`, `whr`, entre otros.

### `IIncidentes` — lesiones deportivas (`src/Incidentes/`)

`nombres`, `rut_paciente`, `edad`, `deporte`, `tipo_lesion`, `ubicacion`, `parte_cuerpo`,
`gravedad`, `estado`, `primeros_auxilios?`, más la jerarquía deportiva **`liga` → `club_deportivo`
→ `categoria`** y el `user_email` dueño. Esa jerarquía es la que explota el panel de
estadísticas de incidentes.

### `IAgendaHora` + `IServicios` — reservas y pago

`IAgendaHora` es una reserva con datos de contacto del paciente (`email_paciente`,
`celular_paciente`, `comuna_paciente`, `direccion_paciente`), el `servicios_name` reservado,
`fecha_reserva_paciente` y `pagado_paciente`. `IServicios { id, nombre, precio, descripcion,
activo }` es el catálogo. El pago sale por **Transbank WebPay**.

### `IFichaClinica` — el agregado por paciente (`src/ficha-clinica/`)

Compone `IPacienteBase`, `IAntecedentes`, `IBioimpedancia[]` e `IElectrocardiograma[]` en una
sola respuesta por RUT. Es el modelo más moderno y el único con **tres capas explícitas**:

1. `api.interface.ts` — forma cruda del backend, con sus typos. **Ningún componente la importa.**
2. `ficha-clinica.interface.ts` — modelo de UI, producido por `utilities/mappers.ts`.
3. `segmentaria.interface.ts` — derivado en el front (no viene del backend).

Si tu módulo nuevo consume un endpoint con nombres feos o inconsistentes, **copia este patrón**:
cruda → mapper → modelo de UI.

## 5. Catálogo de endpoints

Base: `` const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}` `` (así, en
cada servicio; no hay una constante global).

| Dominio | Endpoints |
|---|---|
| **Auth / usuarios** | `auth-login` · `auth-register` · `auth-register/load-logo` · `auth-register/user_email/{perfil}` · `login/create-user` · `user-save` · `user-update-password` · `user-update-ergo-pass` · `user-first-ergo-pass` |
| **Chequeo cardiovascular** | `chequeo-cardiovascular` (GET/POST) · `/{id}` · `/{rut_paciente}` · `/{id_paciente}` · `/{id}/{user_email}` · `/chequeo-all` · `/club-deportivo` · `/filter-calendar` · `/like-chequeo` · `/like-chequeo/user` · `/estado-general/{user_email}` · `/pdf/{id_paciente}` · `/pdfRut/{rut_paciente}` |
| **Bioimpedancia** | `bioimpedancia/create-bio` · `/form-upload` · `/list-all` · `/first-rut` · `/pdfRut/{rut_paciente}` |
| **Electrocardiograma** | `electro-cardiograma/save` · `carga-masiva-ecg` · `carga-masiva/excel` |
| **Certificados** | `certificado/{rut_paciente}` · `certificado/validar/{rut_paciente}` · `certificado/path-url` · `certificado/valida-certificado` · `certificado/save-url` |
| **Ficha clínica** | `ficha-clinica/{rut}` |
| **Incidentes** | `incidencia-deportivos/create` · `/find-by-user/{user_email}` · `/count-club/…` · `/count-liga/…` · `/count-gravedad/…` · `/liga-casos/…` · `/lesion-frecuente/…` · `/sp_estadistica_liga|_categoria|_lesiones|_lesiones_fechas|_parte_cuerpo/{user_email}` |
| **Estadísticas** | `estadisticas/estadistica-imc|-presion|-saturacion|-hemoglucotest/{user_email}` · `estadisticas/agenda-mensual` · `estadisticas/pago-mensual` · `/estadistica-pago-mensual` · `/estadistica-pago-mdc` · `/update-pago-mensual` · `/delete-pago-mensual` |
| **Agenda / servicios / pago** | `agenda-horas` · `servicios` · `servicios/{nombre}` · `servicios/like` · `email/reserva-hora` · `transbank/web-pay-request` |
| **IA** | `sam-assistant/as-question` · `sam-assistant/reset-patient` (clínico, resuelve por RUT) · `sam-assistant-club/as-question` (**por institución**: body `{ email, prompt, sessionId }`, sin reset) · `chat-comercial/as-question` (**no existe aún**, eco) · `GPT/asistente-voz` · `GPT/analisis-ecg` |

⚠️ **Los asistentes están separados por endpoint a propósito, y es una separación de seguridad.**
`sam-assistant` resuelve por RUT (un paciente), `sam-assistant-club` por `email` (una
institución) y `chat-comercial` no ve datos clínicos (visitantes anónimos). Reutilizar uno en el
sitio de otro expondría datos que ese consumidor no debe ver. Cada uno lleva además **su propia
clave de sesión en localStorage** —`chat_session_id`, `ficha_chat_session_id`,
`colegio_chat_session_id`, `home_chat_session_id`—: compartirlas contaminaría el contexto entre
un paciente y un colegio.

Patrones observables, útiles al diseñar endpoints nuevos: los listados por institución terminan
en `/{user_email}`, los históricos por persona en `/{rut_paciente}`, los PDF se abren con
`window.open(url, "_blank", "noopener,noreferrer")` en vez de descargarse por axios, y los
prefijos `sp_` delatan procedimientos almacenados del backend.

## 6. Cómo se maneja el estado (la realidad, no el package.json)

**`@tanstack/react-query` y `@reduxjs/toolkit` están declarados en `package.json` pero no se
usan en un solo archivo de `src/`.** No los tomes como el patrón del proyecto ni los introduzcas
"porque ya están": eso sería estrenar una arquitectura nueva dentro de una tarea que pedía otra
cosa.

Lo que de verdad se usa:

- **Estado de servidor:** llamada directa al servicio (`await UseXService()`) desde un
  `useEffect` o un handler, guardada con `useState`. Sin caché, sin invalidación.
- **Estado global:** React Context + reducer. Tres providers, anidados en `src/App.tsx` en este
  orden: `HelmetProvider → LoginProvider → ModalProvider → SubMenuProvider`.
- **Formularios:** `react-hook-form` + `yup` (`yupResolver`) es el patrón vigente — hook
  `useXForm` en `hooks/` que devuelve `{ control, reset, handleSubmit, setValue, errors }` y
  esquema en `utilities/`. **Formik sobrevive en 5 archivos antiguos** (Certificados, LikeText
  de Chequeo, Home); no lo propagues ni lo migres sin que te lo pidan.
- **Tablas:** hay una tabla propia en `src/common/table/` (`Table`, `HeaderTable`, `Filters`,
  `Pagination`, `useTable`, `useFiltersBase`) con `IColumnsTable`, `IFilterBase`, `IOrderBy` e
  `IPagination`. Convive con `@mui/x-data-grid`. Para un listado nuevo, mira primero cuál usan
  los módulos vecinos.

## 7. Patrón canónico de módulo

Estructura estándar (la de `src/ficha-clinica/`, el módulo más completo):

```
src/<modulo>/
├── index.ts          # barril: página lazy + `export *` de las capas públicas
├── pages/            # 1 página contenedora; es la ÚNICA que hace fetch
├── components/       # presentacionales, reciben todo por props; subcarpetas por tema
├── config/           # JSON/constantes de contenido (patrón de home-ergo)
├── context/          # Context + reducer, solo si el módulo lo necesita
├── hooks/            # useXForm (RHF+yup), hooks de UI
├── interface/        # tipos: api.interface.ts (crudo) → <modulo>.interface.ts (UI)
├── services/         # UseXService: instancia ApiAdapter, arma API, expone métodos
└── utilities/        # mappers, format, parse, esquemas yup, umbrales
```

Barril de referencia (`src/ficha-clinica/index.ts`): la página va **lazy**, el resto se
reexporta.

```ts
const AppXPages = lazy(() => import(/* webpackChunkName: "xPage" */ './pages/app-x'));
export { AppXPages };
export * from './interface'; export * from './components';
export * from './utilities'; export * from './services'; export * from './hooks';
```

Servicio de referencia (`src/Chequeo/services/useChequeoService.ts`): función `async`, arma
`API`, instancia `new ApiAdapter()` tipado como `HttpAdapter`, y devuelve métodos tipados.
`ApiAdapter` expone `getToken/get(url, limit=10, offset=1)/post/put/delete`.

Checklist para dar de alta un módulo nuevo:

1. Crear `src/<modulo>/` con la estructura de arriba y su `index.ts`.
2. Tipar la respuesta del backend en `interface/`; si viene sucia, mapper de por medio.
3. Servicio con el patrón `UseXService` — nunca axios suelto en un componente.
4. Página contenedora que hace el fetch; componentes tontos por props.
5. Registrar la ruta en el `routes*` del perfil correspondiente **y verificar cómo filtra ese
   navegador** (`'All'` solo sirve en `routesErgo`).
6. `npm run build` en verde y `npx eslint src/<modulo>/` en 0.

## 8. Los tres módulos de referencia

- **`src/ficha-clinica/`** — la referencia de **arquitectura de datos**: tres capas, mappers,
  `number | null`, página única que hace fetch, cinco tabs por props, gráficos chart.js aislados
  en `components/charts/`, SVG paramétrico en `components/segmentaria/`. Guía:
  `specs/ficha-clinica/CLAUDE_FICHA_CLINICA.md`.
- **`src/home-ergo/`** — la referencia de **contenido configurable**: seis JSON en `config/`
  con flags `activo`/`destacado`, ningún texto de negocio ni ruta de archivo escrita en un
  `.tsx`. Guía: `specs/home-ergo/CLAUDE_HOME_ERGO.md`.

- **`src/chequeo-cardiovascular/`** — la referencia de **migración por perfil**: reemplaza a
  `src/Chequeo/` un perfil cada vez, sin importar nada del módulo viejo y sin ninguna operación
  de borrado. Hoy sirve solo a `Colegios`. Guía:
  `specs/chequeo-cardiovascular/CLAUDE_CHEQUEO_CARDIOVASCULAR.md`.

Los tres tienen **regla de aislamiento** (no tocan nada fuera de su carpeta), y los tres
**clonan código a propósito** en vez de importarlo: `ficha-clinica` y `home-ergo` un chat con
endpoint y clave de sesión propios —en el comercial es una decisión de seguridad—, y
`chequeo-cardiovascular` los gráficos de estadísticas, `getCertificadoRut` y el `InputText`
compartido. La duplicación es deliberada en los tres casos y está anotada en sus guías.

## 9. Lo que este proyecto no tiene

Para que no lo des por supuesto ni lo introduzcas de contrabando:

- **No hay tests** (ni script, ni runner). La verificación es `npm run build` + `npx eslint`.
- **No hay router único ni layout único**: seis `routes*`, seis navegadores, cada uno con su
  `interface Route` local.
- **No hay `BrowserRouter`**: todo `HashRouter`, porque el deploy es estático por FTP.
- **No hay cliente HTTP con interceptores, retry ni caché**: `ApiAdapter` es un envoltorio fino
  de axios.
- **No hay tipo compartido de ruta, ni enum de perfiles, ni constante global de API.**
- **No hay react-query ni Redux en uso**, pese al `package.json`.
