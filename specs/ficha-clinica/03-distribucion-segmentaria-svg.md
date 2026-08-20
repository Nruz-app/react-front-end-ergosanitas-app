# SPEC 03 — Tab «Distribución Segmentaria» con silueta SVG dinámica

> **Estado:** Aprobado
> **Depende de:** SPEC 01 — Módulo Paciente (Ficha Clínica), SPEC 02 — Ficha Clínica con Tabs
> **Fecha:** 2026-08-19
> **Área afectada:** exclusivamente `src/Paciente/` (regla dura heredada de la Spec 01)
> **Objetivo:** Agregar un cuarto tab a la ficha clínica con una silueta humana SVG cuyos segmentos se colorean según el estado de masa grasa o masa muscular estimada a partir de la bioimpedancia seleccionada, acompañada de un panel con los signos vitales del último electrocardiograma.

---

## Por qué existe esta spec

El backend **no entrega datos segmentarios**. El informe de referencia que motivó esta
feature (un equipo Fitdays) muestra kg y porcentaje por brazo izquierdo, brazo derecho,
tronco y cada pierna. Ninguno de esos cinco desgloses existe en `bioimpedancias[]`: el
payload trae totales (`masa_grasa_kg`, `masa_muscular_kg`, `grasa_corporal_pct`, `smi`,
`agua_corporal_total_kg`) y signos vitales globales del electro.

La spec resuelve esa brecha **estimando** el reparto con coeficientes antropométricos
publicados, y asume la obligación que viene con eso: declarar en pantalla, de forma
permanente, que los valores por segmento son calculados y no medidos. Esa advertencia no
es decorativa — es la condición que hace aceptable la feature.

Segundo condicionante: el paciente del mock tiene **9 años**. Los cortes de normalidad de
grasa corporal, IMC y presión de adulto no aplican en pediatría. La spec usa cortes de
adulto rotulados como tales, igual que hizo la Spec 02 con `EstadoNutricionalChart`, y
deja la estructura preparada para recibir tablas pediátricas sin refactor.

---

## Alcance

**Dentro (In):**

**Estimación segmentaria**

- Función pura en `utilities/segmentacion.ts` que reparte `masaGrasaKg` y `masaMuscularKg`
  de una bioimpedancia entre cinco segmentos: brazo izquierdo, brazo derecho, tronco,
  pierna izquierda y pierna derecha.
- Coeficientes de reparto fijos por sexo, declarados como constante con su fuente
  antropométrica comentada. Los coeficientes de cada métrica suman exactamente 1.
- El reparto es simétrico: brazo izquierdo y derecho reciben el mismo coeficiente, igual
  las piernas. La bioimpedancia no entrega asimetría y no se inventa.

**Evaluación de estado**

- Función en `utilities/umbrales.ts` que clasifica una métrica en cuatro estados: `bajo`,
  `normal`, `alto`, `critico`.
- Cortes de **adulto** (OMS/AHA) para grasa corporal, IMC, presión arterial, saturación,
  frecuencia cardíaca, hemoglucotest y temperatura.
- El estado de un segmento **no** se calcula con cortes propios: hereda el estado global
  de la métrica de esa bioimpedancia. No existen cortes por extremidad y no se inventan.

**Silueta SVG**

- Componente `components/segmentaria/SiluetaCorporal.tsx`: un SVG con `viewBox` fijo,
  paths dibujados a mano, vista frontal, proporciones neutras.
- Un **único set de paths general**, sin variantes por sexo ni por edad: la imagen es
  constante para todos los pacientes.
- Seis regiones identificables: cabeza, tronco, brazo izq, brazo der, pierna izq, pierna
  der. Cada una recibe su color de relleno por prop.
- Marcadores anatómicos del electrocardiograma superpuestos: corazón (FC y presión),
  cabeza (saturación O₂), articulaciones de hombro y rodilla (sistema osteoarticular).
- Gradientes y sombras definidos en `<defs>` dentro del propio SVG. Sin imágenes externas,
  sin dependencias nuevas.

**Callouts y interacción**

- Cinco callouts alrededor de la silueta (uno por segmento), cada uno con kg estimados,
  porcentaje del total corporal y etiqueta de estado con su punto de color.
- `hover` resalta el segmento y su callout. `click` fija el segmento y despliega bajo la
  silueta una tarjeta de detalle con ambas métricas, el estado y el delta.
- Un segundo click sobre el mismo segmento lo deselecciona.

**Controles del tab**

