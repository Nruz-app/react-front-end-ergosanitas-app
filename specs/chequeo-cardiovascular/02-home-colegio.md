# SPEC 02 — Home del colegio: rediseño, gráficos nuevos y accesibilidad

> **Estado:** Implementado
> **Depende de:** Spec 01 de `chequeo-cardiovascular` (Módulo `chequeo-cardiovascular`: perfil Colegios)
> **Fecha:** 2026-09-04
> **Área afectada:** `src/chequeo-cardiovascular/` únicamente. No se toca `src/Chequeo/`, ni
> `src/Estadisticas/`, ni `src/routes/`, ni `src/common/`.
> **Objetivo:** Rediseñar el Home del perfil `Colegios` en dos secciones —avance del proceso y
> salud de los deportistas—, agregando cuatro gráficos derivados de `chequeo-all` y unificando
> los cuatro existentes bajo una paleta semántica, una tarjeta común y una alternativa accesible
> en texto.

---

## 1. Por qué existe esta spec

El Home actual es lo mínimo que la Spec 01 necesitaba para no dejar el tab 0 vacío:
`StatisticsGlobal` con 6 contadores de `estado-general` y cuatro gráficos que consultan
`estadisticas/*`. De esos cuatro **solo cargan tres**: `estadistica-saturacion` devuelve HTTP 500
en el backend.

El problema de fondo no es estético. El Home describe **el estado clínico agregado** —cuántos IMC
normales, cuánta presión alterada— pero no dice nada de **la operación**. Un colegio que entra a
esta pantalla no puede responder las tres preguntas que se hace todos los días:

- ¿Dónde está atascado el proceso? ¿Cuántos quedaron en «ECG FOTO» esperando revisión médica?
- ¿Qué curso va atrasado?
- ¿A qué ritmo avanzamos este año?

Los datos para responderlas ya se descargan: `postChequeoAll(user_email)` devuelve el histórico
completo del colegio y hoy se usa solo para generar el Excel. Nadie está mirando esa información.

De ahí las dos decisiones que marcan la spec: **los gráficos nuevos se calculan en el front sobre
datos que ya existen**, sin esperar endpoints que el backend no tiene; y **el rediseño extrae
tokens de estilo**, porque ocho tarjetas de gráfico con los colores escritos a mano en cada
archivo se desalinean en la primera modificación.

---

## 2. Alcance

**Dentro:**

- **`config/tema.ts` nuevo** — tokens del módulo: paleta semántica, paleta categórica,
  `sxTarjeta`, `sxTituloSeccion`, `sxTituloTarjeta` y `sxSoloLectores`. Al cerrar la spec, ningún
  `.tsx` del Home vuelve a escribir un color a mano.
- **`components/estadisticas/TarjetaGrafico.tsx` nuevo** — el envoltorio común de las 8 tarjetas:
  título, subtítulo con el n, alto fijo y los **tres estados** (cargando, sin datos, servicio no
  disponible). Hoy ese bloque está duplicado en `GraficoTorta` y `BarPresion`.
- **`components/estadisticas/TablaAccesible.tsx` nuevo** — la tabla equivalente de cada gráfico,
  oculta visualmente. `chart.js` pinta un `<canvas>` que ningún lector de pantalla puede leer, y
  hoy no hay alternativa ninguna.
- **`hooks/useResumenColegio.ts` nuevo** — **una sola** llamada a `postChequeoAll` que alimenta
  los cuatro gráficos derivados, con las cuatro series memoizadas.
- **`utilities/resumen.utility.ts` nuevo** — cuatro funciones puras de agregación:
  `resumirPorEstado`, `resumirPorDivision`, `resumirPorMes` y `resumirPorEdadSexo`.
- **`interface/resumen.interface.ts` nuevo** — los tipos de las series derivadas.
- **Cuatro gráficos nuevos**, todos **presentacionales**: reciben su serie por props y no llaman
  a ningún servicio. `EmbudoEstados`, `AvancePorCurso`, `EvolucionMensual` y `PiramideEdadSexo`.
- **Los cuatro gráficos existentes** adoptan `TarjetaGrafico`, la paleta de `tema.ts`, el tooltip
  con cantidad y porcentaje, y su `TablaAccesible`. Las tres tortas pasan a **dona con el total
  al centro**; `BarPresion` sigue en barras.
