---
name: ergo-chequeo-cardiovascular
description: Conocimiento completo del módulo `src/chequeo-cardiovascular/` de Ergosanitas — el reemplazo autocontenido de `src/Chequeo/` que hoy sirve solo al perfil `Colegios` (78 archivos, ~5.300 líneas). Cubre los 4 tabs de índice estable, el formulario agrupado por `seccion`, la validación yup de solo campos visibles, los 3 servicios, el Home de lista + 5 gráficos con sus dos fuentes de datos, las cuatro reglas duras (sin borrado, sin importar de `src/Chequeo/`, sin ramificar por perfil, sin tocar la lógica clínica) y la duplicación deliberada. Úsalo antes de tocar cualquier archivo de `src/chequeo-cardiovascular/`, o al responder sobre el chequeo del perfil Colegios, su lista de deportistas, su carga masiva, su Home de estadísticas o su ruteo por `NavigationCol`.
---

# ergo-chequeo-cardiovascular — el chequeo del perfil Colegios

Mapa de `src/chequeo-cardiovascular/`: **79 archivos, ~5.100 líneas** (tras la Spec 02). Es el reemplazo
autocontenido de `src/Chequeo/`, construido **perfil por perfil**. Hoy sirve **solo a
`Colegios`**; `Administrador`, `Medicos` y `Usuario` siguen en el módulo viejo, que queda
intacto.

Documentos hermanos, que esta skill **no reemplaza**:

- **`specs/chequeo-cardiovascular/CLAUDE_CHEQUEO_CARDIOVASCULAR.md`** — la guía viva del módulo,
  que se actualiza al cerrar cada spec. Si esta skill y la guía discrepan, **manda la guía**.
- `specs/chequeo-cardiovascular/01-perfil-colegios.md` — la spec que creó el módulo, con sus
  criterios de aceptación y los 8 que quedaron pendientes de verificar.
- `specs/chequeo-cardiovascular/02-home-colegio.md` — el rediseño del Home: dos secciones, los
  cuatro gráficos derivados y la accesibilidad.
- Estilo de código: skill `ergo-code`. Arquitectura general: `.claude/ARQUITECTURA.md`.

⚠️ **No confundir con la skill `ergo-chequeo`**, que documenta `src/Chequeo/` — el módulo viejo,
de 75 archivos, con tabs que cambian por perfil. Son dos módulos distintos y ninguno importa del
otro.

---

## 1. Las cuatro reglas duras

Gobiernan cualquier cambio. Si una tarea las contradice, **para y dilo** antes de escribir código.

1. 🔴 **El módulo no importa nada de `src/Chequeo/`**, ni de `src/Estadisticas/`,
   `src/Certificados/` ni `src/components/`. **Lo único externo es `src/common/`** (el
   `ApiAdapter` y los contextos globales), y eso es lectura, no modificación. Comprobación:

   ```bash
   grep -rn "from '\.\./\.\./" src/chequeo-cardiovascular/
   ```

   Solo debe devolver `common/api/api.adapter`, `common/context` y rutas internas del módulo.
   Verificado: hoy no hay ni una excepción.

2. 🔴 **Ninguna operación de borrado.** Ni endpoint, ni handler, ni botón, ni oculto tras un
   permiso. No se pierde capacidad: en `src/Chequeo/` la papelera ya estaba tras `isAdmin`. El
   botón de limpiar el buscador usa **`ClearIcon`, nunca `DeleteIcon`**, para que la comprobación
   por `grep -rni delete src/chequeo-cardiovascular/` siga siendo significativa.

3. 🔴 **El módulo no ramifica por `user_perfil` en el orquestador.** `AppChequeoCardiovascular`
   tiene **4 tabs fijos con índices estables**, que es justo lo que hacía insoportable a
   `AppChequeo`. Si algún día se migra otro perfil aquí, cómo convivir se decide en **su** spec:
   no repliques un `if (user_perfil === …)` por dentro sin pensarlo.
   (Sí hay una comparación de perfil, y solo una: `estaOculto` en `ChequeoForm` — §5.)

4. 🔴 **La lógica clínica no se toca.** Se clonó **sin corregir**, bug incluido (§9).

## 2. Mapa por zonas

