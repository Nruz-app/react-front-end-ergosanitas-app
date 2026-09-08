# SPEC 04 — Juego de cartas por nivel del alumno

> **Estado:** Implementado
> **Depende de:** Spec 01 de `chequeo-cardiovascular` (módulo del perfil Colegios) y Spec 02
> (Home del colegio). En el **backend**, de la SPEC 02 «Juego de cartas por niveles
> (SP_juego_cartas_club)», copiada en `references/backEnd/juego-carta-nives.md` y ya
> **Implementado**.
> **Fecha:** 2026-09-07
> **Área afectada:** `src/chequeo-cardiovascular/` únicamente. No se toca `src/Chequeo/`, ni
> `src/ficha-clinica/`, ni `src/Estadisticas/`, ni `src/common/`, ni `src/routes/`.
> **Objetivo:** Dar al perfil `Colegios` un tab «Nivel de alumnos» que pinte a cada deportista
> como una carta con su nivel clínico, sus cuatro atributos, sus estrellas y su progreso de
> ficha, consumiendo los tres endpoints ya publicados de `juego-cartas`.

---

## 1. Por qué existe esta spec

El backend ya construyó el juego entero: `SP_juego_cartas_club` convierte a cada alumno de un club
en una carta con cuatro atributos comparables 0–100, puntaje, nivel, estrellas y porcentaje de
completitud, contra umbrales configurables en la tabla `juego_niveles`. Esa spec dejó
**el frontend explícitamente fuera de alcance** —«el HTML de `references/` es referencia visual,
no se versiona una página»—. Los tres endpoints están disponibles y **nadie los consume**.

Falta la pantalla, y hay hueco para ella. Hoy el colegio tiene tres vistas y ninguna responde
«¿cómo va *este* alumno y qué le falta?»:

| Pantalla | Qué responde | Qué no |
|---|---|---|
| Home (tab 0) | Cuántos hay y cómo se reparte la población | Nada sobre un alumno concreto, salvo la lista de alterados |
| Asistente Virtual (tab 1) | Lo que se le pregunte, en texto | Requiere saber qué preguntar |
| Lista de deportistas (tab 2 actual) | La ficha administrativa, fila a fila | No evalúa ni prioriza: 118 filas iguales |

La carta es la lectura que falta: **de un vistazo, por alumno, en dos ejes independientes.** Un
eje dice cómo está de salud (`SIN EVALUAR` · `BAJO` · `MEDIO` · `ALTO`) y el otro cuánta ficha
tiene cargada (`Inicial` · `Evaluado` · `Completo`). El backend los mantiene separados a
propósito, y el HTML de referencia los muestra separados: un alumno puede estar sano con la ficha
a medias, y al revés.

### 1.1 El contrato, verificado en vivo

Comprobado contra `http://127.0.0.1:8000/api` el 2026-09-07, sobre el club
`brisas@ergosanitas.com` (118 cartas) y el RUT `25527383-3`.

| Endpoint | Respuesta |
|---|---|
| `GET /juego-cartas/{user_email}?search=` | `{success, message, data:{club, search, total, cartas[]}}` |
| `GET /juego-cartas/detalle/{rut_paciente}` | `{success, message, data: carta \| null}` |
| `GET /juego-cartas/niveles` | `{success, message, data:{clinico[], completitud[], atributos[]}}` |

Forma real de una carta, tal cual llega:

```json
{ "rut":"25527383-3", "club":"brisas@ergosanitas.com", "nombre":"Iñaki Maldonado Carmona",
  "edad":"9", "sexo":"Masculino", "ficha":"#003718", "id_chequeo":3718,
  "puntaje":90, "bonus":0, "estrellas":5, "progreso":80, "insignia":null,
  "nivel":  {"slug":"medio","nombre":"MEDIO","color_fondo":"#fef3c7","color_texto":"#b45309"},
  "estado": {"slug":"evaluado","nombre":"Evaluado","color_fondo":"#e0e7ff","color_texto":"#4f46e5"},
  "atributos":[{"slug":"corazon","valor":100,"medido":true},
               {"slug":"vitalidad","valor":60,"medido":true},
               {"slug":"composicion","valor":100,"medido":true},
               {"slug":"resistencia","valor":100,"medido":true}],
  "completitud":{"chequeo":true,"signos_vitales":true,"ecg":true,
                 "bioimpedancia":false,"certificado":true},
  "fecha_atencion":"2026-04-20 04:00:00.000000",
  "total_chequeos":1, "atributos_medidos":4, "bloques_completos":4 }
```

Seis detalles de esa respuesta condicionan todo el diseño de esta spec:

