# CLAUDE_CHEQUEO_CARDIOVASCULAR.md

Guía del módulo `src/chequeo-cardiovascular/`. Recoge el estado consolidado tras las Specs 01,
02 y 03, y lo que **no** hay que romper. Léela antes de tocar el módulo.

El módulo tiene además **agente y skill propios**, `ergo-chequeo-cardiovascular`, con perímetro
cerrado a `src/chequeo-cardiovascular/`. Si esta guía y la skill discrepan, **manda esta guía**.

Estado de las specs de esta carpeta:

| Spec | Qué hizo | Estado |
|---|---|---|
| `01-perfil-colegios.md` | Creó el módulo para el perfil `Colegios` | Implementado |
| `02-home-colegio.md` | Rediseñó el Home: 2 secciones, 4 gráficos nuevos, accesibilidad | Aprobado (código completo; 4 criterios visuales sin verificar) |
| `03-asistente-colegio.md` | Cambió el botón «Detalle clínico» por un chat conversacional, hoy en el tab «Asistente Virtual» | Implementado, **revisada** (§9 de la spec: rediseño visual y mudanza a tab propio). 10 de 20 criterios verificados; 10 de comportamiento pendientes de prueba manual — §8 y §9.4 |
| — | `Medicos`, `Administrador`, `Usuario` siguen en `src/Chequeo/` | — |

---

## 1. Por qué existe este módulo

`src/Chequeo/` son 75 archivos y ~5.900 líneas, con una sola pantalla (`AppChequeo`) que
ramifica **toda** la interfaz en tres bloques de perfil cuyos índices de tab no coinciden.
Tocar algo para un perfil obliga a revisar los otros dos.

La estrategia es **migrar perfil por perfil**. `Colegios` fue el primero por ser el más acotado.
`src/Chequeo/` queda intacto y sigue sirviendo a los otros tres perfiles exactamente como antes.
Cada perfil siguiente será su propia spec en esta misma carpeta.

## 2. Las cuatro reglas duras

1. **El módulo no importa nada de `src/Chequeo/`.** Tampoco de `src/Estadisticas/`,
   `src/Certificados/` ni `src/components/`. Lo único externo es `src/common/` (el `ApiAdapter`
   y los contextos globales), que es lectura, no modificación. Comprobación:
   `grep -rn "from '.*\(Chequeo\|Estadisticas\|Certificados\|components/forms\)" src/chequeo-cardiovascular/`
   solo debe devolver rutas internas `./`.

2. **Ninguna operación de borrado.** Ni endpoint, ni handler, ni botón, ni siquiera oculto tras
   un permiso. No se pierde capacidad: en `src/Chequeo/` la papelera ya estaba tras `isAdmin`.
   El botón de limpiar el buscador usa `ClearIcon`, **nunca `DeleteIcon`**, para que la
   comprobación por `grep -rni delete` siga siendo significativa.

3. **Este módulo es de un solo perfil.** `AppChequeoCardiovascular` **no ramifica por
   `user_perfil`**: son 5 tabs fijos. Esa es la diferencia de fondo con `AppChequeo`. Si un día
   se migra otro perfil aquí, la decisión de cómo convivir se toma en su spec — no se replica
   el `if (user_perfil === …)` por dentro sin pensarlo.

4. **La lógica clínica no se toca.** Ver §7.

## 3. Estructura y responsabilidades

```
src/chequeo-cardiovascular/
├── pages/       AppChequeoCardiovascular (orquestador, 5 tabs) · HomePage ·
│                AsistentePage · ChequeoPage
├── components/  ChequeoTable · ChequeoTarjeta · ChequeoForm · ChequeoFormUpdate ·
│                ChequeoView · SeccionCampos · SeccionHome · DownloadPDF · LoadingTable
│                filters/ · date-pickers/ · forms/ · carga-masiva/ · exportar-excel/ ·
│                estadisticas/ · statistics-global/ · asistente/ · tabs/
├── config/      custom-form.json (25 campos + `seccion`) · custom-likes.json ·
│                excel-data.json · secciones.ts · tema.ts (tokens visuales) ·
│                sugerencias-asistente.ts
├── context/     like-text/ (búsqueda) — el único; `modal-bar/` se retiró en la Spec 03
├── hooks/       useChequeo · useChequeoRut · useCalculoIMC · useExportToExcel ·
│                useResumenColegio · useReconocimientoVoz
├── interface/   10 archivos de tipos + barril
├── services/    useChequeoCardiovascularService (9) · useEstadisticasService (4) ·
│                useCertificadoService (1) · useAsistenteColegioService (2)
└── utilities/   chequeo-validation.utility · chequeo.utility · resumen.utility
```

