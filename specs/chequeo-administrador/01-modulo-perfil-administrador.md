# SPEC 01 — Módulo `chequeo-administrador`: cimientos del perfil Administrador

> **Estado:** Implementado
> **Aprobado por:** el humano, 2026-11-03, aceptando las recomendaciones de D1–D7 (§10).
> **Depende de:** SPEC 01 de `chequeo-cardiovascular` (precedente de patrón; no hay dependencia de código)
> **Fecha:** 2026-11-03
> **Objetivo:** Crear el módulo autocontenido `src/chequeo-administrador/` con los 7 tabs que hoy ve `Administrador` en `src/Chequeo/`, con paridad funcional y tabs con etiqueta visible, y enrutar solo a ese perfil hacia él sin tocar el módulo viejo.

---

## 1. Por qué existe esta spec

`src/Chequeo/` sigue sirviendo a tres perfiles desde una sola pantalla, `AppChequeo`, que ramifica
toda la interfaz en bloques por `user_perfil`. `Colegios` ya salió de ahí a
`src/chequeo-cardiovascular/`. Esta spec saca al **segundo perfil, `Administrador`**, con la misma
estrategia: módulo nuevo, el viejo intacto como vía de reversa.

Hoy el Administrador ve el bloque «OTROS» de `AppChequeo` (líneas 195-203 y 233-251): 7 tabs
**solo con icono** dentro de un `Tooltip`, sin texto. Además el tab 4 se rotula «Calculos QTC»
pero es una calculadora de IMC, y el tab «Perfil Usuario» son dos tarjetas sueltas sobre una
pantalla casi vacía.

Este trabajo es grande: 7 pantallas, 18 endpoints y ~55 archivos. Por eso se parte en dos capas:

- **Esta spec (01) son los cimientos**: módulo, ruteo, estructura de tabs, migración funcional 1:1
  y la única mejora visual transversal, el rail de tabs con etiqueta.
- **Las mejoras de cada pantalla van en specs siguientes** (§12), una por tab o por familia.

Así cada criterio de la §9 describe el comportamiento **actual**, y un bug de copia no se esconde
detrás de un rediseño. Es la lección de la Spec 01 de `chequeo-cardiovascular`, que migró y
rediseñó a la vez.

### Lo observado en vivo (2026-11-03, `http://localhost:5173/`, 1440 × 900)

Se recorrieron los 7 tabs del Administrador y los 6 de Colegios con una sesión real de cada perfil.
Solo navegación: no se envió ningún formulario.

| Aspecto | Colegios (`chequeo-cardiovascular`) | Administrador (`src/Chequeo/`, hoy) |
|---|---|---|
| AppBar | Una entrada, «CHEQUEO CARDIOVASCULAR» | CHEQUEOS · BIOIMPEDANCIA · INCIDENTES · PAGOS MENSUAL · ASISTENTE-VOZ |
| Rail de tabs | **Solo icono también**, en todos los anchos. El nombre va en `aria-label` | Solo icono. El nombre aparece en un `Tooltip` al pasar el ratón |
| ¿Caben los tabs? | Los 6 caben en 900 px de alto | **No caben los 7**: el rail hace scroll, aparece un chevron «⌄» y el 7.º tab queda medio oculto |
| Filtros de la lista | Una tarjeta: buscador + fecha + «Quitar fecha» | Tres acordeones verdes apilados (texto, fecha, club). Ocupan ~400 px antes de la primera fila |
| Limpiar el buscador | `ClearIcon` | **Papelera roja** (`DeleteIcon`, en `TextInputBaseLike`), junto a una tabla que sí borra registros |
| Contador de resultados | «300 deportistas» sobre la tabla | No hay |
| Acciones por fila | 3 iconos en una línea | **8 iconos en dos líneas**, con tres estilos distintos (verde relleno, azul con contorno, azul relleno) |
| Cabecera de la tabla | Tipografía uniforme | Mezcla dos tamaños: 14 px en Nombres–Estado y 20 px en «Fech Aten», «User» y «Accion». La fecha se corta en dos líneas (`2026-10-` / `31`) |
| Formulario de alta | Cabecera «Nuevo deportista», sección «IDENTIFICACIÓN», botón «Registrar deportista» y nota de validación | Título en cursiva «CHEQUEO PREVENTIVO CARDIOVASCULAR», 25 campos en una grilla plana sin secciones y botón **«Reserva»** |
| Títulos de pantalla | Una sola familia tipográfica | Tres familias: cursiva (ficha, «Ingre Un Nuevo Perfil»), serif con sombra («CARGAR MASIVA DE CHEQUEO») y Roboto (calculadora, ECG) |
| Carga masiva ECG | — | Selector «NO» sin rótulo. La grilla está en inglés: «No rows», «0–0 of 0» |
| Crear usuario | — | Los 4 campos dicen «Club Deportivo» aunque se cree un Administrador. El perfil preseleccionado es **Administrador** (D5) |
| Calculadora | — | El tooltip dice «Calculos QTC». Los placeholders `20`, `82.2` y `1.70` parecen valores ya cargados |
| Perfil usuario | — | Dos tarjetas en el tercio izquierdo y el resto de la pantalla vacío. El avatar muestra el logo y debajo dice **«Sin logo»**. Las contraseñas se guardan con un lápiz, sin botón ni confirmación |

Tres hallazgos se dan **también en Colegios**, porque salen del mismo código clonado. No son del
Administrador, pero el clon los heredaría:

- **`fechaNacimiento` arranca con la fecha de hoy** (`03/11/2026`). El `DatePickers` compartido
  usa `dayjs()` cuando no hay valor. Una ficha guardada sin tocar ese campo registra un recién
  nacido.
- **Los placeholders imitan datos reales**: «Juan Perez gonzalez», `1111111-k`, `20`, `36.5`,
  `123`, `68`, `98`, `107`. En gris claro, sobre un campo vacío, se leen como valores.
- **El selector de `fecha_atencion` nunca muestra su valor.** En `src/components/forms/DatePickers.tsx`
  el `value` del `DatePicker` vale `null` siempre que `name === 'fecha_atencion'`. El estado del
  formulario sí cambia, pero la pantalla sigue vacía, así que en una edición no se ve la fecha
  guardada. Solo lo ve el Administrador: es el único perfil con ese campo visible.

### Nombre del módulo: `chequeo-administrador`

- **Sí:** `src/chequeo-administrador/`, con spec en `specs/chequeo-administrador/` y orquestador
  `AppChequeoAdministrador`.
  - Kebab-case con palabras completas, como `chequeo-cardiovascular`, `ficha-clinica`,
    `home-ergo` y `pagos-mensual`. El repo no abrevia nombres de módulo.
  - Nombra el **dominio y el perfil**. El Administrador ve además Bioimpedancia, Incidentes,
    Pagos y Asistente-voz, que **no** entran aquí.
  - Coincide con el literal `user_perfil === 'Administrador'` que lo enruta.
