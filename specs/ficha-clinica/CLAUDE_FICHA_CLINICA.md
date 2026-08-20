# CLAUDE_FICHA_CLINICA.md — Guía del módulo `src/ficha-clinica/`

Documento de referencia para trabajar sobre el módulo Paciente (ficha clínica). Recoge
lo que las cuatro specs decidieron, por qué, y qué **no** hay que romper.

> **Lee esto antes de tocar `src/ficha-clinica/`.** Las specs individuales
> (`01-`, `02-`, `03-`, `04-`) tienen el detalle de cada iteración; este archivo es el
> estado consolidado.

**Última actualización:** 2026-08-20 (cierre de la Spec 04)

---

## Reglas duras del módulo

Se heredan desde la Spec 01 y aplican a toda la evolución del módulo:

1. **No se toca nada fuera de `src/ficha-clinica/`.** Ni rutas, ni navegadores, ni `common/`.
   La única excepción histórica es `src/routes/routesPA.tsx`, que ya apunta al módulo y
   no ha necesitado cambios. *Importar* de `common/` (el `ApiAdapter`, el `LoginContext`)
   sí está permitido: es lectura, no modificación.
2. **La ficha es de solo lectura.** No hay CRUD: ni crear, ni editar, ni borrar exámenes.
3. **Un solo paciente.** No hay selector ni listado; la ficha es fija.
4. **Sin dependencias nuevas.** Todo se resuelve con lo que ya está en `package.json`
   (MUI 5, chart.js, react-chartjs-2).
5. **`src/AsistenteVirtual/`, `src/presentation/` y `src/asistente-voz/` quedan intactas.**
   Regla de la Spec 04, pedida explícitamente. El chat de la ficha es un **clon**; si algo
   del chat hay que cambiar, se cambia la copia del módulo.
6. **Sin tests.** El proyecto no tiene runner configurado. No inventes comandos de test.
7. **`npm run build` debe quedar en verde.** `tsc -b` corre antes de Vite; un cambio que
   no tipa no compila.

---

## Estado actual

| Spec | Título | Estado |
|------|--------|--------|
| 01 | Módulo Paciente (Ficha Clínica) | Approved → superada por la 02 |
| 02 | Ficha Clínica con Tabs | Implementado |
| 03 | Tab «Distribución Segmentaria» con silueta SVG | Código implementado; falta verificar en navegador |
| 04 | Tab «Asistente Ergo» con chat GPT autoconsultado | Código implementado; falta verificar en navegador |

Las specs 03 y 04 siguen marcadas **`Aprobado`** en su encabezado a propósito: el paso a
`Implementado` lo hace el humano tras comprobar los criterios en el navegador, no el agente.

La ficha tiene hoy **cinco tabs**: Home · Bioimpedancias · Electrocardiogramas ·
Distribución Segmentaria · Asistente Ergo.

**El servicio ya consume el backend real** (`USAR_MOCK = false`); el JSON local quedó como
camino alternativo para desarrollar sin backend. Ver «Servicio», más abajo.

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

Al margen de las tres capas está `interface/asistente.interface.ts` (Spec 04):
`IMensajeChat` e `IRespuestaAsistente` **no pasan por el mapper** porque no son ficha
clínica — el endpoint del asistente responde texto.

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
> medición, no un vacío. La regla se repite en todas las specs del módulo y es la más
> fácil de romper por descuido.

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
│   ├── asistente.interface.ts    chat (Spec 04) — fuera de las tres capas
│   └── index.ts
│
├── services/
│   ├── UsePacienteService.ts     GET /ficha-clinica/{rut} (o el JSON local con USAR_MOCK)
│   └── UseAsistenteService.ts    POST /sam-assistant/… (Spec 04)
│
├── hooks/
│   └── useReconocimientoVoz.ts   clon del hook de voz (es-CL) — Spec 04
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
    │                             TabAsistenteErgo
    ├── asistente/                (Spec 04)
    │   ├── BurbujaGpt · BurbujaUsuario   burbujas del chat
    │   ├── CajaMensaje           input + micrófono (sin «cambiar paciente»)
    │   └── LoaderEscribiendo     tres CircularProgress
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

**~5.680 líneas** de TS/TSX en el módulo.

---

## Patrones que hay que seguir

### La página es el único que hace fetch

`pages/app-pacientes.tsx` pide la ficha, muestra el estado de carga y reparte los datos
**ya normalizados** a cada tab por props. Ningún tab ni componente hace fetch **de la
ficha**. Si agregas un tab, sigue ese patrón.

La única excepción es `TabAsistenteErgo`, que llama al endpoint del chat. No rompe la
regla: recibe la ficha por props como todos y lo que pide es otra cosa —conversación, no
datos clínicos—, imposible de resolver en el fetch inicial sin gastar una llamada a GPT
aunque nadie abra el tab.

