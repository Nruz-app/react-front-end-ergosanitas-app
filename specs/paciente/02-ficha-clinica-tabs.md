# Spec 02 — Ficha Clínica con Tabs (Home / Bioimpedancias / Electrocardiogramas)

- **Estado:** Implementado
- **Fecha:** 2026-08-19
- **Dependencias:** Spec 01 — Módulo Paciente (Ficha Clínica). Esta spec **migra** su
  modelo de datos: `signosActuales` e `historial` desaparecen.
- **Área afectada:** exclusivamente `src/Paciente/` (regla dura heredada de la Spec 01:
  no se toca ninguna otra carpeta)
- **Estado del build al iniciar:** ⚠️ roto. `data/paciente.json` fue reemplazado por el
  payload real del backend y `UsePacienteService.ts:27` falla con `TS2352`. Esta spec
  deja el build verde.

## Objetivo (una frase)

Convertir la ficha clínica del paciente en una vista de tres tabs — Home (datos
generales y signos vitales), Bioimpedancias y Electrocardiogramas — alimentada por la
forma real del payload del backend a través de un mapper de normalización.

## Alcance

### Dentro (In)

**Modelo de datos y normalización**
- Nuevas interfaces **fieles al payload real** en `interface/`: la respuesta cruda
  (`success` / `message` / `data.ficha_clinica`), el paciente base, la bioimpedancia
  (snake_case, mezcla de `number` y `null`) y el electrocardiograma (todo `string` o
  `null`).
- Nuevas interfaces del **modelo de UI** (camelCase, numérico, unidades normalizadas)
  que consumen los componentes.
- Mapper en `utilities/` que convierte cruda → UI: parsea strings a número, normaliza
  estatura a centímetros, resuelve `presionArterial` como diastólica, calcula la edad
  desde `fechaNacimiento` y ordena los exámenes por fecha descendente.
- Eliminar las interfaces obsoletas de la Spec 01 (`ISignosVitales`, `IAtencion`,
  `IPaciente`, `IPacienteResponse`).

**Datos mock**
- Ampliar `data/paciente.json` a **6 electrocardiogramas** y **5 bioimpedancias**,
  respetando exactamente las llaves y los tipos del backend real (incluido el campo
  `raw_json`).
- Reescribir el registro de bioimpedancia existente para que pertenezca a Mateo
  Camacho Moreno (hoy es de otro paciente: rut `16900918-k`, 38 años, 87 kg).

**Estructura de tabs**
- `pages/app-pacientes.tsx` pasa a ser el contenedor: hace el fetch, muestra el estado
  de carga, renderiza la cabecera y los tres `<Tab>` con `useState` local.
- Tres componentes de tab en `components/tabs/`, cada uno recibiendo datos ya
  normalizados por props (ninguno hace fetch propio).

**Tab Home**
- Datos generales del paciente + KPIs de signos vitales del electro más reciente +
  antecedentes clínicos + gauge de estado nutricional.
- Etiqueta visible con la fecha del snapshot ("al 24/04/2026"), para que no se lea como
  un dato de hoy.

**Tabs Bioimpedancias y Electrocardiogramas**
- Tabla con una fila por examen (`Table` + `Collapse` de MUI core) y detalle completo
  expandible, agrupado por categorías.
- Gráficos de evolución adaptados al nuevo modelo: peso/IMC en Bio; presión, saturación/FC
  y hemoglucotest en Electro.
- Estado vacío explícito cuando el array llega sin registros.

**Cierre**
- Actualizar los barriles `interface/index.ts`, `components/index.ts`,
  `services/index.ts` y `src/Paciente/index.ts`.
- Dejar `npm run build` (`tsc -b` + vite) en verde.

### Fuera (Not in) — para specs futuras

- **No se toca nada fuera de `src/Paciente/`.** Ni rutas, ni navegadores, ni `common/`.
- **No hay sub-rutas por tab** ni entradas nuevas en el menú del perfil Paciente. El tab
  no se sincroniza con la URL: un F5 vuelve a Home.
- **No se conecta el backend real.** El servicio sigue resolviendo el JSON local con
  `setTimeout`; solo se ajusta el tipo de retorno.
- **No se parsea `raw_json`.** Se tipa como `string` y se ignora.
- **No se renombra ninguna llave del payload** en el JSON: se respeta como llega.
- **No se muestra el `archivo` de la bioimpedancia** (`16900918K_2118.png`). Requiere una
  URL base de archivos que no existe en el front.
- **No se enlaza con el módulo Chequeo** por `id_chequeo`, aunque el dato esté ahí.
- **No hay CRUD**: la ficha es de solo lectura, sin crear, editar ni borrar exámenes.
- **No hay selector ni lista de pacientes**: una sola ficha fija.
- **No hay filtros, búsqueda ni paginación** en las tablas. Solo orden fijo por fecha
  descendente.
- **No hay exportación a PDF ni impresión** de la ficha.
- **No se usa `@mui/x-data-grid`** en esta spec.
- **No se agregan tabs** de certificados, chequeos ni incidentes.
- **No se instalan dependencias nuevas.**
- **No se agregan tests**: el proyecto no tiene runner configurado.

## Modelo de datos

### Capa 1 — Forma cruda del backend

Ubicación: `src/Paciente/interface/api.interface.ts`. Refleja el payload **exactamente**
como llega, typos incluidos. Ningún componente importa estos tipos: solo el mapper.