```
src/chequeo-cardiovascular/
├── pages/       AppChequeoCardiovascular (188) orquestador de 4 tabs ·
│                HomePage (28) · ChequeoPage (48)
├── components/  26 archivos, 2.421 líneas. Los grandes:
│   ├── ChequeoTable.tsx (332)             la lista + 3 acciones + paginación
│   ├── ChequeoForm.tsx (253)              alta y edición, agrupado por sección
│   ├── ChequeoTarjeta.tsx (93)            la misma fila como tarjeta, bajo 900 px
│   ├── ChequeoFormUpdate.tsx (25)         carga por id y delega en ChequeoForm
│   ├── ChequeoView.tsx (131)              modal de detalle, solo lectura
│   ├── SeccionCampos (45) · SeccionHome · DownloadPDF (30) · LoadingTable (19)
│   ├── carga-masiva/      CargaMasiva (188) · FileUploadExcel (112)
│   ├── alterados/        ListaAlterados · TarjetaAlterado (la misma fila, 2 formatos)
│   ├── estadisticas/      TarjetaGrafico · TablaAccesible · LeyendaGrafico · Dona ·
│   │                      GraficoTorta (backend) · PieChartImc/Hemoglucotest ·
│   │                      PieChartSaturacion (derivado) · BarPresion · PiramideEdadSexo
│   ├── exportar-excel/    ExportarExcel (122)
│   ├── filters/           FilterTable (48) · LikeTextChequeo (82)
│   ├── date-pickers/      DatePickers (91, del form) · DatePickerInput (57, del filtro)
│   ├── forms/             InputText (118) · InputSelect (71) · ButtonsForm (40)
│   ├── modal/             ModalStatus (86)
│   ├── statistics-global/ StatisticsGlobal (166)
│   └── tabs/              TabPanel (29)
├── config/      custom-form.json (25 campos, con `seccion`) · custom-likes.json (1) ·
│                excel-data.json (fila de ejemplo) · secciones.ts (5 secciones) ·
│                tema.ts (tokens visuales: paleta, sx compartidos)
├── context/     like-text/ (búsqueda) · modal-bar/ (modal del Home) — barril COMPLETO
├── hooks/       useChequeo · useChequeoRut · useCalculoIMC · useExportToExcel ·
│                useResumenColegio
├── interface/   9 archivos de tipos + barril
├── services/    useChequeoCardiovascularService (9 métodos) ·
│                useEstadisticasService (4) · useCertificadoService (1)
└── utilities/   chequeo-validation.utility · chequeo.utility · resumen.utility
```

El `index.ts` del módulo exporta `AppChequeoCardiovascular` más los barriles de interface,
components, context, hooks, services y utilities.

## 3. Cómo se monta y se rutea

`pages/index.ts` exporta `AppChequeoCardiovascular` **lazy** (chunk
`chequeoCardiovascularPage`). Fuera del módulo solo existen **tres archivos**:

| Archivo | Qué hace |
|---|---|
| `src/routes/routesCOL.tsx` | Una entrada: «Chequeo Cardiovascular», `to: '/'`, `path: '/*'`, `perfil: 'Colegios'`, `status: true`. |
| `src/routes/NavigationCol.tsx` | Copia de `NavigationMe` apuntando a `routesCol`. |
| `src/routes/NavigationApp.tsx` | `case 'Colegios': return <NavigationCol />;` |

⚠️ **`NavigationCol` no entiende el comodín `'All'`** — compara el perfil inline, igual que
`NavigationMe`, `NavigationPA` y `NavigationED`. Solo `NavigationErgo` soporta `'All'`. Por eso
la entrada lleva el literal `'Colegios'`; marcarla `'All'` la haría desaparecer del menú.

⚠️ **`NavigationApp` decide por `user_perfil` antes de mirar `valid`.** Se replicó tal cual del
resto de perfiles con navegador propio: **no uses `valid` para proteger esta vista.**

`AppChequeoCardiovascular` monta su **propio `<ModalProvider>` anidado** sobre el global de
`App.tsx`, para que el modal de detalle no comparta `isDateModalOpen` con el de login.

## 4. Los 4 tabs — índices estables

Layout de `Tabs` **vertical** (rail de iconos a la izquierda, 64/90 px según breakpoint).

| Índice | Tab | Contenido | Provider que lo envuelve |
|---|---|---|---|
| 0 | Home | `HomePage` → `StatisticsGlobal` + 2 secciones de gráficos + `ModalStatus` | `ModalBarProvider` |
| 1 | Lista de deportistas | `ChequeoTable` | `LikeTextProvider` |
| 2 | Agregar deportista | `ChequeoPage` → `ChequeoForm` o `ChequeoFormUpdate` | — |
| 3 | Carga masiva | `CargaMasiva` | — |