- **`components/SeccionHome.tsx` nuevo** — encabezado y contenedor de una sección del Home.
- **`pages/HomePage.tsx`** pasa a dos secciones y hace la llamada única al hook.
- **`StatisticsGlobal` y `ModalStatus`** adoptan los tokens. Los 6 contadores y los textos del
  modal **no cambian de contenido**.
- **Los barriles** de `components/`, `hooks/`, `utilities/` e `interface/`.
- **Todo el módulo adopta los tokens** (añadido a petición del usuario tras aprobar la spec, en
  dos tandas: primero `pages/AppChequeoCardiovascular.tsx`, después los tabs 1, 2 y 3). Al cerrar,
  **ningún `.tsx` del módulo escribe un hex**. Obligó a ampliar `tema.ts` con `DEGRADADOS`,
  `SOMBRAS`, `sxFocoVisible` y la familia `UI` —acciones, realces y fondos—, separada de la
  clínica a propósito: el verde de un botón de «ver» no significa «normal».
- **Actualizar `specs/chequeo-cardiovascular/CLAUDE_CHEQUEO_CARDIOVASCULAR.md`** al cerrar.

**Fuera de alcance (para specs futuras):**

- **Clic en un gráfico que salte a la lista filtrada.** Obliga a subir un handler al orquestador
  y a escribir en `LikeTextContext` desde el Home: cambia cómo se comunican los tabs y merece su
  propia discusión.
- **Selector de año escolar.** Los cuatro gráficos del backend no entienden un filtro del front.
  Tenerlos al lado mostrando el histórico completo mientras los derivados muestran un año sería
  una lectura falsa.
- **Arreglar `estadistica-saturacion`.** Es backend: `Call to undefined method
  ChequeoCardiovascular::SP_estadistica_saturacion()`. La revisión de §9 lo **esquivó** derivando
  el dato de `chequeo-all`, pero el endpoint sigue roto para quien lo llame.
- **Endpoints agregados para los cuatro gráficos nuevos.** Si el volumen de datos lo exige algún
  día, es su propia spec.
- ~~Aplicar los tokens a los tabs 1, 2 y 3~~ — **hecho después de aprobar la spec**, a petición
  del usuario. Ver la nota en «Dentro».
- **Exportar el Home a PDF.**
- **Retipar `IChequeo` a `number | null`.** Sigue siendo deuda heredada de la Spec 01.

---

## 3. Modelo de datos

**No hay entidades nuevas ni endpoints nuevos.** Se reutiliza `IChequeo` y el método
`postChequeoAll` que ya existen. Lo que se agrega son los tipos de las series derivadas.

```ts
// interface/resumen.interface.ts

/** Serie de una dimensión: etiqueta → valor, con su color. */
export interface SerieSimple {
    labels  : string[];
    data    : number[];
    colores : string[];
    /** Filas que entraron en el cálculo. Puede ser menor que el total descargado. */
    usadas  : number;
}

/** Serie apilada: varias pilas sobre las mismas etiquetas. */
export interface SerieApilada {
    labels : string[];
    pilas  : { nombre: string; data: number[]; color: string }[];
    usadas : number;
}

/** Lo que devuelve `useResumenColegio`, ya agregado. */
export interface ResumenColegio {
    porEstado   : SerieSimple;   // embudo del proceso
    porDivision : SerieApilada;  // avance por curso
    porMes      : SerieSimple;   // evolución mensual
    porEdadSexo : SerieApilada;  // pirámide
    /** Filas descargadas. Es el denominador contra el que se lee el `usadas` de cada serie. */
    totalFilas  : number;
}

/** Los cuatro estados en los que puede estar una tarjeta de gráfico. */
export type EstadoTarjeta = 'cargando' | 'sin-datos' | 'no-disponible' | 'ok';
```

> **Corrección durante la implementación.** El diseño original ponía `totalFilas` solo en
> `ResumenColegio`, pero el criterio «cada tarjeta declara sobre cuántos deportistas está
> calculada» no era implementable así: la evolución mensual y la pirámide descartan filas, y una
> serie no sabía cuántas. Por eso cada serie lleva su propio `usadas`, y `totalFilas` pasa a ser
> el denominador. `EstadoTarjeta` también se subió a la capa de tipos, porque lo comparten las
> ocho tarjetas.

### Reglas de agregación