```typescript
// Bioimpedancia: numérica, snake_case, con nulls.
export interface IBioimpedanciaRaw {
    id                          : number;
    fecha_prueba                : string;        // 'YYYY-MM-DD'
    hora_prueba                 : string | null; // '18:18:08.000000'
    rut                         : string;
    nombre                      : string;
    edad                        : number;
    sexo                        : string;        // 'Hombre' | 'Mujer'
    club                        : string | null; // el mock trae un email aquí
    marca                       : string | null; // 'Fitdays'
    equipo                      : string | null;
    archivo                     : string | null; // PNG del equipo (no se usa)
    raw_json                    : string;        // payload duplicado (no se parsea)
    created_at                  : string;
    updated_at                  : string;
    observaciones               : string | null;

    // Antropometría y composición corporal
    peso_kg                     : number;
    estatura_cm                 : number;
    imc                         : number;
    grasa_corporal_pct          : number;
    masa_grasa_kg               : number;
    grasa_subcutanea_pct        : number;
    grasa_visceral              : number;
    masa_muscular_kg            : number;
    masa_musculo_esqueletico_kg : number;
    smi                         : number;
    proteinas_kg                : number;
    agua_corporal_total_kg      : number;
    peso_sin_grasa_kg           : number;
    whr                         : number;

    // Metabolismo y metas
    tasa_metabolica_basal_kcal  : number;
    edad_corporal               : number;
    puntaje_corporal            : number;
    peso_objetivo_kg            : number;
    control_peso_kg             : number;        // negativo = debe bajar
    tipo_corporal               : string;        // 'Obesidad' | 'Normal' | …
}

// Electrocardiograma: TODO llega como string o null, incluidos los números.
export interface IElectrocardiogramaRaw {
    id_electro                   : number;
    id_chequeo                   : number;
    rut_paciente                 : string;
    fecha_atencion               : string;        // '2026-04-24 04:00:00.000000'
    created_at_electro           : string;
    updated_at_electro           : string;

    // Antropometría (tres campos de IMC, solo uno viene poblado)
    peso                         : string | null;
    estatura                     : string | null; // '1.47' → METROS
    imc                          : string | null; // '' en el mock
    imc_electro                  : string | null; // null en el mock
    imc_paciente                 : string | null; // '17.1' ← el bueno

    // Signos vitales
    presion_sistolica            : string | null; // '107'
    presionArterial              : string | null; // '74' → es la DIASTÓLICA
    frecuencia_cardiaca_paciente : string | null; // '84'
    pulso                        : string | null; // null en el mock
    saturacionOxigeno            : string | null;
    hemoglucotest                : string | null;
    temperatura                  : string | null;
    edad                         : string | null; // congelada a la fecha del examen

    // Evaluación clínica
    status                       : string | null; // 'REVISION MEDICA'
    estado_paciente              : string | null; // 'Normal'
    derivacion_paciente          : string | null; // 'na'
    observacion_paciente         : string | null; // lectura del ECG, multilínea
    Recuperacion                 : string | null; // capital R: así llega
    sistemaCardiovascular        : string | null;
    sistemaOsteoarticular        : string | null;
    gradoIncidenciaPosterio      : string | null; // nombre truncado: así llega

    // Antecedentes (viven aquí, no en `paciente`)
    enfermedadesCronicas         : string | null;
    medicamentosDiarios          : string | null;
    enfermedadesAnteriores       : string | null;
}

export interface IPacienteRaw {
    rut             : string;
    nombre          : string;
    sexo            : string;
    fechaNacimiento : string;   // 'YYYY-MM-DD'
}

export interface IFichaClinicaResponse {
    success : boolean;
    message : string;
    data    : {
        ficha_clinica: {
            paciente            : IPacienteRaw;
            bioimpedancias      : IBioimpedanciaRaw[];
            electrocardiogramas : IElectrocardiogramaRaw[];
        };
    };
}
```

### Capa 2 — Modelo de UI

Ubicación: `src/Paciente/interface/ficha-clinica.interface.ts`. camelCase, numérico,
unidades ya normalizadas. Es lo que importan los componentes.

**Regla de nulabilidad:** todo campo numérico que el backend puede mandar como `''` o
`null` se tipa `number | null`. La UI renderiza `—` cuando es `null`. No se inventan
ceros: un cero en un signo vital es un dato clínico, no un dato ausente.

```typescript
export interface IAntecedentes {
    enfermedadesCronicas   : string | null;
    medicamentosDiarios    : string | null;
    enfermedadesAnteriores : string | null;
}

export interface IPacienteBase {
    rut             : string;
    nombre          : string;
    sexo            : string;
    fechaNacimiento : string;
    edad            : number;   // calculada a hoy desde fechaNacimiento
}

export interface IBioimpedancia {
    id                       : number;
    fecha                    : string;          // 'YYYY-MM-DD'
    hora                     : string | null;   // 'HH:mm'

    pesoKg                   : number | null;
    estaturaCm               : number | null;
    imc                      : number | null;

    grasaCorporalPct         : number | null;
    masaGrasaKg              : number | null;
    grasaSubcutaneaPct       : number | null;
    grasaVisceral            : number | null;
    masaMuscularKg           : number | null;
    masaMusculoEsqueleticoKg : number | null;
    smi                      : number | null;
    proteinasKg              : number | null;
    aguaCorporalTotalKg      : number | null;
    pesoSinGrasaKg           : number | null;
    whr                      : number | null;

    tasaMetabolicaBasalKcal  : number | null;
    edadCorporal             : number | null;
    puntajeCorporal          : number | null;
    pesoObjetivoKg           : number | null;
    controlPesoKg            : number | null;
    tipoCorporal             : string | null;

    marca                    : string | null;
    observaciones            : string | null;
}

export interface IElectrocardiograma {
    idElectro              : number;
    idChequeo              : number;
    fecha                  : string;          // 'YYYY-MM-DD'

    pesoKg                 : number | null;
    estaturaCm             : number | null;   // ya en cm
    imc                    : number | null;

    presionSistolica       : number | null;
    presionDiastolica      : number | null;
    frecuenciaCardiaca     : number | null;
    saturacionOxigeno      : number | null;
    hemoglucotest          : number | null;
    temperatura            : number | null;

    status                 : string | null;
    estadoPaciente         : string | null;
    derivacion             : string | null;
    observacion            : string | null;
    recuperacion           : string | null;
    sistemaCardiovascular  : string | null;
    sistemaOsteoarticular  : string | null;
    gradoIncidencia        : string | null;

    antecedentes           : IAntecedentes;
}

// Lo que la página recibe del servicio, ya normalizado.
export interface IFichaClinica {
    paciente            : IPacienteBase;
    bioimpedancias      : IBioimpedancia[];        // orden: fecha DESC
    electrocardiogramas : IElectrocardiograma[];   // orden: fecha DESC
}
```