Estado que vive en el orquestador: `tab`, `{ rut_paciente, id_paciente }`, `chequeoView`,
`reloadTable`. Tres handlers bajan por props:

- **`handleUpdateStatus(status, rut, id)`** — navegación interna heredada: `1` = editar (guarda
  rut/id y va al tab 2), cualquier otro = alta limpia (vacía la selección y vuelve al tab 1).
  **No tiene nada que ver con `estado_paciente`**, que es el estado clínico del backend.
- **`handleViewData(id)`** — pide el detalle y lo deja en `chequeoView`, que consume el
  `<ChequeoView>` colgado al final del árbol.
- **`handleReloadTable()`** — invierte un booleano que es dependencia del `useEffect` de la tabla.

Entrar al tab 2 **por el menú** siempre limpia la selección: a la edición se llega desde la lista.

## 5. El formulario: agrupado por `seccion` (concepto central)

`config/custom-form.json` es el JSON de `src/Chequeo/` **más un campo nuevo, `seccion`**. Es lo
único que cambia de forma respecto al original, y es lo que permite agrupar sin escribir nombres
de campo en el `.tsx`.

**25 campos**, por sección:

| `seccion` | Campos | Visible para `Colegios` |
|---|---|---|
| `identificacion` | 7: nombre, rut, fechaNacimiento, edad, sexo_paciente, division_paciente, medio_pago_paciente | **Sí, los 7** |
| `signos-vitales` | 5: temperatura, presion_sistolica, presionArterial, saturacionOxigeno, hemoglucotest | No |
| `antropometria` | 3: peso, estatura, imc_paciente | No |
| `anamnesis` | 7 de texto libre | No |
| `gestion` | 3: user_email, status, fecha_atencion | No |

Tipos: `text` (18), `selected` (3), `DatePickers` (2), `number` (1), `selected-user` (1).
**18 de los 25 llevan `disabledText: true`.**

**La regla de ocultamiento** (`estaOculto`, en `ChequeoForm`) es la heredada, sin más cambio que
el `==` → `===`:

```
perfil 'Colegios' && disabledText === true                              → oculto
perfil !== 'Administrador' → rut (si ya existe), user_email, status,
                             fecha_atencion                             → ocultos
```

**Una sección sin campos visibles no se renderiza**: `SeccionCampos` devuelve `null` si
`cantidad === 0`. Por eso `Colegios` ve solo «Identificación» y no cabeceras huérfanas.

`renderCampo` soporta `text`/`number` (→ `InputText`), `DatePickers`, `selected` (→ `InputSelect`)
y devuelve `null` para `selected-user` (el selector de club, que solo vería `Administrador` y no
se portó). **Cualquier otro `type` lanza `Error`**: es deliberado, para que un JSON mal editado
falle ruidosamente en vez de pintar un hueco.

### ⚠️ El esquema yup valida SOLO los campos visibles

`buildChequeoValidationSchema(camposVisibles)` recibe la lista de nombres que se pintan.
**No es un detalle:** de los 13 campos con `required`, **ocho están ocultos** para `Colegios`
(temperatura, presion_sistolica, presionArterial, saturacionOxigeno, hemoglucotest, peso,
estatura, imc_paciente). Validarlos todos dejaría el formulario **imposible de enviar**.

El módulo original esquivaba el problema de otra manera: su botón llamaba a `onSubmit` **sin
pasar por `handleSubmit`**, así que en la práctica no validaba nada. Aquí sí valida, pero solo lo
que el usuario puede ver.

Tres consecuencias de haber activado la validación de verdad, que **no hay que deshacer**:

- **`typeError` en los numéricos.** Un `Yup.number()` vacío falla el casteo *antes* que `required`
  y escupe el mensaje por defecto de yup en inglés. Se sustituye por el mensaje en español que el
  propio JSON declara.
- **`defaultValues` reales** (`valoresPorDefecto()`). El `Controller` *pinta* su `defaultValue`
  pero no lo escribe en el estado: sin esto los desplegables se veían con «Masculino» y «No
  Pagado» elegidos mientras la validación los daba por vacíos. En alta se hace `reset(defaults)`,
  **nunca `reset({})`**.