- **No:** `src/admin/`. Promete un panel de administración entero y atraería a Bioimpedancia,
  Incidentes y Pagos «porque también son de admin».
- **No:** `src/chequeo-admin/`. Es válido, pero abrevia. Si el humano lo prefiere por brevedad,
  el cambio es solo de nombre (decisión abierta D1).
- **No:** meter `Administrador` dentro de `src/chequeo-cardiovascular/`. Su regla dura 3 dice que
  ese módulo es de un solo perfil. Convivir obligaría a replicar el `if (user_perfil === …)` que
  hizo inmanejable a `AppChequeo`.

---

## 2. Alcance

**Dentro:**

- Módulo nuevo `src/chequeo-administrador/`, autocontenido, con los **7 tabs** del Administrador
  (tabla en §4).
- Paridad funcional 1:1 de cada tab, acción por acción, contra el comportamiento actual.
- Las tres navegaciones internas del tab de ficha: alta, edición y revisión médica (ECG).
- El modal «Subir archivo» (`FormUpload` → `POST /GPT/analisis-ecg`) y el modal de detalle
  (`ChequeoView`).
- Navegación a la ruta existente `/certificado/:rut_paciente/:id_paciente` (acción «ECG Foto»).
  Es una **URL**, no un import de `src/Url/`.
- Clonado dentro del módulo de lo que hoy vive fuera: `FormUser` y `UserService` de `src/User/`,
  `getUserEmail` y `loadLogoUser` de `src/Login/services/useRegister.ts`, `getCertificadoRut` de
  `src/Certificados/`, y `InputText`/`InputSelect`/`DatePickers`/`ButtonsForm` de
  `src/components/forms/`.
- **Rail de tabs con etiqueta visible** (mejora transversal, §6.1).
- `config/tema.ts` como única fuente de color del módulo.
- Ruteo de `Administrador` hacia el módulo: un archivo nuevo en `src/routes/` y una línea de
  `routesErgo.ts` (§5).
- La deuda técnica inocua de §7.1.

**Fuera de alcance (para specs siguientes, §12):**

- El rediseño de cada pantalla: «Mi cuenta», lista responsive, formulario por secciones visible,
  calculadora con resultado en pantalla, cargas masivas unificadas.
- Un Home de estadísticas para `Administrador`. Hoy no lo tiene.
- Los perfiles `Medicos` y `Usuario`. Siguen en `src/Chequeo/` sin cambios.
- Retirar, desactivar o «limpiar» el bloque «OTROS» de `AppChequeo`. Lo sigue usando `Usuario`.
- Corregir la lógica clínica (`UseCalculoIMC`, `UseCalcularPercentil`, `UseIMCRecomendaciones`,
  umbrales inline de la calculadora). Es una decisión médica.
- Cambiar a qué `user_email` asigna la carga masiva Excel (hoy el del Administrador; §11, R5).
- Cambiar el perfil por defecto de «Crear usuario» (hoy `Administrador`; decisión D5).
- Endpoints nuevos o cambios en el back-end. Los 18 endpoints ya existen.
- Persistir la sesión (un F5 desloguea). Es de `src/common/context/login/`.
- Crear un agente propio del módulo. Si se crea, se actualizan las tablas de la skill
  `ergo-father` §2 y §5.

---

## 3. Inventario: qué se clona y de dónde

### 3.1 Desde `src/Chequeo/` (fuente de comportamiento)

| Pieza original | Tab | Destino en el módulo | Nota |
|---|---|---|---|
| `pages/AppChequeo.tsx` (bloque «OTROS») | todos | `pages/AppChequeoAdministrador.tsx` | Sin ramas por perfil |
| `pages/Chequeo.tsx` + `pages/ElectroCardiograma.tsx` | 1 | `pages/FichaChequeoPage.tsx` | Una página con `modo` (§3.4) |
| `components/ChequeoTable.tsx` | 0 | `components/lista/ChequeoTable.tsx` | Aplanado a `isAdmin = true` |
| `components/ChequeoView.tsx` · `DownloadPDF.tsx` · `loading-table/` | 0 | `components/lista/` | |
| `components/FormUpload.tsx` + `InputFileUpload.tsx` | 0 | `components/lista/ModalSubirEcg.tsx` · `forms/InputFileUpload.tsx` | Informe escapado (§7.1) |
| `components/filters/FilterTable.tsx` · `LikeTextCheque.tsx` · `forms/TextInputBaseLike.tsx` | 0 | `components/filtros/` | Los 3 acordeones visibles |
| `components/date-pickers/date-picker-input.tsx` | 0 | `components/filtros/DatePickerInput.tsx` | |
| `components/select-club/select-club.tsx` | 0 | `components/filtros/SelectClub.tsx` | Sin `UseRegister` |
| `components/exportar-excel/` + `column.excel.json` | 0 | `components/exportar-excel/` | |
| `components/ChequeoForm.tsx` · `ChequeoFormUpdate.tsx` | 1 | `components/ficha/` | Agrupado por `seccion` (§3.3) |
| `components/select-user/select-user.tsx` | 1 | `components/forms/SelectUser.tsx` | Sin `UseRegister` |
| `components/ElectroCardiogramaForm.tsx` + `modal/preview-file.tsx` | 1 | `components/ficha/` | Sin la rama `Medicos` |
| `components/carga-masiva/` | 2 | `components/carga-masiva/` | |
| `components/carga-masiva-ecg/` | 3 | `components/carga-masiva-ecg/CargaMasivaEcg.tsx` | |
| `components/calculadora-imc/` | 5 | `components/calculadora/CalculadoraImc.tsx` | Lógica intacta |
| `components/perfil-usuario/` · `form-perfil/` · `logo/` | 6 | `components/cuenta/` | Clon 1:1; rediseño en la Spec 02 |
| `components/tabs/TabPanel.tsx` | — | `components/tabs/TabPanel.tsx` | |
| `config/custom-form.json` · `electro-form.json` · `custom-IMC.json` · `custom-likes.json` · `excel-data.json` | — | `config/` | `custom-form` gana `seccion` |
| `context/likeText/` | 0 | `context/like-text/` | Barril completo |
| `hooks/useChequeo` · `useChequeoRut` · `useElectroCardiograma` · `useCalculoIMC` · `useFormCalculoIMC` · `use-export-to-excel` | — | `hooks/` | `useCalculoIMC` sin tocar |
| `interface/` (8 de 10 archivos) | — | `interface/` | `IChequeo` sin retipar |
| `utilities/` (3 esquemas yup) | — | `utilities/` | |

### 3.2 Desde fuera de `src/Chequeo/`