### Capa 3 — Mapper y reglas de normalización

Ubicación: `src/Paciente/utilities/parse.ts` (helpers) y
`src/Paciente/utilities/mappers.ts` (mapper de la ficha).

```typescript
// parse.ts
export const aNumero      = (v: string | number | null) => number | null;
export const aFechaISO    = (v: string) => string;          // corta el timestamp
export const aCentimetros = (v: string | number | null) => number | null;
export const calcularEdad = (fechaNacimiento: string) => number;

// mappers.ts
export const mapFichaClinica = (raw: IFichaClinicaResponse): IFichaClinica;
```

| Regla | Entrada | Salida |
|---|---|---|
| String vacío y `null` son ausencia | `imc: ''`, `pulso: null` | `null` |
| Estatura a centímetros, unidad detectada por magnitud (`< 3` ⇒ metros) | `'1.47'` / `170` | `147` / `170` |
| `presionArterial` es la diastólica | `presion_sistolica: '107'`, `presionArterial: '74'` | `107` / `74` |
| IMC del electro: se prefiere `imc_paciente`, con fallback en cascada | `imc_paciente: '17.1'`, `imc: ''`, `imc_electro: null` | `17.1` |
| FC: se prefiere `frecuencia_cardiaca_paciente`, fallback a `pulso` | `'84'`, `null` | `84` |
| Fechas: se corta el timestamp a día | `'2026-04-24 04:00:00.000000'` | `'2026-04-24'` |
| Hora: se corta a minutos | `'18:18:08.000000'` | `'18:18'` |
| Edad: se calcula a hoy, se ignora la del examen | `fechaNacimiento: '2016-05-23'` | `10` |
| Orden: exámenes por fecha descendente (el más reciente primero) | — | — |
| Antecedentes: se agrupan bajo `antecedentes` en cada electro | 3 campos planos | `IAntecedentes` |
| `raw_json`, `archivo`, `club`, `equipo`, `edad`, `nombre`, `rut` del examen | — | descartados por el mapper |

**Snapshot de Home:** `electrocardiogramas[0]` (el más reciente tras el orden DESC). De
ahí salen los KPIs y los antecedentes, y su `fecha` se muestra como etiqueta del bloque.

## Plan de implementación

**Invariante de partida:** el build arranca **rojo** (`TS2352` en `UsePacienteService.ts:27`).
Los pasos 1 a 4 son puramente aditivos y no agregan ni un error nuevo. El **paso 5 es el
pivote**: deja el build verde. Del 5 al 13, cada paso mantiene `tsc -b` en verde y es
commiteable por separado.

Solo se tocan archivos dentro de `src/Paciente/`.

### Paso 1 — Interfaces crudas
- Crear `interface/api.interface.ts` con `IPacienteRaw`, `IBioimpedanciaRaw`,
  `IElectrocardiogramaRaw` e `IFichaClinicaResponse`.
- Reexportar desde `interface/index.ts`.
- Verificación: `npx tsc -b` sigue reportando **exactamente un** error (el preexistente).

### Paso 2 — Interfaces del modelo de UI
- Crear `interface/ficha-clinica.interface.ts` con `IAntecedentes`, `IPacienteBase`,
  `IBioimpedancia`, `IElectrocardiograma` e `IFichaClinica`.
- Reexportar desde `interface/index.ts`. **No** se borra `paciente.interface.ts` todavía.
- Verificación: mismo único error; los tipos nuevos son importables.

### Paso 3 — Helpers de parseo
- Crear `utilities/parse.ts`: `aNumero`, `aFechaISO`, `aHoraCorta`, `aCentimetros`,
  `calcularEdad`, y `primerValor` (fallback en cascada para los tres campos de IMC).
- `aNumero` devuelve `null` para `null`, `''` y `NaN`.
- Verificación: mismo único error.

### Paso 4 — Mapper de la ficha
- Crear `utilities/mappers.ts` con `mapFichaClinica(raw): IFichaClinica`, aplicando la
  tabla de reglas de normalización de la sección anterior.
- Ordena ambos arrays por fecha **DESC** y descarta `nombre` / `rut` / `edad` de cada examen.
- Crear `utilities/index.ts` (barril).
- Verificación: mismo único error.