### Servicio

`UsePacienteService` sigue el patrón `UseXService` del proyecto (ver
`src/Chequeo/services/`) y **ya apunta al backend real**:
`GET {VITE_API}{VITE_API_PATH}/ficha-clinica/{rut}`.

La bandera `USAR_MOCK` (hoy `false`) alterna entre la petición HTTP y el JSON local con
latencia simulada. **Los dos caminos son código real y `tsc -b` los type-checkea**: por eso
la llamada no está comentada — un comentario no compila y el que hubo ahí llevaba la ruta
equivocada sin que nadie se enterara.

⚠️ **`data/paciente.json` no es la respuesta de un solo RUT.** Es un compuesto armado a
mano para tener los cuatro primeros tabs poblados a la vez. Verificado contra el backend:

| RUT | Respuesta real |
|---|---|
| `16900918-k` | paciente con `nombre`/`sexo`/`fechaNacimiento` en `null`, `bioimpedancias: array(1)`, `electrocardiogramas: null` |
| `2123456-7` | paciente completo, `bioimpedancias: null`, `electrocardiogramas: array(6)` |
| inexistente | HTTP 500 con `{success:false, message:"…"}` |

Ningún RUT real devuelve los dos tipos de examen juntos, y las listas llegan `null`, no
`[]`. El mapper cubre las tres formas.

`UseAsistenteService` (Spec 04) sigue el mismo patrón contra
`POST {API}/sam-assistant/as-question` y `POST {API}/sam-assistant/reset-patient`.

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

**El paciente del mock tiene 9–10 años** (contra el backend real la edad varía: el RUT de
respaldo `16900918-k` es un adulto). Los cortes de adulto no son válidos en pediatría,
donde se evalúa por percentiles según edad y sexo, y el módulo no sabe de antemano con
qué edad le van a llegar los datos. La UI está **obligada** a
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

## El chat «Asistente Ergo» (Spec 04)

### Es un clon, y eso es deliberado

El chat vive en `components/asistente/` + `hooks/useReconocimientoVoz.ts` +
`services/UseAsistenteService.ts`, copiado de `src/presentation/`. **No se importa nada de
`src/presentation/`, `src/AsistenteVirtual/` ni `src/asistente-voz/`**: la regla dura del
módulo lo prohíbe y el usuario lo pidió explícito. Se paga duplicación a cambio de que el
tab quede inmune a cambios en el asistente global, que tiene otro dueño y otro ritmo.

Unificar ambos chats en un componente compartido es el refactor correcto, pero toca
`src/presentation/` y por tanto es **otra spec**. Está asumido y documentado, no es un
pendiente silencioso.

### Autoconsulta del RUT

Al montarse el tab por primera vez envía `paciente.rut` **a secas** como prompt, sin frase
envolvente: es literalmente lo que el asistente pide hoy por pantalla, y cualquier adorno
arriesga no matchear su parser.

- **El envío es silencioso**: no se pinta burbuja de usuario con el RUT. El usuario no
  escribió eso; fingir que sí simula una acción que no ocurrió.
- **Guarda de ejecución única** (`useRef`): `StrictMode` está activo, así que sin ella el
  RUT saldría duplicado en cada apertura en desarrollo.
- **El RUT sale de las props**, no de `user.rut_paciente` del `LoginContext`. Dos fuentes de
  verdad para el mismo dato terminan desalineándose, y así el chat consulta siempre al
  mismo paciente que la ficha está mostrando.
- Sin RUT, no hay consulta automática: la caja de texto queda habilitada y una burbuja
  explica que se puede indicar el paciente a mano.

### Clave de sesión propia

```
ficha_chat_session_id     ← la ficha
chat_session_id           ← el asistente global (NO se toca)
```

Separadas a propósito. Si compartieran clave, un hilo abierto en el asistente virtual con
**otro** paciente contaminaría el contexto de la ficha y el chat respondería sobre alguien
que no es el de la pantalla.

### Lo que se quitó del original

- **El botón naranja «Consultar por otro paciente».** El módulo tiene un solo paciente por
  regla dura; ese botón podía dejar el chat hablando de otra persona. `reiniciarPaciente()`
  sigue existiendo en el servicio (paridad con el contrato del backend), pero ningún
  componente lo llama.
- **`terminator.gif`** como loader: 300×300 px dentro de un panel de 400 px de alto. Se
  reemplazó por los tres `CircularProgress`.

### Ciclo de vida

El historial vive en `useState` del tab. Cambiar de tab y volver **no** reenvía el RUT;
un F5 vuelve a Home y la conversación empieza de cero. Si la respuesta llega con el tab
desmontado, se pierde: aceptado.

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