- `ToggleButtonGroup` para alternar la métrica que colorea el cuerpo: masa grasa o masa
  muscular.
- `Select` de bioimpedancia por fecha (5 opciones en el mock), que redibuja la silueta.
- `Select` de examen base para comparar, con opción «Sin comparación». Cuando hay
  comparación, cada callout suma una línea con el delta en kg, flecha y signo.
- El color siempre representa el estado actual, nunca el delta.

**Panel del electrocardiograma**

- Componente `components/segmentaria/PanelElectro.tsx` a la derecha de la silueta.
- Muestra siempre el electro **más reciente** del paciente, con su fecha rotulada,
  independiente de la bioimpedancia elegida.
- Lista los signos vitales con su estado evaluado, el `status`, el `estadoPaciente`, la
  derivación y la observación del ECG.

**Advertencias visibles**

- Chip permanente «Valores estimados — no medidos por el equipo» junto al título.
- Rótulo que declara que los cortes de referencia son de adulto y no son válidos en
  pediatría.

**Integración y cierre**

- `pages/app-pacientes.tsx` agrega el cuarto `<Tab>` «Distribución Segmentaria» con su
  icono, después de Electrocardiogramas.
- Nuevo componente de tab en `components/tabs/TabDistribucionSegmentaria.tsx`, que recibe
  todo por props y no hace fetch.
- Actualizar los barriles `interface/index.ts`, `components/index.ts`,
  `utilities/index.ts` y `src/Paciente/index.ts`.
- Dejar `npm run build` (`tsc -b` + vite) en verde.

**Fuera (Not in) — para specs futuras:**

- **No se toca nada fuera de `src/Paciente/`.** Ni rutas, ni navegadores, ni `common/`.
- **No se modifica `data/paciente.json`.** La estimación trabaja con el payload actual tal
  como está.
- **No se agregan campos segmentarios al contrato del backend.** Si algún día el equipo
  entrega masa por segmento medida, esa migración es otra spec.
- **No hay tablas de referencia pediátricas** por edad y sexo. Los cortes son de adulto,
  rotulados como tales.
- **No hay cortes de normalidad por segmento.** El estado se hereda del valor global.
- **No hay vista dorsal** ni siluetas diferenciadas por sexo o por edad.
- **No hay tercera métrica** (agua corporal) en el toggle.
- **No hay modo de color por delta.** La comparación se expresa en números, no en color.
- **No se parsea `raw_json`.** Sigue tipado como `string` e ignorado.
- **No hay exportación a PNG, PDF ni impresión** de la silueta.
- **No se sincroniza el tab con la URL.** Un F5 sigue volviendo a Home, como en la Spec 02.
- **No se instalan dependencias nuevas.** El SVG se escribe a mano, sin librerías de
  visualización.
- **No se agregan tests:** el proyecto no tiene runner configurado.

---

## Modelo de datos

Tres archivos nuevos de tipos y constantes. Ninguna interfaz existente cambia: esto se
**deriva** de `IBioimpedancia` e `IElectrocardiograma` tal como los dejó la Spec 02.

### Capa 3 — Modelo derivado (`interface/segmentaria.interface.ts`)

```typescript
/** Los cinco segmentos que reciben masa. La cabeza es región dibujable, no segmento. */
export type SegmentoId = 'brazoIzq' | 'brazoDer' | 'tronco' | 'piernaIzq' | 'piernaDer';

/** Qué métrica colorea la silueta. */
export type MetricaSegmentaria = 'grasa' | 'musculo';

/** Estado clínico de una métrica. 'sinDato' cuando el backend no entregó el valor. */
export type EstadoClinico = 'critico' | 'bajo' | 'normal' | 'alto' | 'sinDato';

export interface ISegmentoCorporal {
    id              : SegmentoId;
    nombre          : string;        // 'Brazo izquierdo'
    grasaKg         : number | null; // estimado, null si masaGrasaKg venía null
    musculoKg       : number | null;
    fraccionGrasa   : number;        // 0.055 → 5.5% del total corporal
    fraccionMusculo : number;
}

export interface IDistribucionSegmentaria {
    fecha          : string;                              // de la bioimpedancia origen
    segmentos      : Record<SegmentoId, ISegmentoCorporal>;
    // Estado global heredado por todos los segmentos de esa métrica.
    estadoGrasa    : EstadoClinico;
    estadoMusculo  : EstadoClinico;
    // Totales de origen, para el pie de la vista.
    masaGrasaKg    : number | null;
    masaMuscularKg : number | null;
}

export interface IDeltaSegmento {
    grasaKg   : number | null;   // positivo = subió respecto al examen base
    musculoKg : number | null;
}

export interface IComparacionSegmentaria {
    fechaBase : string;
    deltas    : Record<SegmentoId, IDeltaSegmento>;
}
```