### Paso 5 — Servicio + contenedor de tabs → **BUILD VERDE**
- `services/UsePacienteService.ts`: reemplazar `getPaciente` por
  `getFichaClinica(): Promise<IFichaClinica>`, que castea el JSON a
  `IFichaClinicaResponse`, lo pasa por `mapFichaClinica` y resuelve tras el `setTimeout`.
  Se conserva el `ApiAdapter` + `API` preparados y el comentario de migración.
- Reescribir `pages/app-pacientes.tsx` como contenedor: fetch, estado de carga,
  `Paper` + encabezado + `<Tabs>` con `useState(0)`, siguiendo el patrón de
  `home-bioimpefancia.tsx`. Iconos: `PersonIcon`, `MonitorWeightIcon`,
  `MonitorHeartIcon`. Las etiquetas muestran el conteo ("Bioimpedancias (5)").
- Los tres tabs renderizan un placeholder temporal por ahora.
- Los componentes de la Spec 01 quedan intactos y siguen compilando (sus interfaces
  todavía existen), pero dejan de estar montados.
- Verificación: `npm run build` **pasa**. Los tres tabs se navegan y muestran los conteos
  correctos del mock.

### Paso 6 — Ampliar los datos mock
- Reescribir `data/paciente.json` con **6 electrocardiogramas** y **5 bioimpedancias**,
  misma forma exacta del backend (mismas llaves, mismos tipos `string`/`number`/`null`,
  `raw_json` presente).
- Todos los registros pertenecen a Mateo Camacho Moreno (rut `2123456-7`, 10 años). El
  registro de bioimpedancia actual, que es de otro paciente adulto, se reescribe con
  valores propios de un niño de 10 años (~37 kg, IMC ~17).
- Fechas ascendentes entre 2025-08 y 2026-06, con evolución clínicamente coherente. Los
  dos registros actuales quedan como los más recientes (electro `2026-04-24`,
  bioimpedancia `2026-06-25`); los nuevos se agregan hacia atrás en el tiempo.
- Verificación: los conteos de los tabs muestran 5 y 6; el primer registro de cada array
  ordenado es el más reciente.

### Paso 7 — Adaptar los componentes de cabecera y antecedentes
- `PacienteHeader.tsx`: pasa a recibir `IPacienteBase`. **Se eliminan** los chips de
  `division`, `email`, `telefono` y `grupoSanguineo` (no existen en el payload). Quedan
  iniciales, nombre, rut, edad y sexo.
- `AntecedentesCard.tsx`: pasa a recibir `IAntecedentes`. **Se elimina** la fila de
  `alergias`. Los `null` se pintan como `—`.
- `KpiCard.tsx`: `valor` acepta `number | string | null` y renderiza `—` cuando es `null`.
- Verificación: build verde; los tres componentes compilan con los tipos nuevos.

### Paso 8 — Tab Home
- Crear `components/tabs/TabHome.tsx`: recibe `paciente: IPacienteBase` y
  `ultimoElectro: IElectrocardiograma | null`.
- Renderiza `PacienteHeader`, la fila de 8 `KpiCard` (peso, estatura, IMC, presión
  combinada `107/74`, FC, saturación, hemoglucotest, temperatura) con la etiqueta
  "Último control: 24/04/2026", y `AntecedentesCard`.
- **Caso degradado:** si no hay electros, muestra la cabecera y un aviso de que no hay
  controles registrados, sin KPIs vacíos.
- Montarlo en el tab 0 reemplazando el placeholder.
- Verificación: el tab Home muestra los KPIs del electro más reciente y la fecha del
  snapshot.

### Paso 9 — Gauge de estado nutricional en Home
- `charts/chart-utils.ts`: `clasificarIMC` acepta `number | null` y devuelve una categoría
  "Sin dato" cuando es `null`. La etiqueta del gráfico dice explícitamente
  **"IMC adulto (OMS)"**.
- `EstadoNutricionalChart.tsx`: prop `imc: number | null`, con estado vacío propio.
- Montarlo en Home dentro de un `ChartCard`.
- Verificación: el gauge refleja el IMC del último electro y su categoría.

### Paso 10 — Tab Bioimpedancias: tabla y detalle
- `charts/chart-utils.ts`: `buildLabels` pasa a ser genérico sobre `{ fecha: string }[]`.
- Crear `components/EmptyState.tsx`: mensaje + icono, reutilizable por ambos tabs.
- Crear `components/BioimpedanciaRow.tsx`: `TableRow` con fecha, IMC, peso, % grasa y
  tipo corporal, más `IconButton` que expande un `TableRow` con `Collapse` y el detalle
  agrupado en tres bloques (composición corporal, masa muscular, metabolismo y metas).
- Crear `components/tabs/TabBioimpedancias.tsx`: `Table` + `TableHead` + las filas, o
  `EmptyState` si el array está vacío.
- Montarlo en el tab 1.
- Verificación: 5 filas en orden descendente; cada fila expande y colapsa su detalle.

### Paso 11 — Gráfico de evolución en Bioimpedancias
- `PesoImcChart.tsx`: prop `bioimpedancias: IBioimpedancia[]`, leyendo `pesoKg` e `imc`.
  Invierte la copia del array para graficar en orden cronológico ascendente.
- Montarlo arriba de la tabla dentro de un `ChartCard`.
- Verificación: la línea de peso e IMC recorre las 5 fechas de izquierda (más antigua) a
  derecha (más reciente).

### Paso 12 — Tab Electrocardiogramas: tabla y detalle
- Crear `components/ElectroRow.tsx`: `TableRow` con fecha, presión `107/74`, FC,
  saturación y un `Chip` de color según `status` / `estadoPaciente`; expande a `Collapse`
  con la observación del ECG (respetando los saltos de línea de `observacion_paciente`) y
  las evaluaciones por sistema.