Van documentadas en el JSDoc de cada función de `resumen.utility.ts`. La regla transversal es
que **nada se descarta en silencio**: un valor inesperado cae en un grupo visible.

| Serie | Campo de origen | Tratamiento de lo ausente o inesperado |
|---|---|---|
| ~~`porEstado`~~ | ~~`estado_paciente`~~ | **Retirada en la revisión de §9.** |
| ~~`porDivision`~~ | ~~`division_paciente`~~ | **Retirada en la revisión de §9:** el endpoint no devuelve el campo. |
| ~~`porMes`~~ | ~~`fecha_atencion`~~ | **Retirada en la revisión de §9**, ya arreglada, por decisión del usuario. |
| `porSaturacion` | `saturacionOxigeno` | Cuatro tramos de pulsioximetría, de mejor a peor. Los tramos vacíos **sí** se pintan: que «Severa» esté en cero es la información. Una lectura ausente o no numérica se resta del `usadas`. |
| `alterados` | `estado_paciente` | Las filas `Diag. Card. - Alterado`, ordenadas por fecha de atención descendente y por nombre a igualdad. Una fecha ilegible baja al final, no desaparece. |
| `porMes` | `fecha_atencion` | Se lee con `parsearFecha`, que reconoce `DD-MM-YYYY` **y** el ISO. Sin fecha legible, la fila no entra. Se agrupa por `YYYY-MM` y se etiqueta `MMM YY` con `dayjs` en locale `es`. El respaldo por `created_at` se conserva pero **hoy nunca se dispara**: el endpoint tampoco devuelve ese campo. |
| `porEdadSexo` | `edad` + `sexo_paciente` | `edad` es `string`: se parsea y una edad no numérica excluye la fila. Solo entran `Masculino` y `Femenino`. La tarjeta declara cuántas filas usó. |

Rangos de la pirámide: `<6`, `6-8`, `9-11`, `12-14`, `15-17`, `18+`. Un rango sin nadie no se
pinta. Masculino se dibuja con valores negativos para que quede a la izquierda, y tanto el eje
como el tooltip aplican `Math.abs`.

### Paleta semántica

El color significa lo mismo en las ocho tarjetas. Los cinco primeros se separan también en
**luminosidad**, no solo en tono, para seguir distinguiéndose en deuteranopía.

```ts
// config/tema.ts
export const COLORES = {
    normal      : '#1B9E77',  // verde azulado
    limite      : '#E6A700',  // ámbar
    alterado    : '#D64550',  // rojo
    pendiente   : '#6C8EBF',  // azul
    neutro      : '#9AA5B1',
    primario    : '#1976d2',
    primarioOsc : '#0d47a1',
    fondoSuave  : '#e3f2fd',
    borde       : '#e0e0e0',
};
```

---

## 4. Plan de implementación

Cada paso deja el módulo compilando y el Home usable.

1. **`config/tema.ts`** con la paleta y los `sx` compartidos. Todavía no lo consume nadie.
2. **`interface/resumen.interface.ts`** y su barril. Solo tipos.
3. **`utilities/resumen.utility.ts`**: las cuatro funciones puras y su barril. Se comprueban
   pasándoles a mano un array de `IChequeo` desde la consola del navegador.
4. **`hooks/useResumenColegio.ts`**: la llamada a `postChequeoAll`, el `useMemo` de las cuatro
   series y los estados `cargado` y `error`. Barril.
5. **`components/estadisticas/TablaAccesible.tsx`** y **`TarjetaGrafico.tsx`**, con sus tres
   estados. Barril.
6. **Migrar `GraficoTorta` y `BarPresion`** a `TarjetaGrafico`, a la paleta y al tooltip con
   `n (%)`, cada uno con su `TablaAccesible`. Las tortas pasan a dona con el total al centro,
   mediante un `Box` superpuesto y centrado sobre el canvas. Al terminar el paso el Home dice
   exactamente lo mismo que antes, mejor presentado, con 3 de 4 gráficos cargando.
7. **`EmbudoEstados`** (barras horizontales, `indexAxis: 'y'`) y **`AvancePorCurso`** (barras
   apiladas). Registrar en `chart.js` lo que falte.
8. **`EvolucionMensual`** (línea: exige registrar `PointElement` y `LineElement`) y
   **`PiramideEdadSexo`** (barras horizontales apiladas con valores negativos).