| Hallazgo | Consecuencia en el front |
|---|---|
| `puntaje` puede ser **`null`** (banda `SIN EVALUAR`; 201 alumnos de 1.554 en toda la base) | Se pinta `—`, **nunca `0`**. Un cero es una medición, no un vacío: es la regla del módulo. |
| Los atributos de la carta traen **solo `slug`, `valor`, `medido`** | El icono y el nombre viven en `/niveles → atributos`. Hay que pedir las **dos** cosas para pintar una carta. |
| `nivel` y `estado` traen **sus propios colores** | La paleta del badge sale del backend, que es justo para lo que existe `juego_niveles`. |
| `edad` es **`string`** | Igual que en `IChequeo`. No se hace aritmética con ella. |
| `fecha_atencion` llega **`YYYY-MM-DD HH:mm:ss.ffffff`** | Formato **distinto** al `DD-MM-YYYY` de `chequeo-all`: `parsearFecha` de `resumen.utility.ts` **no sirve aquí**. |
| El sobre es **`{success, message, data}`** | Distinto del resto de endpoints del módulo, que devuelven el dato pelado. El servicio desenvuelve y comprueba. |

**Datos de prueba:** `brisas@ergosanitas.com` (118), `Colegio.altair@ergosanitas.com` (147),
`cobresal.buin@ergosanitas.com` (109). RUT con carta completa: `25527383-3`.

---

## 2. Alcance

**Dentro:**

- Un **tab nuevo, «Nivel de alumnos», en la posición 2** del orquestador, tras Home y Asistente
  Virtual. Lista, Alta y Carga masiva pasan a 3, 4 y 5.
- `pages/JuegoCartasPage.tsx`: buscador, dos filas de chips de filtro, grilla responsive 3/2/1
  columnas y render incremental.
- `components/juego-cartas/`: la carta, la barra de atributo, las estrellas, los filtros, el
  buscador y el modal de desglose.
- `services/useJuegoCartasService.ts` con los tres endpoints.
- `hooks/useJuegoCartas.ts`: una carga, dos llamadas, y el filtrado en memoria.
- `interface/juego-carta.interface.ts` y su barril.
- Tokens nuevos en `config/tema.ts` (bloque `JUEGO`).
- Actualización de `specs/chequeo-cardiovascular/CLAUDE_CHEQUEO_CARDIOVASCULAR.md` y del catálogo
  de endpoints de `.claude/ARQUITECTURA.md`.

**Fuera de alcance:**

- **Cualquier archivo fuera de `src/chequeo-cardiovascular/`** salvo los dos documentos citados.
  Es la regla dura 1 del módulo, y aquí ni siquiera hace falta tocar el ruteo: el tab vive dentro
  del orquestador que `routesCOL` ya monta.
- **Duelos, mazos, ranking con posición, XP e histórico.** No existen en el backend, que los dejó
  fuera por la misma razón: exigen persistir el puntaje.
- **Persistir o recalcular el puntaje en el front.** La fórmula vive en el SP. El front pinta lo
  que recibe; no deriva ni un valor clínico.
- **Retunear umbrales o bandas.** Son un `UPDATE` sobre `juego_niveles`, no código, y son una
  decisión clínica.
- **Llevar las cartas a otros perfiles.** `Medicos`, `Administrador` y `Usuario` siguen en
  `src/Chequeo/`, intactos.
- **Paginación de servidor** y **búsqueda de servidor**: el club más grande son 147 cartas y
  llegan en una sola respuesta.
- **Un contador o gráfico de cartas en el Home.** El Home ya lleva 6 contadores, una lista y 5
  gráficos; sumarle una fuente más es otra spec.
- **Exportar las cartas a Excel o PDF.**

---

## 3. Modelo de datos

Todo nuevo y todo en `interface/juego-carta.interface.ts`. Es un espejo del contrato, sin mapper:
a diferencia de `ficha-clinica`, aquí el backend ya entrega el modelo de UI —etiquetas, colores y
porcentajes— y una capa de traducción solo añadiría sitios donde equivocarse.