- Crear `components/tabs/TabElectrocardiogramas.tsx`: `Table` + filas, o `EmptyState`.
- Montarlo en el tab 2.
- Verificación: 6 filas en orden descendente; la lectura multilínea del ECG se ve con sus
  saltos de línea.

### Paso 13 — Gráficos de Electro, limpieza y cierre
- `PresionChart.tsx`, `SaturacionFcChart.tsx`, `HemoglucotestChart.tsx`: prop
  `electrocardiogramas: IElectrocardiograma[]`, orden cronológico ascendente,
  saltando los `null` con `spanGaps`.
- Montarlos arriba de la tabla del tab Electro.
- **Borrar `interface/paciente.interface.ts`** y su reexport: ya no lo usa nadie.
- Actualizar los barriles `components/index.ts` (tabs, filas, `EmptyState`) e
  `interface/index.ts`; `src/Paciente/index.ts` sigue exportando `AppPacientePages` lazy
  y ahora reexporta `utilities/`.
- Verificación: `npm run build` verde, `npm run lint` sin errores nuevos en
  `src/Paciente/`, y `git status` sin cambios fuera de `src/Paciente/`.

## Criterios de aceptación

Checklist booleana: cada ítem se verifica con sí o no.

### Build y alcance
- [ ] `npm run build` (`tsc -b` + vite) pasa sin errores. El `TS2352` de
      `UsePacienteService.ts` desapareció.
- [ ] `npm run lint` no introduce errores nuevos en `src/Paciente/`.
- [ ] `git status` / `git diff` no muestran cambios fuera de `src/Paciente/`.
- [ ] No se agregaron dependencias: `package.json` intacto.
- [ ] No hay ningún import de `@mui/x-data-grid` en `src/Paciente/`.

### Interfaces
- [ ] Existe `interface/api.interface.ts` con `IPacienteRaw`, `IBioimpedanciaRaw`,
      `IElectrocardiogramaRaw` e `IFichaClinicaResponse`.
- [ ] `IFichaClinicaResponse` declara las tres llaves de `ficha_clinica` con el mismo
      nombre que usa el backend: `paciente`, `bioimpedancias` y `electrocardiogramas`.
- [ ] Existe `interface/ficha-clinica.interface.ts` con `IAntecedentes`,
      `IPacienteBase`, `IBioimpedancia`, `IElectrocardiograma` e `IFichaClinica`.
- [ ] Todo campo numérico del modelo de UI se tipa `number | null`.
- [ ] `interface/paciente.interface.ts` fue **borrado**.
- [ ] Una búsqueda de `signosActuales`, `historial`, `IAtencion`, `ISignosVitales`,
      `IPaciente` e `IPacienteResponse` en `src/Paciente/` no arroja resultados.

### Mapper y normalización
- [ ] `aNumero('')` devuelve `null` y `aNumero(null)` devuelve `null`.
- [ ] `aCentimetros('1.47')` devuelve `147` y `aCentimetros(170)` devuelve `170`.
- [ ] `aFechaISO('2026-04-24 04:00:00.000000')` devuelve `'2026-04-24'`.
- [ ] `aHoraCorta('18:18:08.000000')` devuelve `'18:18'`.
- [ ] `calcularEdad('2016-05-23')` devuelve la edad a la fecha de hoy, no el `edad: '9'`
      del registro.
- [ ] El IMC del último electro se resuelve como `17.1` (viene de `imc_paciente`, con
      `imc: ''` e `imc_electro: null` descartados).
- [ ] La frecuencia cardíaca del último electro se resuelve como `84` (viene de
      `frecuencia_cardiaca_paciente`, con `pulso: null` descartado).
- [ ] `mapFichaClinica` devuelve ambos arrays ordenados por fecha descendente.
- [ ] No existe ningún `JSON.parse` en `src/Paciente/`: `raw_json` no se parsea.

### Datos mock
- [ ] `data/paciente.json` contiene 6 electrocardiogramas y 5 bioimpedancias.
- [ ] Todos los registros son de Mateo Camacho Moreno: ni "Nicolas Ruz Figueroa",
      ni el rut `16900918-k`, ni la edad `38` aparecen en el archivo.
- [ ] Cada registro conserva las mismas llaves y los mismos tipos
      (`string`/`number`/`null`) que el payload original, `raw_json` incluido.
- [ ] El electro más reciente y la bioimpedancia más reciente siguen siendo
      `2026-04-24` y `2026-06-25`.

### Servicio
- [ ] `UsePacienteService` expone `getFichaClinica(): Promise<IFichaClinica>` y ya no
      expone `getPaciente`.
- [ ] El servicio devuelve el JSON local tras un `setTimeout` y conserva el `ApiAdapter`
      instanciado, la `API` armada y el comentario de migración a backend real.

### Estructura de tabs
- [ ] `pages/app-pacientes.tsx` renderiza tres `<Tab>`: Home, Bioimpedancias y
      Electrocardiogramas, cada uno con su icono.
- [ ] El tab activo se controla con `useState` local; recargar la página vuelve a Home.
- [ ] Las etiquetas de los tabs Bio y Electro muestran el conteo de registros: `(5)` y `(6)`.
- [ ] Se muestra un estado de carga mientras la Promise del servicio resuelve.
- [ ] Existen `components/tabs/TabHome.tsx`, `TabBioimpedancias.tsx` y
      `TabElectrocardiogramas.tsx`, y ninguno hace fetch propio: todos reciben datos por props.