- **Validaciones implementadas**: `required`, `REGEX_RUN`, `MAX`, `NUMBER_DOT`.
  **`LETRAS` sigue declarada en `nombre` y sin implementar**, igual que en el original: se ignora
  en silencio. `REGEX_RUN` va **sin anclas** a propósito (valida subcadenas); endurecerlo cambia
  qué RUT se aceptan hoy.

### `hooks/useChequeo.ts`

Envuelve `useForm` con `mode: 'all'`, `criteriaMode: 'all'`, el resolver memoizado por
`camposVisibles` y `reset(chequeo ?? defaults)` en un efecto. Expone `getValues` a propósito:
así `InputText` lee el resto del formulario **sin tocar `control._formValues`**, que es API
privada de react-hook-form y era lo que hacía el módulo original.

## 6. La lista: tabla y tarjeta son la misma fila

`ChequeoTable` (332) es la lista del colegio. **Cuatro columnas** — Nombre, RUT, Edad, Estado —
y **tres acciones**: ver (`VisibilityIcon`), descargar PDF (`DownloadPDF`) y descargar ECG
(`AssignmentTurnedInIcon`). **No hay editar, ni subir archivo, ni papelera.**

🔴 **Bajo 900 px (`md`) la tabla se sustituye por `ChequeoTarjeta`.** Son la misma fila en dos
formatos: **cambiar una columna o una acción obliga a tocar los dos archivos juntos.**

- Paginación real por servidor: `TablePagination`, `rowsPerPage` inicial **20**, `page` base 0 en
  React y `page + 1` al servicio.
- Un `useEffect` aparte hace `setPage(0)` al cambiar cualquier filtro: sin él, cambiar de filtro
  con la lista en la página 5 devolvía vacío sin explicación.
- Un `try/catch/finally` deja `rowTable: []` y `cargado: true` si la API falla — sin eso la lista
  se quedaría en el spinner para siempre.
- La fila **«reciente»** (`esReciente`: estado `ECG FOTO` de los últimos 3 días) se marca con un
  **indicador lateral**, no con fondo rojo pleno como en el original: el rojo dejaba el texto
  ilegible.
- El botón de ECG usa **Swal**, no el `alert()` nativo del original, y arma un `<a download>`
  temporal a partir de `pathUrlCertificado`.

**Filtros** (`FilterTable`): buscador + fecha, **siempre a la vista, en una fila**. En el original
eran tres acordeones y el filtro por fecha estaba oculto para todos salvo `Administrador`; aquí
`Colegios` **sí lo ve**. **No hay filtro por club**: un colegio es un solo club por definición.

`LikeTextChequeo` **no usa formik** (el original sí): es un campo controlado con **debounce de
350 ms** y limpieza del timer al desmontar. Escribe en `LikeTextContext`; es `ChequeoTable` quien
reacciona y vuelve a pedir la página.

## 7. Servicios — 14 métodos en 3 archivos, ningún endpoint nuevo

Patrón `ApiAdapter` de siempre: `const API = ${VITE_API}${VITE_API_PATH}`.

**`UseChequeoCardiovascularService` (async, 9 métodos)** — de los 23 de `UseChequeoService` se
portan solo los que este perfil usa; **no se portan los dos de borrado**:

| Método | Endpoint |
|---|---|
| `postChequeoSearch(likeTextState, user_email, limit=20, page=1)` | `POST /chequeo-cardiovascular/search-chequeo?limit=&page=` |
| `postChequeoAll(user_email)` | `POST /chequeo-cardiovascular/chequeo-all` (alimenta el Excel) |
| `getChequeoRut(id_paciente)` | `GET /chequeo-cardiovascular/{id}` |
| `postCreateChequeo(chequeo)` | `POST /chequeo-cardiovascular` |
| `postUpdateChequeo(chequeo, id, user_email)` | `PUT /chequeo-cardiovascular/{id}/{user_email}` |
| `chequeoPDF(id_paciente)` | `window.open('/chequeo-cardiovascular/pdf/{id}')` |
| `pathUrlCertificado(rut?, id?)` | `POST /certificado/path-url` |
| `getEstadoGeneral(user_email)` | `GET /chequeo-cardiovascular/estado-general/{user_email}` |
| `postCargaMasiva(file, user_email)` | `POST /carga-masiva/excel` (FormData) |

