# Spec 01 — Módulo Paciente (Ficha Clínica)

- **Estado:** Implementado
- **Fecha:** 2026-07-20
- **Dependencias:** ninguna (reutiliza `common/api/api.adapter.ts` y patrones de `Chequeo` y `Estadisticas`)
- **Área afectada:** exclusivamente `src/Paciente/` (regla dura: no se toca ninguna otra carpeta)

## Objetivo (una frase)

Convertir el módulo `src/Paciente/` en una ficha clínica visual y elegante de un paciente mock, alimentada por un JSON local que un servicio devuelve simulando una petición HTTP, con gráficos de evolución basados en react-chartjs-2.

## Alcance

### Dentro (In)
- Reestructurar `src/Paciente/` con la estructura estándar de módulo: `components/`, `interface/`, `services/`, `data/`, `pages/`, `index.ts`.
- Crear `data/paciente.json` con la ficha de un paciente mock, incluyendo su historial de atenciones (series temporales).
- Crear el servicio `services/UsePacienteService.ts` que importa el JSON local y lo devuelve en una `Promise` con `setTimeout` (simula latencia HTTP), siguiendo el patrón `UseXService` + `ApiAdapter`.
- Definir las interfaces TS del paciente y su historial en `interface/`.
- Construir la página de ficha clínica (`pages/app-pacientes.tsx`) que reemplaza el gif del corazón: cabecera con datos del paciente, tarjetas KPI de últimos signos vitales, y gráficos de evolución con react-chartjs-2.
- Componentes reutilizables en `components/` (cabecera, tarjeta KPI, tarjetas de gráfico).
- Reexportar todo desde el `index.ts` de barril del módulo.

### Fuera (Not in)
- **No se modifica ninguna carpeta fuera de `src/Paciente/`** (ni rutas, ni navegadores, ni `common/`, ni Chequeo/Estadisticas). La ruta `routesPA.tsx` ya apunta a `AppPacientePages`, así que no requiere cambios.
- No hay backend real ni endpoint HTTP: la petición se simula 100% en el front.
- No hay edición/creación/borrado del paciente (solo lectura de la ficha).
- No hay selector ni lista de pacientes: una sola ficha fija.
- No se agrega login ni control de permisos nuevo.
- No se instalan dependencias nuevas (react-chartjs-2 y chart.js ya están en el proyecto).

## Modelo de datos

Ubicación: `src/Paciente/interface/paciente.interface.ts` (reexportado por `interface/index.ts`). Nombres basados en los campos de `IChequeo` pero normalizados a tipos correctos (números para poder graficar) y con un array de historial para las series temporales.

```typescript
// interface/paciente.interface.ts

// Snapshot de signos vitales (valores numéricos para graficar)
export interface ISignosVitales {
    peso                : number;  // kg
    estatura            : number;  // cm
    imc                 : number;
    presionSistolica    : number;  // mmHg
    presionDiastolica   : number;  // mmHg
    saturacionOxigeno   : number;  // %
    frecuenciaCardiaca  : number;  // ppm
    hemoglucotest       : number;  // mg/dL
    temperatura         : number;  // °C
}

// Una atención en el tiempo = snapshot + fecha (eje X de los gráficos)
export interface IAtencion extends ISignosVitales {
    fecha        : string;   // ISO 'YYYY-MM-DD'
    observacion? : string;
}

// Ficha clínica completa del paciente
export interface IPaciente {
    id                     : number;
    rut                    : string;
    nombre                 : string;
    fechaNacimiento        : string;   // ISO
    edad                   : number;
    sexo                   : string;   // 'Masculino' | 'Femenino'
    email                  : string;
    telefono?              : string;
    division               : string;   // categoría / club deportivo
    grupoSanguineo?        : string;

    // Antecedentes clínicos
    enfermedadesCronicas   : string;
    medicamentosDiarios    : string;
    enfermedadesAnteriores : string;
    alergias?              : string;

    // Último control (tarjetas KPI)
    signosActuales         : ISignosVitales;

    // Historial para gráficos de evolución
    historial              : IAtencion[];
}

// Envoltura que devuelve el servicio (simula respuesta HTTP)
export interface IPacienteResponse {
    status  : number;    // 200
    mensaje : string;
    data    : IPaciente;
}
```

**Notas de diseño:**
- `signosActuales` alimenta las **tarjetas KPI** (último valor de cada signo).
- `historial: IAtencion[]` (varias fechas) alimenta los **gráficos de evolución**: `fecha` → eje X; cada métrica → eje Y.
- `IPacienteResponse` es lo que el servicio resuelve en la `Promise` con `setTimeout`, imitando el `{ status, mensaje, data }` que ya usan otros módulos (ej. `IDataAll` de Chequeo).