### Coeficientes de reparto (`utilities/segmentacion.ts`)

```typescript
/**
 * Fracción de masa corporal por segmento, de Leva (1996), ajuste de los datos de
 * Zatsiorsky-Seluyanov. La masa de la cabeza se agrupa en el tronco: los equipos de
 * bioimpedancia segmentaria reportan «tronco» incluyendo cabeza y cuello.
 *
 * Simplificación asumida: el mismo vector reparte grasa y músculo. La grasa real se
 * concentra más en tronco que la masa total, pero no existe un factor validado para
 * corregirlo sin datos medidos, y estimar sobre una estimación empeora el dato.
 */
const COEFICIENTES = {
    masculino: { brazoIzq: 0.0494, brazoDer: 0.0494, tronco: 0.5040, piernaIzq: 0.1986, piernaDer: 0.1986 },
    femenino:  { brazoIzq: 0.0449, brazoDer: 0.0449, tronco: 0.4926, piernaIzq: 0.2088, piernaDer: 0.2088 },
} as const;   // cada vector suma exactamente 1.0000
```

**Normalización de sexo:** el payload trae `paciente.sexo = 'Masculino'` y
`bioimpedancia.sexo = 'Hombre'` — dos vocabularios para lo mismo. La función normaliza
ambos; cualquier valor no reconocido cae en `masculino` con un comentario que lo declara
como default arbitrario.

### Escalas clínicas (`utilities/umbrales.ts`)

Tramos ordenados en vez de pares mín/máx, porque hay métricas donde lo malo está abajo
(saturación) y otras donde está arriba (grasa). Una sola estructura cubre ambas:

```typescript
export interface ITramoClinico {
    hasta  : number | null;   // límite superior inclusivo; null = sin techo
    estado : EstadoClinico;
}

export interface IEscalaClinica {
    etiqueta   : string;
    unidad     : string;
    referencia : string;      // 'Adulto (OMS)' — va visible en la UI
    tramos     : ITramoClinico[];
}
```

```typescript
// Ejemplo: grasa corporal masculina y saturación, misma estructura, direcciones opuestas.
grasaCorporalPct_masculino: {
    etiqueta: 'Grasa corporal', unidad: '%', referencia: 'Adulto (OMS)',
    tramos: [
        { hasta: 8,    estado: 'bajo'    },
        { hasta: 20,   estado: 'normal'  },
        { hasta: 25,   estado: 'alto'    },
        { hasta: null, estado: 'critico' },
    ],
},
saturacionOxigeno: {
    etiqueta: 'Saturación O₂', unidad: '%', referencia: 'Adulto (AHA)',
    tramos: [
        { hasta: 90,   estado: 'critico' },
        { hasta: 94,   estado: 'bajo'    },
        { hasta: null, estado: 'normal'  },
    ],
},
```

Escalas definidas: grasa corporal (por sexo), SMI, IMC, presión sistólica, presión
diastólica, frecuencia cardíaca, saturación, hemoglucotest y temperatura.

### Paleta de estados

```typescript
const COLOR_ESTADO: Record<EstadoClinico, string> = {
    critico : '#d32f2f',
    alto    : '#f57c00',
    normal  : '#2e7d32',
    bajo    : '#0288d1',
    sinDato : '#bdbdbd',
};
```

Cada relleno de segmento usa este color con opacidad reducida y el borde en el color
pleno, para que la silueta no quede como una mancha saturada.

### Convenciones

- **Redondeo:** los kg estimados se redondean a un decimal solo al formatear, nunca en el
  cálculo.
- **Propagación de nulos:** si `masaGrasaKg` es `null`, los cinco `grasaKg` son `null` y el
  estado es `sinDato`. No se sustituye por 0, igual que en la Spec 02.
- **Coordenadas SVG:** `viewBox="0 0 400 640"`, origen arriba-izquierda, silueta centrada
  en `x = 200`.
- **Izquierda/derecha:** son las del **paciente**, no las del observador. El brazo
  izquierdo se dibuja a la derecha de la pantalla, y la silueta lleva las marcas `L` y `R`
  como en el informe de referencia.

---

## Plan de implementación

### Fase A — Lógica pura (sin UI)