Sin el `console.log` que el módulo viejo dejaba en producción imprimiendo `user_email`.
Los PDF **se abren en pestaña nueva** (`window.open(…, '_blank', 'noopener,noreferrer')`), no se
descargan por axios: es el patrón de todo el repo.

**`UseEstadisticasService` (síncrono, 4 métodos)** — `GET /estadisticas/estadistica-{imc,
presion, hemoglucotest, saturacion}/{user_email}`. Clonado de `src/Estadisticas/`.

**`UseCertificadoService` (async, 1 método)** — `getCertificadoRut(rut)` →
`GET /certificado/{rut}`. **Es el único servicio del módulo que atrapa su propia excepción** y
devuelve `null`: un 404 (deportista sin certificado) no debe romper la edición.

Las dos claves del modelo, sin cambios: **`user_email`** filtra los listados (el colegio) y
**`rut`** identifica a la persona. No hay id relacional.

## 8. El Home — dos secciones, dos fuentes de datos, y dónde está el blindaje

`HomePage` = `StatisticsGlobal` (los 11 contadores de `estado-general` en 6 tarjetas KPI) + **dos
secciones** (`SeccionHome`) + `ModalStatus`. Son **una lista y 5 gráficos**, y la división no es
estética: cada tarjeta viene de un sitio distinto.

| Sección | Contenido | Fuente |
|---|---|---|
| **Requiere atención** | `ListaAlterados` — quiénes tienen diagnóstico alterado, con sus signos vitales | Derivada de `chequeo-all` |
| **Salud de los deportistas** | IMC · Hemoglucotest · Presión | `estadisticas/*` (backend) |
| | Saturación de oxígeno · Pirámide edad/sexo | Derivadas de `chequeo-all` |

### 🔴 La asimetría de los fetch es deliberada

- **Los tres del backend piden su serie cada uno**, porque cada uno consulta un endpoint distinto.
- **Las tres derivadas no llaman a ningún servicio**: son presentacionales y reciben lo suyo por
  props. `HomePage` llama a **`useResumenColegio` una sola vez** y reparte. Si cada una pidiera lo
  suyo, serían varias descargas del histórico completo para pintar una pantalla.

`Dona.tsx` es la parte visual que comparten los dos bandos: dona, total al centro, leyenda y tabla
accesible. `GraficoTorta` le añade el fetch al backend; `PieChartSaturacion` le pasa la serie ya
derivada. No lo «unifiques» en un solo patrón sin leer esto.

### 🔴 La saturación NO viene del backend

`GET /estadisticas/estadistica-saturacion/{user_email}` devuelve **HTTP 500** desde que existe el
módulo (`Call to undefined method ChequeoCardiovascular::SP_estadistica_saturacion()`). El dato,
en cambio, **sí viene**: está en `saturacionOxigeno` de cada fila de `chequeo-all`. Por eso el
gráfico se deriva en el front con `resumirPorSaturacion` y `getEstadisticaSaturacion` ya no existe
en el servicio.

⚠️ **Sus tramos son una decisión clínica sin validar**: normal ≥ 95 %, leve 91-94 %, moderada
88-90 %, severa < 88 %. Son los de referencia habituales de pulsioximetría y están **pendientes
del visto bueno médico**. Cambiarlos va en su propia spec, igual que los umbrales de IMC.

### ⚠️ Dos fuentes de verdad en la misma pantalla

Los contadores vienen del backend y las series derivadas se calculan en el front: **pueden
discrepar** si el backend filtra distinto. Por eso cada tarjeta derivada declara en su subtítulo
sobre cuántos deportistas está calculada (`subtituloResumen`, y el `usadas` de cada serie). La
discrepancia queda a la vista y explicada, no escondida.

### ⚠️ El backend responde 200 con sobres de error

Verificado contra `http://127.0.0.1:8000/api`: algunos endpoints de estadísticas devuelven
`{response: {status: 'Error en ejecucion', …}}` en vez de la serie, y **`estadistica-saturacion`
da HTTP 500** (`Call to undefined method ChequeoCardiovascular::SP_estadistica_saturacion()`).

`GraficoTorta`, `BarPresion` y `useResumenColegio` comprueban **`Array.isArray(response?.data)`**
antes de guardar: sin esa línea `serie.data.length` revienta en el render y **un gráfico caído
tumba el Home entero**. No la quites.

Un sobre de error cuenta como **servicio caído**, igual que una excepción: ambos marcan `error` y
la tarjeta muestra «no disponible», no «sin datos».