Ambos verificados en verde el 2026-08-20, ya con el tab «Asistente Ergo» dentro.

Cifras de referencia con el mock actual (bioimpedancia del 25/06/2026, `masaGrasaKg: 6.8`):

- Tronco: `3.4 kg`, `50.4 % del total`
- Los cinco porcentajes suman 100 %
- Delta de tronco en músculo, comparando con 17/10/2025: `▲ +1.11 kg`
- Delta de grasa entre esos dos exámenes: `0.00 kg` (ambos traen 6.8)

⚠️ **Los dos endpoints no comparten base de pacientes** (verificado el 2026-08-20 contra
el backend local `http://127.0.0.1:8000/api`):

| RUT | `GET /ficha-clinica/{rut}` | `POST /sam-assistant/as-question` |
|---|---|---|
| `16900918-k` (= `RUT_DEMO`) | 200 | `patient: null`, `status: "needs_identifier"` |
| `2123456-7` | 200 | reconocido → responde sobre el paciente |

Con `RUT_DEMO` el tab «Asistente Ergo» contesta «No encontré información del paciente»:
**ése es el comportamiento correcto del front ante esa respuesta, no un bug.** Para probar
el camino feliz hay que entrar con `2123456-7`. Las pruebas HTTP van con PowerShell
(`Invoke-WebRequest`); el sandbox de Bash bloquea las salientes y devuelve `HTTP 000`, que
se confunde con un backend caído.

**Pendiente de verificación en navegador** (requiere sesión con perfil `Paciente`):

- Spec 03: hover, click para fijar, segundo click para cerrar, click en callout, y el
  responsive a 360 px.
- Spec 04: que al abrir el tab salga el loader **sin** burbuja de usuario con el RUT, que
  el micrófono alterne `MicIcon`/`MicOffIcon`, que «Reintentar» reenvíe el mismo prompt y
  que `localStorage` gane `ficha_chat_session_id` sin tocar `chat_session_id`.

---

## Qué NO está en el módulo

Cada una de estas, si entra alguna vez, va en su propia spec:

- Parseo de `raw_json`.
- Tablas de referencia pediátricas por edad y sexo.
- Cortes de normalidad por segmento.
- Campos segmentarios medidos en el contrato del backend.
- Vista dorsal, siluetas por sexo o por edad.
- Agua corporal como tercera métrica del toggle.
- Coloreado por variación en lugar de por estado clínico.
- Exportación a PDF/PNG e impresión de la ficha.
- Sincronización del tab con la URL.
- Unificar el chat clonado con el asistente global en un componente compartido.
- Persistir el historial del chat entre recargas o sesiones.
- Pasar los datos ya cargados de la ficha (bioimpedancias, electros) como contexto del
  prompt: hoy el backend resuelve la ficha por su cuenta a partir del RUT.
- Streaming de la respuesta token a token, text-to-speech y cambiar de paciente desde el chat.
- Enlace con el módulo Chequeo por `id_chequeo` (el dato está ahí).
- Visualización del `archivo` PNG de la bioimpedancia (falta URL base).
- Filtros, búsqueda o paginación en las tablas.
- `@mui/x-data-grid` en este módulo.
- CRUD, selector de pacientes, tests.

---

## Trabajar con `/spec` y `/spec-impl`

El módulo se construyó con el flujo spec-driven del proyecto:

1. `/spec <descripción>` → diseña por fases, guarda en `specs/ficha-clinica/NN-slug.md` en
   estado `Borrador`. **Nunca escribe código.**
2. Revisas y cambias el estado a `Aprobado` **a mano**. El agente no lo hace por ti.
3. `/spec-impl NN-slug` → crea la rama `spec-NN-slug` e implementa paso a paso, con
   pausa después de cada uno para revisar el diff.
4. Al terminar y verificar los criterios, cambias el estado a `Implementado` y commiteas.

Una spec que resulta equivocada durante la implementación **se corrige en la spec**, no
en el código por sorpresa. Ejemplo real: la Spec 03 declaraba un delta de `+1.10 kg` y
la aritmética daba `+1.11`; se corrigió el criterio en el `.md`.

> La carpeta se llamó `specs/paciente/` hasta el 2026-08-20, y esta guía,
> `CLAUDE_PACIENTE.md`. Se renombraron a `specs/ficha-clinica/` y
> `CLAUDE_FICHA_CLINICA.md` para que coincidan con el nombre del módulo. Las specs 01–03
> mencionan `src/Paciente/` en sus encabezados: es el nombre viejo de
> `src/ficha-clinica/`, se deja como quedó escrito.