9. **`components/SeccionHome.tsx`** y **`pages/HomePage.tsx`**: las dos secciones, la llamada
   única al hook y el reparto por props. Rejilla: embudo y curso a `md=6`, evolución a `12`; los
   cuatro clínicos a `xs=12 sm=6 lg=3` y la pirámide a `12`.
10. **`StatisticsGlobal` y `ModalStatus`** adoptan los tokens.
11. **Actualizar `CLAUDE_CHEQUEO_CARDIOVASCULAR.md`**: el Home nuevo, el hook único, la regla de
    que los gráficos derivados no llaman a servicios, y la paleta.

### Distribución final

```
Estado general del colegio
[KPI][KPI][KPI][KPI][KPI][KPI]

REQUIERE ATENCIÓN
[ Lista de deportistas con diagnóstico alterado ]

SALUD DE LOS DEPORTISTAS
[ IMC ][ Hemoglucotest ][ Saturación* ][ Presión ]
[        Pirámide por edad y sexo                ]

* La saturación es la única clínica que NO viene del backend: se deriva del listado.
```

> Distribución tras la revisión de §9. La original tenía una sección «Avance del proceso» con
> el embudo por etapa y el avance por curso.

---

## 5. Criterios de aceptación

- [ ] El Home muestra dos secciones con encabezado: «Requiere atención» y «Salud de los deportistas».
- [ ] Se pintan la lista de alterados, 6 tarjetas de gráfico y los 6 contadores.
- [ ] `postChequeoAll` se llama **una sola vez** al abrir el Home (verificable en la pestaña Red).
- [ ] Cambiar de tab y volver al Home no dispara una segunda tanda de peticiones por gráfico.
- [ ] La lista muestra **solo** deportistas con `estado_paciente === 'Diag. Card. - Alterado'`.
- [ ] La lista va ordenada por fecha de atención descendente, y por nombre a igualdad de fecha.
- [ ] Cada fila muestra nombre, RUT, edad, presión, frecuencia cardíaca, saturación, IMC y el chip de estado.
- [ ] Un signo vital ausente se pinta `—`, nunca `0`.
- [ ] Con cero alterados, la tarjeta dice «Ningún deportista con diagnóstico alterado», **no** «todavía no hay datos suficientes».
- [ ] Bajo 900 px la lista se sustituye por tarjetas y no hay scroll horizontal.
- [ ] La saturación de oxígeno **se pinta con datos**, no con «indicador no disponible», pese a que su endpoint siga devolviendo 500.
- [ ] La saturación muestra los cuatro tramos aunque tres estén en cero.
- [ ] Una fila sin lectura de saturación se resta del `usadas` y no cuenta como 0 %.
- [ ] La pirámide dibuja Masculino a la izquierda y Femenino a la derecha, y ambos ejes muestran números positivos.
- [ ] Cada tarjeta derivada declara en su subtítulo sobre cuántos deportistas está calculada.
- [ ] Las tres donas muestran el total en el centro.
- [ ] El tooltip de cualquier gráfico muestra cantidad y porcentaje.
- [ ] Cada gráfico tiene una tabla equivalente, legible por lector de pantalla e invisible en pantalla. La lista de alterados **no** la lleva: ya es una `<table>` real.
- [ ] Ningún `.tsx` del Home contiene un color escrito a mano: todos salen de `config/tema.ts`.
- [ ] Un gráfico del backend que falle muestra un mensaje de servicio no disponible **distinto** del de «todavía no hay datos», y el resto del Home carga completo.
- [ ] Si `chequeo-all` falla, las tres tarjetas derivadas —lista, saturación y pirámide— muestran su estado de error y las tres del backend siguen funcionando.
- [ ] El Home no muestra scroll horizontal a 375 px.
- [ ] `npm run build` en verde y `npx eslint src/chequeo-cardiovascular/` en 0.
- [ ] `grep -rn "from '\.\./\.\./" src/chequeo-cardiovascular/` sigue devolviendo solo `common/` y rutas internas.
- [ ] `grep -rni "delete" src/chequeo-cardiovascular/` sigue vacío.
- [ ] `Administrador` y `Medicos` siguen entrando a `src/Chequeo/` sin cambios.

---

## 6. Decisiones

- **Sí:** derivar los gráficos nuevos de `postChequeoAll`. El endpoint ya existe y ya se consume
  para exportar a Excel. Pedir endpoints agregados dejaría la spec bloqueada por trabajo que no
  controlamos, y el 500 sin arreglar de `estadistica-saturacion` demuestra el riesgo.
