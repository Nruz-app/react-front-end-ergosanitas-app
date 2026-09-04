---
name: ergo-chequeo
description: Conocimiento completo del módulo `src/Chequeo/` de Ergosanitas — el chequeo preventivo cardiovascular, el módulo más grande del repo (75 archivos, ~5.900 líneas). Cubre la matriz de tabs por perfil, la máquina de estados del paciente, los formularios declarados en JSON, el servicio de 23 métodos, los contextos propios, la lógica clínica de IMC y la deuda técnica. Úsalo antes de tocar cualquier archivo de `src/Chequeo/`, o al responder sobre chequeos, la tabla de deportistas, carga masiva, ECG, calculadora IMC o los estados del paciente.
---

# ergo-chequeo — el módulo de chequeo cardiovascular

Mapa de `src/Chequeo/`: **75 archivos, ~5.900 líneas**, el módulo más grande y más antiguo del
proyecto. Es el corazón del negocio: aquí se registra la atención al deportista.

Estilo de código: skill `ergo-code` (este módulo es de la **generación antigua**: 2 espacios,
comillas dobles, `control._formValues`, Swal para todo). Arquitectura general:
`.claude/ARQUITECTURA.md`.

---

## 1. Mapa por zonas

```
src/Chequeo/
├── pages/            AppChequeo (262) orquestador · Chequeo · ElectroCardiograma · Home-page
├── components/       34 componentes; los grandes:
│   ├── ChequeoTable.tsx (500)          la tabla de deportistas + acciones
│   ├── carga-masiva-ecg/ (322)         subida masiva de ECG
│   ├── ElectroCardiogramaForm.tsx (311)
│   ├── ChequeoForm.tsx (288)           alta de paciente
│   ├── ChequeoFormUpdate.tsx           edición
│   ├── FormUpload · ChequeoView · DownloadPDF · LikeTextCheque
│   ├── carga-masiva/ · exportar-excel/ · filters/ · date-pickers/
│   ├── calculadora-imc/ · statistics-global/ · form-perfil/ · perfil-usuario/
│   ├── select-club/ · select-user/ · logo/ · modal/ · tabs/ · loading-table/
├── config/           5 JSON: custom-form (422) · custom-IMC · electro-form · custom-likes · excel-data
├── context/          likeText/ (búsqueda) · modal-bar/ (modal de presión)
├── hooks/            useChequeo · useChequeoRut · useElectroCardiograma · useCalculoIMC ·
│                     useFormCalculoIMC · use-export-to-excel
├── interface/        10 archivos de tipos
├── services/         useChequeoService (221, 23 métodos) · useElectroCardiogranaService
└── utilities/        3 esquemas yup construidos desde los JSON
```

## 2. Cómo se monta y se rutea

`pages/index.ts` exporta `AppChequeo` **lazy** (`chequeoPage`). Se registra en **dos rutas
distintas**:

| Archivo | `path` | `perfil` |
|---|---|---|
| `routesErgo.ts` | `/Chequeos/*` (C mayúscula) | `'All'` |
| `routesME.tsx` | `/chequeos/*` (minúscula) | `'Medicos'` |

⚠️ Las rutas **difieren en la mayúscula** y `'All'` solo lo entiende `NavigationErgo` (ver
`CLAUDE.md`). Son dos montajes del mismo componente para dos navegadores distintos.

`AppChequeo` monta su **propio `<ModalProvider>` anidado** sobre el global de `App.tsx`, así que
los modales de este módulo están aislados. Al final del árbol cuelgan siempre `<FormUpload>` y
`<ChequeoView>`, que son modales controlados por ese provider.

## 3. 🔴 La matriz de tabs por perfil — lo más importante del módulo

`AppChequeo` ramifica **toda la interfaz** por `user_perfil` en tres bloques mutuamente
excluyentes. **Los índices de tab NO coinciden entre perfiles**, y ese es el mayor riesgo al
tocar este archivo:

| Índice | `Colegios` | `Medicos` | Resto (Administrador/Usuario/…) |
|---|---|---|---|
| 0 | Home (`HomePage`) | Lista Deportista | Lista Deportista |
| 1 | Lista Deportista | Perfil Usuario | Agregar/Editar (`Chequeo`) o ECG |
| 2 | Agregar Deportista | — | Carga Masiva |
| 3 | Carga Masiva | — | Agregar Perfil (`FormUser`, de `src/User/`) |
| 4 | — | — | Calculadora IMC (QTC) |
| 5 | — | — | Perfil Usuario |
| 6 | — | — | Carga Masiva ECG |

**Agregar un tab obliga a revisar los tres bloques**: el array de `<Tab>` *y* los `<TabPanel>`,
que están en secciones separadas del archivo (líneas ~180-203 y ~209-251). Si agregas uno solo
en el array, corres los índices y el panel equivocado se muestra.

⚠️ **`"Colegios"` es un perfil real que no aparece en ningún `routes*`.** Solo existe como valor
de `user_perfil` que llega del backend, y ramifica aquí y en `ChequeoForm`/`ChequeoTable`. No lo
busques en las rutas: no está. Se declara como opción en `src/User/config/custom-form.json`.

Perfiles comparados dentro del módulo: `Colegios`, `Medicos`, `Administrador`, `Usuario`.
Ojo: las comparaciones mezclan `===` y `==` (`user_perfil == 'Colegios'` en `ChequeoForm:170`).

## 4. Las dos máquinas de estados

Se confunden con facilidad porque ambas se llaman "status". Son distintas:

### `status` numérico — navegación interna (estado de React)

Vive en `AppChequeo` (`statusSet`) y viaja por `handleUpdateStatus(status, rut, id)`:

| Valor | Significado |
|---|---|
| `0` | limpio / alta nueva → `<ChequeoForm>` |
| `1` | edición de un paciente existente → `<ChequeoFormUpdate>` |
| `3` | modo electrocardiograma → `<ElectroCardiograma>` |

`handleUpdateStatus` además **cambia de tab** según el perfil (Colegios → 2, Médicos → se queda,
resto → 1) y de paso pide la URL del certificado a `UseCertificadoService`. No existe `2`.

### `estado_paciente` textual — estado clínico (dato del backend)

Se pinta como `<Chip>` de color en la tabla (`getEstadoProps` en `ChequeoTable`):

`ingresado` (default) → `Testiado` (primary) → `ECG FOTO` (secondary) → `REVISION MEDICA` (info)
→ `En Rev. Cardio` (info) → `Diag. Card. - Normal` (success) / `Diag. Card. - Alterado` (error)

Son **strings literales con espacios y puntos**; un typo rompe el color en silencio (cae en
`default`). `isRecent()` marca como recientes solo las filas en `ECG FOTO` de los últimos 3 días.

## 5. Formularios declarados en JSON

Igual que en Login, **los campos no están en el `.tsx`**: se declaran en `config/` y se recorren
con `.sort((a,b) => a.order - b.order).map(...)`.

| JSON | Campos | Alimenta |
|---|---|---|
| `custom-form.json` | **25** | `ChequeoForm` / `ChequeoFormUpdate` |
| `electro-form.json` | 4 | `ElectroCardiogramaForm` |
| `custom-IMC.json` | 4 | `calculadora-imc` |
| `custom-likes.json` | 1 | `LikeTextCheque` (buscador) |
| `excel-data.json` | plantilla | carga masiva |

**Tipos soportados** en el `.map` de `ChequeoForm`: `text`, `number`, `DatePickers`, `selected`,
`selected-user`. Un tipo nuevo en el JSON exige agregar su rama al `.map`.

**Los 25 campos** de `custom-form.json` cubren identificación (`nombre`, `rut`,
`fechaNacimiento`, `edad`, `sexo_paciente`), signos vitales (`temperatura`,
`presion_sistolica`, `presionArterial`, `saturacionOxigeno`, `hemoglucotest`), antropometría
(`peso`, `estatura`, `imc_paciente`), anamnesis (5 campos de texto libre), y gestión
(`division_paciente`, `medio_pago_paciente`, `user_email`, `status`, `fecha_atencion`).

