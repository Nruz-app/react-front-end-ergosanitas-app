# SPEC 01 — Módulo `chequeo-cardiovascular`: perfil Colegios

> **Estado:** Aprobado — implementado, pendiente de verificación final
> **Implementado en:** rama `spec-01-perfil-colegios` (2026-09-04). Sigue en `Aprobado` y no en
> `Implementado` porque 8 de los 25 criterios de aceptación no se pudieron comprobar: ver
> «Criterios pendientes» al final del documento.
> **Depende de:** ninguna
> **Fecha:** 2026-09-03
> **Objetivo:** Crear el módulo `src/chequeo-cardiovascular/` como reemplazo autocontenido de `src/Chequeo/` para el perfil `Colegios`, y enrutar ese perfil hacia él sin modificar el módulo original.

---

## 1. Por qué existe esta spec

`src/Chequeo/` es el módulo más grande y más antiguo del repositorio: 75 archivos, ~5.900 líneas,
y una sola pantalla (`AppChequeo`) que ramifica **toda** la interfaz en tres bloques de perfil con
índices de tab que no coinciden entre sí. Cualquier cambio para un perfil obliga a revisar los
otros dos. Esa es la razón real del trabajo.

La estrategia es **migrar perfil por perfil a un módulo nuevo**, empezando por `Colegios`, que es
el más acotado (4 tabs, sin ECG, sin gestión de usuarios). `src/Chequeo/` queda intacto y sigue
sirviendo a `Administrador`, `Medicos` y `Usuario` exactamente como hoy. Cada perfil siguiente
será su propia spec en esta misma carpeta.

Dos consecuencias de diseño que se derivan de esto:

- El módulo nuevo **no importa nada de `src/Chequeo/`**. Si lo hiciera, seguiría atado al módulo
  que queremos poder retirar algún día.
- El módulo nuevo **no incluye ninguna operación de borrado**. No es solo una restricción del
  encargo: el perfil `Colegios` tampoco la tiene hoy (`handleDeletePaciente` está envuelto en
  `isAdmin`), así que no se pierde ninguna capacidad.

---

## 2. Alcance

**Dentro:**

- Módulo nuevo `src/chequeo-cardiovascular/`, autocontenido, con los 4 tabs del perfil `Colegios`:
  Home de estadísticas, Lista de deportistas, Agregar/Editar deportista, Carga masiva.
- Ruteo del perfil `Colegios` hacia el módulo nuevo: `src/routes/NavigationCol.tsx`,
  `src/routes/routesCOL.tsx` y un `case 'Colegios'` en `src/routes/NavigationApp.tsx`.
- Clonado dentro del módulo de las dependencias de feature: los 4 gráficos de `src/Estadisticas/`,
  el `getCertificadoRut` de `src/Certificados/` y el `InputText` de `src/components/forms/`.
- Servicio propio con los **10 métodos** que el perfil `Colegios` realmente usa, apuntando a los
  mismos endpoints del backend que hoy.
- Corrección de la deuda técnica inocua listada en §6 (no la clínica).
- Rediseño visual de las cuatro pantallas, dentro de la identidad actual (§5, pasos 3 a 8).
- Vista responsive de la lista y del formulario bajo 900 px.

**Fuera de alcance (para specs futuras):**

- Los perfiles `Medicos`, `Administrador` y `Usuario`. Siguen en `src/Chequeo/`, sin tocar.
- Electrocardiograma, carga masiva de ECG, calculadora IMC (QTC), «Agregar Perfil» (`FormUser`) y
  «Perfil Usuario». Ninguno lo ve `Colegios`.
- Cualquier operación de borrado: `getDeleteRut`, `getDeleteById` y el botón de la papelera **no
  se portan**.
- La subida de archivo a `POST /GPT/analisis-ecg` (`FormUpload`), que hoy solo abre `Administrador`.
- Corregir las fórmulas clínicas (`UseCalculoIMC`, `UseCalcularPercentil`, `UseIMCRecomendaciones`).
  Se clonan con su comportamiento actual, bug incluido. Cambiar un umbral clínico es una decisión
  médica, no una refactorización, y va en su propia spec.
- Borrar, desactivar o modificar `src/Chequeo/`, `src/Estadisticas/`, `src/Certificados/`,
  `src/Login/` y `src/components/`. Todos quedan intactos.