Los 5 tabs: **0** Home · **1** Asistente Virtual · **2** Lista · **3** Alta/Edición ·
**4** Carga masiva.

🔴 **Los índices se usan a mano en dos handlers** del orquestador, así que insertar un tab en
medio los desplaza en silencio — es exactamente lo que pasó al mover el asistente a la posición
1, que empujó los tres siguientes. Por eso ya no hay literales: las cinco posiciones son
constantes `TAB_HOME`, `TAB_ASISTENTE`, `TAB_LISTA`, `TAB_ALTA` y `TAB_CARGA`, declaradas junto
al array `TABS`, y las usan tanto los `<TabPanel>` como `handleChange` y `handleUpdateStatus`.
Si agregas un tab, **declara su constante**; no escribas el número.

## 4. El formulario: agrupado por `seccion` (concepto central)

`config/custom-form.json` es el JSON de `src/Chequeo/` **más un campo nuevo, `seccion`**. Es lo
único que cambia de forma respecto al original, y es lo que permite agrupar el formulario sin
escribir nombres de campo en el `.tsx`.

| `seccion` | Campos | Visible para `Colegios` |
|---|---|---|
| `identificacion` | nombre, rut, fechaNacimiento, edad, sexo_paciente, division_paciente, medio_pago_paciente | **Sí, los 7** |
| `signos-vitales` | temperatura, presion_sistolica, presionArterial, saturacionOxigeno, hemoglucotest | No |
| `antropometria` | peso, estatura, imc_paciente | No |
| `anamnesis` | 7 campos de texto libre | No |
| `gestion` | user_email, status, fecha_atencion | No |

**Una sección sin campos visibles no se renderiza** (`SeccionCampos` devuelve `null` si
`cantidad === 0`). Por eso `Colegios` ve solo «Identificación» y no cabeceras huérfanas.

La regla de ocultamiento es la heredada, sin cambios: `disabledText: true` + perfil `Colegios`
→ el campo no se renderiza; y `rut`/`user_email`/`status`/`fecha_atencion` fuera para todo
perfil que no sea `Administrador`.

### ⚠️ El esquema yup valida SOLO los campos visibles

`buildChequeoValidationSchema(camposVisibles)` recibe la lista de campos que se pintan.
**No es un detalle:** ocho de los campos ocultos declaran `required` (temperatura, presión,
peso, estatura, IMC…). Validarlos todos dejaría el formulario **imposible de enviar** para
`Colegios`.

El módulo original esquivaba el problema de otra manera: su botón llamaba a `onSubmit`
directamente, **sin pasar por `handleSubmit`**, así que en la práctica no validaba nada. Aquí sí
se valida de verdad, pero solo lo que el usuario puede ver.

Dos consecuencias que se descubrieron al activar la validación de verdad:

- **Los campos numéricos necesitan `typeError`.** Un `Yup.number()` vacío falla el casteo antes
  que `required` y escupe su mensaje por defecto en inglés. Se sustituye por el mensaje en
  español que el propio JSON ya declara.
- **El formulario necesita `defaultValues` reales.** El `Controller` de react-hook-form *pinta*
  su `defaultValue` pero no lo escribe en el estado: sin `valoresPorDefecto()`, los desplegables
  se veían con «Masculino» y «No Pagado» elegidos mientras la validación los daba por vacíos.
  En alta se hace `reset(defaults)`, nunca `reset({})`.

## 5. El Home: dos secciones y dos fuentes de datos (Spec 02)

El tab 0 tiene **6 contadores, una lista y 5 gráficos**, en dos secciones con encabezado
(`SeccionHome`). La lista va primero porque es **lo único accionable**: el resto describe a la
población, ella nombra a quien hay que atender.

| Sección | Contenido | Fuente |
|---|---|---|
| **Requiere atención** | `ListaAlterados` — quiénes tienen diagnóstico alterado, con sus signos vitales | Derivada de `chequeo-all` |
| **Salud de los deportistas** | IMC · Hemoglucotest · Presión | `estadisticas/*` (backend) |
| | Saturación de oxígeno · Pirámide edad/sexo | Derivadas de `chequeo-all` |