```ts
/** Una banda configurable de `juego_niveles`, en cualquiera de los dos ejes. */
export interface IJuegoNivel {
    slug        : string;
    nombre      : string;
    valor_min   : number;
    valor_max   : number;
    color_fondo : string;
    color_texto : string;
    orden       : number;
    activo      : number;   // el backend lo manda como 0/1, no como boolean
}

/** El catálogo de `juego_atributos`: lo que da icono y nombre a un `slug` de la carta. */
export interface IJuegoAtributoCatalogo {
    slug        : string;
    nombre      : string;
    icono       : string;   // el emoji, tal cual llega
    descripcion : string;
    orden       : number;
}

/** El atributo dentro de una carta. `valor` es `null` cuando no hay ningún sub-indicador. */
export interface IAtributoCarta {
    slug   : string;
    valor  : number | null;
    medido : boolean;
}

/** Los cinco bloques del eje de completitud. `chequeo` es siempre `true`. */
export interface ICompletitudCarta {
    chequeo        : boolean;
    signos_vitales : boolean;
    ecg            : boolean;
    bioimpedancia  : boolean;
    certificado    : boolean;
}

/** La badge de nivel o de estado que viaja dentro de la carta: la banda sin sus rangos. */
export interface IBadgeCarta {
    slug        : string;
    nombre      : string;
    color_fondo : string;
    color_texto : string;
}

export interface IJuegoCarta {
    rut               : string;
    club              : string;
    nombre            : string;
    edad              : string;          // string, igual que en IChequeo
    sexo              : string;
    ficha             : string;          // '#003718'
    id_chequeo        : number;
    puntaje           : number | null;   // null ⇒ SIN EVALUAR
    bonus             : number;
    estrellas         : number;          // 0–5; 0 solo si puntaje es null
    progreso          : number;          // múltiplo de 20, de 20 a 100
    insignia          : string | null;   // 'InBody' cuando hay bioimpedancia
    nivel             : IBadgeCarta;     // nunca null
    estado            : IBadgeCarta;     // nunca null
    atributos         : IAtributoCarta[];
    completitud       : ICompletitudCarta;
    fecha_atencion    : string | null;
    total_chequeos    : number;
    atributos_medidos : number;
    bloques_completos : number;
}

/** Lo que devuelve `/juego-cartas/niveles`: la configuración entera. */
export interface IConfiguracionJuego {
    clinico     : IJuegoNivel[];
    completitud : IJuegoNivel[];
    atributos   : IJuegoAtributoCatalogo[];
}

/** El sobre A del backend, que este módulo no usaba en ningún otro endpoint. */
export interface ISobre<T> {
    success : boolean;
    message : string;
    data    : T;
}

export interface IListadoCartas {
    club   : string;
    search : string | null;
    total  : number;
    cartas : IJuegoCarta[];
}
```

**Nada se mapea a `0`.** `puntaje: null` y `valor: null` se pintan `—`, con la barra vacía y sin
color clínico. Es la misma regla que rige `ficha-clinica` y el Home: un cero en un indicador es
una medición, y confundirlo con un vacío es exactamente lo que el estado `SIN EVALUAR` existe
para evitar —201 alumnos que solo tienen la carga de Excel aparecerían como `BAJO` ante su
colegio por un problema administrativo.

---

## 4. Plan de implementación

Siete pasos. Cada uno deja el módulo compilando (`npm run build`), y los seis primeros no cambian
nada de lo que el usuario ve: el tab aparece en el paso 7.

### Paso 1 — Interfaces

`interface/juego-carta.interface.ts` con lo del §3, reexportado desde `interface/index.ts`.

### Paso 2 — Servicio

`services/useJuegoCartasService.ts`, patrón `ApiAdapter` como los otros cuatro servicios del
módulo, reexportado desde `services/index.ts`:

```ts
getCartasClub  (user_email: string, search?: string) : Promise<IListadoCartas>
getCartaDetalle(rut: string)                         : Promise<IJuegoCarta | null>
getNiveles     ()                                    : Promise<IConfiguracionJuego>
```

Cuatro decisiones que van escritas en el propio archivo:

- **Se usa `getToken(url)`, no `get(url, 10, 0)`.** `ApiAdapter.get` inyecta siempre `limit` y
  `offset` como query params, que estos endpoints no aceptan y que ensucian la URL. `getToken` es
  un GET sin params —el nombre engaña, no gestiona tokens— y es lo que corresponde aquí.
- **El sobre se desenvuelve en el servicio y se valida.** Se comprueba `success === true` y que
  `data` tenga la forma esperada (`Array.isArray(data.cartas)`) antes de devolver. Es el mismo
  blindaje que llevan `GraficoTorta`, `BarPresion` y `useResumenColegio`, y por la misma razón:
  **este backend responde 200 con sobres de error**. Sin eso, un `.length` sobre `undefined`
  revienta el render y tumba el tab entero.
- **`getCartaDetalle` devuelve `null` sin lanzar** cuando el RUT no existe: el backend responde
  **200 con `data: null`** y `message: "Paciente sin chequeos registrados"`. Es un caso normal,
  no un error.
- El `search` queda expuesto en la firma pero **la UI no lo usa** (ver paso 3). Está para no tener
  que reabrir el servicio el día que un club crezca lo suficiente.

### Paso 3 — Hook