- Persistir la sesión (hoy un F5 desloguea). Es un problema de `src/common/context/login/` y no
  cambia con esta spec.

---

## 3. Modelo de datos

No aparecen entidades nuevas. Se **clonan** los tipos que el perfil `Colegios` usa, en
`src/chequeo-cardiovascular/interface/`, para que el módulo no dependa de `src/Chequeo/interface/`:

| Archivo nuevo | Clonado de | Contenido |
|---|---|---|
| `chequeo.interface.ts` | `Chequeo/interface/chequeo.interface.ts` | `IChequeo`, `IData`, `IDataAll` |
| `estado-generales.interface.ts` | idem | `EstadoGenerales` (11 contadores del Home) |
| `form-data.interface.ts` | `formData.interface.ts` | `formData` |
| `response-carga-masiva.interface.ts` | `response-carga-masiva.ts` | `ResponseCargaMasica` |
| `url-certificado.interface.ts` | `url-certificado.ts` | `IUrlCertificado` |
| `certificado-url.interface.ts` | `Certificados/interface/` | `ICertificadoUrl` |
| `estadistica.interface.ts` | `Estadisticas/interface/` | `IEstadistica`, `IEstadisticaPresion` |

`IChequeo` se clona **tal cual, sin retipar**, aunque sea casi todo `string` opcional. Retiparlo a
`number | null` obligaría a tocar el mapeo con el backend y saldría del alcance.

Las dos claves del modelo no cambian: **`user_email`** identifica al colegio (filtra los listados)
y **`rut`** identifica a la persona. No se introduce ningún id relacional.

### Único cambio de forma: campo `seccion` en `config/custom-form.json`

Los 25 campos del formulario se copian con sus mismos `name`, `type`, `order`, `validations` y
`disabledText`. Se les agrega **un campo nuevo**, `seccion`, que es lo que permite agruparlos
visualmente sin escribir los nombres de campo en el `.tsx`:

```jsonc
{
  "order": 8,
  "name": "temperatura",
  "type": "text",
  "seccion": "signos-vitales",
  "disabledText": true,
  "validations": []
}
```

Reparto de los 25 campos:

| `seccion` | Campos (con su `order`) |
|---|---|
| `identificacion` | nombre 1 · rut 2 · fechaNacimiento 3 · edad 4 · sexo_paciente 5 · division_paciente 6 · medio_pago_paciente 7 |
| `signos-vitales` | temperatura 8 · presion_sistolica 9 · presionArterial 10 · saturacionOxigeno 11 · hemoglucotest 12 |
| `antropometria` | peso 13 · estatura 14 · imc_paciente 15 |
| `anamnesis` | enfermedadesCronicas 16 · medicamentosDiarios 17 · sistemaOsteoarticular 18 · sistemaCardiovascular 19 · enfermedadesAnteriores 20 · Recuperacion 21 · gradoIncidenciaPosterio 22 |
| `gestion` | user_email 23 · status 24 · fecha_atencion 25 |

**Una sección sin campos visibles no se renderiza.** Para `Colegios` esto importa mucho: los 18
campos con `disabledText: true` se ocultan, igual que hoy, así que las secciones
`signos-vitales`, `antropometria`, `anamnesis` y `gestion` quedan vacías y el formulario muestra
**solo `identificacion`**. El agrupamiento se nota de inmediato cuando el módulo se extienda a
`Administrador`, y no debe pintar cabeceras huérfanas mientras tanto.

### Endpoints — los 10 que consume el módulo

Ninguno es nuevo. Base: `${VITE_API}${VITE_API_PATH}` = `http://127.0.0.1:8000/api`.