1. **Tipos derivados.** Crear `interface/segmentaria.interface.ts` con `SegmentoId`,
   `MetricaSegmentaria`, `EstadoClinico`, `ISegmentoCorporal`,
   `IDistribucionSegmentaria`, `IDeltaSegmento` e `IComparacionSegmentaria`. Reexportar
   desde `interface/index.ts`.
   *Verificación:* `npm run build` en verde; nada cambia en pantalla.

2. **Escalas clínicas.** Crear `utilities/umbrales.ts` con `ITramoClinico`,
   `IEscalaClinica`, el mapa `ESCALAS` (grasa por sexo, SMI, IMC, sistólica, diastólica,
   FC, saturación, hemoglucotest, temperatura) y `clasificar(valor, escala):
   EstadoClinico`.
   *Verificación:* `clasificar(19.5, ESCALAS.grasaMasculino)` → `'normal'`;
   `clasificar(null, …)` → `'sinDato'`.

3. **Reparto segmentario.** Crear `utilities/segmentacion.ts` con `COEFICIENTES`,
   `normalizarSexo()` y `estimarDistribucion(bio, sexo): IDistribucionSegmentaria`.
   *Verificación:* con la bioimpedancia del 25/06/2026 (`masaGrasaKg: 6.8`) el tronco da
   `3.43 kg` y los cinco segmentos suman `6.8` con tolerancia de 0.01 kg.

4. **Comparación entre exámenes.** Agregar `compararDistribuciones(actual, base)`. Cada
   delta es `null` si alguno de los dos valores lo es. Reexportar ambas utilidades desde
   `utilities/index.ts`.
   *Verificación:* 25/06/2026 contra 17/10/2025 da delta `0.00 kg` en grasa (ambos traen
   `6.8`) y positivo en músculo.

### Fase B — El asset SVG

5. **Geometría del cuerpo.** Crear `components/segmentaria/svg/cuerpo-paths.ts`: un único
   set de paths generales, sin variantes por sexo ni edad. Constantes exportadas
   `PATH_CABEZA`, `PATH_TRONCO`, `PATH_BRAZO_IZQ`, `PATH_BRAZO_DER`, `PATH_PIERNA_IZQ`,
   `PATH_PIERNA_DER`, más `VIEWBOX = '0 0 400 640'`. Requisitos de calidad, todos
   verificables mirando el render:
   - Proporción canónica de 7.5 cabezas de altura, postura anatómica frontal (brazos
     separados del tronco, palmas al frente).
   - Contorno con curvas cúbicas (`C`/`S`), nunca polilíneas rectas: sin vértices
     angulosos en hombros, cintura, caderas ni pantorrillas.
   - Los seis paths son **cerrados y disjuntos**: no se solapan ni dejan huecos entre sí.
     Los cortes siguen referencias anatómicas reales — línea axilar para los brazos,
     pliegue inguinal para las piernas.
   - Silueta simétrica respecto a `x = 200`.
   *Verificación:* archivo sin JSX, solo constantes de string; el build sigue verde.

6. **Definiciones visuales.** Crear `components/segmentaria/svg/CuerpoDefs.tsx` con el
   `<defs>` compartido: un `<radialGradient>` por estado clínico (centro más claro, borde
   saturado), un `<filter>` con `feDropShadow` suave para despegar la figura del fondo, y
   un `<linearGradient>` neutro para las regiones sin dato.
   *Verificación:* aún no se monta; el build sigue verde.

7. **Componente de silueta.** Crear `components/segmentaria/SiluetaCorporal.tsx` que
   ensambla paths y defs. Props: `colores: Record<SegmentoId, EstadoClinico>`,
   `segmentoActivo`, `onHoverSegmento`, `onClickSegmento`.
   - `width="100%"`, `preserveAspectRatio="xMidYMid meet"`: escala sin pérdida y sin
     deformar en cualquier ancho de contenedor.
   - Relleno con el gradiente del estado, contorno de 1.5 px en el color pleno.
   - Marcas `L` y `R` en la parte superior, en chips circulares, con las lateralidades del
     **paciente** (la `L` va a la derecha de la pantalla).
   - `role="img"` y `<title>` descriptivo para lectores de pantalla.
   *Verificación:* aún no se monta.

8. **Marcadores del electrocardiograma.** Crear
   `components/segmentaria/svg/MarcadoresElectro.tsx`: grupo superpuesto con el corazón
   (posición anatómica, ligeramente a la izquierda del paciente), un marcador en la cabeza
   para saturación y cuatro en hombros y rodillas para el sistema osteoarticular. Cada
   marcador se colorea por su propio estado y se atenúa si no hay dato. Dibujados a mano en
   el mismo lenguaje de curvas que el cuerpo.
   *Verificación:* aún no se monta.