### Tab Home
- [ ] La cabecera muestra iniciales, nombre, rut, edad y sexo, y **ya no** muestra chips
      de división, email, teléfono ni grupo sanguíneo.
- [ ] Hay 8 tarjetas KPI: peso, estatura, IMC, presión, frecuencia cardíaca, saturación,
      hemoglucotest y temperatura.
- [ ] La presión se muestra combinada como `107/74 mmHg`.
- [ ] La estatura se muestra como `147 cm`, no como `1.47`.
- [ ] El bloque de KPIs muestra la fecha del control del que provienen (`24/04/2026`).
- [ ] Se muestra la tarjeta de antecedentes con enfermedades crónicas, medicamentos
      diarios y antecedentes anteriores, y **ya no** muestra alergias.
- [ ] Hay un gauge de estado nutricional cuya etiqueta dice explícitamente
      "IMC adulto (OMS)".
- [ ] Ningún KPI muestra `0` para un dato ausente: los `null` se pintan como `—`.

### Tab Bioimpedancias
- [ ] La tabla muestra 5 filas, la más reciente primero.
- [ ] Cada fila muestra fecha, IMC, peso, % de grasa corporal y tipo corporal.
- [ ] Al hacer click en el icono de una fila se expande su detalle y al volver a hacer
      click se colapsa.
- [ ] El detalle agrupa los campos en composición corporal, masa muscular y
      metabolismo/metas.
- [ ] No se muestra el nombre del archivo PNG del equipo en ninguna parte.
- [ ] Hay un gráfico de evolución de peso e IMC sobre las 5 fechas.

### Tab Electrocardiogramas
- [ ] La tabla muestra 6 filas, la más reciente primero.
- [ ] Cada fila muestra fecha, presión combinada, FC, saturación y un chip de estado.
- [ ] El detalle expandible muestra la lectura del ECG **respetando los saltos de línea**
      de `observacion_paciente` (las tres líneas del mock se ven como tres líneas).
- [ ] El detalle muestra las evaluaciones por sistema (cardiovascular, osteoarticular,
      recuperación, grado de incidencia).
- [ ] Hay gráficos de presión, saturación/FC y hemoglucotest sobre las 6 fechas.

### Orden temporal de los gráficos
- [ ] En todos los gráficos, la etiqueta del eje X más a la izquierda es la fecha **más
      antigua** y la más a la derecha la **más reciente** (inverso al orden de las tablas).

### Estados degradados
- [ ] Si `electrocardiogramas` llega vacío, Home muestra la cabecera y un aviso de que no
      hay controles registrados, sin tarjetas KPI vacías.
- [ ] Si `bioimpedancias` llega vacío, el tab Bio muestra el `EmptyState` y
      no una tabla sin filas ni un gráfico vacío.
- [ ] Si `electrocardiogramas` llega vacío, el tab Electro muestra el `EmptyState`.

### Responsive
- [ ] Los tres tabs se ven correctamente en móvil (360 px) y escritorio: las tablas
      scrollean horizontalmente en vez de desbordar la página.

## Decisiones tomadas y descartadas

### 1. Dos capas de interfaces separadas por un mapper
- *Por qué:* el payload real es sucio (strings numéricos, tres campos de IMC, nulls, un
  typo). Aislarlo en una capa cruda que nadie consume salvo el mapper significa que el día
  que se conecte el backend real no hay que retocar ni una interfaz ni un componente.
- *Descartado:* consumir la forma cruda directo en los componentes, parseando con
  `Number()` donde haga falta. Repartiría el parseo por toda la UI y cada componente
  tendría que decidir por su cuenta qué hacer con un `''`.
- *Descartado:* reescribir `data/paciente.json` a un modelo limpio. Cómodo hoy, pero el
  mock deja de parecerse al backend y el error se descubre en producción.

### 2. Fidelidad total al payload, defectos incluidos
- *Por qué:* las llaves se declaran con el nombre exacto que usa el backend y campos
  redundantes como `raw_json` se tipan aunque no se usen. El mock es el contrato con el
  backend: si lo "arreglamos" en el front, dejamos de tener forma de detectar que el
  contrato real es otro.
- *Descartado:* parsear `raw_json` como fallback de campos faltantes. Duplica la ruta de
  datos y multiplica la superficie de error para recuperar información que ya viene plana.
- *Corrección durante la implementación (paso 1):* la spec se escribió asumiendo que el
  backend enviaba la llave duplicada `bioimpedanciasbioimpedancias`, porque así estaba en
  el mock al momento de diseñar. Se confirmó que el contrato real es `bioimpedancias`: el
  typo era del mock. Se ajustaron la interfaz, el criterio de aceptación y esta decisión.
  El mapper ya no renombra la llave.

### 3. Ausencia de dato es `null`, y se pinta `—`
- *Por qué:* es la decisión más importante de la spec. En una ficha clínica, "0 mmHg" o
  "IMC 0" no es un dato faltante: es una afirmación falsa sobre un paciente. Tipar
  `number | null` obliga al compilador a exigir el manejo del caso en cada componente.
- *Descartado:* mapear ausencia a `0`. Simplifica los tipos y arruina el significado.

### 4. Reglas de desambiguación de los campos del electro
- *Por qué:* el payload trae tres campos de IMC (`imc: ''`, `imc_electro: null`,
  `imc_paciente: '17.1'`), dos de frecuencia cardíaca (`pulso: null`,
  `frecuencia_cardiaca_paciente: '84'`) y un `presionArterial: '74'` que por magnitud es
  la diastólica junto a `presion_sistolica: '107'`. Se resuelven con preferencia en
  cascada, todo documentado en la tabla de normalización.