| Método del servicio | Endpoint | Lo usa |
|---|---|---|
| `postChequeoSearch` | `POST /chequeo-cardiovascular/search-chequeo?limit=&page=` | Lista (paginada) |
| `postChequeoAll` | `POST /chequeo-cardiovascular/chequeo-all` | Exportar a Excel |
| `getChequeoRut(id)` | `GET /chequeo-cardiovascular/{id}` | Ver detalle y editar |
| `postCreateChequeo` | `POST /chequeo-cardiovascular` | Alta |
| `postUpdateChequeo` | `PUT /chequeo-cardiovascular/{id}/{user_email}` | Edición |
| `chequeoPDF(id)` | `GET /chequeo-cardiovascular/pdf/{id}` (abre pestaña) | Descargar PDF |
| `pathUrlCertificado` | `POST /certificado/path-url` | Descargar ECG |
| `getEstadoGeneral` | `GET /chequeo-cardiovascular/estado-general/{user_email}` | Home |
| `postCargaMasiva` | `POST /carga-masiva/excel` | Carga masiva |
| `getCertificadoRut` | `GET /certificado/{rut}` | URL del certificado al editar |

Más los 4 de estadísticas, clonados de `src/Estadisticas/services/`:
`GET /estadisticas/estadistica-{imc,presion,hemoglucotest,saturacion}/{user_email}`.

**Los 13 métodos restantes de `useChequeoService` no se portan**, incluidos los dos `DELETE`.

---

## 4. Estructura de archivos

```
src/chequeo-cardiovascular/
├── index.ts
├── pages/
│   ├── index.ts
│   ├── AppChequeoCardiovascular.tsx   orquestador, 4 tabs, solo Colegios
│   ├── HomePage.tsx                   tab 0
│   └── ChequeoPage.tsx                tab 2 (decide alta vs edicion)
├── components/
│   ├── index.ts
│   ├── ChequeoTable.tsx               tab 1, escritorio
│   ├── ChequeoTarjeta.tsx             NUEVO — la fila como tarjeta bajo 900 px
│   ├── ChequeoForm.tsx                alta
│   ├── ChequeoFormUpdate.tsx          edicion
│   ├── ChequeoView.tsx                modal de detalle
│   ├── DownloadPDF.tsx
│   ├── LoadingTable.tsx
│   ├── SeccionCampos.tsx              NUEVO — cabecera + grilla de una seccion
│   ├── filters/       FilterTable.tsx · LikeTextChequeo.tsx
│   ├── date-pickers/  DatePickers.tsx · DatePickerInput.tsx
│   ├── forms/         InputText.tsx · InputSelect.tsx    clones, con el IMC del modulo
│   ├── carga-masiva/  CargaMasiva.tsx · FileUploadExcel.tsx
│   ├── exportar-excel/ExportarExcel.tsx + config/column.excel.json
│   ├── estadisticas/  BarPresion.tsx · PieChartImc.tsx ·
│   │                  PieChartHemoglucotest.tsx · PieChartSaturacion.tsx   clones
│   ├── statistics-global/StatisticsGlobal.tsx
│   ├── modal/         ModalStatus.tsx
│   └── tabs/          TabPanel.tsx
├── config/    custom-form.json (25 campos + seccion) · custom-likes.json · excel-data.json
├── context/   index.ts · like-text/ · modal-bar/
├── hooks/     index.ts · useChequeo.ts · useChequeoRut.ts · useCalculoIMC.ts · useExportToExcel.ts
├── interface/ los 7 archivos de la seccion 3
├── services/  useChequeoCardiovascularService.ts · useEstadisticasService.ts · useCertificadoService.ts
└── utilities/ chequeo-validation.utility.ts
```

Estilo: **generación nueva** (skill `ergo-code`) — componentes PascalCase, arrow function con
`interface Props` local, 4 espacios, react-hook-form + yup, `sx` de MUI. Se importa de `common/`
(`ApiAdapter`, `LoginContext`, `ModalContext`) como hace todo el repo: eso es lectura, no
modificación.

**No se copia**: `select-club/` (solo visible para `Administrador`), `select-user/`,
`form-perfil/`, `perfil-usuario/`, `logo/`, `calculadora-imc/`, `carga-masiva-ecg/`,
`ElectroCardiogramaForm`, `FormUpload`, `useElectroCardiogranaService`, ni `common/table/`
(es código muerto: de sus 595 líneas solo se usa el tipo `IColumnsTable`, que aquí se declara
local).

---

## 5. Plan de implementación

Cada paso deja el proyecto compilando (`npm run build` en verde) y es commiteable por sí solo.
Hasta el paso 9 nada está enrutado, así que ningún usuario ve el módulo a medio hacer.