- **Sí:** una sola llamada en `HomePage`, con las cuatro series bajando por props. Cuatro
  componentes pidiendo la misma lista serían cuatro descargas del histórico completo.
- **Asimetría deliberada:** los cuatro gráficos del backend siguen pidiendo su serie cada uno,
  porque cada uno consulta un endpoint distinto; los cuatro nuevos no llaman a ningún servicio.
  Queda anotado en la guía del módulo para que no se lea como una inconsistencia y alguien
  «unifique» el patrón.
- ~~**Sí:** mantener la tarjeta de saturación degradada~~ **(superado en §9: se deriva del
  listado y ya no depende del endpoint).** Con un mensaje que distinga «sin datos» de
  «servicio no disponible». Ocultarla dejaría el Home más limpio y escondería un fallo real del
  que nadie se enteraría.
- **No:** clic en un gráfico que filtre la lista. Cambia cómo se comunican los tabs; su propia spec.
- **No:** selector de año escolar. Filtraría solo la mitad de los gráficos, y dos lecturas
  distintas del mismo período una al lado de la otra es peor que no filtrar.
- **Sí:** dona con el total al centro mediante un `Box` superpuesto, no un plugin de `chart.js`.
  Menos código y sin tocar el registro global de la librería.
- **Corrección durante la implementación — leyenda propia en las donas.** La leyenda de
  `chart.js` vive **dentro** del canvas, así que al ponerla abajo desplaza el anillo hacia
  arriba y el total del medio deja de caer donde debe. Se apaga la leyenda del canvas y se pinta
  un `LeyendaGrafico` propio bajo el gráfico, que además muestra la cantidad y el porcentaje de
  cada categoría — cosa que la leyenda de `chart.js` no hace. Los gráficos de barras y la línea
  conservan la leyenda nativa: ahí no hay nada que centrar.
- **Corrección durante la implementación — un sobre de error es «no disponible».** El diseño
  trataba como «sin datos» cualquier respuesta que no fuera un array. Es engañoso: un 200 con
  `{response: {status: 'Error en ejecucion'}}` es un servicio caído, igual que el 500. Ambos
  marcan `error` y muestran el mensaje de servicio no disponible.
- **Sí:** tres ayudantes junto a las cuatro agregaciones — `estadoDeTarjeta`, `colorPorIndice` y
  `subtituloResumen`. Las comparten las ocho tarjetas; repetirlas ocho veces era el problema que
  esta spec vino a resolver.
- **Sí:** tabla accesible en texto. Es la única de las cuatro mejoras de los gráficos que no se
  ve, y la única que hoy falta por completo: un `<canvas>` no es legible por un lector de pantalla.
- **Sí:** `sxSoloLectores` propio en `tema.ts` en lugar de `visuallyHidden` de `@mui/utils`.
  `@mui/utils` no está declarado en `package.json`: llega solo como dependencia transitiva de
  `@mui/material`, y apoyarse en eso es frágil.
- **Sí:** grupos visibles («Otro», «Sin curso», «Sin estado») en vez de descartar filas. Un dato
  inesperado que desaparece del gráfico es un error silencioso; uno que aparece agrupado se ve.
- **No:** retipar `IChequeo`. Obligaría a tocar el mapeo con el backend y sale del alcance.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| **Dos fuentes de verdad.** Los contadores vienen de `estado-general` (backend) y las series nuevas se calculan en el front: pueden discrepar si el backend filtra distinto. | Cada tarjeta derivada declara en su subtítulo sobre cuántas filas está calculada. La discrepancia queda visible y explicada, no escondida. |
| **`chequeo-all` no pagina.** Hoy son 118 filas en el colegio de prueba; un colegio grande podría traer miles en un solo JSON. | La llamada ya existe para exportar a Excel, así que no se agrega carga nueva a la app. Se hace **una sola vez** y las agregaciones van memoizadas. Si el volumen se vuelve un problema, un endpoint agregado es su propia spec. |
| **`estado_paciente` son strings libres del backend.** Un cambio de literal rompería el embudo en silencio. | El grupo «Otro» hace visible cualquier valor no previsto en vez de descartarlo. |
| **`edad` es `string` opcional.** Un valor no numérico rompería la pirámide. | Se parsea y se excluye la fila, y la tarjeta declara cuántos deportistas quedaron fuera. |
| **La paleta verde/ámbar/rojo es difícil para daltónicos.** | Los colores se separan también en luminosidad, y la tabla accesible da el dato exacto sin depender del color. |
| **Ocho canvas en una pantalla.** Más gráficos es más trabajo de render al abrir el tab. | Los cuatro derivados comparten una sola petición y se calculan con `useMemo`; los `chart.js` solo se montan cuando su serie tiene datos. |