Otras discrepancias de tipo observadas: `porcentaje_imc_normal`, `porcentaje_estado_normal` y
`per_page` llegan como **string** (`"60.7"`).

### ⚠️ En las tres donas el servicio se resuelve en ámbito de módulo

```ts
const { getEstadisticaIMC } = UseEstadisticasService();   // ← fuera del componente, a propósito
```

Si se llama dentro, la identidad de la función cambia en cada render del padre y `GraficoTorta`
vuelve a pedir la serie en cada cambio de tab. `BarPresion` sí lo llama dentro de su
`useCallback`, porque su única dependencia es `user_email`.

### `TarjetaGrafico` y sus cuatro estados

Envuelve las 8 tarjetas: título, subtítulo, alto fijo y los estados `cargando`, `sin-datos`,
`no-disponible` y `ok`. **`sin-datos` y `no-disponible` dicen cosas distintas a propósito**: un
colegio que aún no mide no es un servicio caído, y confundirlos esconde el 500 que hoy existe.

`GraficoTorta` es la base común de las tres donas (IMC, hemoglucotest, saturación), que se
diferencian solo por `titulo` y `fetchSerie` y ocupan ~16 líneas cada una. Los colores **ya no se
pasan por prop**: los asigna `colorClinico` por el texto de la etiqueta (ver abajo).

Las donas **apagan la leyenda de chart.js** y usan `LeyendaGrafico`: la leyenda nativa vive dentro
del canvas y descentraría el total del medio. Barras y línea sí usan la nativa.

### Color y accesibilidad

- **`config/tema.ts` es la única fuente de color de TODO el módulo.** Ningún `.tsx` escribe un
  hex: comprobable con
  `grep -rc '#[0-9a-fA-F]\{3,8\}' --include=*.tsx src/chequeo-cardiovascular/`, que solo debe
  señalar a `tema.ts`.
- **Dos familias de color, separadas a propósito.** `COLORES` es el significado de un resultado
  (normal, límite, alterado) más el azul de marca; `UI` es la interfaz (`accionVer`, `accionEcg`,
  `atencion`, fondos y bordes). El verde de un botón de «ver» no significa «normal»: significa
  «pulsa aquí». Mezclarlas es lo que hacía que el mismo verde tuviera dos sentidos en la misma
  pantalla.
- El archivo expone además `DEGRADADOS`, `SOMBRAS`, `PALETA_CATEGORICA`, `sxFocoVisible` —que se
  compone dentro de otro `sx`, no lo sustituye— y los `sx` de tarjeta y títulos.
- 🔴 **El color clínico va por etiqueta, NUNCA por posición.** El backend no devuelve las series
  ordenadas de normal a alterado: `estadistica-imc` empieza por `Bajo Peso` y
  `estadistica-hemoglucotest` por `Bajo` — son curvas de campana. Colorear por índice pintaba
  «Bajo Peso» de verde. `colorClinico` decide por el texto, y una etiqueta sin regla sale en gris.
  `colorPorIndice` sí cicla, pero solo se usa en series sin significado clínico.
- **Cada gráfico lleva su `TablaAccesible`.** Un `<canvas>` de chart.js es invisible para un
  lector de pantalla. Se oculta con `sxSoloLectores` — token propio, **no `visuallyHidden` de
  `@mui/utils`**, que no está declarado en `package.json`.

### `utilities/resumen.utility.ts` — nada se descarta en silencio

Tres derivaciones puras (`filtrarAlterados`, `resumirPorSaturacion`, `resumirPorEdadSexo`),
`parsearFecha` y los ayudantes (`estadoDeTarjeta`, `colorClinico`, `colorPorIndice`,
`subtituloResumen`). Una lectura ausente o ilegible **se resta del `usadas`** que la tarjeta
declara en su subtítulo. Un dato que desaparece del gráfico es un error que nadie ve.

⚠️ **`chequeo-all` NO devuelve** `division_paciente`, `created_at`, `derivacion_paciente`,
`observacion_paciente`, `email_paciente` ni `pulso`. No derives nada de esos campos: llegarán
siempre vacíos. Fue la razón de retirar el gráfico «Avance por curso».

⚠️ **`fecha_atencion` llega como `DD-MM-YYYY`**, que `dayjs()` da por inválida sin plugin. Para eso
está `parsearFecha`, que además rechaza los desbordes: `'31-02-2026'` no es el 3 de marzo.