9. **Tab montado.** Crear `components/tabs/TabDistribucionSegmentaria.tsx` renderizando la
   silueta con estados fijos. Agregar el cuarto `<Tab>` en `pages/app-pacientes.tsx` con
   `AccessibilityNewIcon` y actualizar los barriles `components/index.ts` y
   `src/Paciente/index.ts`.
   *Verificación:* `npm run dev` muestra cuatro tabs y el nuevo dibuja la silueta completa.
   **Primer punto revisable visualmente — aquí se aprueba la calidad del dibujo antes de
   seguir.**

### Fase C — Datos y controles

10. **Silueta conectada.** El tab recibe `paciente`, `bioimpedancias` y
    `electrocardiogramas` por props. `useState` para la bioimpedancia elegida (por defecto
    la más reciente) y la métrica (`'grasa'`). Los colores salen de `estimarDistribucion`
    + `clasificar`.
    *Verificación:* con el mock, grasa 18.1% en escala adulto masculino pinta el cuerpo en
    verde `normal`.

11. **Controles.** Crear `components/segmentaria/ControlesSegmentaria.tsx` con el
    `ToggleButtonGroup` de métrica y el `Select` de fecha de examen.
    *Verificación:* cambiar de examen o de métrica redibuja la silueta sin recargar.

### Fase D — Lectura del detalle

12. **Callouts.** Crear `components/segmentaria/CalloutSegmento.tsx` (kg, % del total,
    punto de color y etiqueta de estado) y ubicar los cinco alrededor de la silueta con
    líneas guía que conectan cada uno con su segmento. Apilados debajo en `xs`.
    *Verificación:* las cifras de los cinco callouts corresponden al examen elegido.

13. **Interacción.** `hover` resalta el path y su callout; `click` fija el segmento. Crear
    `components/segmentaria/DetalleSegmento.tsx`, la tarjeta bajo la silueta con ambas
    métricas del segmento fijado.
    *Verificación:* click en la pierna izquierda abre su detalle; segundo click lo cierra.

14. **Comparación.** Agregar el `Select` de examen base (por defecto «Sin comparación») y
    la línea de delta en cada callout, con flecha y signo. El color del segmento no cambia:
    sigue representando el estado actual.
    *Verificación:* comparando 25/06/2026 contra 17/10/2025, el callout de tronco muestra
    `▲ +1.11 kg` en masa muscular y `0.00 kg` en grasa.

### Fase E — Contexto clínico y cierre

15. **Panel del electrocardiograma.** Crear `components/segmentaria/PanelElectro.tsx` con
    los signos vitales del electro **más reciente**, cada uno con su estado evaluado, más
    `status`, `estadoPaciente`, derivación y observación del ECG. La fecha va rotulada en
    la cabecera del panel.
    *Verificación:* muestra el electro del 24/04/2026 aunque la bioimpedancia elegida sea
    de octubre 2025.

16. **Advertencias y estados degradados.** Chip «Valores estimados — no medidos por el
    equipo» junto al título, rótulo de «Referencia adulto — no válida en pediatría» al pie,
    y `EmptyState` cuando el paciente no tiene bioimpedancias. Si no hay electros, el panel
    muestra su propio aviso y la silueta se dibuja sin marcadores.
    *Verificación:* forzando `bioimpedancias: []` el tab muestra el estado vacío sin
    romperse.

---

## Criterios de aceptación

### Lógica de estimación

- [ ] `estimarDistribucion` devuelve los cinco segmentos y su suma reproduce `masaGrasaKg`
      y `masaMuscularKg` de origen con tolerancia de 0.01 kg.
- [ ] Los dos vectores de `COEFICIENTES` suman exactamente 1.0000.
- [ ] Brazo izquierdo y derecho reciben siempre el mismo valor; piernas también.
- [ ] Con `masaGrasaKg: null`, los cinco `grasaKg` son `null` y `estadoGrasa` es
      `'sinDato'`. Ningún campo se sustituye por 0.
- [ ] `normalizarSexo` resuelve `'Masculino'`, `'Hombre'`, `'Femenino'` y `'Mujer'`. Un
      valor no reconocido no lanza excepción.
- [ ] `clasificar(19.5, ESCALAS.grasaMasculino)` devuelve `'normal'` y `clasificar(26, …)`
      devuelve `'critico'`.