### El tab «Asistente Virtual» (Spec 03)

El chat nació **dentro del Home**, en el sitio del botón «Detalle clínico» —que abría un modal
con cuatro párrafos fijos y no leía ni un dato del colegio—. Con ese botón se retiraron
`ModalStatus` y todo el contexto `context/modal-bar/`: eran sus dos únicos consumidores.

Después se **sacó a su propio tab**, el 1, justo detrás de Home. El motivo: el Home es una
pantalla para **mirar** —cifras, quién requiere atención, gráficos— y el chat una para **hacer**.
Embebido obligaba a bajar por encima de él para llegar a los datos, y el hilo de la conversación
se perdía al hacer scroll. En su tab ocupa el alto completo, que es como se lee una conversación
larga.

`AsistenteColegio` conserva la prop **`alto`** (`'completo' | 'franja'`) precisamente de ese
viaje: `franja` es el alto contenido que hacía falta embebido. Hoy no la usa nadie, y se conserva
para poder volver a incrustar el chat en otra pantalla sin tocar el componente.

Lo que hay que saber antes de tocarlo:

- 🔴 **Los cinco componentes de `components/asistente/` y `hooks/useReconocimientoVoz.ts` son
  clones locales** de `src/ficha-clinica/`, no imports. La regla dura 1 lo obliga, y la
  divergencia es esperada: aquel chat habla de **un paciente** y este de **una institución**.
  Si corriges un bug aquí, mira si aplica también allí — y al revés.
- **No consulta nada al montarse.** El tab de la ficha clínica sí lo hace porque tiene un RUT
  concreto que preguntar; aquí no hay pregunta obvia, y una llamada por cada entrada al tab 0 es
  tráfico que nadie pidió. En su lugar hay una bienvenida fija y los chips de
  `config/sugerencias-asistente.ts`, que **rellenan el input sin enviarlo**.
- **`email` es obligatorio y va en el body**, junto a `prompt` y `sessionId`. Es la clave de
  multi-tenencia: es lo que impide que este chat resuelva por un RUT arbitrario. Sin
  `user_email` el chat se bloquea con una burbuja que lo explica, en vez de mandar la consulta y
  mostrar un error técnico.
- **Clave de sesión propia: `colegio_chat_session_id`.** Son ya cuatro hilos separados en el
  proyecto —`chat_session_id` (asistente global), `ficha_chat_session_id`,
  `home_chat_session_id` y esta—. Compartir clave contaminaría el contexto entre un paciente y
  un colegio.
- **«Nueva conversación» solo toca el front**: renueva el `sessionId` y vacía la pantalla, sin
  llamar a ningún endpoint. No consta que `sam-assistant-club` exponga un reset, y llamar a una
  ruta inventada fallaría en silencio. Usa **`RestartAltIcon`**, no un icono de papelera: la
  regla dura 2 se comprueba con `grep -rni "delete"`.
- El servicio exige que `response` sea un string con contenido antes de pintarlo, por la misma
  razón que los gráficos comprueban `Array.isArray`: **este backend responde 200 con sobres de
  error**.

#### El chat es **una sola pieza**, no tres cajas

Su primera versión eran un botón suelto, un panel blanco y una caja de texto, apiladas. Se veía
sin acabar. Ahora es un único bloque con `borderRadius: 3` y `overflow: hidden`, en tres franjas:

| Franja | Qué lleva | Fondo |
|---|---|---|
| Cabecera | Avatar, «Asistente Ergo», el estado en texto y «Nueva conversación» | `DEGRADADOS.cabeceraChat` |
| Lienzo | El hilo, con scroll propio | `DEGRADADOS.lienzoChat` |
| Pie | Micrófono e input, tras un `borderTop` | `COLORES.fondoTarjeta` |

Tres decisiones que conviene no deshacer:

- 🔴 **La burbuja del asistente es blanca sobre lienzo tintado**, no gris sobre blanco. El gris
  translúcido heredado (`rgba(0,0,0,0.06)`) solo funciona sobre un panel blanco; invertir la
  relación es lo que hace que el turno del asistente **destaque por ser el más claro**.