Los ayudantes de presentación viven en `chequeo.utility.ts` y **los comparten la tabla y la
tarjeta** para que no discrepen: `hayDato` (un `0` es una medición; `''` y `'-'` no lo son),
`oGuion` y `formatearPresion`. El backend usa **`'-'` como centinela de «sin medir»** en
`frecuencia_cardiaca_paciente`, que es `string`, no `number`.

En la pirámide, `Masculino` llega **en negativo**: es cómo chart.js dibuja una pirámide, no un
dato. El eje y el tooltip aplican `Math.abs`.

## 9. Lógica clínica: clonada y NO corregida

`hooks/useCalculoIMC.ts` se copió con su comportamiento actual y las trampas documentadas en
JSDoc. **Cambiar una fórmula o un umbral es una decisión médica, no una refactorización: va en su
propia spec.**

- **`UseCalculoIMC(estatura, peso)`** → `peso / estatura²`. **Exige la estatura en metros**; en
  centímetros el resultado es absurdo y nada lo detecta. Lanza `throw` con valores no numéricos
  o ≤ 0.
- **`UseCalcularPercentil(edad, IMC, sexo)`** → **aproximación lineal propia, no tablas OMS/CDC**
  (`base = 16 + edad*0.23` en masculino), acotada a [0.1, 99.9]. **No la presentes como percentil
  clínico validado.**
- 🔴 **`UseIMCRecomendaciones(edad, IMC, sexo)` tiene un bug conocido, clonado a propósito:** en
  adultos la rama de peso normal (`IMC < 25`) devuelve el mismo texto que la de bajo peso
  (`< 18.5`) — le dice a un adulto sano que necesita ganar peso. La rama pediátrica sí está bien
  diferenciada.

**`UseCalcularPercentil` y `UseIMCRecomendaciones` hoy no las usa nadie aquí**: su único consumidor
era la calculadora IMC, que no se portó. Se clonaron por decisión explícita de la Spec 01, para
que el módulo esté listo cuando se migre `Administrador`.

Dentro del módulo, `UseCalculoIMC` solo lo llama el `InputText` propio, y **para `Colegios` nunca
se dispara**, porque peso, estatura e IMC están ocultos.

## 10. Contextos propios — el barril sí está completo

- **`LikeTextProvider`** (`context/like-text/`) — `{ textoValue, fechaCalendar, selectClub }`.
  `selectClub` se conserva aunque este perfil no tenga selector de club: **viaja en el cuerpo de
  `search-chequeo` y quitarlo cambiaría la forma que espera el backend.** Para `Colegios` va
  siempre vacío. Envuelve al tab 1.
- **`ModalBarProvider`** (`context/modal-bar/`) — `{ isModalOpen, typePresion }` para el modal
  informativo del Home. Envuelve al tab 0.

✅ A diferencia de `src/Chequeo/context/index.ts`, **este barril exporta los dos** contextos con
sus providers, reducers y tipos. No hay que importar nada por ruta directa.

## 11. Duplicación aceptada a propósito

Se asumió al elegir un módulo autocontenido. **Si corriges un bug en cualquiera de estos, hay que
corregirlo en los dos sitios.**

| Duplicado aquí | Original | Por qué |
|---|---|---|
| `components/forms/InputText.tsx` | `src/components/forms/InputText.tsx` | Rompe el acoplamiento raro en el que un componente compartido dependía de `Chequeo/hooks`. La copia compartida queda intacta para el resto del repo. |
| Los 4 gráficos | `src/Estadisticas/pages/` | Módulo autocontenido. |
| `getCertificadoRut` | `src/Certificados/services/` | Ídem. |
| `useCalculoIMC.ts` | `src/Chequeo/hooks/` | Ídem, con el bug incluido (§9). |
| `ColumnaTabla` (tipo local en `ChequeoTable`) | `common/table/` | `common/table/` es **código muerto**: de sus 595 líneas solo se usaba un tipo. |

## 12. Deuda que sí se corrigió al clonar

Anotada para que nadie la reintroduzca copiando del módulo viejo:

- El `console.log` de `postChequeoSearch` que imprimía `user_email` en producción.
- El `alert()` nativo de la descarga de ECG → **Swal**.
- `context/index.ts` incompleto → ahora exporta `like-text` **y** `modal-bar`.
- `==` → `===` en todas las comparaciones de perfil.
- `control._formValues` y `control._reset()` (API privada de react-hook-form) → `getValues()`,
  `handleSubmit(datos)` y `reset()`.