- [ ] `clasificar(99, ESCALAS.saturacionOxigeno)` devuelve `'normal'` y `clasificar(89, …)`
      devuelve `'critico'` — la escala invertida funciona.
- [ ] `compararDistribuciones` devuelve `null` en un delta cuando alguno de los dos
      exámenes no tiene el valor.

### Silueta SVG

- [ ] El tab dibuja una silueta humana frontal reconocible: cabeza, cuello, tronco, dos
      brazos con manos y dos piernas con pies.
- [ ] La misma geometría se usa para cualquier paciente: no existe un segundo set de paths
      por sexo ni por edad en `cuerpo-paths.ts`.
- [ ] Pintando cada región de un color distinto se ve que los seis paths no se solapan ni
      dejan huecos entre ellos.
- [ ] La silueta es simétrica respecto a `x = 200` del `viewBox`.
- [ ] Redimensionando la ventana de 1920 px a 360 px de ancho, la silueta escala sin
      deformarse y sin pixelarse.
- [ ] Las marcas `L` y `R` están presentes y la `L` aparece a la derecha de la pantalla.
- [ ] El SVG no carga ningún recurso externo: todo son paths, gradientes y filtros
      declarados en el archivo.
- [ ] El `<svg>` tiene `role="img"` y un `<title>` descriptivo.

### Datos en pantalla

- [ ] Con el examen del 25/06/2026 y métrica «masa grasa», el callout de tronco muestra
      `3.4 kg` y `50.4% del total`.
- [ ] Los cinco porcentajes mostrados suman 100%.
- [ ] Cambiar el `ToggleButtonGroup` a «masa muscular» actualiza las cinco cifras y los
      colores sin recargar la página.
- [ ] Cambiar el `Select` de examen a otra fecha actualiza las cinco cifras.
- [ ] Todo valor ausente se muestra como `—` y nunca como `0`.

### Interacción

- [ ] Pasar el mouse por un segmento lo resalta y destaca su callout.
- [ ] Click en un segmento abre la tarjeta de detalle con sus dos métricas y su estado.
- [ ] Segundo click sobre el mismo segmento cierra la tarjeta.
- [ ] Click en un callout produce el mismo efecto que click en su segmento.

### Comparación

- [ ] Con «Sin comparación» seleccionado, ningún callout muestra línea de delta.
- [ ] Comparando 25/06/2026 contra 17/10/2025, el callout de tronco muestra `▲ +1.11 kg` en
      masa muscular.
- [ ] El delta de grasa entre esos dos exámenes se muestra como `0.00 kg`, sin flecha.
- [ ] Activar la comparación no cambia el color de ningún segmento.
- [ ] El examen base no puede ser el mismo que el examen actual.

### Panel del electrocardiograma

- [ ] El panel muestra los datos del electro del 24/04/2026 aunque la bioimpedancia elegida
      sea la del 17/10/2025, con su fecha rotulada.
- [ ] Cada signo vital del panel muestra su estado evaluado con el color de la paleta.
- [ ] La observación del ECG conserva sus saltos de línea.

### Advertencias

- [ ] El chip «Valores estimados — no medidos por el equipo» es visible sin hacer scroll
      dentro del tab.
- [ ] El rótulo que declara la referencia adulta es visible en el tab.

### Estados degradados

- [ ] Con `bioimpedancias: []` el tab muestra un `EmptyState` y no lanza excepciones en
      consola.
- [ ] Con `electrocardiogramas: []` la silueta se dibuja sin marcadores y el panel muestra
      su aviso.

### Integración

- [ ] La ficha muestra cuatro tabs y el nuevo se llama «Distribución Segmentaria».
- [ ] Los otros tres tabs siguen funcionando igual que antes de esta spec.
- [ ] No se modificó ningún archivo fuera de `src/Paciente/`.
- [ ] `data/paciente.json` quedó sin cambios respecto a la Spec 02.
- [ ] `package.json` no tiene dependencias nuevas.
- [ ] `npm run build` termina sin errores de TypeScript ni de Vite.
- [ ] `npm run lint` no reporta errores nuevos.

---

## Decisiones

### Origen de los datos segmentarios

- **Sí:** estimar el reparto desde `masaGrasaKg` y `masaMuscularKg` con coeficientes
  antropométricos fijos. Es lo único que permite construir la vista con el payload que el
  backend entrega hoy.
- **Sí:** declarar la estimación en pantalla con un chip permanente. Un médico que lee
  «1.33 kg en pierna izquierda» tiene derecho a saber que ese número no salió de un
  electrodo, sino de una multiplicación.
