# CLAUDE_PACIENTE.md — Guía del módulo `src/ficha-clinica/`

Documento de referencia para trabajar sobre el módulo Paciente (ficha clínica). Recoge
lo que las tres specs decidieron, por qué, y qué **no** hay que romper.

> **Lee esto antes de tocar `src/ficha-clinica/`.** Las specs individuales
> (`01-`, `02-`, `03-`) tienen el detalle de cada iteración; este archivo es el estado
> consolidado.

**Última actualización:** 2026-08-19 (cierre de la Spec 03)

---

## Reglas duras del módulo

Se heredan desde la Spec 01 y aplican a toda la evolución del módulo:

1. **No se toca nada fuera de `src/ficha-clinica/`.** Ni rutas, ni navegadores, ni `common/`.
   La única excepción histórica es `src/routes/routesPA.tsx`, que ya apunta al módulo y
   no ha necesitado cambios.
2. **La ficha es de solo lectura.** No hay CRUD: ni crear, ni editar, ni borrar exámenes.
3. **Un solo paciente.** No hay selector ni listado; la ficha es fija.
4. **Sin dependencias nuevas.** Todo se resuelve con lo que ya está en `package.json`
   (MUI 5, chart.js, react-chartjs-2).
5. **Sin tests.** El proyecto no tiene runner configurado. No inventes comandos de test.
6. **`npm run build` debe quedar en verde.** `tsc -b` corre antes de Vite; un cambio que
   no tipa no compila.

---

## Estado actual

| Spec | Título | Estado |
|------|--------|--------|
| 01 | Módulo Paciente (Ficha Clínica) | Approved → superada por la 02 |
| 02 | Ficha Clínica con Tabs | Implementado |
| 03 | Tab «Distribución Segmentaria» con silueta SVG | Aprobado, implementado (pendiente de verificación en navegador) |

La ficha tiene hoy **cuatro tabs**: Home · Bioimpedancias · Electrocardiogramas ·
Distribución Segmentaria.

---

## Arquitectura de datos: tres capas

El módulo separa deliberadamente la forma del backend de lo que consumen los
componentes. **Ningún componente importa la Capa 1.**

```
data/paciente.json  (payload real del backend)
        │
        ▼
Capa 1 — interface/api.interface.ts
        snake_case, todo string|null en el electro, typos del backend incluidos
        │   ← solo lo lee utilities/mappers.ts
        ▼
Capa 2 — interface/ficha-clinica.interface.ts
        camelCase, numérico, unidades normalizadas
        │   ← lo que consumen TODOS los componentes
        ▼
Capa 3 — interface/segmentaria.interface.ts
        modelo DERIVADO (calculado en el front, no viene del backend)
```

### Capa 1 — Forma cruda

Refleja el payload **exactamente** como llega. Rarezas que hay que respetar:

- El electrocardiograma manda **todos los números como string** (`"107"`, `"1.47"`), y
  usa tanto `null` como `''` para «sin dato».
- `presionArterial` es la **diastólica**, pese al nombre.
- `estatura` del electro viene en **metros** (`"1.47"`); la de bioimpedancia en
  **centímetros** (`144`). Sin ninguna marca que los distinga.
- Hay **tres campos de IMC** (`imc`, `imc_electro`, `imc_paciente`) y solo uno poblado.
- `Recuperacion` va con **R mayúscula** y `gradoIncidenciaPosterio` está **truncado**.
  Así llegan: no se renombran.
- `raw_json` duplica el payload como string. **No se parsea.**
- El sexo usa **dos vocabularios**: `paciente.sexo` = `'Masculino'`,
  `bioimpedancia.sexo` = `'Hombre'`.

### Capa 2 — Modelo de UI

**Regla de nulabilidad, crítica:** todo campo numérico que el backend puede mandar como
`''` o `null` se tipa `number | null` y la UI lo renderiza como `—`.

> **Nunca se mapea la ausencia de dato a `0`.** Un cero en un signo vital es una
> medición, no un vacío. Esta regla se repite en las tres specs y es la más fácil de
> romper por descuido.

### Capa 3 — Modelo derivado (Spec 03)

`IDistribucionSegmentaria` y compañía **no vienen del backend**: se calculan en
`utilities/segmentacion.ts`. Ver la sección de estimación más abajo.

---

## Mapa de archivos