| Pieza original | Destino | Por qué se clona y no se importa |
|---|---|---|
| `src/User/components/form-user.tsx` + `config/custom-form.json` + hook + validación | `components/usuarios/FormUsuario.tsx` · `config/usuario-form.json` | Regla dura 1 |
| `src/User/service/user.service.ts` (3 métodos) | `services/useUsuarioService.ts` | Idem |
| `src/Login/services/useRegister.ts` → `getUserEmail`, `loadLogoUser` | `services/useUsuarioService.ts` | Idem. **No se clona `authRegister`**: la sesión sigue siendo de `common/` y `Login/` |
| `src/Certificados/services/useCertificadoService.ts` → `getCertificadoRut` | `services/useCertificadoService.ts` | Lo usa `handleUpdateStatus` para obtener `url_pdf` |
| `src/components/forms/` → `InputText`, `InputSelect`, `DatePickers`, `ButtonsForm` | `components/forms/` | `InputText` importa `Chequeo/hooks`; la copia apunta al `useCalculoIMC` del módulo |

### 3.3 Lo que **no** se clona

| Pieza | Por qué |
|---|---|
| Bloques `Colegios` y `Medicos` de `AppChequeo`, `pages/Home-page.tsx`, `statistics-global/`, `context/modal-bar/` | No son del Administrador |
| `modal/validate-dialog.tsx` y `userUpdateErgoPass` (`POST /user-first-ergo-pass`) | La validación por Ergo Pass del ECG solo se activa con `user_perfil === "Medicos"` |
| `getChequeoCardiovascular` de `useElectroCardiogranaService` | Duplica `getChequeoRut`: mismo endpoint. Se usa el del servicio principal |
| `components/date-pickers/DatePickers.tsx` de `src/Chequeo/` | Código muerto: el formulario usa el de `src/components/forms/` |
| `components/filters/FilterTableTab.tsx`, `modal/modal.component.tsx` | Sin consumidores en el bloque del Administrador |
| 12 métodos de `useChequeoService` (§3.5) | El Administrador no los usa |
| `common/table/` | Código muerto; `IColumnsTable` se declara local |

### 3.4 Las dos máquinas de estado

- **`estado_paciente`** (dato del backend) se conserva tal cual, con sus 7 strings exactos y
  `getEstadoProps` movido a `utilities/chequeo.utility.ts`.
- **El `status` numérico** (`0` alta · `1` edición · `3` ECG; no existe `2`) se reemplaza dentro
  del módulo por una unión de strings. El valor ya no viaja al backend: es navegación de React.

```ts
// interface/ficha.interface.ts (FICHA_ALTA en config/ficha.ts)
type ModoFicha = 'alta' | 'edicion' | 'revision';

interface SeleccionFicha {
    modo         : ModoFicha;
    rut_paciente : string;
    id_paciente  : number;
    url_pdf      : string;   // '' si no hay certificado
}
```

> Corrección del paso 5: los tipos no viven en `pages/FichaChequeoPage.tsx`, como decía esta
> spec, porque una página que exporta algo más que componentes da el aviso
> `react-refresh/only-export-components` y el criterio exige eslint en 0.

Mapeo 1:1: «Editar» → `edicion` y «Revisión Médica» → `revision`; las dos saltan a `TAB_FICHA`.
Entrar al tab por el rail → `alta` limpia. Guardar en cualquier modo → `alta` + recarga de la lista.

### 3.5 Endpoints — los 18 que consume el módulo

Ninguno es nuevo y ninguno cambia de sobre. Base: `${VITE_API}${VITE_API_PATH}`.

| # | Método del servicio | Endpoint | Lo usa |
|---|---|---|---|
| 1 | `postChequeoSearch` | `POST /chequeo-cardiovascular/search-chequeo?limit=&page=` | Lista paginada |
| 2 | `postChequeoAll` | `POST /chequeo-cardiovascular/chequeo-all` | Exportar Excel |
| 3 | `getChequeoRut(id)` | `GET /chequeo-cardiovascular/{id}` | Ver, editar, cabecera del ECG |
| 4 | `postCreateChequeo` | `POST /chequeo-cardiovascular` | Alta |
| 5 | `postUpdateChequeo` | `PUT /chequeo-cardiovascular/{id}/{user_email}` | Edición |
| 6 | `chequeoPDF(id)` | `GET /chequeo-cardiovascular/pdf/{id}` (`window.open`) | Descargar PDF |
| 7 | `getDeleteById(id)` | `DELETE /chequeo-cardiovascular/{id}` | Borrar — **sujeto a D2** |
| 8 | `pathUrlCertificado` | `POST /certificado/path-url` | Descargar ECG |
| 9 | `getCertificadoRut(rut)` | `GET /certificado/{rut}` | `url_pdf` al editar/revisar |
| 10 | `postUploadFile` | `POST /GPT/analisis-ecg` (multipart) | Modal «Subir archivo» |
| 11 | `postCargaMasiva` | `POST /carga-masiva/excel` (multipart) | Tab Carga masiva Excel |
| 12 | `cargaMasivaECG` | `POST /carga-masiva-ecg` (multipart, `files[]`) | Tab Carga masiva ECG |
| 13 | `postCreateElectroCardiograma` | `POST /electro-cardiograma/save` | Revisión médica |
| 14 | `getUserEmail(3)` | `GET /auth-register/user_email/{perfil}` | `SelectClub` y `SelectUser` |
| 15 | `PostUserSave` | `POST /user-save` | Crear usuario |
| 16 | `PostUserPassword` | `PUT /user-update-password` (typo del back `UserUpdatePassowrd`) | Mi cuenta |
| 17 | `PostUserErgoPass` | `PUT /user-update-ergo-pass` | Mi cuenta |
| 18 | `loadLogoUser` | `POST /auth-register/load-logo` (multipart) | Mi cuenta |

Reparto en servicios: `useChequeoAdministradorService` (1-8, 10-12), `useCertificadoService` (9),
`useElectroCardiogramaService` (13) y `useUsuarioService` (14-18).

**No se portan**: `getChequeo`, `postChequeoUser`, `chequeoPDFRut`, `postLikeChequeo`,
`postLikeChequeoUser`, `getDeleteRut` (su ruta está comentada en el back y en la práctica
pegaba un RUT a `deleteById`), `postFilterCalendar`, `getEstadoGeneral`,
`postFilterClubDeportivo` (URL malformada), `validaCertificado`, `getUrlBio` y `bioPDFRut`.

⚠️ Nota de contrato: el back-end **no autentica** estas rutas. El filtrado por perfil es de
presentación. Esta spec no cambia eso ni lo empeora.

---

## 4. Tabs

Índices estables, declarados como constantes `TAB_*` junto al array `TABS`. Ni los `<TabPanel>`
ni los handlers escriben un número. Además cada `<Tab>` lleva **`value={TAB_*}` explícito**: si
mañana se intercala un separador de grupo en el rail, no desplaza ningún índice.