- **No:** agregar campos segmentarios a `data/paciente.json`. Habría inventado un contrato
  que el backend no tiene y que nadie se comprometió a implementar.
- **No:** renunciar al desglose y colorear solo por métricas globales. Se aleja demasiado
  del informe que el usuario quiere reproducir.

### Coeficientes de reparto

- **Sí:** de Leva (1996), sobre los datos de Zatsiorsky-Seluyanov. Es la referencia
  antropométrica estándar en biomecánica y está publicada; cualquiera puede auditar de
  dónde salieron los números.
- **Sí:** agrupar la masa de la cabeza dentro del tronco. Los equipos de bioimpedancia
  segmentaria reportan «tronco» incluyendo cabeza y cuello, y así los cinco coeficientes
  suman exactamente 1.
- **Sí:** mantener dos vectores, masculino y femenino. Es dato, no dibujo: la silueta es
  única, pero las proporciones de masa difieren entre sexos y ese ajuste es gratis.
- **Sí:** reparto simétrico entre lado izquierdo y derecho. La bioimpedancia no entrega
  asimetría; fabricarla sería la mentira más fácil de detectar y la más difícil de
  justificar.
- **No:** un vector distinto para grasa y otro para músculo. La grasa real se concentra más
  en tronco que la masa total, pero no existe un factor de corrección validado sin datos
  medidos, y estimar sobre una estimación degrada el dato en vez de mejorarlo.
- **No:** coeficientes pediátricos por edad. No hay tablas de consenso equivalentes y
  habría que mantenerlas en el front.

### Evaluación clínica

- **Sí:** el estado de un segmento hereda el estado global de la métrica. No existen cortes
  de normalidad por extremidad en la literatura, y no se inventan.
- **Sí:** cortes de adulto (OMS/AHA), rotulados como tales. Es coherente con lo que ya hace
  `EstadoNutricionalChart` desde la Spec 02.
- **Sí:** escalas como tramos ordenados en vez de pares mín/máx. Una sola estructura cubre
  las métricas donde lo malo está arriba (grasa) y donde está abajo (saturación).
- **No:** tablas de percentiles pediátricos por edad y sexo. Es lo clínicamente correcto
  para este paciente de 9 años, pero multiplica el tamaño de la spec. Queda anotado como
  deuda explícita en Riesgos.

### La silueta

- **Sí:** un único set de paths general, sin variantes por sexo ni por edad. Decisión del
  usuario: la imagen es constante, lo dinámico son los valores y los colores.
- **Sí:** geometría en su propio archivo (`svg/cuerpo-paths.ts`), separada del componente.
  Permite iterar el dibujo sin tocar lógica de render.
- **Sí:** vista frontal únicamente. Los cinco segmentos se ven completos de frente; una
  vista dorsal no agregaría información.
- **Sí:** SVG escrito a mano. Sin dependencias nuevas, sin imágenes externas, escala sin
  pérdida y cada región es un elemento con eventos propios.
- **No:** un PNG o una imagen trazada de terceros. No se podría colorear por región y
  arrastraría licencias.
- **No:** siluetas diferenciadas por sexo. Duplicaba el trabajo de dibujo y obligaba a
  decidir qué se muestra cuando el sexo no viene o no es reconocido.

### Presentación

- **Sí:** callouts con kg, porcentaje del total corporal y estado. El porcentaje es la
  fracción del total, así que los cinco suman 100% y se explica solo.
- **No:** el porcentaje «respecto al valor esperado» que muestra el informe Fitdays (287%).
  Requeriría una tabla de valores esperados por segmento que no tenemos, encima de una
  estimación. Dos capas de dato fabricado.
- **Sí:** toggle entre masa grasa y masa muscular. Reproduce el selector del informe de
  referencia y duplica el valor de la vista sin duplicar el dibujo.
- **No:** agua corporal como tercera métrica. Su reparto segmentario es el más discutible de
  los tres.
- **Sí:** comparación con una sola silueta y el delta en los callouts. El color sigue
  significando estado clínico en todo momento.
- **No:** colorear por delta (verde bajó / rojo subió). Cambiar el significado del color a
  mitad de la misma vista es una trampa de lectura.
- **No:** dos siluetas lado a lado. En móvil quedan apiladas y se pierde la comparación.

### Panel del electrocardiograma

- **Sí:** mostrar siempre el electro más reciente, con su fecha visible. Es el estado
  cardiovascular actual del paciente, que es lo que un médico quiere ver al abrir la ficha.