---

## 8. Criterios pendientes de verificación (2026-09-04)

El código está completo y **17 de los 21 criterios quedaron verificados**: los estáticos por
`grep`, `npm run build` y `npx eslint`; los de agregación **ejecutando las funciones puras** con
filas sintéticas (ver abajo); y el resto por inspección del código.

### Las agregaciones se verificaron ejecutándolas, no leyéndolas

Se bundleó `resumen.utility.ts` con esbuild y se corrió contra 10 filas sintéticas que
reproducen los casos raros del backend: estado desconocido, estado vacío, curso vacío, fila sin
`fecha_atencion` (con y sin `created_at`), edad no numérica y sexo sin registrar. Resultados:

- **`resumirPorEstado`** suma exactamente las 10 filas. «Otro» capturó el estado inventado y
  «Sin estado» el vacío: **ninguna fila desapareció**.
- **`resumirPorDivision`** suma 10 y ordena `2B | 4A | 10A | Sin curso` — la collation numérica
  funciona (`10A` va después de `4A`, no antes) y el cajón de sastre queda al final.
- **`resumirPorMes`** devuelve `nov 25 | dic 25 | ene 26 | feb 26 | mar 26`: ascendente y en
  español. El respaldo por `created_at` funciona, y la fila sin ninguna fecha queda fuera
  (`usadas` 9 de 10).
- **`resumirPorEdadSexo`** devuelve Masculino en negativo y Femenino en positivo, oculta los
  rangos vacíos y excluye la edad `N/A` y el sexo sin registrar (`usadas` 8 de 10).

Estos cuatro criterios **no** se pudieron verificar, y por eso la spec no se marca
`Implementado`:

| Criterio | Por qué no se verificó |
|---|---|
| La pirámide dibuja Masculino a la izquierda y Femenino a la derecha | Implementado y correcto en el código —valores negativos más `Math.abs` en eje y tooltip—, pero **no observado en pantalla**. Requiere backend y una cuenta `Colegios`. |
| Las tres donas muestran el total en el centro | Ídem: el `Box` superpuesto está, no se vio renderizado. |
| ~~Con `estadistica-saturacion` en 500, su tarjeta dice «no disponible»~~ | **Ya no aplica.** La saturación dejó de depender de ese endpoint: se deriva de `chequeo-all` y se verificó con datos reales (117 en «Normal», `usadas` 117 de 118). La distinción «no disponible» vs «sin datos» sigue viva para los tres gráficos que sí vienen del backend, y esa sí queda sin observar en pantalla. |
| El Home no muestra scroll horizontal a 375 px | La rejilla usa `xs=12` en todo, así que no debería, pero **no se midió en un navegador**. |

Los cuatro necesitan la app levantada con el backend en `http://127.0.0.1:8000/api` y una cuenta
de perfil `Colegios`. Ninguno es verificable leyendo el código.

### ✅ Hallazgo resuelto: el color clínico va por etiqueta, no por posición

El diseño asignaba el color por la **posición** de la etiqueta, asumiendo que el backend devolvía
las series ordenadas de normal a alterado. **Era falso**, y se comprobó consultando el backend
real en `http://127.0.0.1:8000/api`:

| Serie | Etiquetas, en el orden que las devuelve el backend |
|---|---|
| `estadistica-imc` | `Bajo Peso` · `Normal` · `Sobre Peso` · `Obesidad` |
| `estadistica-hemoglucotest` | `Bajo` · `Normal` · `Alterado` |
| `estadistica-presion` | `Normal` · `Elevada` · `Hipertensión Grado 1` · `Hipertensión Grado 2` |

En **dos de las tres** la posición 0 no es «normal»: son curvas de campana, no escalas monótonas.
Con el color por índice, **«Bajo Peso» se pintaba de verde y «Normal» de ámbar** — la interfaz
afirmaba lo contrario de lo que ocurría, que es exactamente lo que el criterio de paleta semántica
prohíbe.