`hooks/useJuegoCartas.ts`, reexportado desde `hooks/index.ts`. Lee `user_email` de `LoginContext`
y hace **dos llamadas en paralelo** (`Promise.all`): las cartas del club y la configuración.

- Devuelve `{ cartas, configuracion, cargando, error, sinEmail, recargar }`.
- **`error` distingue lo mismo que las tarjetas del Home:** un fallo del servicio no es un colegio
  sin deportistas. Un 500, una excepción o un sobre de error son `error`; un `total: 0` es una
  grilla vacía con su mensaje propio.
- **Sin `user_email` no llama a nada** y expone `sinEmail`, como hace el chat del asistente. La
  clave de multi-tenencia no se inventa.
- **El filtrado y la búsqueda son en memoria**, con `useMemo` sobre las cartas ya cargadas:
  búsqueda por `nombre` y `rut` sin distinguir mayúsculas, filtro por `nivel.slug` y filtro por
  `estado.slug`, combinables. Con 147 cartas como máximo, ir al servidor por cada tecla sería
  tráfico regalado.
- **No se reordena.** El backend ya entrega por puntaje descendente, desempatando por
  `atributos_medidos` y mandando las `sin_evaluar` al final —lo ordena en PHP justamente porque
  MySQL 5.7 no lo garantiza—. Reordenar en el front duplicaría ese criterio en un segundo sitio.

### Paso 4 — Tokens de color

Bloque `JUEGO` en `config/tema.ts`: fondo y borde de la carta, degradado del avatar, pista y
relleno de la barra de progreso, relleno de la barra de atributo, estrella llena y estrella vacía,
y el gris del atributo no medido.

**Los colores del badge de nivel y de estado NO están aquí**: vienen del backend en la propia
carta. La regla del módulo —«ningún `.tsx` escribe un hex»— se mantiene igual de verificable, y
además se gana lo que la tabla `juego_niveles` prometía: retunear la paleta con un `UPDATE`.

### Paso 5 — Componentes

`components/juego-cartas/`, reexportados desde `components/index.ts`:

| Archivo | Qué hace |
|---|---|
| `CartaAlumno.tsx` | La carta: avatar con iniciales, nombre, ficha y edad · estrellas · badge de nivel · los 4 atributos · barra de progreso con su badge de estado · pie con `total_chequeos` y «Ver desglose». |
| `BarraAtributo.tsx` | Un atributo: icono y nombre del catálogo, barra y valor. Sin medir → barra vacía y `—`. |
| `Estrellas.tsx` | Las 5 estrellas, llenas y vacías, con su texto alternativo. |
| `FiltrosCartas.tsx` | Las dos filas de chips, construidas **desde `/niveles`**, no escritas a mano. |
| `BuscadorCartas.tsx` | El campo de búsqueda, con `ClearIcon` para limpiar —**nunca `DeleteIcon`**, regla dura 2. |
| `ModalCarta.tsx` | El desglose: los 4 atributos con barra, los 5 bloques de completitud marcados, estrellas, puntaje, bonus e insignia. |

La carta sigue el HTML de referencia en estructura y en jerarquía —avatar y nombre arriba,
estrellas, badge, barra de progreso, pie con el contador y el enlace— y el sistema visual del
módulo: `sxTarjeta`, `borderRadius: 3`, sombras y tipografías de `tema.ts`. La grilla es
`repeat(3, 1fr)` / 2 / 1 en los mismos cortes que el HTML (900 px y 600 px), que además coinciden
con el corte `md` que ya usa la lista.

### Paso 6 — Página

`pages/JuegoCartasPage.tsx`, reexportada desde `pages/index.ts`. Título y subtítulo como
`AsistentePage`, buscador, filtros, grilla y el modal. Cinco estados, explícitos:

| Estado | Qué se ve |
|---|---|
| `sinEmail` | Un aviso que explica que la sesión no trae el colegio. No se llama al endpoint. |
| `cargando` | Esqueletos con la forma de la carta, no un spinner suelto. |
| `error` | «El servicio de niveles no está disponible», con botón de reintentar. |
| Sin cartas | «Este colegio todavía no tiene deportistas evaluados» — distinto del anterior. |
| Filtro sin resultados | «Ningún alumno coincide con el filtro», con la acción de limpiarlo. |

**Render incremental:** 24 cartas y un botón «Ver más» que suma otras 24. Montar 147 tarjetas MUI
de golpe al entrar al tab es un coste que nadie pidió, y el usuario que busca a alguien concreto
usa el buscador, no el scroll.

Al pie de la grilla, una **nota permanente**: el nivel es una heurística de gamificación sobre
datos incompletos, **no un diagnóstico**. Lo pide el §7 de la spec del backend y es la línea que
separa esta pantalla de una afirmación clínica.