| Índice | Constante | Etiqueta visible | Icono | Contenido | Antes (índice · tooltip) |
|---|---|---|---|---|---|
| 0 | `TAB_LISTA` | Lista de chequeos | `ListAltIcon` | `ChequeoTable` + filtros + exportar | 0 · «Lista Deportista» |
| 1 | `TAB_FICHA` | Ficha del chequeo | `PersonAddIcon` | Alta · edición · revisión médica | 1 · «Agregar Deportista» |
| 2 | `TAB_CARGA` | Carga masiva Excel | `CloudUploadIcon` | `CargaMasiva` | 2 · «Carga Masiva» |
| 3 | `TAB_CARGA_ECG` | Carga masiva ECG | `DriveFolderUploadIcon` | `CargaMasivaEcg` | **6** · «Carga Masiva ECG» |
| 4 | `TAB_USUARIOS` | Crear usuario | `GroupAddIcon` | `FormUsuario` | 3 · «Agregar Perfil» |
| 5 | `TAB_CALCULADORA` | Calculadora IMC | `CalculateIcon` | `CalculadoraImc` | 4 · «Calculos QTC» (rótulo erróneo) |
| 6 | `TAB_CUENTA` | Mi cuenta | `ManageAccountsIcon` | `MiCuenta` (logo, contraseña, Ergo Pass) | 5 · «Perfil Usuario» |

El orden agrupa por tarea: **gestionar chequeos** (0-1), **cargas** (2-3) y **administración y
cuenta** (4-6). El único movimiento respecto a hoy es que «Carga masiva ECG» pasa de la última
posición a la 3, junto a la otra carga. Si el humano prefiere el orden exacto de hoy, es cambiar
seis constantes (decisión D3).

**Carga diferida (`activo`).** `TabPanel` oculta con `display: none` **sin desmontar**. Por eso
ningún panel que no sea la lista hace fetch al montarse:

- `FichaChequeoPage` recibe `activo={tab === TAB_FICHA}`, y `SelectUser` pide la lista de clubes
  (`getUserEmail(3)`) en la **primera** activación, no al entrar al módulo.
- Ningún otro tab consulta al montarse. Si una spec siguiente añade un fetch inicial, añade
  `activo`.

---

## 5. Ruteo: Administrador al módulo nuevo sin tocar a los demás

### Cómo está hoy

- `NavigationApp` manda a `NavigationErgo` (por `default`) a todo perfil que no sea
  `Emergencia Deportiva`, `Paciente`, `Medicos` o `Colegios`. Ahí caen **`Administrador`,
  `Usuario` y cualquier string desconocido**.
- En `routesErgo.ts`, `/Chequeos/*` tiene `perfil: 'All'` y `Component: AppChequeo`.
- `validatePerfil` deja ver **todo** al `Administrador`. Una segunda entrada con
  `perfil: 'Administrador'` le daría **dos** botones «Chequeos».
- `Medicos` entra por `routesME.tsx` (`/chequeos/*`, minúscula) y no pasa por `routesErgo`.

### La propuesta: un selector en la entrada existente

1. **Archivo nuevo `src/routes/ChequeoSegunPerfil.tsx`.** Unas 15 líneas: lee
   `LoginContext`, compara `user.user_perfil?.trim() === 'Administrador'` y renderiza
   `<AppChequeoAdministrador />`. Para cualquier otro perfil renderiza `<AppChequeo />`. Los dos
   son `lazy`; el `Suspense` de `NavigationErgo` ya los cubre.
2. **`src/routes/routesErgo.ts`**: el import de `AppChequeo` se cambia por el de
   `ChequeoSegunPerfil`, y la entrada `/Chequeos/*` pasa a `Component: ChequeoSegunPerfil`. Nada
   más: mismo `name`, `to`, `path`, `perfil: 'All'` y `status`.

Son **los únicos dos archivos fuera del módulo**. `NavigationApp.tsx`, `NavigationErgo.tsx`,
`routesME.tsx`, `NavigationMe.tsx`, `routesCOL.tsx` y `NavigationCol.tsx` no se tocan.

| Perfil | Navegador | Entrada | Ve |
|---|---|---|---|
| `Administrador` | `NavigationErgo` (sin cambios) | `/Chequeos` | **`AppChequeoAdministrador`** |
| `Usuario` y cualquier otro en `default` | `NavigationErgo` | `/Chequeos` | `AppChequeo` (bloque «OTROS», sin cambios) |
| `Medicos` | `NavigationMe` | `/chequeos` | `AppChequeo` (bloque `Medicos`, sin cambios) |
| `Colegios` | `NavigationCol` | `/` | `AppChequeoCardiovascular` (sin cambios) |

**Vía de reversa:** devolver `Component: AppChequeo` en `routesErgo.ts` (una línea). El módulo
nuevo queda en el repo sin rutear.

El `trim()` replica el de `NavigationApp`: `user_perfil` es un string libre del backend.

---

## 6. Estructura y mejoras de UI de esta spec

### 6.1 Rail de tabs con etiqueta visible (la única mejora visual de la 01)

- **≥ 900 px (`md`)**: rail de ~232 px con icono + texto (`iconPosition="start"`), alineado a la
  izquierda y en una sola línea. El tab activo lleva el degradado azul de hoy
  (`#1976d2 → #0d47a1`), movido a `tema.ts`.
- **< 900 px**: rail de 64 px solo con icono. El nombre va en `aria-label` y `title`, como en
  `chequeo-cardiovascular`. El rail no desaparece.
- **Sin `Tooltip` envolviendo al `Tab`**: hoy cada `<Tab>` va dentro de un `<Tooltip>`, y
  `Tabs` le inyecta sus props a través de él. Funciona por accidente.
- **Sin `transform: scale(1.15)` en hover**: hoy agranda el tab y desplaza a sus vecinos. Se
  conserva el cambio de fondo y se respeta `prefers-reduced-motion`.
- Foco visible por teclado (`sxFocoVisible` propio en `tema.ts`) y
  `aria-label="Secciones del chequeo del administrador"` en `Tabs`.
- La cabecera de cada panel muestra el nombre del tab como `h5`, así la pantalla dice dónde está
  el usuario también en móvil.

### 6.2 Otros cambios visibles, cerrados

Esta lista es **cerrada**. Nada visual fuera de ella entra en la 01:

- El rótulo «Calculos QTC» pasa a «Calculadora IMC». Es lo que el tab hace.
- Se quitan los `ml={15} mt={8}` fijos de `Chequeo.tsx` y `ElectroCardiograma.tsx`. Con el rail
  ancho empujarían el formulario fuera de la tarjeta.
- Se corrigen erratas de texto: «Modficar» y «Ingre Un Nuevo Perfil».
- `alert()` → Swal en «Descargar ECG» y en los dos avisos de «Exportar» (sin datos / error).
  El de «Exportar» se agregó al implementar el paso 4: eran los únicos `alert()` restantes.
- «Carga masiva Excel» sin archivo: el original hacía `alert()` **y seguía**, enviando `null` al
  backend. Ahora avisa con Swal y se detiene (agregado en el paso 6).
- «Mi cuenta» con la contraseña o el Ergo Pass vacíos: el original enviaba la cadena vacía al
  backend. Ahora avisa y no envía (agregado en el paso 7). El resto de «Mi cuenta» es clon 1:1 (D6).