**Corrección aplicada:** `colorClinico` asigna el color **por el texto de la etiqueta**, con
reglas ordenadas de más grave a menos, y `ESCALA_CLINICA` desaparece de `tema.ts` por quedar sin
uso. Verificado ejecutando la función contra las 11 etiquetas reales:

```
Bajo Peso → ámbar     Normal → verde      Sobre Peso → naranja   Obesidad → rojo
Bajo      → ámbar     Normal → verde      Alterado   → rojo
Normal    → verde     Elevada → ámbar     HTA Grado 1 → naranja  HTA Grado 2 → rojo
Algo Nuevo (categoría inventada) → gris
```

Una etiqueta que no reconoce ninguna regla sale en **gris**, que no afirma nada: es preferible una
categoría sin color a una mal pintada de verde.

⚠️ Lo que queda como graduación visual y no como criterio médico validado es el reparto fino entre
ámbar y naranja (`Bajo Peso` vs `Sobre Peso`). Lo firme es que **solo «Normal» va en verde**.

---

## 9. Revisión del 2026-09-04 — los gráficos de proceso, sustituidos por una lista

Con el Home ya implementado y el backend en marcha, se ejecutaron las agregaciones contra los
**118 deportistas reales** de `brisas@ergosanitas.com`. Dos de los cuatro gráficos derivados no
servían y un tercero estaba roto:

| Gráfico | Qué pasaba de verdad |
|---|---|
| **Avance por curso** | `chequeo-all` **no devuelve `division_paciente`**. Los 118 caían en «Sin curso» y el gráfico era una sola barra. No era un dato faltante: el campo **no existe en la respuesta**, así que nunca podría funcionar con este endpoint. |
| **Avance por etapa** | Funcionaba, pero era casi binario: 102 normales, 14 alterados y 2 sueltos. Un embudo de dos escalones no informa de nada que los contadores no dijeran ya. |
| **Chequeos por mes** | Usaba **1 de 118 filas**. `fecha_atencion` llega como `23-04-2026` (DD-MM-YYYY) y `dayjs()` sin plugin la daba por inválida, descartando la fila **en silencio**. |
| Pirámide edad/sexo | Correcta, 118 de 118. Sin cambios. |

### Qué se hizo

- **Los dos primeros se retiraron**, y su código se borró: `EmbudoEstados.tsx`,
  `AvancePorCurso.tsx` y las agregaciones `resumirPorEstado` y `resumirPorDivision`.
- **En su lugar, `ListaAlterados`**: los deportistas con diagnóstico alterado, con nombre, RUT,
  edad, presión, frecuencia cardíaca, saturación, IMC y el chip de estado. La razón de fondo es
  que un colegio no necesita saber *cuántos* hay —eso ya lo dicen los contadores— sino **quiénes
  son**: es lo único de esta pantalla sobre lo que se puede actuar. Los 14 alterados traen los 18
  campos completos, a diferencia del resto de la población, así que la lista no queda llena de
  guiones.
- **`parsearFecha` arregla el gráfico mensual**, reordenando `DD-MM-YYYY` a ISO a mano en vez de
  traer el plugin `customParseFormat`, que tocaría la configuración global de dayjs.
- **La sección «Avance del proceso» pasa a llamarse «Requiere atención»** y contiene solo la
  lista. «Chequeos por mes» baja a la segunda sección para no quedarse solo en una propia.

### Verificado contra los 118 registros reales

Ejecutando las funciones puras con el banco de esbuild, no leyendo el código:

- `parsearFecha`: `'23-04-2026'` → `2026-04-23`, el ISO sigue funcionando, y basura o vacío → `null`.
- `resumirPorMes`: de **1 fila usada a 118 de 118** — `abr 26` (110), `may 26` (6), `jul 26` (1),
  `sep 26` (1), en orden ascendente.
- `filtrarAlterados`: **14 filas**, todas con el estado correcto, ordenadas por fecha descendente
  y por nombre a igualdad.
- `resumirPorEdadSexo`: sigue en 118 de 118.

### Decisiones de esta revisión

- **Sí:** borrar el código de los dos gráficos en vez de conservarlo sin usar. `resumirPorDivision`
  además nunca podrá funcionar con este endpoint, así que guardarla sería guardar una promesa
  falsa. Borrar **código** no toca la regla dura nº 2, que prohíbe borrar **datos**.