1. **Esqueleto, tipos y servicios.** Crear el árbol de carpetas, los 7 archivos de `interface/`
   y los 3 de `services/` con los 10 + 4 métodos de la sección 3. Sin UI todavía.
   *Verificación:* `npm run build` en verde; `grep -rn "delete" src/chequeo-cardiovascular/services/`
   no devuelve nada.

2. **Contextos, hooks, config y validaciones.** Clonar `like-text/` y `modal-bar/` (con el barril
   `context/index.ts` **completo**, exportando los dos), los 4 hooks, los 3 JSON de `config/`
   —agregando el campo `seccion`— y `chequeo-validation.utility.ts`. `useCalculoIMC.ts` se copia
   con su lógica intacta y un JSDoc que documenta el bug de adultos sin corregirlo.
   *Verificación:* build en verde.

3. **Componentes de formulario y `SeccionCampos`.** Clonar `InputText` (apuntando al
   `useCalculoIMC` del módulo), `InputSelect` y los date-pickers. Escribir `SeccionCampos`, que
   recibe el título y los campos ya filtrados y **no renderiza nada si la lista viene vacía**.

4. **`ChequeoForm` y `ChequeoFormUpdate`.** Recorrer el JSON agrupado por `seccion` en lugar de
   la grilla plana. Se conserva idéntica la regla de ocultamiento: `disabledText: true` +
   perfil `Colegios` → el campo no se renderiza; y `rut`/`user_email`/`status`/`fecha_atencion`
   deshabilitados para todo perfil que no sea `Administrador`.
   *Verificación manual:* como `Colegios` se ve una sola sección, «Identificación», con 7 campos.

5. **Lista de deportistas, escritorio.** `ChequeoTable` con las 4 columnas de `Colegios`
   —nombre, rut, edad, estado— y sus 3 acciones: Ver, Descargar PDF, Descargar ECG. Más
   `FilterTable` (buscador + fecha, sin `SelectClub`), `ExportarExcel`, `LoadingTable`,
   `ChequeoView` y `DownloadPDF`. Rediseño: barra de filtros agrupada, densidad de fila revisada
   y **el «reciente» pasa de fondo rojo completo a un indicador lateral**, porque hoy el rojo
   pleno deja el texto ilegible.

6. **Lista responsive.** `ChequeoTarjeta`: bajo 900 px cada fila se pinta como tarjeta con
   nombre, rut · edad, chip de estado y los tres iconos de acción. El formulario pasa a una
   columna en el mismo punto de corte.

7. **Home de estadísticas.** Clonar los 4 gráficos y `StatisticsGlobal`, montarlos en `HomePage`
   con `ModalBarProvider` y `ModalStatus`. Rediseño: KPIs con jerarquía arriba, los 4 gráficos
   con título y leyenda consistentes entre sí.

8. **Carga masiva.** `CargaMasiva` con zona de arrastrar y soltar, el formato de columnas
   esperado a la vista y el resumen de resultado (`status`, `message`, `cantidad`) legible.
   Feedback con Swal, como el resto del repo.

9. **Orquestador y ruteo.** `AppChequeoCardiovascular` con los 4 tabs verticales —sin ramificar
   por perfil: este módulo es de `Colegios`— y su `ModalProvider` anidado. Después
   `src/routes/routesCOL.tsx` (una sola entrada, `path: '/*'`),
   `src/routes/NavigationCol.tsx` (copia de `NavigationMe` apuntando a `routesCOL`) y el
   `case 'Colegios'` en `NavigationApp.tsx`.

---

## 6. Deuda técnica: qué se corrige y qué no

**Se corrige al clonar** (nada de esto cambia el resultado que ve el usuario):

- El `console.log` de `postChequeoSearch`, que hoy imprime `user_email` en la consola de producción.
- La URL de `postFilterClubDeportivo`, malformada por un salto de línea dentro del template
  literal. El método no se porta, pero la revisión confirma que el patrón no reaparezca.
- El `alert()` nativo de `handleClickDowloadECG` → Swal, como el resto del módulo.
- `context/index.ts` incompleto: el nuevo exporta `like-text` **y** `modal-bar`.
- El doble `handleReloadTable()` de `handleDeletePaciente` desaparece junto con el borrado.
- `==` → `===` en todas las comparaciones de perfil.
- El typo `ÏProcesados` no se hereda: ese tipo pertenece a la carga masiva de ECG, que no se porta.