- «Carga masiva ECG»: el selector `SI`/`NO` lleva rótulo «Derivado médico» y los errores salen
  con Swal (antes solo a consola). §12 los reservaba a la Spec 06; se dejan porque quitarlos
  empeoraría la pantalla (anotado en el cierre).
- El botón para limpiar el buscador (`TextInputBaseLike`) usa `ClearIcon` en vez de `DeleteIcon`
  rojo, como en `chequeo-cardiovascular`. Hoy parece una papelera junto a una tabla que sí borra
  registros, y además ensucia el criterio de D2 («exactamente una llamada `delete`»).
- El botón de alta de la ficha dice «Registrar chequeo» en vez de «Reserva».
- El título «CARGAR MASIVA DE CHEQUEO» pasa a «CARGA MASIVA DE CHEQUEOS».

> Estos tres últimos puntos se agregaron el 2026-11-03, a pedido del humano y con la spec ya
> aprobada, a partir de la revisión en vivo (§1).

### 6.3 Estructura de carpetas

```
src/chequeo-administrador/
├── index.ts
├── pages/
│   ├── index.ts                      AppChequeoAdministrador lazy
│   ├── AppChequeoAdministrador.tsx   orquestador: TABS, TAB_*, SeleccionFicha
│   └── FichaChequeoPage.tsx          tab 1: alta | edicion | revision
├── components/
│   ├── index.ts
│   ├── navegacion/   RailTabs.tsx                      NUEVO (§6.1)
│   ├── lista/        ChequeoTable · ChequeoView · DownloadPDF · LoadingTable · ModalSubirEcg
│   ├── filtros/      FilterTable · LikeTextChequeo · TextInputBaseLike · DatePickerInput · SelectClub
│   ├── ficha/        ChequeoForm · ChequeoFormUpdate · SeccionCampos · ElectroCardiogramaForm · PreviewFileDialog
│   ├── forms/        InputText · InputSelect · SelectUser · DatePickers · ButtonsForm · InputFileUpload
│   ├── carga-masiva/ CargaMasiva · FileUploadExcel
│   ├── carga-masiva-ecg/ CargaMasivaEcg
│   ├── exportar-excel/   ExportarExcel + config/column.excel.json
│   ├── usuarios/     FormUsuario
│   ├── calculadora/  CalculadoraImc
│   ├── cuenta/       MiCuenta · TarjetaLogo · FormCredenciales · InputPassword
│   └── tabs/         TabPanel
├── config/    custom-form.json (25 + seccion) · secciones.ts · electro-form.json · custom-IMC.json ·
│              custom-likes.json · excel-data.json · usuario-form.json · tema.ts
├── context/   index.ts · like-text/
├── hooks/     index.ts · useChequeo · useChequeoRut · useElectroCardiograma · useCalculoIMC ·
│              useFormCalculoIMC · useUsuarioForm · useExportToExcel
├── interface/ chequeo · estado (getEstadoProps) · form-data · response-carga-masiva ·
│              carga-masiva-ecg (IProcesadoEcg) · electro-cardiograma · calculadora-imc ·
│              url-certificado · certificado-url · usuario · index
├── services/  index.ts · useChequeoAdministradorService (11) · useCertificadoService (1) ·
│              useElectroCardiogramaService (1) · useUsuarioService (5)
└── utilities/ chequeo-validation · electro-validation · calculadora-validation ·
               usuario-validation · chequeo.utility
```

Estilo: generación nueva (skill `ergo-code`). Componentes PascalCase como arrow function con
`interface Props` local, 4 espacios, `sx` de MUI, servicios por `ApiAdapter` y feedback con Swal.

**Fuente del clon.** El **comportamiento** se copia de `src/Chequeo/`. Donde
`chequeo-cardiovascular` ya resolvió la misma pieza (`seccion`, `SeccionCampos`, validación por
campos visibles, `getValues()` en vez de `control._formValues`, `tema.ts`, `TabPanel`), se toma su
solución **copiando el código, nunca importándolo**. Los dos módulos nuevos son hermanos
independientes.

### 6.4 `custom-form.json` con `seccion`

Los 25 campos se copian con sus `name`, `type`, `order`, `validations` y `disabledText`, más
`seccion`, con el mismo reparto que `chequeo-cardiovascular` (`identificacion`, `signos-vitales`,
`antropometria`, `anamnesis`, `gestion`).

Para el Administrador **todas las secciones tienen campos visibles**: ve los 25 campos, incluidos
`user_email` (`selected-user`), `status` y `fecha_atencion`. Así que en la 01 el formulario ya se
pinta agrupado en 5 secciones con cabecera. No se cambia ni un campo, solo se agrupa.

⚠️ `src/chequeo-cardiovascular/config/custom-form.json` tiene hoy **cambios sin commitear** en la
rama de trabajo. El clon parte de `src/Chequeo/config/custom-form.json` más el campo `seccion`,
no del archivo de `chequeo-cardiovascular`.

---

## 7. Deuda técnica: qué se corrige al clonar y qué no

### 7.1 Se corrige (no cambia el resultado que ve el usuario, salvo §6.2)

- El `console.log` de `postChequeoSearch` (imprime `user_email` en producción).
- `==` / `!=` → `===` / `!==`.
- `control._formValues` / `control._reset()` (API privada de react-hook-form) → `getValues()` /
  `reset()`. Ver D4 sobre si el botón pasa además por `handleSubmit`.
- **El informe GPT de «Subir archivo» se escapa antes de interpolarlo** en el `html` de Swal.
  Hoy `FormUpload` mete `ecg.conclusion`, `ecg.hallazgos` y 14 campos más, tal cual llegan de
  `POST /GPT/analisis-ecg`, en un `html:`. Si el modelo devolviera marcado, se ejecutaría en la
  sesión del Administrador. Mismo aspecto, texto seguro.
- `getUserEmail` usa `getToken` en vez de `get`. `ApiAdapter.get` inyecta `?limit=10&offset=0`,
  que `ListUserEmail` ignora (verificado en el back). Se deja de mandar ruido.
- `getChequeoCardiovascular` duplicado → `getChequeoRut`.
- El doble `handleReloadTable()` de `handleDeletePaciente` (solo si D2 porta el borrado).
- El `useEffect` de `ChequeoTable` con dependencias listadas campo a campo → depende de
  `fetchChequeos`.
- El typo `ÏProcesados` no se hereda: el tipo del módulo es `IProcesadoEcg`.
- `context/index.ts` exporta todo lo que hay en `context/`.
- La rama `user_perfil === "Medicos"` de `ElectroCardiogramaForm` desaparece: en este módulo
  siempre es Administrador, que hoy confirma sin Ergo Pass.

### 7.2 No se toca (cambia comportamiento clínico o de negocio; va en otra spec)