- Los tres gráficos de torta comparten `GraficoTorta` en vez de ser tres archivos casi idénticos.
- **Cambios visibles y deliberados**: el filtro por fecha ahora sí se muestra a `Colegios`, y la
  fila «reciente» pasa de fondo rojo pleno a indicador lateral.

Deuda que **sigue viva**, heredada a propósito: `IChequeo` casi todo `string` opcional (retiparla
obliga a tocar el mapeo con el backend), `LETRAS` sin implementar, `REGEX_RUN` sin anclas, y el
bug de IMC en adultos.

## 13. Al trabajar en este módulo

- **Un campo nuevo del formulario** → `config/custom-form.json`, **con su `seccion`**. Solo si su
  `type` es nuevo, además una rama en `renderCampo` de `ChequeoForm` (si no, lanza `Error`).
- **Una sección nueva** → `config/secciones.ts`. El orden del array es el orden de pintado.
- **Una validación nueva** → `utilities/chequeo-validation.utility.ts`, una rama más en el bucle.
- **Un endpoint nuevo** → `services/`, patrón `ApiAdapter`. **Nunca uno de borrado.**
- **Columnas o acciones de la lista** → `ChequeoTable.tsx` **y** `ChequeoTarjeta.tsx`, juntos.
- **Un estado clínico nuevo** → `getEstadoProps` en `utilities/chequeo.utility.ts` **y** el
  backend; el string debe coincidir exacto, espacios y puntos incluidos (`ingresado`, `Testiado`,
  `ECG FOTO`, `REVISION MEDICA`, `En Rev. Cardio`, `Diag. Card. - Normal`,
  `Diag. Card. - Alterado`). Un typo cae en `default` y pierde el color sin avisar.
- **Un tab nuevo** → `AppChequeoCardiovascular`: el array `TABS` **y** su `<TabPanel>`, que aquí
  se leen juntos. No hay bloques por perfil que sincronizar.
- **Un gráfico nuevo en el Home** → decide primero la fuente. Si sale de `chequeo-all`, una
  agregación pura en `resumen.utility.ts` + su serie en `useResumenColegio` + un componente
  presentacional; **no añadas otro fetch**. Si viene de un endpoint propio, sigue `GraficoTorta`.
- **Un color** → `config/tema.ts`, eligiendo familia: `COLORES` (resultado clínico o marca) o
  `UI` (acción, realce, fondo). Ningún `.tsx` del módulo escribe un hex.
- **Un gráfico cualquiera** → lleva su `TablaAccesible`. No es opcional.
- **Ausencia de dato** → `—`, nunca `0` (patrón `Dato` de `ChequeoView`).
- Feedback al usuario: **Swal**, en todo el módulo.

## 14. Verificación

```bash
npm run build                             # tsc -b + vite build, en verde
npx eslint src/chequeo-cardiovascular/    # en 0
```

**No hay tests en este proyecto: no inventes un comando de test.** La prueba es a mano con
`npm run dev` y un usuario `Colegios` real (en el backend local se usó `brisas@ergosanitas.com`).

Dos comprobaciones propias del módulo:

```bash
# Regla 1: solo debe salir common/api, common/context y rutas internas
grep -rn "from '\.\./\.\./" src/chequeo-cardiovascular/
# Regla 2: no debe haber ni un borrado
grep -rni "delete" src/chequeo-cardiovascular/
```

Y una que no es opcional: **comprueba que `Administrador` y `Medicos` siguen entrando a
`src/Chequeo/` sin cambios.** El ruteo por perfil es lo único que este módulo comparte con el
resto de la app.

Ocho criterios de la Spec 01 quedaron **sin verificar** y siguen así (detalle en §11 de
`01-perfil-colegios.md`): los dos de perfiles ajenos (sin credenciales), el 4.º gráfico
(`estadistica-saturacion` da 500 en el backend), el filtro por fecha con resultados, la apertura
del PDF, la descarga del Excel, la carga masiva real y la fila «reciente» con dato real. Si tu
trabajo toca uno de ellos, **es tu oportunidad de cerrarlo** — y si sigues sin poder, dilo.

Dato de prueba creado por la Spec 01 y que **este módulo no puede borrar**:
`ZZ PRUEBA CLAUDE SPEC01` / RUT `11111111-1` en `brisas@ergosanitas.com`.