- **Las esquinas recogidas apuntan al avatar**: `4px 16px 16px 16px` en el asistente y su espejo
  en el usuario. Es lo que evita que las burbujas parezcan tarjetas sueltas.
- **El estado de la cabecera se escribe** («Listo para responder» / «Escribiendo…» /
  «No disponible»), no se codifica en un punto de color. En una pantalla donde el verde ya
  significa «resultado normal», un punto verde de «en línea» mezclaría las dos familias.

Las sombras del chat van **teñidas de azul** (`SOMBRAS.chat`, `.burbuja`, `.burbujaUsuario`): una
sombra gris sobre fondo azulado se ve sucia. Y el loader se dibuja **con forma de burbuja del
asistente**, para que la respuesta no haga saltar el hilo al llegar.
- 🔴 **El micrófono se corta con la prop `activo`, no con el desmontaje.** `TabPanel` oculta los
  paneles con `display: none` en vez de desmontarlos —así la lista conserva sus filtros y su
  página—, así que el cleanup de `useReconocimientoVoz` **nunca se dispara al cambiar de tab**.
  Por eso `AppChequeoCardiovascular` pasa `activo={tab === 0}` a `HomePage` y esta a
  `AsistenteColegio`, que llama a `detener()` al perder el foco. Es la única razón de esa prop:
  sin ella el navegador seguiría grabando con el chat fuera de pantalla. Se detiene pero **no se
  limpia**, para no borrar lo que el usuario llevaba dictado al volver.

### La asimetría de los fetch es deliberada

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

Los contadores de `StatisticsGlobal` vienen de `estado-general` (backend) y las series derivadas
se calculan en el front. **Pueden discrepar** si el backend filtra distinto. Por eso cada tarjeta
derivada declara en su subtítulo sobre cuántos deportistas está calculada
(`subtituloResumen`): la discrepancia queda a la vista y explicada, no escondida.

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

Los ayudantes de presentación viven en `chequeo.utility.ts` y **los comparten la tabla y la
tarjeta** para que no discrepen: `hayDato` (un `0` es una medición, `''` y `'-'` no lo son),
`oGuion` y `formatearPresion`. El backend usa **`'-'` como centinela de «sin medir»** en
`frecuencia_cardiaca_paciente`, que es `string`, no `number`.

### Las cuatro tarjetas de estado

`TarjetaGrafico` envuelve las ocho y tiene cuatro estados: `cargando`, `sin-datos`,
`no-disponible` y `ok`. **`sin-datos` y `no-disponible` dicen cosas distintas a propósito**: el
primero es un colegio que aún no mide, el segundo un servicio caído. Hoy la diferencia es real
—`estadistica-saturacion` devuelve 500— y confundirlas escondería el fallo.

Un 200 con sobre de error cuenta como **`no-disponible`**, igual que una excepción.

### 🔴 El color clínico va por etiqueta, NUNCA por posición

`colorClinico` decide el color leyendo **el texto de la etiqueta**. No es un capricho: el backend
**no** devuelve las series ordenadas de normal a alterado. Verificado contra
`http://127.0.0.1:8000/api`:

| Serie | Orden real de las etiquetas |
|---|---|
| `estadistica-imc` | `Bajo Peso` · `Normal` · `Sobre Peso` · `Obesidad` |
| `estadistica-hemoglucotest` | `Bajo` · `Normal` · `Alterado` |
| `estadistica-presion` | `Normal` · `Elevada` · `HTA Grado 1` · `HTA Grado 2` |

En **dos de las tres**, la posición 0 no es «normal»: son curvas de campana, no escalas monótonas.
Colorear por índice pintaba «Bajo Peso» de verde y «Normal» de ámbar. **Si alguien lo vuelve
posicional, reintroduce el bug.**

Una etiqueta que no reconoce ninguna regla sale en **gris**, que no afirma nada: es preferible una
categoría sin color a una mal pintada de sana. `colorPorIndice` sí es cíclica, pero solo se usa en
series sin significado clínico (cursos, meses).

### Accesibilidad y color

- **Cada gráfico lleva su `TablaAccesible`**: un `<canvas>` de chart.js es invisible para un
  lector de pantalla. La tabla va oculta con `sxSoloLectores` —token propio, **no
  `visuallyHidden` de `@mui/utils`**, que no está declarado en `package.json`.
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
- Las tres **donas apagan la leyenda de chart.js** y usan `LeyendaGrafico`: la leyenda nativa vive
  dentro del canvas y descentraría el total del medio. Barras y línea sí usan la nativa.