- `UseCalculoIMC` sigue exigiendo la estatura en **metros**.
- `UseCalcularPercentil` sigue siendo la aproximación lineal propia, no tablas OMS/CDC.
- `UseIMCRecomendaciones` mantiene el bug de adultos (`IMC < 25` devuelve el texto de bajo peso),
  documentado en un JSDoc.
- Los umbrales inline de `CalculadoraImc` (18.5 / 25 / 30 y percentiles 5 / 85 / 95) y su rótulo
  «Clasificación pediátrica», que sale también para adultos.
- La cabecera del ECG rotula la estatura como «cm» mientras `UseCalculoIMC` la exige en metros. Se
  clona igual y queda anotado para la spec del formulario.
- `LETRAS` sigue declarada y sin implementar.
- `IChequeo` sigue casi todo `string` opcional (sin retipar).

---

## 8. Plan de implementación

Cada paso deja `npm run build` en verde y se puede commitear por separado. Hasta el paso 9 nada
está enrutado, así que ningún usuario ve el módulo a medio hacer.

1. **Esqueleto, tipos y servicios.** Árbol de carpetas, `interface/` y los 4 servicios con los 18
   métodos de §3.5. *Verificación:* build en verde.
2. **Config, contexto, hooks y utilidades.** Los 7 JSON (con `seccion` en `custom-form`),
   `secciones.ts`, `tema.ts`, `like-text/`, los 7 hooks (`useCalculoIMC` intacto + JSDoc del bug)
   y los 4 esquemas yup. `getEstadoProps` y `esReciente` en `chequeo.utility.ts`.
3. **Componentes de formulario.** `forms/` completo, con `InputText` apuntando al `useCalculoIMC`
   del módulo y `SelectUser` al `useUsuarioService` del módulo. `SeccionCampos` devuelve `null`
   si no recibe campos.
4. **Lista (tab 0).** `ChequeoTable` con las 6 columnas y las 8 acciones del Administrador (§9),
   filtros con los tres acordeones, `ExportarExcel`, `ChequeoView`, `DownloadPDF` y
   `ModalSubirEcg`.
5. **Ficha (tab 1).** `FichaChequeoPage` con `ModoFicha`, `ChequeoForm`/`ChequeoFormUpdate`
   agrupados por `seccion`, `ElectroCardiogramaForm` y `PreviewFileDialog`.
6. **Cargas (tabs 2 y 3).** `CargaMasiva` y `CargaMasivaEcg`, con el mismo comportamiento.
7. **Administración y cuenta (tabs 4-6).** `FormUsuario`, `CalculadoraImc` y `MiCuenta`, como
   clon 1:1.
8. **Orquestador y rail.** `AppChequeoAdministrador` con `TABS`, `TAB_*`, `value` explícito,
   `ModalProvider` anidado, `RailTabs` (§6.1) y `activo` hacia `FichaChequeoPage`.
9. **Ruteo.** `src/routes/ChequeoSegunPerfil.tsx` y la línea de `routesErgo.ts` (§5).

---

## 9. Criterios de aceptación

### Ruteo y aislamiento

- [ ] Un usuario `Administrador` que entra a «CHEQUEOS» ve `AppChequeoAdministrador` con 7 tabs
      etiquetados.
- [ ] El AppBar de `Administrador` sigue mostrando exactamente CHEQUEOS · BIOIMPEDANCIA ·
      INCIDENTES · PAGOS MENSUAL · ASISTENTE-VOZ, sin entradas duplicadas.
- [ ] Un usuario `Usuario` sigue viendo `AppChequeo` con sus 7 tabs de icono, sin cambios.
- [ ] Un usuario `Medicos` sigue entrando a `NavigationMe` con sus 2 tabs, sin cambios.
- [ ] Un usuario `Colegios` sigue entrando a `AppChequeoCardiovascular` con sus 6 tabs, sin cambios.
- [ ] `git diff --name-only main...HEAD` solo lista archivos de `src/chequeo-administrador/`,
      `src/routes/ChequeoSegunPerfil.tsx`, `src/routes/routesErgo.ts` y `specs/` (+ guías y
      documentación del cierre).
- [ ] `grep -rnE "from '\.\./+.*(Chequeo|chequeo-cardiovascular|User|Login|Certificados|components/forms|Url)/" src/chequeo-administrador/`
      no devuelve nada. Lo único externo es `src/common/`.
- [ ] `grep -rn "user_perfil" src/chequeo-administrador/` no devuelve ninguna comparación de
      perfil. El módulo no ramifica.
- [ ] `grep -rnE "#[0-9a-fA-F]{3,8}\b" --include=*.tsx src/chequeo-administrador/` no devuelve
      nada: el color sale de `config/tema.ts`.
- [ ] Ni los `<TabPanel>` ni los handlers usan índices literales; todos usan `TAB_*`.

### Rail

- [ ] A 1280 px cada tab muestra icono y texto, y el activo se distingue sin depender del hover.
- [ ] A 375 px el rail muestra solo iconos, cada uno con `aria-label`, y el body no tiene scroll
      horizontal.
- [ ] El rail se recorre con Tab/flechas y el foco es visible.
- [ ] A 1440 × 900 los 7 tabs caben sin scroll vertical del rail (hoy el 7.º queda medio oculto).
- [ ] `grep -rn "DeleteIcon" src/chequeo-administrador/` solo aparece en la acción «Borrar» de la
      lista; el buscador usa `ClearIcon`.
- [ ] El botón de alta dice «Registrar chequeo» y el título de la carga Excel «CARGA MASIVA DE
      CHEQUEOS».

### Paridad funcional (contra `http://127.0.0.1:8000/api`, con un Administrador real)

Lista (tab 0):

- [ ] La lista trae los chequeos paginados (10/20/50) con las columnas Nombres · Rut · Edad ·
      Estado · Fech Aten · User.
- [ ] El buscador por rut/nombre, el filtro por fecha y el filtro por club cambian el resultado.
- [ ] «Ver» abre el detalle con los datos del registro.
- [ ] «Editar» abre la ficha en modo `edicion` con los 25 campos cargados.
- [ ] «ECG Foto» navega a `#/certificado/{rut}/{id}` y la pantalla de `src/Url/` carga.
- [ ] «Revisión Médica» abre la ficha en modo `revision`, con la cabecera del paciente y el
      visor del certificado.
- [ ] «Descargar PDF» abre `/chequeo-cardiovascular/pdf/{id}` en una pestaña nueva.
- [ ] «Descargar ECG» descarga el certificado; si no existe, avisa con Swal.
- [ ] «Subir Archivo» envía la imagen o el PDF y muestra el informe; un texto con `<b>` en la
      respuesta se ve literal, no en negrita.
- [ ] «Borrar» se comporta según lo que resuelva D2 (§10). Si se porta, pide confirmación con
      nombre y RUT, y se verifica sobre el registro de prueba `ZZ PRUEBA CLAUDE SPEC01` /
      `11111111-1`.
- [ ] «Exportar» genera el Excel.