```
src/ficha-clinica/
├── index.ts                      barril del módulo (lazy de la página)
├── data/paciente.json            payload real del backend (NO modificar)
│
├── interface/
│   ├── api.interface.ts          Capa 1 — forma cruda
│   ├── ficha-clinica.interface.ts Capa 2 — modelo de UI
│   ├── segmentaria.interface.ts  Capa 3 — modelo derivado
│   └── index.ts
│
├── services/
│   └── UsePacienteService.ts     resuelve el JSON local con setTimeout
│
├── utilities/
│   ├── parse.ts                  aNumero, primerValor, aFechaISO, aCentimetros, calcularEdad
│   ├── mappers.ts                mapFichaClinica: Capa 1 → Capa 2
│   ├── format.ts                 SIN_DATO ('—'), formatNumero, formatPresion, formatFechaCL
│   ├── umbrales.ts               ESCALAS, clasificar, peorEstado, clasificarHallazgo
│   └── segmentacion.ts           COEFICIENTES, estimarDistribucion, compararDistribuciones
│
├── pages/
│   └── app-pacientes.tsx         ÚNICO punto que hace fetch; reparte por props
│
└── components/
    ├── PacienteHeader · KpiCard · ChartCard · AntecedentesCard · EmptyState
    ├── DetalleCampos (Bloque, Dato) · BioimpedanciaRow · ElectroRow
    ├── charts/                   5 gráficos chart.js + chart-utils
    ├── tabs/                     TabHome · TabBioimpedancias
    │                             TabElectrocardiogramas · TabDistribucionSegmentaria
    └── segmentaria/              (Spec 03)
        ├── SiluetaCorporal.tsx   ensambla el SVG; acepta children
        ├── ControlesSegmentaria  toggle métrica + selects de examen
        ├── CalloutSegmento       ficha lateral de un segmento
        ├── DetalleSegmento       tarjeta del segmento fijado
        ├── PanelElectro          signos vitales del último control
        ├── paleta.ts             COLOR_ESTADO, ETIQUETA_ESTADO, ids de <defs>
        └── svg/
            ├── cuerpo-paths.ts   geometría (solo constantes, sin JSX)
            ├── CuerpoDefs.tsx    gradientes + filtros
            ├── MarcadoresElectro corazón, saturación, articulaciones
            └── GuiasCallout      líneas punteadas hacia las fichas
```

**~4.270 líneas** de TS/TSX en el módulo.

---

## Patrones que hay que seguir

### La página es el único que hace fetch

`pages/app-pacientes.tsx` pide la ficha, muestra el estado de carga y reparte los datos
**ya normalizados** a cada tab por props. Ningún tab ni componente hace fetch propio.
Si agregas un tab, sigue ese patrón.

### Servicio

`UsePacienteService` sigue el patrón `UseXService` del proyecto (ver
`src/Chequeo/services/`). Hoy resuelve el JSON local con `setTimeout` simulando latencia;
**no está conectado al backend real**. Cuando se conecte, solo cambia el interior del
servicio: el mapper y los componentes no se enteran.

### Barriles

Cada carpeta tiene su `index.ts` y el módulo reexporta desde `src/ficha-clinica/index.ts`.
Los tipos van con `export type`, los valores con `export`.

### Navegación

El tab activo vive en `useState` local. **No se sincroniza con la URL**: un F5 vuelve a
Home. Decisión de la Spec 02, mantenida en la 03. Cambiarlo afecta al contenedor y
merece su propia spec.

---

## Evaluación clínica (`utilities/umbrales.ts`)

### ⚠️ Todas las escalas son de POBLACIÓN ADULTA

**El paciente del mock tiene 9–10 años.** Los cortes de adulto no son válidos en
pediatría, donde se evalúa por percentiles según edad y sexo. La UI está **obligada** a
rotularlo: el tab de distribución segmentaria lo declara al pie, y
`EstadoNutricionalChart` lo rotula desde la Spec 02.

Consecuencia visible con los datos actuales:

| Métrica | Valor del mock | Estado con tabla adulta | Realidad pediátrica |
|---|---|---|---|
| Grasa corporal | 18.1 % | `normal` | normal |
| IMC | 17.2 | `bajo` | normal para su edad |
| SMI | 6.9 kg/m² | `bajo` | normal para su edad |

**Esto no es un bug.** Es la decisión consciente de la Spec 03 (cortes de adulto
rotulados en vez de tablas pediátricas, que quedaron fuera de alcance) mostrando su
costo. Si alguna vez se agregan tablas pediátricas, van en `umbrales.ts` y **ningún
componente cambia**: esa es la razón de que las escalas vivan aisladas.