- **Las dos zonas con scroll propio son navegables por teclado y se anuncian.** `ListaAlterados`
  va con `tabIndex={0}` + `role="group"`; el hilo del chat, con `tabIndex={0}` +
  `role="log" aria-live="polite"`, para que cada respuesta se lea sola sin interrumpir. Una zona
  que solo se mueve con el ratón deja fuera a quien navega con teclado.

## 6. Datos: dos claves, ningún id relacional

Sin cambios respecto al resto del proyecto: **`user_email`** identifica al colegio (filtra los
listados) y **`rut`** identifica a la persona.

`IChequeo` se clona **sin retipar**: casi todo `string` opcional. Es deuda conocida y heredada;
retiparla obligaría a tocar el mapeo con el backend y sale del alcance de la Spec 01.

### Endpoints (11, uno nuevo desde la Spec 03)

`postChequeoSearch` · `postChequeoAll` · `getChequeoRut` · `postCreateChequeo` ·
`postUpdateChequeo` · `chequeoPDF` · `pathUrlCertificado` · `getEstadoGeneral` ·
`postCargaMasiva` · `getCertificadoRut`, más los 4 de `estadisticas/estadistica-*`.

**Nuevo (Spec 03):** `POST /sam-assistant-club/as-question` con `{ email, prompt, sessionId }`
→ `{ response }`. Es el **único endpoint que el módulo estrenó**: los otros 10 ya existían. No
hay endpoint de reset del hilo.

### ⚠️ El backend responde 200 con sobres de error

Verificado contra `http://127.0.0.1:8000/api`: algunos endpoints de estadísticas devuelven
`{response: {status: 'Error en ejecucion', mensaje: …}}` en vez de la serie, y
`estadistica-saturacion` directamente da **500**. Por eso `GraficoTorta` y `BarPresion`
comprueban `Array.isArray(response?.data)` antes de guardar: sin eso, `serie.data.length`
revienta en el render y **un gráfico caído tumba el Home entero**.

Otras discrepancias de tipo observadas en el backend real (no rompen nada, pero conviene
saberlas): `porcentaje_imc_normal` y `porcentaje_estado_normal` llegan como **string**
(`"60.7"`), y `per_page` de la paginación también.

### Los servicios se resuelven en ámbito de módulo en los gráficos

`PieChartImc`, `PieChartHemoglucotest` y `PieChartSaturacion` llaman a `UseEstadisticasService()`
**fuera del componente**. Si se llama dentro, la identidad de la función cambia en cada render
del padre y `GraficoTorta` vuelve a pedir la serie en cada cambio de tab.

## 7. Lógica clínica: clonada y NO corregida

`hooks/useCalculoIMC.ts` se copia con su comportamiento actual. Cambiar una fórmula o un umbral
es una decisión médica, no una refactorización: va en su propia spec.

- **`UseCalculoIMC`** exige la estatura en **metros**. En centímetros el resultado es absurdo y
  nada lo detecta.
- **`UseCalcularPercentil`** es una aproximación lineal propia, **no tablas OMS/CDC**. No la
  presentes como percentil clínico validado.
- 🔴 **`UseIMCRecomendaciones` tiene un bug conocido**: en adultos, la rama de IMC normal
  (`< 25`) devuelve el mismo texto que la de bajo peso. Está documentado en un JSDoc y **clonado
  a propósito**.
- **`LETRAS`** sigue declarada en el JSON del campo `nombre` y sin implementar, igual que antes.

`UseCalcularPercentil` y `UseIMCRecomendaciones` **hoy no las usa nadie** en este módulo: su
único consumidor era la calculadora IMC, que no se portó. Se clonaron por decisión explícita de
la Spec 01, para que el módulo esté listo cuando se migre `Administrador`.

## 8. Ruteo

Tres archivos, y son los **únicos** fuera del módulo:

- `src/routes/routesCOL.tsx` — una entrada, «Chequeo Cardiovascular», `perfil: 'Colegios'`.
- `src/routes/NavigationCol.tsx` — copia de `NavigationMe` apuntando a `routesCOL`.
- `src/routes/NavigationApp.tsx` — `case 'Colegios': return <NavigationCol />;`.