## Plan de implementación

Cada paso deja el módulo compilando (`npm run build` = `tsc -b` + vite). Solo se tocan archivos dentro de `src/Paciente/`.

### Paso 1 — Interfaces
- Crear `interface/paciente.interface.ts` con `ISignosVitales`, `IAtencion`, `IPaciente`, `IPacienteResponse`.
- Crear/actualizar `interface/index.ts` (barril) que reexporta las interfaces.
- Verificación: `tsc -b` no rompe; los tipos son importables desde `../interface`.

### Paso 2 — Datos mock
- Crear `data/paciente.json` con un paciente completo:
  - Datos demográficos + antecedentes clínicos.
  - `signosActuales` con el último control.
  - `historial` con 6–8 atenciones en fechas ascendentes (evolución realista de peso, IMC, presión, saturación, FC, hemoglucotest, temperatura).
- El JSON debe tipar contra `IPacienteResponse` (`{ status, mensaje, data }`).
- Verificación: import del JSON compila y calza con la interfaz.

### Paso 3 — Servicio (simulación HTTP)
- Crear `services/UsePacienteService.ts` siguiendo el patrón `UseXService`:
  - Instancia `new ApiAdapter()` y arma `API = ${VITE_API}${VITE_API_PATH}` (queda listo, aunque no se llame aún).
  - Método `getPaciente(): Promise<IPacienteResponse>` que importa `data/paciente.json` y lo resuelve en una `Promise` con `setTimeout` (~400–800 ms) para simular latencia.
  - Comentario que indique cómo cambiar a la llamada real (`apiAdapter.get(...)`) cuando exista backend.
- Crear/actualizar `services/index.ts` (barril).
- Verificación: `getPaciente()` resuelve el objeto tipado tras la latencia simulada.

### Paso 4 — Componentes reutilizables
- Crear en `components/`:
  - `PacienteHeader.tsx` — cabecera con avatar/iniciales, nombre, rut, edad, sexo, división, grupo sanguíneo.
  - `KpiCard.tsx` — tarjeta de un signo vital (label, valor, unidad, ícono/color según estado).
  - `ChartCard.tsx` — envoltura `Card` de MUI reutilizable para cada gráfico (título + contenedor), al estilo `pie-chart-IMC.tsx`.
  - `AntecedentesCard.tsx` — tarjeta con enfermedades crónicas, medicamentos, antecedentes, alergias.
- Crear `components/index.ts` (barril).
- Verificación: componentes compilan y son importables; cada uno recibe props tipadas.

### Paso 5 — Gráficos (react-chartjs-2)
- Dentro de `components/` (o `components/charts/`), crear los gráficos registrando los elementos de `chart.js` como en Estadísticas:
  - Línea: evolución de **peso** e **IMC**.
  - Línea (2 series): **presión sistólica vs diastólica**.
  - Línea/área: **saturación O₂** y **frecuencia cardíaca**.
  - Barras: **hemoglucotest** por fecha.
  - Dona/gauge: **estado nutricional** según IMC actual.
- Todos reciben el `historial` / `signosActuales` por props (no hacen fetch propio).
- Verificación: los gráficos renderizan con los datos del historial.

### Paso 6 — Página ficha clínica
- Reescribir `pages/app-pacientes.tsx` (`AppPacientePages`) para que:
  - Use estado local + `useEffect` que llama a `getPaciente()` (patrón de Estadísticas: `useCallback` + `useState`).
  - Muestre un estado de **carga** (spinner/skeleton) mientras la Promise resuelve.
  - Renderice: `PacienteHeader` → fila de `KpiCard` (signos actuales) → grid de `ChartCard` con los gráficos → `AntecedentesCard`.
  - Layout responsivo con `Grid`/`Box` de MUI, tarjetas con bordes redondeados y sombra (estética de Estadísticas).
- Verificación: al entrar como perfil Paciente, se ve la ficha completa; ya no aparece el gif.

### Paso 7 — Barril del módulo
- Actualizar `src/Paciente/index.ts` para reexportar `AppPacientePages` (lazy, ya existente) y lo que corresponda del módulo, sin romper el import de `routesPA.tsx`.
- Verificación: `npm run build` completo pasa; `routesPA.tsx` sigue importando `AppPacientePages` sin cambios.

## Criterios de aceptación

