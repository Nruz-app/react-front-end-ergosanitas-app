# CLAUDE_CHEQUEO_CARDIOVASCULAR.md

Guía del módulo `src/chequeo-cardiovascular/`. Recoge el estado consolidado tras la Spec 01 y
lo que **no** hay que romper. Léela antes de tocar el módulo.

Estado de las specs de esta carpeta:

| Spec | Perfil | Estado |
|---|---|---|
| `01-perfil-colegios.md` | `Colegios` | Implementado |
| — | `Medicos`, `Administrador`, `Usuario` | Siguen en `src/Chequeo/` |

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
   `user_perfil`**: son 4 tabs fijos. Esa es la diferencia de fondo con `AppChequeo`. Si un día
   se migra otro perfil aquí, la decisión de cómo convivir se toma en su spec — no se replica
   el `if (user_perfil === …)` por dentro sin pensarlo.

4. **La lógica clínica no se toca.** Ver §6.

## 3. Estructura y responsabilidades

```
src/chequeo-cardiovascular/
├── pages/       AppChequeoCardiovascular (orquestador, 4 tabs) · HomePage · ChequeoPage
├── components/  ChequeoTable · ChequeoTarjeta · ChequeoForm · ChequeoFormUpdate ·
│                ChequeoView · SeccionCampos · DownloadPDF · LoadingTable
│                filters/ · date-pickers/ · forms/ · carga-masiva/ · exportar-excel/ ·
│                estadisticas/ · statistics-global/ · modal/ · tabs/
├── config/      custom-form.json (25 campos + `seccion`) · custom-likes.json ·
│                excel-data.json · secciones.ts
├── context/     like-text/ (búsqueda) · modal-bar/ (modal del Home) — barril COMPLETO
├── hooks/       useChequeo · useChequeoRut · useCalculoIMC · useExportToExcel
├── interface/   8 archivos de tipos + barril
├── services/    useChequeoCardiovascularService (9) · useEstadisticasService (4) ·
│                useCertificadoService (1)
└── utilities/   chequeo-validation.utility · chequeo.utility
```

Los 4 tabs, con índices **estables**: 0 Home · 1 Lista · 2 Alta/Edición · 3 Carga masiva.

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

## 5. Datos: dos claves, ningún id relacional

Sin cambios respecto al resto del proyecto: **`user_email`** identifica al colegio (filtra los
listados) y **`rut`** identifica a la persona.

`IChequeo` se clona **sin retipar**: casi todo `string` opcional. Es deuda conocida y heredada;
retiparla obligaría a tocar el mapeo con el backend y sale del alcance de la Spec 01.

### Endpoints (10, ninguno nuevo)

`postChequeoSearch` · `postChequeoAll` · `getChequeoRut` · `postCreateChequeo` ·
`postUpdateChequeo` · `chequeoPDF` · `pathUrlCertificado` · `getEstadoGeneral` ·
`postCargaMasiva` · `getCertificadoRut`, más los 4 de `estadisticas/estadistica-*`.

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

## 6. Lógica clínica: clonada y NO corregida

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

## 7. Ruteo

Tres archivos, y son los **únicos** fuera del módulo:

- `src/routes/routesCOL.tsx` — una entrada, «Chequeo Cardiovascular», `perfil: 'Colegios'`.
- `src/routes/NavigationCol.tsx` — copia de `NavigationMe` apuntando a `routesCOL`.
- `src/routes/NavigationApp.tsx` — `case 'Colegios': return <NavigationCol />;`.

⚠️ **`NavigationCol` no entiende el comodín `'All'`**: compara el perfil inline, como
`NavigationMe`, `NavigationPA` y `NavigationED`. Solo `NavigationErgo` soporta `'All'`. Por eso
las entradas de `routesCol` llevan el perfil literal.

⚠️ `NavigationApp` decide por `user_perfil` **antes** de mirar `valid`, igual que los otros tres
perfiles con navegador propio. Se replicó tal cual: **no uses `valid` para proteger esta vista.**

## 8. Deuda que sí se corrigió al clonar

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

## 9. Al trabajar en este módulo

- **Un campo nuevo del formulario** → `config/custom-form.json`, con su `seccion`. Si su `type`
  es nuevo, además una rama en `renderCampo` de `ChequeoForm`.
- **Una sección nueva** → `config/secciones.ts`. El orden del array es el orden de pintado.
- **Una validación nueva** → `utilities/chequeo-validation.utility.ts`.
- **Un endpoint nuevo** → `services/`, patrón `ApiAdapter`. **Nunca uno de borrado.**
- **Columnas o acciones de la lista** → `ChequeoTable.tsx` **y** `ChequeoTarjeta.tsx`: son la
  misma fila en dos formatos y hay que cambiarlas juntas. El corte es `md` (900 px).
- **Un estado clínico nuevo** → `getEstadoProps` en `utilities/chequeo.utility.ts` **y** el
  backend; el string debe coincidir exacto, espacios y puntos incluidos.
- Feedback al usuario: **Swal**, en todo el módulo.
- Verificación: `npm run build` y `npx eslint src/chequeo-cardiovascular/`. **No hay tests en
  este proyecto: no inventes un comando de test.** Prueba a mano con un usuario `Colegios` real
  y comprueba además que `Administrador` y `Medicos` siguen entrando a `src/Chequeo/` sin cambios.

## 10. Duplicación aceptada a propósito

Se asumió al elegir un módulo autocontenido, y queda anotada para que nadie la "arregle" sin
querer:

| Duplicado | Original | Por qué |
|---|---|---|
| `components/forms/InputText.tsx` | `src/components/forms/InputText.tsx` | Rompe el acoplamiento raro en el que un componente compartido dependía de `Chequeo/hooks`. La copia de `src/components/` queda intacta para el resto del repo. |
| Los 4 gráficos | `src/Estadisticas/pages/` | Módulo autocontenido. |
| `getCertificadoRut` | `src/Certificados/services/` | Idem. |
| `useCalculoIMC.ts` | `src/Chequeo/hooks/` | Idem, con el bug incluido (§6). |

Si se corrige un bug en cualquiera de estos, **hay que corregirlo en los dos sitios**.