Ficha (tab 1):

- [ ] Entrar por el rail abre un alta limpia.
- [ ] El formulario se ve en 5 secciones con cabecera y los 25 campos del JSON.
- [ ] El alta guarda y el registro aparece en la lista al volver.
- [ ] La edición guarda y vuelve a alta limpia.
- [ ] La revisión médica guarda el ECG y la fila cambia de estado en la lista.

Cargas, usuarios, calculadora y cuenta (tabs 2-6):

- [ ] La carga masiva Excel sube un `.xlsx` y muestra el resumen.
- [ ] La carga masiva ECG sube varios PDF y muestra Procesados/OK/Error y la grilla.
- [ ] «Crear usuario» crea un usuario con el perfil elegido.
- [ ] La calculadora muestra clasificación y recomendaciones idénticas a las de hoy para los
      mismos datos (probar un adulto con IMC 22 → reproduce el bug documentado).
- [ ] «Mi cuenta» sube un logo y cambia la contraseña y el Ergo Pass.

### Carga diferida

- [ ] Al entrar al módulo y quedarse en la lista, la pestaña Red muestra **una sola**
      `GET /auth-register/user_email/3`: la del filtro de club, que monta con la lista igual que
      hoy. La segunda, la de `SelectUser`, aparece solo al abrir «Ficha del chequeo» por primera
      vez.

### Mecánica

- [ ] `npm run build` en verde.
- [ ] `npx eslint src/chequeo-administrador/ src/routes/ChequeoSegunPerfil.tsx src/routes/routesErgo.ts`
      devuelve 0 problemas.

---

## 10. Decisiones (resueltas el 2026-11-03)

> **Resolución:** el humano aceptó la recomendación de las siete: D1 `chequeo-administrador` · D2 (a) se porta el borrado con confirmación nombre + RUT · D3 (a) orden agrupado por tarea · D4 (b) solo `identificacion` obligatoria, resto validado en formato si viene relleno · D5 (a) perfil por defecto igual en la 01 · D6 (a) «Mi cuenta» 1:1 en la 01, rediseño en la 02 · D7 se consiguen las cuentas `Administrador` y `Usuario` en local; si falta alguna, el bloque «Ruteo» se verifica por inspección.

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| **D1** | Nombre del módulo | `chequeo-administrador` · `chequeo-admin` · `admin` | `chequeo-administrador` (§1) |
| **D2** | ¿Se porta el **borrado**? En el precedente es regla dura «sin borrado», pero allí el perfil no borraba. **El Administrador sí**, y es el único: la propia Spec 01 de Colegios dice que su registro de prueba «debe eliminarse desde el perfil Administrador» | (a) Portar `getDeleteById` con confirmación que muestra nombre y RUT. (b) No portarlo: el Administrador pierde la capacidad, salvo con la reversa de la ruta | **(a)**. Paridad. Un único método de borrado, un único handler, sin `getDeleteRut`. Se reemplaza el criterio «grep delete vacío» por «exactamente una llamada `delete`» |
| **D3** | Orden de los tabs | (a) Agrupado por tarea (§4: ECG pasa de 6 a 3). (b) Orden exacto de hoy | (a). Con etiquetas, la memoria del icono pesa menos que la agrupación |
| **D4** | **Validación del formulario de chequeo.** Hoy `ButtonsForm` llama a `onSubmit` sin `handleSubmit`, así que el Administrador **guarda sin validar nada**. El Administrador ve los 25 campos y 8 declaran `required`: temperatura, presión, peso, estatura, IMC… | (a) Validar todo lo visible, como en Colegios. **Bloquea guardar fichas parciales**, que hoy sí se guardan. (b) Validar solo `identificacion` como obligatoria y el resto solo en formato (`MAX`, `NUMBER_DOT`, `REGEX_RUN`) si viene relleno. (c) No validar, 1:1 | **(b)**. Conserva el flujo de ficha parcial y bloquea lo que de verdad rompe (RUT mal formado, nombre vacío). Lo mismo se decide para «Crear usuario» (`required` + `email`) y la calculadora |
| **D5** | Perfil por defecto de «Crear usuario». Hoy es `"1"` = **Administrador**, y la lista no ofrece `Medicos` ni `Paciente` | (a) Clonar igual. (b) Sin valor por defecto, obligando a elegir | (a) en la 01 por paridad; (b) en su spec. Lo dejo señalado porque un alta descuidada crea un Administrador |
| **D6** | «Mi cuenta», ¿en la 01 o en la 02? | (a) 01 la clona 1:1 y la 02 la rediseña. (b) Rediseño ya en la 01 | (a). Es la pantalla que el usuario señaló, pero rediseñarla junto con la migración repite el riesgo que esta spec existe para evitar |
| **D7** | Cuenta de prueba | Se necesita un usuario `Administrador` y uno `Usuario` en local | Sin ellas, el bloque «Ruteo» se verifica solo por inspección, como pasó en la Spec 01 de Colegios |

---

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| R1. El selector vive en `src/routes/` y ramifica por perfil | Es el lugar donde el repo ya decide por perfil (`NavigationApp`, `validatePerfil`). El módulo sigue sin ramificar. Una sola línea para revertir |
| R2. `user_perfil` es string libre: un `"Administrador "` con espacio caería al módulo viejo | `trim()` en el selector, igual que `NavigationApp` |
| R3. Duplicación: `ChequeoTable`, `ChequeoForm`, `useCalculoIMC`, `InputText` y el chequeo de estados quedan en **tres** módulos | Aceptado, como en `chequeo-cardiovascular`. La guía del módulo tendrá su tabla de «duplicación aceptada». Un bug clínico hay que corregirlo en los tres |
| R4. El back filtra por `perfiles_id` y al Administrador le devuelve **todo**. «Exportar» (`chequeo-all`) descarga la base completa en una sola respuesta | Paridad: hoy ya es así. Se anota para la spec de la lista (paginar o filtrar la exportación) |
| R5. La carga masiva Excel asigna las filas al `user_email` **del Administrador**, no a un club | Paridad. Elegir el club destino cambia el negocio y va en la spec de cargas |
| R6. Sin credenciales `Administrador`/`Usuario` no se prueba el ruteo real | D7. Se verifica además por inspección: `git diff` limitado a los dos archivos de ruteo |
| R7. `Usuario` sigue viendo en el módulo viejo los mismos 7 tabs, incluido «Agregar Perfil», que crea usuarios **Administrador** | Fuera de alcance: es el perfil que se migra después. Lo señalo porque el filtrado es solo de presentación y el back no autentica |
| R8. Las erratas de texto y el rótulo «Calculadora IMC» son cambios visibles | Lista cerrada en §6.2 |
| R9. Hay cambios sin commitear en `src/chequeo-cardiovascular/` y en `.claude/` en la rama actual | El clon parte de `src/Chequeo/`. `/spec-impl` crea su rama: revisar `git status` antes, para no mezclar ese trabajo |

---