⚠️ **`NavigationCol` no entiende el comodín `'All'`**: compara el perfil inline, como
`NavigationMe`, `NavigationPA` y `NavigationED`. Solo `NavigationErgo` soporta `'All'`. Por eso
las entradas de `routesCol` llevan el perfil literal.

⚠️ `NavigationApp` decide por `user_perfil` **antes** de mirar `valid`, igual que los otros tres
perfiles con navegador propio. Se replicó tal cual: **no uses `valid` para proteger esta vista.**

## 9. Deuda que sí se corrigió al clonar

Nada de esto cambia lo que ve el usuario, salvo donde se indica:

- El `console.log` de `postChequeoSearch`, que imprimía `user_email` en la consola de producción.
- El `alert()` nativo de la descarga de ECG → **Swal**, como el resto del repositorio.
- `context/index.ts` incompleto: el nuevo exporta `like-text` **y** `modal-bar`.
- `==` → `===` en todas las comparaciones de perfil.
- `control._formValues` y `control._reset()` (API privada de react-hook-form) → `getValues()`,
  `handleSubmit(datos)` y `reset()`.
- **Cambios visibles y deliberados:** el filtro por fecha ahora **sí se muestra a `Colegios`**
  (estaba tras una condición de solo-Administrador), y la fila «reciente» pasa de fondo rojo
  pleno a un **indicador lateral**, porque el rojo completo dejaba el texto ilegible.
- Los tres gráficos de torta comparten `GraficoTorta` en vez de ser tres archivos de ~145 líneas
  casi idénticos.

## 10. Al trabajar en este módulo

- **Un campo nuevo del formulario** → `config/custom-form.json`, con su `seccion`. Si su `type`
  es nuevo, además una rama en `renderCampo` de `ChequeoForm`.
- **Una sección nueva** → `config/secciones.ts`. El orden del array es el orden de pintado.
- **Una validación nueva** → `utilities/chequeo-validation.utility.ts`.
- **Un endpoint nuevo** → `services/`, patrón `ApiAdapter`. **Nunca uno de borrado.**
- **Un gráfico nuevo en el Home** → decide primero la fuente. Si sale de `chequeo-all`, una
  agregación pura en `resumen.utility.ts` + su serie en `useResumenColegio` + un componente
  presentacional; **no añadas otro fetch**. Si viene de un endpoint propio, sigue el patrón de
  `GraficoTorta`.
- **Un color** → `config/tema.ts`, y decide primero la familia: `COLORES` si describe un
  resultado clínico o es el azul de marca, `UI` si es una acción, un realce o un fondo.
- **Un gráfico cualquiera** → lleva su `TablaAccesible`. No es opcional: sin ella el dato no
  existe para un lector de pantalla.
- **Columnas o acciones de la lista** → `ChequeoTable.tsx` **y** `ChequeoTarjeta.tsx`: son la
  misma fila en dos formatos y hay que cambiarlas juntas. El corte es `md` (900 px).
- **Un estado clínico nuevo** → `getEstadoProps` en `utilities/chequeo.utility.ts` **y** el
  backend; el string debe coincidir exacto, espacios y puntos incluidos.
- Feedback al usuario: **Swal**, en todo el módulo.
- Verificación: `npm run build` y `npx eslint src/chequeo-cardiovascular/`. **No hay tests en
  este proyecto: no inventes un comando de test.** Prueba a mano con un usuario `Colegios` real
  y comprueba además que `Administrador` y `Medicos` siguen entrando a `src/Chequeo/` sin cambios.

## 11. Duplicación aceptada a propósito

Se asumió al elegir un módulo autocontenido, y queda anotada para que nadie la "arregle" sin
querer:

| Duplicado | Original | Por qué |
|---|---|---|
| `components/forms/InputText.tsx` | `src/components/forms/InputText.tsx` | Rompe el acoplamiento raro en el que un componente compartido dependía de `Chequeo/hooks`. La copia de `src/components/` queda intacta para el resto del repo. |
| Los 4 gráficos | `src/Estadisticas/pages/` | Módulo autocontenido. |
| `getCertificadoRut` | `src/Certificados/services/` | Idem. |
| `useCalculoIMC.ts` | `src/Chequeo/hooks/` | Idem, con el bug incluido (§7). |

Si se corrige un bug en cualquiera de estos, **hay que corregirlo en los dos sitios**.