- **Sí:** arreglar «Chequeos por mes» en la misma tanda. Estaba roto en silencio y la alternativa
  —dejar una tarjeta permanentemente vacía— escondía el fallo.
- **No:** acciones en la lista (ver detalle, PDF, ECG). Obligaría a cablear handlers desde el
  orquestador hasta el Home, que es el mismo cableado que esta spec dejó fuera de alcance para el
  clic en gráficos. Esas acciones ya están en el tab «Lista de deportistas».
- **No:** `TablaAccesible` en la lista. **Ya es una `<table>` real** con encabezados: añadírsela
  duplicaría el contenido para el lector de pantalla.
- **Sí:** `alto: 'auto'` y `mensajeVacio` en `TarjetaGrafico`. Cero alterados es una buena
  noticia, no una carencia de datos, y «todavía no hay datos suficientes» sonaría a que falta
  información.

### Segunda tanda: fuera el gráfico mensual, dentro la saturación derivada

Con la revisión ya aplicada, el usuario pidió dos cosas más:

**1. Retirar «Chequeos por mes».** Se había arreglado en esta misma revisión —de 1 a 118 filas
usadas— pero el ritmo mensual no le aporta al colegio. Se borran `EvolucionMensual.tsx` y
`resumirPorMes`. `parsearFecha` **se conserva**: la sigue usando `filtrarAlterados` para ordenar,
y su comprobación de desbordes vale igual.

**2. Arreglar el gráfico de saturación, que llevaba meses vacío.** Y aquí estaba el punto: el
endpoint `estadistica-saturacion` devuelve 500, pero **el dato nunca faltó**. Viene en
`saturacionOxigeno` de cada fila de `chequeo-all`, la misma llamada que ya alimenta la lista y la
pirámide. Se agrupa en el front con `resumirPorSaturacion` y el gráfico funciona sin tocar el
backend.

Eso obligó a un refactor pequeño: `GraficoTorta` traía la serie **y** pintaba la dona, así que un
gráfico derivado no podía reutilizar el dibujo. Se extrajo **`Dona.tsx`**, puramente
presentacional, que ahora comparten `GraficoTorta` (backend) y `PieChartSaturacion` (derivado).
`getEstadisticaSaturacion` se retira del servicio por quedarse sin consumidor.

Verificado con los 118 reales: **117 en «Normal (≥ 95%)»**, los otros tres tramos en cero, y
`usadas` 117 de 118 —hay una fila sin lectura, que se resta en vez de contarse como 0 %.

#### ⚠️ Los tramos de saturación son una decisión clínica sin validar

`resumirPorSaturacion` agrupa en normal ≥ 95 %, leve 91-94 %, moderada 88-90 % y severa < 88 %.
Son los tramos de referencia habituales de pulsioximetría, **elegidos porque el gráfico tenía que
agrupar de alguna forma**, y **están pendientes del visto bueno médico del proyecto**. Cambiarlos
es una decisión médica y va en su propia spec, igual que los umbrales de IMC.

Hoy no se nota —los 117 valores reales van de 95 a 100, todos en el primer tramo—, pero el día
que aparezca un deportista por debajo de 95 el tramo en el que caiga sí importará.

### Lo que este hallazgo deja anotado para siempre

**`chequeo-all` no devuelve `division_paciente`, `created_at`, `derivacion_paciente`,
`observacion_paciente`, `email_paciente` ni `pulso`.** Y al revés: **sí devuelve
`saturacionOxigeno`**, que es lo que permitió resucitar ese gráfico sin backend. Está en el JSDoc de
`resumen.utility.ts` y en la guía del módulo. No derives nada de esos campos desde ese endpoint:
llegarán siempre vacíos.

---

## 10. Lo que **no** está en esta spec

- El clic en un gráfico que salta a la lista filtrada.
- El selector de año escolar.
- Arreglar `estadistica-saturacion`: es backend.
- Endpoints agregados para los cuatro gráficos nuevos.
- Aplicar los tokens de `tema.ts` a los tabs 1, 2 y 3.
- Exportar el Home a PDF.
- Retipar `IChequeo` a `number | null`.

Cada uno de esos, si entra, va en su propia spec de `specs/chequeo-cardiovascular/`.