### Paso 7 — El tab

En `pages/AppChequeoCardiovascular.tsx`:

```
TAB_HOME      = 0
TAB_ASISTENTE = 1
TAB_JUEGO     = 2   ← nuevo
TAB_LISTA     = 3   ← era 2
TAB_ALTA      = 4   ← era 3
TAB_CARGA     = 5   ← era 4
```

Más su entrada en `TABS` (icono `StyleIcon` o `EmojiEventsIcon`) y su `<TabPanel>`. **Los dos
handlers que usan índices (`handleChange` y `handleUpdateStatus`) ya van por constantes**, así
que renumerar no los rompe — pero hay que leerlos, que es exactamente el tropiezo que la Spec 03
documentó al meter el asistente en la posición 1.

### Lo que se reutiliza, y lo que no se duplica

- `capitalizarPalabras` de `utilities/chequeo.utility.ts` para el nombre.
- `TabPanel` de `components/tabs/`.
- `sxTarjeta`, `sxTituloSeccion`, `sxTituloTarjeta`, `sxSubtituloTarjeta`, `sxFocoVisible` y
  `sxSoloLectores` de `config/tema.ts`.
- `LoginContext` de `src/common/context` para `user_email`.
- El patrón `ApiAdapter` de los cuatro servicios existentes.

`parsearFecha` de `resumen.utility.ts` **no se reutiliza**: espera `DD-MM-YYYY` y `fecha_atencion`
llega aquí en formato ISO con microsegundos. Se escribe un ayudante propio, con un comentario que
explique por qué son dos formatos.

---

## 5. Criterios de aceptación

**Reglas duras del módulo**

- [x] `grep -rn "from '\.\./\.\./" src/chequeo-cardiovascular/` sigue devolviendo **solo**
      `../../common/`.
- [x] `grep -rni "delete" src/chequeo-cardiovascular/` sigue sin resultados. El buscador limpia
      con `ClearIcon`.
- [x] `grep -rc '#[0-9a-fA-F]\{3,8\}' --include=*.tsx src/chequeo-cardiovascular/` sigue sin
      señalar ningún `.tsx`: los colores del badge llegan como dato, no como literal.
- [x] `npm run build` en verde y `npx eslint src/chequeo-cardiovascular/` en 0.

**Funcionales**

- [x] El tab «Nivel de alumnos» aparece en la posición 2, con su icono y su `aria-label`.
- [x] Los tabs 3, 4 y 5 siguen abriendo Lista, Alta y Carga masiva; entrar al 4 por el rail sigue
      abriendo un formulario limpio, y «editar» desde la lista sigue llevando al 4 con los datos.
- [ ] Con `brisas@ergosanitas.com` se pintan 118 cartas (24 visibles y el resto tras «Ver más»).
- [ ] El buscador filtra por nombre y por RUT, sin distinguir mayúsculas.
- [ ] Los chips de progreso y los de nivel filtran por separado **y combinados**; cada fila tiene
      su «Todos».
- [x] Los chips salen de `/juego-cartas/niveles`: un `UPDATE` que cambie el nombre de una banda se
      ve en la UI sin tocar código.
- [ ] Una carta `SIN EVALUAR` muestra `—` en el puntaje, 0 estrellas y los 4 atributos en `—`.
      **En ningún sitio aparece un `0` donde el dato es `null`.**
- [ ] Una carta con `insignia` muestra el chip «InBody»; una sin ella no deja hueco.
- [ ] Pulsar una carta abre el modal con el desglose **del RUT correcto**, y el puntaje del modal
      coincide con el de la carta.
- [ ] El modal muestra los 5 bloques de completitud con su estado y `atributos_medidos`.
- [ ] Sin `user_email` la pantalla lo explica y **no se dispara ninguna llamada** (comprobable en
      la pestaña de red).
- [ ] Un 500 o un sobre de error pinta «servicio no disponible» **y es distinto** del mensaje de
      «este colegio todavía no tiene deportistas evaluados».
- [ ] Un filtro sin resultados muestra su propio mensaje, no el de colegio vacío.
- [x] La nota de «no es un diagnóstico» está visible al pie de la grilla.

**Accesibilidad** — el listón lo fijó la Spec 02 y no baja

- [x] Cada carta es un elemento pulsable real (`button` / `CardActionArea`), alcanzable con Tab,
      con `aria-label` que incluye nombre, nivel y progreso, y con `sxFocoVisible`.