**No se toca** (cambia comportamiento clínico, va en otra spec):

- `UseCalculoIMC` — sigue exigiendo la estatura en **metros**.
- `UseCalcularPercentil` — sigue siendo la aproximación lineal propia, no tablas OMS/CDC.
- `UseIMCRecomendaciones` — el bug de adultos (`IMC < 25` devuelve el texto de bajo peso) **se
  clona tal cual**, documentado en un JSDoc.
- `LETRAS`, declarada en el JSON del campo `nombre` y nunca implementada, sigue sin implementarse.

---

## 7. Criterios de aceptación

Ruteo y aislamiento:

- [ ] Un usuario con `user_perfil === "Colegios"` entra y aterriza en el módulo nuevo, no en `/Chequeos`.
- [ ] La barra superior le muestra **una** entrada, «Chequeo Cardiovascular».
- [ ] `git diff --name-only main...HEAD` **no lista ningún archivo** de `src/Chequeo/`,
      `src/Estadisticas/`, `src/Certificados/`, `src/Login/` ni `src/components/`.
- [ ] `grep -rn "Chequeo/" src/chequeo-cardiovascular/` no devuelve resultados: el módulo nuevo
      no importa nada del viejo.
- [ ] Un usuario `Administrador` sigue viendo `/Chequeos` con sus 7 tabs, sin cambios.
- [ ] Un usuario `Medicos` sigue entrando a `NavigationMe` con sus 2 tabs, sin cambios.

Ausencia de borrado:

- [ ] `grep -rni "delete" src/chequeo-cardiovascular/` no devuelve ninguna llamada HTTP ni ningún
      handler de borrado.
- [ ] La lista de deportistas no muestra icono de papelera en ninguna fila ni en ningún ancho.

Funcionalidad, probada contra `http://127.0.0.1:8000/api` con un usuario `Colegios` real:

- [ ] El Home carga los 11 contadores de `estado-general` y los 4 gráficos con datos del colegio.
- [ ] La lista trae los deportistas del `user_email` de la sesión, paginada, con las 4 columnas.
- [ ] El buscador por rut/nombre y el filtro por fecha modifican el resultado de la lista.
- [ ] «Ver» abre el modal de detalle con los datos del deportista.
- [ ] «Descargar PDF» abre el PDF del chequeo en una pestaña nueva.
- [ ] «Descargar ECG» descarga el certificado; si no existe, avisa con Swal (no con `alert`).
- [ ] «Exportar» genera el Excel con los deportistas del colegio.
- [ ] Dar de alta un deportista lo guarda y aparece en la lista al volver al tab.
- [ ] El formulario muestra **solo la sección «Identificación»** con sus 7 campos.
- [ ] Un RUT que no pasa `REGEX_RUN` y los campos requeridos vacíos bloquean el envío con
      mensaje visible.
- [ ] La carga masiva sube un Excel y muestra el resumen con la cantidad procesada.

Rediseño y responsive:

- [ ] A 1280 px las cuatro pantallas conservan la identidad azul actual (`#1976d2` → `#0d47a1`),
      los tabs verticales con iconos y la tarjeta blanca con sombra.
- [ ] A 375 px la lista se ve como tarjetas legibles, con las 3 acciones alcanzables, y **sin
      scroll horizontal en el body**.
- [ ] A 375 px el formulario se ve en una columna, sin campos cortados.
- [ ] Una fila «reciente» (estado `ECG FOTO` de los últimos 3 días) se distingue del resto **sin**
      que el texto quede ilegible.

Mecánica:

- [ ] `npm run build` en verde.
- [ ] `npx eslint src/chequeo-cardiovascular/ src/routes/` devuelve 0 problemas.

---

## 8. Decisiones tomadas y descartadas

- **Sí:** navegador propio `NavigationCol` + `routesCOL` + `case 'Colegios'` en `NavigationApp`.
  Es el patrón que ya usan `Medicos`, `Paciente` y `Emergencia Deportiva`, y saca a `Colegios` de
  `NavigationErgo` de una vez, sin dejarle dos menús de chequeo.