**Deshabilitado por perfil, dentro del `.map`:** el campo lleva `disabledText: true` y, si el
perfil es `Colegios`, se oculta. Y para todo perfil que no sea `Administrador` se deshabilitan
`rut` (si ya existe), `user_email`, `status` y `fecha_atencion`. Nota: los campos deshabilitados
**no se renderizan** (`(disabled == false) && <Grid…>`), no se muestran en gris.

### Validaciones: `utilities/chequeo-validation.utility.ts`

Construye el esquema yup recorriendo el JSON. **Implementa** `required`, `REGEX_RUN`, `MAX`,
`NUMBER_DOT`. Es el patrón correcto y más completo del repo (Login solo tiene `required`).

⚠️ **`LETRAS` está declarada en `custom-form.json` (campo `nombre`) pero no se implementa**: se
ignora en silencio. Si te piden validar que el nombre sea solo letras, el arreglo va aquí.

`REGEX_RUN = /(\d{7}|\d{8})\-(\d{1}|k|K)/` — sin anclas, así que valida subcadenas.

## 6. `services/useChequeoService.ts` — 23 métodos

El servicio más grande del proyecto. **Cruza dominios**: además de chequeos, llama a
bioimpedancia, certificados y GPT.

- **CRUD**: `getChequeo` · `getChequeoRut(id)` · `postCreateChequeo` · `postUpdateChequeo(ch, id, user_email)` · `getDeleteById` · `getDeleteRut`
- **Búsqueda/listado**: `postChequeoSearch(likeTextState, user_email, limit, page)` → `POST /chequeo-cardiovascular/search-chequeo?limit=&page=` (paginado real) · `postChequeoAll` · `postChequeoUser` · `postLikeChequeo` · `postLikeChequeoUser` · `postFilterCalendar` · `postFilterClubDeportivo`
- **PDF** (abren pestaña, no descargan por axios): `chequeoPDF(id)` · `chequeoPDFRut(rut)` · `bioPDFRut(rut)`
- **Certificados**: `pathUrlCertificado` · `validaCertificado`
- **Carga masiva**: `postCargaMasiva(file, user_email)` (Excel) · `cargaMasivaECG(derivado_medico, formData)`
- **Otros**: `postUploadFile` → **`POST /GPT/analisis-ecg`** (el nombre no lo delata) · `getEstadoGeneral(user_email)` · `getUrlBio(rut)`

Recuerda la clave del modelo: los listados se filtran por **`user_email`** (la institución) y los
históricos por **`rut_paciente`** (la persona).

## 7. Contextos propios

- **`LikeTextProvider`** (`context/likeText/`) — estado de búsqueda de la tabla:
  `{ textoValue, fechaCalendar, selectClub }`. `ChequeoTable` lo consume entero y lo manda como
  cuerpo de `postChequeoSearch`. **Envuelve a `ChequeoTable` en los tres perfiles.**
- **`ModalBarProvider`** (`context/modal-bar/`) — `{ isModalOpen, typePresion }` para el modal de
  la barra de presión del `HomePage` de Colegios.

⚠️ **`context/index.ts` solo exporta `LikeText`**; `ModalBarProvider` se importa por ruta directa.
Inconsistencia del barril, no la asumas resuelta.

## 8. Lógica clínica: `hooks/useCalculoIMC.ts`

Tres funciones exportadas, y las tres tienen advertencias que hay que conocer antes de tocarlas:

- **`UseCalculoIMC(estatura, peso)`** → `peso / (estatura²)`. **Exige la estatura en metros**; si
  el dato viene en centímetros el IMC sale absurdo. Lanza `throw` con valores no numéricos o ≤ 0.
- **`UseCalcularPercentil(edad, IMC, sexo)`** → **aproximación lineal propia**, no tablas OMS/CDC:
  `base = 16 + edad*0.23` (masculino) o `15.5 + edad*0.21`, con desviación también lineal. Es una
  estimación inventada, acotada a [0.1, 99.9]. **No la presentes como percentil clínico validado.**
- **`UseIMCRecomendaciones(edad, IMC, sexo)`** → texto por rangos. Bifurca en adulto (≥18, por
  IMC) y pediátrico (<18, por percentil).
  🔴 **Bug conocido: en adultos, la rama `IMC < 25` (peso normal) devuelve exactamente las mismas
  recomendaciones que `IMC < 18.5` (bajo peso)** — le dice a un adulto sano que necesita ganar
  peso. La rama pediátrica sí está bien diferenciada.