- **No:** parear el electro con la fecha de la bioimpedancia elegida. Las dos series no
  coinciden en fechas y el pareo «más cercano» habría mostrado un control de hace meses
  como si fuera del mismo día.

### Alcance técnico

- **Sí:** todo el trabajo dentro de `src/Paciente/`. Regla dura heredada de la Spec 01.
- **Sí:** el tab recibe todo por props, sin fetch propio. Mismo patrón que los tres tabs de
  la Spec 02.
- **No:** sincronizar el tab con la URL. La Spec 02 ya decidió que un F5 vuelve a Home;
  cambiarlo aquí sería inconsistente y toca el contenedor más de lo necesario.
- **No:** exportar la silueta a PNG o PDF. Es una feature con demanda previsible, pero
  arrastra decisiones de layout de impresión que merecen su propia spec.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| **Un médico lee los kg por segmento como una medición real.** Es el riesgo más serio de esta spec: la vista se parece mucho al informe de un equipo que sí mide por segmento, y podría fundamentar una decisión clínica sobre un número calculado. | Chip permanente «Valores estimados — no medidos por el equipo» visible sin scroll, la palabra «estimado» en la tarjeta de detalle de cada segmento, y el método de cálculo documentado en la cabecera de `segmentacion.ts`. |
| **Los cortes de adulto no aplican al paciente del mock, de 9 años.** Un IMC de 17.2 es normal en un niño de 10 años y bajo peso en un adulto: la misma cifra cambia de estado según la tabla. | Rótulo visible «Referencia adulto — no válida en pediatría». Las escalas viven en un único archivo (`umbrales.ts`) con la estructura de tramos ya preparada para recibir tablas por edad y sexo sin tocar componentes. |
| **Los coeficientes de de Leva son de población adulta.** Aplicarlos a un niño de 9 años suma una segunda aproximación: las proporciones corporales infantiles difieren, con cabeza proporcionalmente mayor y extremidades menores. | Queda cubierto por el chip de estimación. `COEFICIENTES` es una constante única y aislada: reemplazarla por vectores por rango etario es un cambio de un archivo. |
| **El mismo vector reparte grasa y músculo.** En un paciente con obesidad central, el tronco quedará subestimado y las extremidades sobreestimadas respecto a la realidad. | Documentado como simplificación explícita en `segmentacion.ts` y en la sección de Decisiones. La firma de `estimarDistribucion` admite vectores distintos por métrica el día que exista un factor validado. |
| **Dibujar una silueta humana convincente con paths a mano puede salir mal.** Es la parte del plan con más incertidumbre y la más visible: un cuerpo mal proporcionado arruina la percepción de toda la ficha. | El paso 9 del plan es un punto de corte deliberado: la silueta se monta en pantalla sin datos encima y se aprueba antes de invertir en callouts, interacción y comparación. Iterar el dibujo solo toca `cuerpo-paths.ts`. |
| **La silueta queda de un solo color.** Como el estado se hereda del valor global, los cinco segmentos comparten estado y la vista puede leerse como «no está pasando nada». | Los callouts diferencian por cifra aunque el color coincida, y el modo comparación aporta variación real por segmento. Es el costo aceptado de no inventar cortes por extremidad. |
| **Los cinco callouts alrededor de la silueta se rompen en pantallas angostas.** El posicionamiento absoluto que funciona en escritorio colapsa en móvil. | Breakpoint explícito: en `xs` los callouts se apilan bajo la silueta como lista, sin líneas guía. Un criterio de aceptación verifica el render a 360 px. |
| **`normalizarSexo` recibe un valor inesperado.** El payload ya usa dos vocabularios distintos (`'Masculino'` en paciente, `'Hombre'` en bioimpedancia); un tercero es plausible. | La función cae en `masculino` por defecto, sin lanzar excepción, y el default está comentado como arbitrario en el código. |

---

## Lo que **no** está en esta spec

- Tablas de referencia pediátricas por edad y sexo.
- Campos segmentarios medidos en el contrato del backend.
- Vista dorsal, siluetas por sexo o siluetas por edad.
- Agua corporal como tercera métrica del toggle.
- Coloreado por variación (delta) en lugar de por estado clínico.
- Exportación de la silueta a PNG o PDF, e impresión de la ficha.
- Sincronización del tab con la URL.
- Cualquier cambio fuera de `src/Paciente/`.

Cada una de esas, si entra alguna vez, va en su propia spec.