- *Descartado:* pintar los campos crudos con su etiqueta literal sin interpretar. Cero
  riesgo de malinterpretar, pero la ficha mostraría tres IMC y ninguna presión legible.
- *Riesgo asumido:* la lectura de `presionArterial` como diastólica se basa en la magnitud
  del valor, no en documentación del backend. Ver sección de riesgos.

### 5. Estatura normalizada a centímetros detectando la unidad por magnitud
- *Por qué:* el electro manda metros (`'1.47'`) y la bioimpedancia centímetros (`170`).
  Un umbral (`< 3` ⇒ metros) absorbe ambas fuentes sin ramificar por tipo de examen y
  cubre todo el rango humano.
- *Descartado:* convertir según el origen del registro. Más explícito, pero deja de
  funcionar si el backend cambia la unidad de una de las dos fuentes.

### 6. `ficha_clinica.paciente` es la única fuente de verdad de la identidad
- *Por qué:* cada examen repite `nombre`, `rut` y `edad`, y en el mock actual esos campos
  **contradicen** al paciente de la ficha. El mapper los descarta.
- *Descartado:* mostrar los datos del paciente que trae cada examen. Haría que la tabla de
  bioimpedancias de Mateo mostrara "Nicolas Ruz, 38 años".

### 7. Los antecedentes salen del electro más reciente, con la fecha a la vista
- *Por qué:* no están en el objeto `paciente`; viven dentro de cada electro. El más
  reciente es la mejor aproximación disponible al estado actual, y la etiqueta de fecha
  ("Último control: 24/04/2026") evita que se lea como información de hoy.
- *Descartado:* moverlos al nivel de `paciente` en el JSON. Más limpio conceptualmente,
  pero se aparta de lo que devuelve el backend.

### 8. La edad se calcula a hoy desde `fechaNacimiento`
- *Por qué:* el campo `edad` de cada examen está congelado a la fecha en que se tomó
  (`'9'` en un examen de abril de un niño nacido en mayo de 2016).
- *Descartado:* usar el `edad` del registro. Fiel al examen, incorrecto como dato de ficha.

### 9. El tab activo vive en `useState` local
- *Por qué:* es el patrón que ya usa `home-bioimpefancia.tsx`, el ejemplo de referencia
  del proyecto. Consistencia sobre features.
- *Descartado:* sincronizar el tab con la URL para poder compartir el link y sobrevivir un
  F5. Más útil, pero introduce manejo de query params sin precedente en el módulo.

### 10. `Table` + `Collapse` de MUI core para el listado con detalle
- *Por qué:* el detail panel de `@mui/x-data-grid` es una feature Pro (pagada). El detalle
  expandible in-place mantiene el contexto de la tabla, que es lo que se quería.
- *Descartado:* `DataGrid` con el detalle en un `Drawer`. Trae filtros y orden de serie,
  pero saca el detalle de la página y agrega una dependencia visual innecesaria para 5 filas.

### 11. Los cinco gráficos se adaptan, no se borran
- *Por qué:* ya están escritos, registrados contra chart.js y estilados. Se reubican donde
  el dato realmente vive: peso/IMC en Bio, presión y saturación/FC y hemoglucotest en
  Electro, gauge nutricional en Home.
- *Descartado:* borrarlos y traerlos de vuelta en otra spec. Tiraría trabajo hecho.
- *Consecuencia:* el modelo entrega los exámenes en orden **descendente** (la tabla muestra
  el más reciente arriba) y los gráficos invierten la copia para graficar en orden
  cronológico. Se decidió no tener dos ordenamientos en el modelo para no duplicar arrays.

### 12. El mock se amplía a 6 electros y 5 bioimpedancias, y se sanea
- *Por qué:* con un registro por tipo no se puede evaluar visualmente ni la tabla ni un
  gráfico de evolución. Y el registro de bioimpedancia existente es de otro paciente
  (adulto de 38 años, 87 kg, "Obesidad") dentro de la ficha de un niño de 10.
- *Descartado:* dejar un registro de cada uno. La UI funcionaría, pero no habría forma de
  ver si funciona.
- *Descartado:* conservar el registro contaminado como está. Los valores de un adulto obeso
  en la ficha de un niño harían que cualquier revisión visual sea inútil.

### 13. Un componente por tab en `components/tabs/`, con la página como contenedor
- *Por qué:* `pages/app-pacientes.tsx` se queda con el fetch, el loading y los `<Tabs>`;
  cada tab recibe datos ya normalizados por props y no hace fetch propio. Mantiene el
  archivo de la página corto y cada tab revisable por separado en un diff.
- *Descartado:* todo inline en `app-pacientes.tsx`, como hace `home-bioimpefancia.tsx`.
  Fiel al patrón de referencia, pero ese archivo tiene tres tabs triviales y este tendría
  tablas, detalles y cuatro gráficos: crecería a varios cientos de líneas.
- *Descartado:* una página por tab en `pages/`. `pages/` dejaría de significar "vista
  ruteable".

### 14. El IMC se clasifica con cortes de adulto, y la UI lo declara
- *Por qué:* `clasificarIMC` usa los cortes OMS 18.5/25/30, que son de adulto. El paciente
  del mock tiene 10 años y el IMC pediátrico se evalúa por percentiles según edad y sexo.
  Etiquetar el gráfico como "IMC adulto (OMS)" es la forma honesta de mostrarlo sin
  afirmar algo clínicamente falso.