- [x] Las estrellas llevan texto alternativo («4 de 5 estrellas»), no solo el icono.
- [x] Cada barra —progreso y atributos— va con `role="progressbar"`, `aria-valuenow`,
      `aria-valuemin` y `aria-valuemax`.
- [x] El badge no comunica solo por color: el nombre de la banda va escrito dentro.
- [ ] A 375 px la grilla es de una columna y **no hay scroll horizontal**.
- [x] El modal atrapa el foco y se cierra con `Esc`.

---

## 6. Decisiones tomadas y descartadas

| Decisión | Por qué |
|---|---|
| **Tab propio en la posición 2**, no una sección del Home | El Home ya son 6 contadores, una lista y 5 gráficos; la grilla quedaría bajo dos pantallas de scroll. En la posición 2 las tres pantallas de **mirar** quedan juntas y las de **gestionar** detrás, que es el mismo criterio con el que la Spec 03 sacó el chat del Home. |
| **Al pulsar, modal de desglose**; descartado abrir `ChequeoView` | `ChequeoView` muestra la ficha clínica: contesta «qué mide este alumno», no «por qué tiene este nivel». El desglose es lo que hace comprensible la carta. Descartado también hacerla no clicable: un 100 sin explicación es justo el riesgo que el backend documenta. |
| **Dos ejes de filtro**, no solo el de completitud del HTML | Son datos independientes —el mock del backend lo demuestra: Ana con 55 % es `BAJO` y Carlos con 25 % es `MEDIO`— y el colegio querrá recorrer los dos. |
| **Los chips se construyen desde `/niveles`** | Ese endpoint existe precisamente «para que el front no hardcodee nada». Escribir las cuatro bandas a mano lo desperdiciaría y las dejaría desincronizadas al primer `UPDATE`. |
| **Colores del badge desde el backend** | Idem: es para lo que existe `juego_niveles`. Y no rompe la regla de `tema.ts`, porque siguen sin aparecer hex en un `.tsx`. Descartado mapear `slug → token`: obliga a mantener el mapa y a redeployar el front para cambiar un color. |
| **Sin mapper: la interfaz es espejo del contrato** | A diferencia de `ficha-clinica`, aquí el backend ya devuelve el modelo de UI —etiquetas, colores, porcentajes—. Una capa de traducción solo añadiría un sitio donde equivocarse. |
| **Búsqueda y filtros en memoria** | El club más grande son 147 cartas en una sola respuesta. Ir al servidor por cada tecla sería tráfico regalado, y el `search` del servicio queda disponible por si algún día deja de serlo. |
| **No se reordena en el front** | El orden ya viene decidido, con desempate por `atributos_medidos` y las `sin_evaluar` al final. Duplicar ese criterio garantiza que un día diverjan. |
| **Render incremental de 24 en 24** | 147 tarjetas MUI montadas de golpe al entrar al tab es un coste que nadie pidió. Descartada la paginación clásica: rompe el escaneo visual, que es lo único que esta pantalla aporta. |
| **Iniciales en el avatar**, no los emoji del HTML | El HTML pone 🧑/👩 por paciente. Sobre nombres reales de menores eso es afirmar un género a partir de un campo que el propio backend describe como desbalanceado (1.445 `Masculino` / 189 `Femenino`). El `sexo` sí viaja y se muestra **como texto**, que es lo que el dato dice. |
| **`getToken` en vez de `get`** | `get` inyecta `limit`/`offset`, que estos endpoints no aceptan. |
| **`SIN EVALUAR` se pinta, no se esconde** | Es información: son alumnos cargados por Excel a los que **falta evaluar**. Filtrarlos por defecto ocultaría la tarea pendiente. |
| **Nada del puntaje se calcula en el front** | La fórmula vive en el SP y se retunea con un `UPDATE`. Recalcular aquí crearía dos verdades. |
| **Sin ranking con posición, duelos ni progresión** | El backend los dejó fuera y exigen persistir el puntaje. Si llegan, van en su propia spec. |

---

## 7. Riesgos identificados

- 🔴 **El SP no viaja en las migraciones.** Lo declara la propia spec del backend: un entorno
  levantado solo con `php artisan migrate` tiene las tablas pero no `SP_juego_cartas_club`, y los
  tres endpoints devuelven 500. Por eso la pantalla **degrada explícitamente** en vez de romperse.
  **Hay que confirmar el despliegue del SP en producción antes de dar el tab por disponible**, o
  el colegio verá un tab que solo sabe decir que no está disponible.
- ⚠️ **Las bandas están calibradas sobre la distribución actual, no sobre criterio clínico.** Con
  los cortes «naturales» 1.225 de 1.353 alumnos caían en `ALTO` y el badge no discriminaba nada;
  los actuales son percentiles de esa base en esa fecha. La UI **no debe presentar el nivel como
  un diagnóstico**: de ahí la nota al pie. Recalibrar es un `UPDATE`, y esta pantalla lo reflejará
  sin cambios.