### Estructura de escalas: tramos, no min/max

```typescript
tramos: [
    { hasta: 7.9,  estado: 'bajo'    },
    { hasta: 20,   estado: 'normal'  },
    { hasta: null, estado: 'critico' },   // null cierra la escala por arriba
]
```

Una sola estructura cubre las métricas donde lo malo está arriba (grasa) y donde está
abajo (saturación). `hasta` es el límite superior **inclusivo**, expresado con la
resolución con la que el backend reporta el dato: por eso el corte de bajo peso es
`18.4` y no `18.5` — un IMC de 18.5 debe caer en `normal`.

### Funciones

- `clasificar(valor, escala)` → un valor ausente devuelve `'sinDato'`, **nunca**
  `'normal'`.
- `peorEstado(...estados)` → combina varios en el peor. `sinDato` es el mínimo de
  severidad: que falte la presión no debe borrar una frecuencia alterada.
- `clasificarHallazgo(texto)` → para campos de **texto libre**
  (`sistemaOsteoarticular`, `sistemaCardiovascular`). Devuelve `alto` para cualquier
  hallazgo, **nunca `critico`**: la gravedad la determina el médico que lo escribió, no
  una comparación de strings.

---

## Estimación segmentaria (`utilities/segmentacion.ts`)

### ⚠️ Estos valores NO son medidos

El backend **no entrega masa por segmento**. Solo totales (`masa_grasa_kg`,
`masa_muscular_kg`). El módulo los reparte con coeficientes antropométricos de
**de Leva (1996)**, ajuste de Zatsiorsky-Seluyanov.

**La UI está obligada a declararlo**: chip permanente «Valores estimados — no medidos
por el equipo» junto al título, repetido en la tarjeta de detalle y en el pie. Esa
advertencia **no es decorativa** — es la condición que hace aceptable la feature. Si
alguien la quita, la vista pasa a presentar cifras calculadas como si fueran mediciones
de un equipo.

### Coeficientes

```
                brazo   tronco   pierna
masculino      0.0494   0.5040   0.1986   (×2 brazos, ×2 piernas = 1.0000)
femenino       0.0449   0.4926   0.2088
```

- La masa de la **cabeza se agrupa en el tronco** (así lo reportan los equipos de
  bioimpedancia segmentaria), y así los cinco coeficientes suman exactamente 1.
- El reparto es **simétrico** entre lados: la bioimpedancia no entrega asimetría y
  fabricarla sería la invención más fácil de detectar.
- **El mismo vector reparte grasa y músculo.** Simplificación asumida: la grasa real se
  concentra más en tronco, pero no hay factor validado sin datos medidos.
- Los coeficientes son de **población adulta**. En un paciente pediátrico las
  proporciones difieren (cabeza mayor, extremidades menores).

### Estado por segmento

**Los cinco segmentos heredan el estado global de la métrica.** No existen cortes de
normalidad por extremidad en la literatura y **no se inventan**. La grasa se evalúa por
`grasaCorporalPct` y el músculo por `smi`, ambos del examen completo.

Consecuencia: la silueta suele quedar de un solo color. Es el costo aceptado.

### `normalizarSexo`

Resuelve los dos vocabularios del payload. Valor no reconocido cae en `masculino` sin
lanzar — el default es **arbitrario** y está ahí solo para no romper el render.

---

## La silueta SVG (`components/segmentaria/svg/`)

### Un único set de paths, general

**No hay variantes por sexo ni por edad.** La imagen es constante para todos los
pacientes; lo único dinámico son los colores y las cifras. (Los *coeficientes* sí varían
por sexo — eso es dato, no dibujo.)

### Construcción

- Lienzo `0 0 400 640`, figura centrada en `x = 200`, de y=26 a y=629.
- **Los lados se generaron por espejo matemático** (`x → 400 − x`) del lado derecho del
  paciente. La simetría es exacta **por construcción**, no por pulso. Si editas un lado,
  espeja el otro con la misma transformación.
- Contorno en curvas cúbicas. Las únicas rectas son cortes entre regiones.
- Seis paths cerrados y **disjuntos**: no se solapan ni dejan huecos.
- **El deltoides pertenece al BRAZO**, no al tronco. Es el corte de los informes de
  bioimpedancia y evita que la separación parezca una manga de camiseta.

### Lateralidad