- *Descartado:* implementar percentiles pediátricos OMS. Requiere tablas por edad y sexo:
  es una spec propia.
- *Descartado:* dejar la etiqueta genérica "Estado nutricional". El gráfico diría
  "Sobrepeso" sobre un niño sin base para afirmarlo.

### 15. El paso 5 del plan es el pivote que devuelve el build a verde
- *Por qué:* la spec arranca con `tsc -b` en rojo. Poner el build verde temprano, con tabs
  placeholder y los componentes viejos aún intactos, permite que los ocho pasos siguientes
  se validen con el compilador de aliado.
- *Descartado:* adaptar todos los componentes y compilar al final. Ocho pasos a ciegas.

### 16. Regla dura heredada: solo se toca `src/Paciente/`
- *Por qué:* `routesPA.tsx` ya apunta a `AppPacientePages`, así que los tabs son internos a
  la página y no requieren rutas ni entradas de menú nuevas. Mantiene el mismo contrato de
  la Spec 01.
- *Descartado:* una sub-ruta por tab (`#/paciente/bioimpedancia`) con entradas en el menú
  del perfil Paciente. Más navegable, pero cambia la navegación y el filtrado por perfil de
  un sistema en producción.

## Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| **`presionArterial` no es la diastólica.** La interpretación se basa en la magnitud del valor (`'74'` junto a `presion_sistolica: '107'`), no en documentación del backend. Si en realidad es otra medición, la ficha muestra una presión arterial incorrecta. | La regla vive en **una sola línea del mapper** y está documentada en la tabla de normalización: corregirla es un cambio de una línea. Se confirma con el equipo de backend antes de conectar la API real. Es el único dato clínico de la ficha que depende de una inferencia. |
| **La detección de unidad de estatura por magnitud falla fuera del rango humano.** Si el backend empieza a mandar milímetros (`1470`), el umbral `< 3 ⇒ metros` lo deja pasar como 1470 cm. | El umbral está documentado y aislado en `aCentimetros`. El valor se muestra siempre con su unidad (`147 cm`), de modo que un error de escala es visible a simple vista en el KPI y en la tabla. |
| **Alguna de las llaves de `ficha_clinica` cambia de nombre en el backend.** El array llegaría `undefined` y el tab quedaría en cero sin ningún error visible. Ya pasó una vez: el mock traía `bioimpedanciasbioimpedancias` y el contrato real es `bioimpedancias`. | El mapper resuelve ambos arrays con `?? []`, así que nunca revienta, y el `EmptyState` del tab correspondiente hace visible el caso "no hay registros" en lugar de mostrar una tabla vacía indistinguible de un fallo. |
| **El `as IFichaClinicaResponse` sobre el JSON importado es un punto ciego.** Si el mock diverge de la interfaz, el cast puede ocultarlo. | Se usa un `as` **directo**, nunca `as unknown as`. TypeScript sigue exigiendo solapamiento entre el tipo inferido del JSON y la interfaz: una divergencia aparece como error de compilación, que es exactamente cómo se descubrió el `TS2352` que esta spec viene a arreglar. |
| **Los cortes de IMC son de adulto sobre un paciente pediátrico.** El gauge puede clasificar a un niño de 10 años con una categoría que no le corresponde. | La etiqueta del gráfico dice explícitamente "IMC adulto (OMS)". Los percentiles pediátricos por edad y sexo quedan como spec futura. Ningún otro componente de la ficha emite juicio clínico derivado. |
| **El mock ampliado contiene 11 registros clínicos inventados.** Un screenshot de la ficha es indistinguible de datos reales de un paciente. | Los datos viven en `data/paciente.json` dentro del módulo, y el servicio conserva el comentario que marca la latencia simulada y la ruta de migración a backend real. No se agrega ningún aviso en pantalla: la spec asume que este es un mock de desarrollo, no una demo para terceros. |
| **El mapper es la pieza con más lógica del módulo y el proyecto no tiene runner de tests.** Un error de conversión no lo detecta nada automático. | Los helpers de `utilities/parse.ts` son funciones puras y aisladas, listas para testear el día que exista runner. Mientras tanto, ocho criterios de aceptación están redactados como aserciones concretas de entrada/salida (`aCentimetros('1.47')` → `147`) verificables a mano. |
| **Home depende de `electrocardiogramas[0]`.** Si un registro trae `fecha_atencion` vacía o inválida, el orden se vuelve impredecible y Home podría mostrar el snapshot equivocado. | `aFechaISO` devuelve `''` para una fecha inválida y el ordenamiento manda esos registros al final del array, de modo que nunca ganan la posición 0. Home muestra siempre la fecha del snapshot, así que un orden incorrecto es visible en pantalla. |

## Lo que **no** entra en esta spec

- Sub-rutas por tab y entradas de menú en el perfil Paciente.
- Sincronizar el tab activo con la URL.
- Conexión al backend real (sigue siendo el JSON local con `setTimeout`).
- Parseo de `raw_json` y visualización del PNG del equipo.
- Enlace con el módulo Chequeo por `id_chequeo`.
- CRUD de exámenes: la ficha es de solo lectura.
- Selector o lista de pacientes.
- Filtros, búsqueda y paginación en las tablas.
- Exportación a PDF o impresión de la ficha.
- Percentiles pediátricos de IMC.
- Tabs de certificados, chequeos o incidentes.
- Tests: el proyecto no tiene runner configurado.

Cada uno de esos, si entra, va en su propia spec.