- ⚠️ **Un atributo puede valer 100 con un solo sub-indicador.** Un alumno con
  `sistemaCardiovascular = 'No Presenta'` y sin ECG tiene Corazón 100. El modal lo delata
  —`atributos_medidos` y los bloques de completitud— pero la carta de la grilla muestra un 100 que
  descansa en un campo de texto. Mitigarlo de verdad es cambiar el SP.
- ⚠️ **Las estrellas casi no discriminan**: 892 de 1.353 cartas evaluadas tienen 5. Se pintan igual
  porque son el lenguaje del juego, pero el orden real lo da el puntaje, y por eso el puntaje va
  escrito en la carta y no solo insinuado en las estrellas.
- ⚠️ **Sin control de acceso en el backend.** `detalle/{rut}` no exige club: cualquiera que conozca
  un RUT lee la evaluación de un menor. Es el mismo riesgo que el resto de `routes/api.php` y no
  se resuelve desde el front, pero el front **no lo agrava**: la grilla solo pide por
  `user_email` y el detalle solo por un RUT que ya está en la grilla de ese colegio.
- ⚠️ **Renumerar los tabs vuelve a tocar los índices del orquestador**, el mismo tropiezo de la
  Spec 03. Mitigado porque ya son constantes, pero el paso 7 obliga a leer los dos handlers.
- ⚠️ **Una fuente de verdad más en la misma app.** El total de cartas no tiene por qué coincidir
  con los contadores del Home, que vienen de `estado-general`. La grilla declara sobre cuántos
  alumnos está calculada, igual que hacen las tarjetas derivadas del Home.

---

## 8. Lo que **no** entra en esta spec

Duelos, mazos y ranking con posición · progresión, XP e histórico del puntaje · cartas para
`Medicos`, `Administrador` o `Usuario` · edición de umbrales o bandas desde el front · recalcular
el puntaje en el cliente · exportar las cartas a Excel o PDF · notificaciones · paginación y
búsqueda de servidor · un contador de cartas en el Home · corregir los bugs heredados que el
backend documenta y esquiva.

Cada uno, si llega, va en su propia spec.

---

## 9. Lo implementado (2026-09-07)

Rama `spec-04-juego-cartas-nivel`. Todo dentro de `src/chequeo-cardiovascular/`, salvo los dos
documentos que la §2 ya declaraba (`CLAUDE_CHEQUEO_CARDIOVASCULAR.md` y `.claude/ARQUITECTURA.md`).

| Paso | Archivos |
|---|---|
| 1 | `interface/juego-carta.interface.ts` + barril |
| 2 | `services/useJuegoCartasService.ts` + barril |
| 3 | `hooks/useJuegoCartas.ts` + barril |
| 4 | `config/tema.ts` — bloque `JUEGO`, 2 degradados (`avatarCarta`, `barraProgreso`) y 2 sombras (`carta`, `cartaHover`) |
| 5 | `components/juego-cartas/` — `BadgeJuego` · `Estrellas` · `BarraAtributo` · `BarraProgreso` · `CartaAlumno` · `BuscadorCartas` · `FiltrosCartas` · `ModalCarta` · `index.ts` |
| 6 | `pages/JuegoCartasPage.tsx` + barril |
| 7 | `pages/AppChequeoCardiovascular.tsx` — `TAB_JUEGO = 2`, renumerados `TAB_LISTA/ALTA/CARGA` a 3/4/5 |

**Tres archivos que la spec no había previsto**, y por qué:

- `components/juego-cartas/BadgeJuego.tsx` y `BarraProgreso.tsx` — la carta y el modal pintan los
  mismos badges y la misma barra. Duplicarlos garantizaba que divergieran.
- `utilities/juego.utility.ts` — `iniciales`, `fechaDeCarta`, `resumenDeCarta` y `filtrarCartas`.
  Es lógica pura, y el módulo la mantiene fuera del JSX.

### 9.1 Lo que la revisión del agente del módulo corrigió

Seis cosas, dos de ellas de fondo. Ninguna era un fallo de compilación: el build y ESLint ya
estaban limpios antes.

- 🔴 **La grilla pedía sus datos aunque nadie abriera el tab.** `TabPanel` oculta con
  `display: none` **sin desmontar**, así que `useJuegoCartas` disparaba las dos llamadas y montaba
  24 tarjetas en cuanto un colegio entraba al módulo, aunque nunca fuera al tab 2 — justo el coste
  que el render incremental existe para evitar. **La spec no lo contempló.** Se resolvió con la
  misma señal que el módulo ya usaba para el micrófono del asistente: `activo={tab === TAB_JUEGO}`
  → `JuegoCartasPage` → `useJuegoCartas(activo)`, que carga en la **primera** activación (un
  `useRef` cifrado por `user_email`). «Reintentar» sigue llamando a `recargar` sin pasar por ahí.