`InputText` (compartido, en `src/components/forms/`) **recalcula el IMC en cada cambio** llamando
a `UseCalculoIMC`: por eso ese componente compartido depende de este módulo.

## 9. Consumidores externos

El módulo es proveedor de otros cinco lugares. **Cambiar estas firmas rompe fuera:**

| Quién | Qué importa |
|---|---|
| `src/AgendarHora/components/agendar-chequeo-form.tsx` | `useChequeoService` + `interface` |
| `src/Certificados/components/DownloadFile.tsx` | `useChequeoService`, `url-certificado`, `url-bio.interface` |
| `src/components/forms/InputText.tsx` | `Chequeo/hooks` (`UseCalculoIMC`) |
| `src/Home/components/SearchServicios.tsx` | `components/forms/TextInputBaseLike` |
| `src/Url/components/CertificadoForm.tsx` | `Chequeo/components` |

Y hacia fuera, el módulo **importa** de: `common/context`, `common/table`, `Certificados/services`,
`src/User` (`FormUser`), `src/components/forms`, `Login/services` (`UseRegister`).

## 10. Deuda técnica conocida

Documentada, **no para arreglarla de oficio**: cada punto cambia comportamiento.

1. 🔴 **El bug de recomendaciones de IMC en adultos** (§8).
2. **`console.log` en producción**: `postChequeoSearch` imprime el cuerpo de cada búsqueda
   (`useChequeoService.ts:139`), incluyendo `user_email`.
3. **URL malformada**: `postFilterClubDeportivo` arma el template literal con un salto de línea y
   sangría dentro (`` `\n  ${API}/…` ``), generando una URL con espacios al inicio.
4. **`control._formValues` y `control._reset()`** — API privada de react-hook-form, usada en
   `ChequeoForm`, `ChequeoFormUpdate` e `InputText`.
5. **`LETRAS` declarada pero no implementada** (§5).
6. **`useEffect` de `ChequeoTable` sin `fetchAgendaHoras` en las dependencias** (lista los campos
   del contexto uno por uno en su lugar).
7. **`ÏProcesados`** — typo con diéresis en el nombre del tipo exportado en `interface/index.ts`;
   está así en todo el módulo, no lo "arregles" sin renombrar los usos.
8. **`alert()` nativo** en `handleClickDowloadECG` de `ChequeoTable`, cuando todo el resto usa Swal.
9. **`handleReloadTable()` se llama dos veces** en `handleDeletePaciente` (dentro del `if` y al
   final).
10. **`context/index.ts` incompleto** (§7) y **mezcla de `==` y `===`** al comparar perfiles.
11. **Tipos laxos**: `IChequeo` es casi todo `string` opcional, incluidos peso, presión y
    temperatura (ver `.claude/ARQUITECTURA.md`).

## 11. Al trabajar en este módulo

- **Un campo nuevo del formulario** → el JSON de `config/`. Solo si su `type` es nuevo, además el
  `.map` del form correspondiente.
- **Una validación nueva** → `utilities/*-validation.utility.ts`, agregando una rama al bucle.
- **Un endpoint nuevo** → `services/useChequeoService.ts`, patrón `ApiAdapter`.
- **Un tab nuevo** → `AppChequeo`, y **revisa los tres bloques de perfil** (§3).
- **Cambiar columnas o acciones de la tabla** → `ChequeoTable.tsx` (500 líneas; los permisos
  están en las constantes `isAdmin`/`isMedico`/`isColegio`/`isUsuario` del principio).
- **Un estado clínico nuevo** → `getEstadoProps` en `ChequeoTable` **y** el backend; el string
  debe coincidir exacto.
- Feedback al usuario: **Swal**, como todo el módulo. Confirmación antes de borrar, siempre.
- Verificación: `npm run build` y `npx eslint src/Chequeo/`. No hay tests. Prueba a mano **con
  más de un perfil**: un cambio en `AppChequeo` que se ve bien como Administrador puede romper
  la numeración de tabs de Colegios o Médicos.