Checklist booleana (cada ítem es verificable con sí/no):

### Estructura
- [ ] Existe `src/Paciente/` con las carpetas `components/`, `interface/`, `services/`, `data/`, `pages/` y un `index.ts` de barril.
- [ ] No se modificó ningún archivo fuera de `src/Paciente/` (git diff limitado a esa carpeta).

### Datos y servicio
- [ ] Existe `data/paciente.json` con un paciente que incluye `signosActuales` y un `historial` de al menos 6 atenciones con fechas ascendentes.
- [ ] El JSON valida contra `IPacienteResponse` (`{ status, mensaje, data }`) sin errores de tipo.
- [ ] `services/UsePacienteService.ts` expone `getPaciente(): Promise<IPacienteResponse>` que devuelve el JSON local tras un `setTimeout` (latencia simulada).
- [ ] El servicio instancia `ApiAdapter` y arma `API = ${VITE_API}${VITE_API_PATH}`, con un comentario indicando cómo migrar a la llamada HTTP real.

### Interfaces
- [ ] `interface/paciente.interface.ts` define `ISignosVitales`, `IAtencion`, `IPaciente`, `IPacienteResponse` y se reexportan desde `interface/index.ts`.

### UI / Ficha
- [ ] Al entrar como perfil Paciente ya NO se muestra el gif del corazón, sino la ficha clínica.
- [ ] Se muestra un estado de carga mientras la Promise del servicio resuelve.
- [ ] La cabecera muestra nombre, rut, edad, sexo y división del paciente.
- [ ] Hay una fila de tarjetas KPI con los signos vitales actuales (peso, IMC, presión, saturación, FC, hemoglucotest, temperatura).
- [ ] Se muestra una tarjeta de antecedentes (enfermedades crónicas, medicamentos, antecedentes, alergias).

### Gráficos
- [ ] Se renderizan gráficos de evolución con react-chartjs-2 alimentados por `historial`: al menos peso/IMC, presión (sistólica y diastólica) y saturación/FC.
- [ ] Hay un gráfico de estado nutricional (dona/gauge) basado en el IMC actual.
- [ ] Los gráficos reciben datos por props y no hacen fetch propio.

### Build
- [ ] `npm run build` (`tsc -b` + vite) pasa sin errores de tipo.
- [ ] `npm run lint` no introduce nuevos errores en `src/Paciente/`.
- [ ] El layout es responsivo (se ve correcto en móvil y escritorio).

## Decisiones tomadas y descartadas

### Tomadas

1. **Una sola ficha de paciente fijo (mock).**
   - *Por qué:* el objetivo es simular una ficha clínica bonita, no un CRUD. Reduce complejidad y foco en la parte visual.
   - *Descartado:* lista/selector de varios pacientes con navegación a cada ficha (queda fuera de scope; sería otra spec si se necesita).

2. **Simulación HTTP importando el JSON local + `setTimeout`.**
   - *Por qué:* funciona 100% sin backend, respeta el patrón `UseXService`, y deja el `ApiAdapter` preparado para migrar a la llamada real.
   - *Descartado:* llamar de verdad al `ApiAdapter.get(...)` contra un endpoint o servir el JSON desde `public/` — requeriría backend o tocar configuración fuera del módulo.

3. **Historial de atenciones (series temporales) en el JSON.**
   - *Por qué:* `IChequeo` solo tiene un valor por métrica; sin historial no hay gráficos de evolución. El array `historial: IAtencion[]` habilita gráficos de línea/barras a lo largo del tiempo.
   - *Descartado:* graficar solo el estado actual (limitaría los gráficos a donas/gauges).

4. **Tipos numéricos en el modelo (no strings como `IChequeo`).**
   - *Por qué:* chart.js necesita números; normalizar en la interfaz evita parseos repetidos en la UI.
   - *Descartado:* reutilizar `IChequeo` tal cual (sus campos son `string` y opcionales, incómodos para graficar).

5. **Regla dura: solo se toca `src/Paciente/`.**
   - *Por qué:* requisito explícito del usuario; `routesPA.tsx` ya apunta a `AppPacientePages`, así que no hace falta tocar rutas ni navegadores.
   - *Descartado:* agregar sub-rutas o entradas de menú nuevas.

6. **Reutilizar la estética de Estadísticas (Cards MUI con bordes redondeados y sombra).**
   - *Por qué:* consistencia visual con el resto de la app y patrón ya probado en `pie-chart-IMC.tsx`.
   - *Descartado:* introducir una librería de UI o sistema de diseño nuevo.