`IZQ` y `DER` son las del **PACIENTE**. Como la silueta se mira de frente, `BRAZO_IZQ`
se dibuja en la mitad **derecha** de la pantalla. Las marcas `L` y `R` de la cabecera
existen precisamente para que nadie lea el informe invertido.

### Composición

`SiluetaCorporal` acepta `children`, que se renderizan **dentro del `<svg>`**. Es la vía
por la que se superponen `MarcadoresElectro` y `GuiasCallout`: como elementos hermanos no
compartirían el sistema de coordenadas del `viewBox`.

### Marcadores del electro

A diferencia de los segmentos, estos datos **sí son medidos**. Por eso son marcas encima
del cuerpo y no relleno de región: son otra cosa y deben leerse como otra cosa. Sin dato
se **atenúan** (opacidad 0.35), no se ocultan — si desaparecieran, el lector no sabría
que ese dato existe y falta.

---

## Decisiones de presentación

| Decisión | Razón |
|---|---|
| El porcentaje del callout es la **fracción del total** (suman 100 %) | El 287 % del informe Fitdays es contra un valor esperado que este front no tiene |
| El delta **no lleva color semántico**, solo flecha | Subir músculo y subir grasa no significan lo mismo |
| El color **siempre** representa el estado actual, nunca el delta | Cambiar el significado del color a mitad de vista es una trampa de lectura |
| El panel del electro muestra **siempre el más reciente** | Las dos series no coinciden en fechas; parear «el más cercano» mostraría un control de hace meses como si fuera del mismo día |
| Hover y fijado son **estados separados**, el fijado manda | Si fueran uno, mover el mouse hacia la tarjeta de detalle la cerraría |
| Umbral de `0.005 kg` para «sin cambio» | Por debajo, el redondeo daría `0.00` igual; mejor sin flecha que fingir variación |

---

## Verificación

No hay runner de tests. Lo que se puede comprobar:

```bash
npm run build              # tsc -b + vite — debe quedar en verde
npx eslint src/ficha-clinica/   # debe salir en 0 (el lint global tiene ~117 preexistentes de otros módulos)
```

Cifras de referencia con el mock actual (bioimpedancia del 25/06/2026, `masaGrasaKg: 6.8`):

- Tronco: `3.4 kg`, `50.4 % del total`
- Los cinco porcentajes suman 100 %
- Delta de tronco en músculo, comparando con 17/10/2025: `▲ +1.11 kg`
- Delta de grasa entre esos dos exámenes: `0.00 kg` (ambos traen 6.8)

**Pendiente de verificación en navegador** (requiere sesión con perfil `Paciente`):
hover, click para fijar, segundo click para cerrar, click en callout, y el responsive a
360 px.

---

## Qué NO está en el módulo

Cada una de estas, si entra alguna vez, va en su propia spec:

- Conexión al backend real (el servicio sigue resolviendo el JSON local).
- Parseo de `raw_json`.
- Tablas de referencia pediátricas por edad y sexo.
- Cortes de normalidad por segmento.
- Campos segmentarios medidos en el contrato del backend.
- Vista dorsal, siluetas por sexo o por edad.
- Agua corporal como tercera métrica del toggle.
- Coloreado por variación en lugar de por estado clínico.
- Exportación a PDF/PNG e impresión de la ficha.
- Sincronización del tab con la URL.
- Enlace con el módulo Chequeo por `id_chequeo` (el dato está ahí).
- Visualización del `archivo` PNG de la bioimpedancia (falta URL base).
- Filtros, búsqueda o paginación en las tablas.
- `@mui/x-data-grid` en este módulo.
- CRUD, selector de pacientes, tests.

---

## Trabajar con `/spec` y `/spec-impl`

El módulo se construyó con el flujo spec-driven del proyecto:

1. `/spec <descripción>` → diseña por fases, guarda en `specs/paciente/NN-slug.md` en
   estado `Borrador`. **Nunca escribe código.**
2. Revisas y cambias el estado a `Aprobado` **a mano**. El agente no lo hace por ti.
3. `/spec-impl NN-slug` → crea la rama `spec-NN-slug` e implementa paso a paso, con
   pausa después de cada uno para revisar el diff.
4. Al terminar y verificar los criterios, cambias el estado a `Implementado` y commiteas.

Una spec que resulta equivocada durante la implementación **se corrige en la spec**, no
en el código por sorpresa. Ejemplo real: la Spec 03 declaraba un delta de `+1.10 kg` y
la aritmética daba `+1.11`; se corrigió el criterio en el `.md`.