## 12. Specs siguientes (anotadas, no incluidas)

Cada una en `specs/chequeo-administrador/`, con su propio `Borrador`:

- **02 — «Mi cuenta».** Mostrar el logo actual (hoy dice «Sin logo» aunque exista, porque el texto
  depende de `selectedFile` y no del logo). Vista previa y validación de tipo y peso. Refrescar el
  avatar del AppBar vía `ValidLogin` del `LoginContext` (hoy queda desfasado hasta el próximo
  login). Contraseña con confirmación y requisitos visibles. Un botón «Guardar» explícito en vez
  del lápiz. Explicar qué es el Ergo Pass. Datos de la cuenta (nombre, email, perfil) en lectura.
  Feedback de error: hoy solo se avisa del éxito, y un fallo es silencio.
- **03 — Lista de chequeos.** Tarjeta bajo 900 px, acciones secundarias agrupadas (8 iconos por
  fila hoy), indicador lateral para «reciente» en vez de fondo rojo, estado vacío útil, y la
  exportación acotada a los filtros activos (R4).
- **04 — Ficha del chequeo.** Navegación por secciones, resumen de antropometría con IMC en vivo,
  aviso de unidad de estatura, y revisión médica con visor y formulario lado a lado responsive.
- **05 — Calculadora IMC.** Resultado en tarjeta dentro de la pantalla (hoy un Swal con
  `timer: 3000` se cierra antes de leer las recomendaciones), rótulo adulto/pediátrico correcto y
  aviso de «percentil estimado, no OMS». Corregir el bug de recomendaciones va en spec aparte, con
  visto bueno médico.
- **06 — Cargas masivas.** Unificar Excel y ECG en una experiencia coherente: zona de arrastrar y
  soltar, `accept=".pdf"` en ECG, el selector «NO/SI» rotulado como «Derivado a médico», errores
  con Swal (hoy van a `console.error`) y la decisión de negocio de R5.
- **07 — Home del Administrador** (opcional). Indicadores globales. Requiere decidir la fuente: hoy
  `estado-general/{user_email}` es por institución.
- **Más adelante:** migrar `Usuario` y `Medicos`, y retirar `src/Chequeo/` en su propia spec
  cuando no quede ningún perfil.

### Entregable del cierre de esta spec

`specs/chequeo-administrador/CLAUDE_CHEQUEO_ADMINISTRADOR.md` (guía viva del módulo) **no se crea
en esta etapa**. La convención del repo es que nace al implementar la 01: la escribe
`/spec-impl-ergo` al cerrar, junto con la actualización de `CLAUDE.md` (tabla de módulos y de
ruteo) y `.claude/ARQUITECTURA.md`.

---

## 13. Lo que **no** está en esta spec

- El rediseño de las pantallas: «Mi cuenta», lista, ficha, calculadora y cargas (§12).
- Un Home para `Administrador`.
- Los perfiles `Medicos` y `Usuario`, y cualquier cambio en `src/Chequeo/`.
- Corregir fórmulas o umbrales clínicos.
- Cambiar a quién asigna la carga masiva o el perfil por defecto al crear usuarios.
- Endpoints nuevos o cambios de sobre en el back-end.
- Persistir la sesión.

Cada uno de esos, si entra, va en su propia spec de `specs/chequeo-administrador/`.

### Nota de proceso

Esta spec se redactó por encargo del orquestador sin la ronda interactiva de preguntas de `/spec`
(fase 2). Las preguntas que esa ronda habría hecho están en §10 como decisiones abiertas. Ninguna
se dio por resuelta en la redacción; todas las resolvió el humano el 2026-11-03 (ver §10).

---

## 14. Estado de la implementación (cierre de `/spec-impl-ergo`, 2026-11-03)

Implementada en la rama `spec-01-modulo-perfil-administrador`, **sin commitear**. 9/9 pasos.
Guía viva creada: `CLAUDE_CHEQUEO_ADMINISTRADOR.md`. `CLAUDE.md` y `.claude/ARQUITECTURA.md`
actualizados.

**Revisión del agente dueño** (`ergosanitas-developer`): corrigió 6 defectos, todos heredados del
original salvo el último:
carreras en «Editar»/«Revisión» y en «Ver» que podían mostrar la ficha de **otro** paciente
(contador en `useRef`); carrera en la búsqueda de la lista (solo la última respuesta escribe);
«Editar» con la carga en vuelo o fallida pintaba el alta y podía **crear un duplicado**
(`ChequeoFormUpdate` ahora espera el chequeo y muestra error); el modal «Subir archivo» arrastraba
el archivo del paciente anterior; el debounce del buscador pisaba la fecha o el club; y una errata
en «Mi cuenta».

**Criterios verificados** (build, eslint, `grep` y Playwright headless de solo lectura contra
`http://localhost:5173` con un Administrador real):

- Ruteo y aislamiento: Administrador ve `AppChequeoAdministrador` con 7 tabs etiquetados; AppBar
  sin cambios; Colegios sigue con sus 6 tabs (verificado en vivo); `git status` solo lista el
  módulo, `ChequeoSegunPerfil.tsx`, `routesErgo.ts`, `specs/` y documentación; los cinco `grep`
  (imports, `user_perfil`, hex, literales de tab, `DeleteIcon`) en verde.
- Rail: icono + texto a 1440 px; solo iconos con `aria-label` a 375 px y sin scroll horizontal; los
  7 tabs caben a 1440 × 900; flechas mueven el foco.
- Paridad (solo lectura): lista paginada con sus 6 columnas y 8 acciones; «Ver» con los datos del
  registro; «Editar» con los 25 campos en 5 secciones; «Revisión Médica» con cabecera y visor;
  volver por el rail deja alta limpia; textos de §6.2.
- Carga diferida: `user_email/3` una vez con la lista y una más al abrir la ficha por primera vez
  (en `npm run dev` se ven dobles por `StrictMode`).
- Mecánica: `npm run build` y `eslint` en 0.

**Pendientes — por eso la spec sigue en `Aprobado` y no pasa a `Implementado`:**

1. `Usuario` y `Medicos` sin cuenta de prueba (D7): su ruteo está verificado **solo por
   inspección** (`ChequeoSegunPerfil`, `routesME` sin tocar).
2. Los criterios que **escriben datos** no se ejecutaron, porque el front local apunta a un backend
   que no se comprobó que no fuera producción: alta, guardar edición, guardar revisión médica,
   borrar (registro `ZZ PRUEBA CLAUDE SPEC01`), carga Excel, carga ECG, crear usuario, cambiar
   contraseña / Ergo Pass / logo, «Subir archivo» con informe GPT, «Descargar ECG», «Exportar» y la
   calculadora con un adulto de IMC 22.
3. Teclado del rail verificado solo con flechas; el foco visible, a ojo en las capturas.

Hay que probarlos a mano con el perfil afectado, contra `http://127.0.0.1:8000/api`, y entonces
marcar `Implementado`.