- **No:** cambiar el `Component` de la entrada `/Chequeos` de `routesErgo`. Afectaría también a
  `Administrador` y `Usuario`, y el plan es perfil por perfil.
- **No:** agregar una segunda entrada a `routesErgo` con `perfil: 'Colegios'`. La entrada
  existente tiene `perfil: 'All'`, así que `Colegios` seguiría viendo el módulo viejo al lado.
- **Sí:** portar solo lo que `Colegios` usa (~35 archivos de los 75). Los perfiles siguientes
  agregan lo suyo en su propia spec; arrancar con los 75 sería heredar código muerto desde el
  primer día.
- **Sí:** clonar dentro del módulo los gráficos de `Estadisticas`, el `getCertificadoRut` de
  `Certificados` y el `InputText` compartido. Cuesta duplicación, pero el módulo queda
  autocontenido y —en el caso de `InputText`— rompe el acoplamiento raro en el que un componente
  compartido de `src/components/` depende de un módulo de feature.
- **No:** clonar `common/` ni `Login/services/useRegister`. Son infraestructura transversal de la
  que dependen 64 archivos; duplicarlas sería fabricar una segunda sesión y una segunda capa HTTP.
- **Sí:** migrar y rediseñar en la misma spec, decidido explícitamente por el usuario. Se hizo
  notar el riesgo —sin línea base no se distingue un bug de copia de un cambio intencional— y se
  compensa separando el trabajo en dos capas: paridad funcional (sección 7, bloque
  «Funcionalidad», que describe el comportamiento actual) y una lista **cerrada** de cambios
  visuales (pasos 5 a 8).
- **Sí:** pulir la identidad actual en vez de rediseñar de cero. Un usuario de colegio reconoce
  la pantalla al entrar; solo se lee mejor.
- **Sí:** responsive de lista y formulario. Los datos se cargan en cancha, desde el teléfono.
- **No:** corregir la lógica clínica de IMC y percentil. Es una decisión médica.
- **No:** portar ninguna operación de borrado, ni siquiera oculta tras un permiso. `Colegios` no
  la tiene hoy, así que no se pierde nada.
- **Sí:** carpeta y spec en kebab-case (`chequeo-cardiovascular`), como `ficha-clinica` y
  `home-ergo`, los dos módulos más nuevos. Coincide además con el prefijo de los endpoints.

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| `NavigationApp` decide por `user_perfil` **antes** de mirar `valid`, así que `Colegios` entraría a `NavigationCol` con sesión inválida. | Es el comportamiento que ya tienen `Medicos`, `Paciente` y `ED`; hoy no se nota porque el estado inicial trae `user_perfil: ''`. Se replica tal cual y **no se usa `valid` para proteger la vista**. |
| `user_perfil` es un string libre del backend: un `"Colegios "` con espacio no entraría al `case`. | `NavigationApp` ya hace `user.user_perfil?.trim()` antes del `switch`. Se mantiene. |
| Rediseñar y migrar a la vez tapa un bug de copia. | Los criterios de la sección 7 describen el comportamiento **actual** acción por acción; los cambios visuales están enumerados y cerrados en los pasos 5 a 8. Nada visual fuera de esa lista. |
| Clonar `InputText` deja dos copias divergiendo. | La copia del módulo es la única que usa `chequeo-cardiovascular`; la de `src/components/` queda intacta para el resto del repo. Se anota en `CLAUDE_CHEQUEO_CARDIOVASCULAR.md`. |
| Clonar los 4 gráficos deja el mismo bug en dos sitios. | Aceptado explícitamente al elegir un módulo autocontenido. Queda anotado en la guía del módulo. |
| El módulo entra al build y `dist/` ya ronda los 60 MB, que el CI sube entero por FTP tres veces en paralelo. | El módulo no agrega assets binarios: es solo código. El impacto en `dist/` es marginal. |
| `Colegios` no aparece en ningún `routes*` hoy, así que nadie recuerda que existe. | Esta spec lo pone por primera vez en un `routes*` propio y lo documenta en `CLAUDE.md`. |

---

## 10. Lo que **no** está en esta spec