- 🔴 **Respuestas fuera de orden en el modal.** Pulsar una carta lenta y luego una rápida dejaba
  el desglose de la primera al llegar: la evaluación de **otro menor** bajo el nombre del que se
  pulsó. Se descarta con un `useRef` que guarda el último RUT pedido, comprobado en `try`, `catch`
  y `finally`. Un `useState` no vale: el `handleAbrir` en vuelo ve el valor con el que se creó.
- **El corte de la grilla estaba en `lg` (1200 px)** en vez de `md` (900 px), que es lo que pide
  la §4 y el corte que ya usa la lista. Corregido en la grilla y en los esqueletos.
- **`BarraAtributo` tenía un `as number`**: ahora `valor` es `number | null` de verdad y el `0`
  solo existe como ancho de la barra vacía.
- **`resumenDeCarta` capitaliza el nombre**, igual que la carta: el nombre accesible de un control
  tiene que contener su texto visible, y el backend devuelve algunos nombres en mayúsculas.
- `height: '100%'` en el `ButtonBase` de la carta —sin él las cartas de una fila quedan a alturas
  distintas en cuanto un nombre ocupa dos líneas— y una alineación torcida en `BadgeJuego`.

### 9.2 Estado de los criterios: 13 de 24 verificados

**Verificados** (mecánicamente o leyendo el código): las cuatro reglas duras —imports, `grep`
de borrado, ningún hex en un `.tsx`, `npm run build` en verde y ESLint en 0—, el tab en la
posición 2 con su icono y su `aria-label`, los tabs 3/4/5 intactos (ambos handlers van solo por
constantes), los chips construidos desde `/niveles`, la nota de «no es un diagnóstico», y los
cinco de accesibilidad que se leen en el código: carta pulsable con `aria-label` completo y foco
visible, estrellas con texto alternativo, barras con `role="progressbar"`, el nombre de la banda
escrito dentro del badge, y el foco atrapado con cierre por `Esc` (`Dialog` de MUI).

**Comprobado además contra el backend real** (`http://127.0.0.1:8000/api`, 2026-09-07):

- `brisas@ergosanitas.com` → **118 cartas / 118 RUT distintos**, ordenadas por puntaje
  descendente; `estrellas` siempre 0–5, `progreso` múltiplo de 20, `nivel` y `estado` nunca
  ausentes, y `medido` coherente con `valor !== null` en las 118.
- `detalle/99999999-9` → `{success: true, data: null}`, que la página traduce a «Este alumno no
  tiene chequeos registrados».
- Un `user_email` inexistente → `total: 0`, que se pinta como «Todavía no hay alumnos evaluados»
  y **no** como «servicio no disponible».

**Los 11 que faltan necesitan la app en marcha con un usuario `Colegios`**: las 24 cartas
visibles y «Ver más», el buscador, los chips combinados, el aspecto de una carta `SIN EVALUAR` y
de una con insignia, la apertura del modal y sus cinco bloques, que sin `user_email` no salga
ninguna llamada, el mensaje de servicio caído, el de filtro sin resultados, y la única columna a
375 px.

⚠️ **El club de prueba conviene que sea `cobresal.buin@ergosanitas.com`** (109 cartas): es el
único de los tres que tiene a la vez cartas `SIN EVALUAR` —2, con `puntaje: null`, 0 estrellas y
los cuatro atributos en `null`— y con insignia **InBody** —3, una con `bonus: 5`—. `brisas` no
tiene ninguna de las dos, así que con ese club esos dos criterios no se pueden ver.

### 9.3 Un riesgo nuevo, y no se arregla desde el front

🔴 **Tres badges no llegan al contraste AA**, medido sobre los colores que hoy trae
`juego_niveles`: `SIN EVALUAR` 2.31:1, `Inicial` 3.90:1 y `BAJO` 3.95:1, con texto de 11–12 px
que exige 4.5:1. Los otros tres sí pasan (`ALTO` 4.57, `MEDIO` 4.51, `Evaluado` 5.10).

**El arreglo es un `UPDATE` sobre `juego_niveles`, no código.** Oscurecer esos tres desde el front
rompería justo la razón por la que la paleta vive en la tabla. Mitiga —no resuelve— que el badge
lleve **el nombre de la banda escrito dentro**, así que no comunica solo por color.