- Los perfiles `Medicos`, `Administrador` y `Usuario`: siguen íntegros en `src/Chequeo/`.
- Electrocardiograma, carga masiva de ECG, calculadora IMC, «Agregar Perfil», «Perfil Usuario».
- Cualquier borrado: ni endpoint, ni botón, ni handler.
- La corrección de las fórmulas clínicas de IMC y percentil.
- Retipar `IChequeo` a `number | null`.
- Retirar o desactivar `src/Chequeo/`. Ese día llegará cuando los cuatro perfiles estén migrados,
  y será su propia spec.

Cada uno de esos, si entra, va en su propia spec de `specs/chequeo-cardiovascular/`.


---

## 11. Criterios pendientes de verificación (2026-09-04)

El módulo está implementado y probado contra `http://127.0.0.1:8000/api` con la cuenta
`brisas@ergosanitas.com` (perfil `Colegios`). **17 de los 25 criterios quedaron verificados.**
Estos 8 no, y por eso la spec **no** se marca `Implementado`:

| Criterio | Por qué no se verificó |
|---|---|
| `Administrador` sigue viendo `/Chequeos` con sus 7 tabs | No hay credenciales de ese perfil. Verificado **solo por inspección**: `NavigationApp` cae al `default` igual que antes y `src/Chequeo/` no tiene ni un cambio. |
| `Medicos` sigue entrando a `NavigationMe` con sus 2 tabs | Igual que el anterior. |
| El Home carga **los 4 gráficos** | Carga 3. **`GET /estadisticas/estadistica-saturacion/{user_email}` devuelve HTTP 500** en el backend local (`Call to undefined method ChequeoCardiovascular::SP_estadistica_saturacion()`). El front degrada bien y muestra «Todavía no hay datos suficientes». **Es un fallo del backend, no del módulo.** |
| El **filtro por fecha** modifica el resultado de la lista | Solo se comprobó que el control existe, escribe en `LikeTextContext` y se limpia. No se ejecutó una búsqueda por fecha con resultados. |
| «Descargar PDF» abre el PDF en una pestaña nueva | El endpoint se verificó por separado (`/pdf/4498` devuelve un PDF real de 95 KB), pero el click no se ejecutó en el navegador: abre una pestaña nueva y eso no se pudo observar. |
| «Exportar» genera el Excel | La fuente se verificó (`chequeo-all` devuelve 118 filas × 18 columnas), pero la descarga del archivo no se pudo observar. |
| La **carga masiva** sube un Excel y muestra el resumen | No se dispone de un `.xlsx` válido para subir. La pantalla, la zona de arrastrar y soltar y el resumen están implementados, pero no se ejecutó una carga real. |
| Una fila «reciente» se distingue con indicador lateral | Implementado y visible en el código, pero **no se observó con un dato real**: `esReciente` exige estado `ECG FOTO` de los últimos 3 días y los registros del colegio son de mayo y agosto. |

### Correcciones no previstas por la spec

Cuatro problemas aparecieron al probar de verdad y se corrigieron. Los tres primeros son
consecuencia de **activar la validación**, que en `src/Chequeo/` nunca llegaba a ejecutarse
porque el botón llamaba a `onSubmit` saltándose `handleSubmit`:

1. **El esquema yup valida solo los campos visibles.** Ocho campos ocultos declaran `required`;
   validarlos todos dejaba el formulario imposible de enviar para `Colegios`.
2. **`typeError` en los campos numéricos.** Un `Yup.number()` vacío falla el casteo antes que
   `required` y mostraba el mensaje por defecto de yup en inglés.
3. **`defaultValues` reales en el formulario.** El `Controller` pinta su `defaultValue` pero no
   lo escribe en el estado: los desplegables se veían con «Masculino» y «No Pagado» elegidos
   mientras la validación los daba por vacíos.
4. **Blindaje de forma en los gráficos.** El backend responde 200 con sobres de error en
   estadísticas; sin comprobar `Array.isArray(response?.data)`, `serie.data.length` revienta en
   el render y **un gráfico caído tumba el Home entero**.

### Dato de prueba creado

Para verificar el alta se creó el registro **`ZZ PRUEBA CLAUDE SPEC01` / RUT `11111111-1`** en
`brisas@ergosanitas.com`. Este módulo **no tiene borrado por diseño**, así que debe eliminarse
desde el perfil `Administrador` si estorba.
