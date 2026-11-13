# SPEC 02 — Banner de ofertas mientras se buscan los certificados por RUT

> **Estado:** Implementado
> **Depende de:** SPEC 08 del back `Back-end/ergosanitas-app/specs/08-banner-ofertas-certificados-sin-impacto.md` (**Implementado**, spec «sin impacto»: el back no cambia). Consume tal cual `GET {API}/home-imagenes` de la SPEC 03 del back (Implementado). Se apoya en la SPEC 01 de esta carpeta (`01-rediseno-descarga-certificados.md`, Aprobado).
> **Fecha:** 2026-11-12
> **Área afectada:** `src/Certificados/` (página pública `/certificados`, sin perfil) y su guía `specs/certificados/CLAUDE_CERTIFICADOS.md` (dos reglas duras se amplían, ver §6). Import de solo lectura de `urlWhatsappPromo` desde `src/home-ergo/config/canales-contacto.tsx` (P2 resuelta: reutilizar). `src/routes/routes.ts` no cambia.
> **Objetivo:** Que, mientras la página pública de certificados busca un RUT, en lugar del spinner aparezca un banner elegante que rota las imágenes activas de «Lo que está en oferta» del Home, una a la vez, con transición de entrada y salida, barra de tiempo, puntos y clic a WhatsApp.

---

## 1. Por qué existe esta spec

La búsqueda por RUT es el único momento en que el visitante de `/certificados` **espera** sin
nada que hacer. Hoy ve un `CircularProgress` con «Buscando documentos…». El negocio quiere usar
esa espera como espacio publicitario, con las mismas ofertas que ya publica en la portada
(sección «Lo que está en oferta», `seccion = 'promocion'`), administradas desde el mantenedor de
imágenes del Administrador. No se crea contenido nuevo ni se toca el back.

### 1.1 Lo que se verificó en el código (2026-11-12, revisado el mismo día)

| Hallazgo | Consecuencia |
| --- | --- |
| `pages/CertificadoPage.tsx` L13: `type Estado = 'inicial' \| 'cargando' \| 'ok' \| 'vacio' \| 'error'`; L59 `setEstado('cargando')` al buscar; L66/L71 descartan respuestas viejas con `busquedaVigente` | El banner se monta solo con `estado === 'cargando'`. No se toca la lógica de búsqueda. |
| `CertificadoPage.tsx` L163–165: única región `role="status" aria-live="polite"` con `resumenDe(estado, …)`, **visible** (`body2`); L27 devuelve `''` mientras carga | «Buscando documentos…» se anuncia **en esa misma región** (`resumenDe` devuelve `textos.resultados.cargando` con `cargando`). Para no duplicar el texto en pantalla, la región se oculta a la vista mientras carga (D9). No se crea una segunda región viva. |
| `CertificadoPage.tsx` L167: `{estado === 'cargando' && <EstadoResultado estado="cargando" />}` | Es el punto de integración: banner si hay ofertas; si no, este mismo spinner. |
| `components/EstadoResultado.tsx` L18–24: `CircularProgress size={28}` + `textos.resultados.cargando` | Se conserva sin cambios como respaldo. |
| `components/BuscadorRut.tsx` L84, L95: «Buscar» y «Limpiar» con `disabled={cargando}`. Al estar deshabilitado el botón por defecto, Enter en el campo tampoco envía | Durante el banner no se puede lanzar otra búsqueda ni limpiar: no hay carreras nuevas. |
| `BuscadorRut.tsx` L61: `flexDirection: { xs: 'column', sm: 'row' }` | En móvil el buscador crece en alto y el banner arrancaría a ≈ 430 px (estimado). A 360×640 casi no se vería: la vista se desplaza hasta él (Q2). |
| `src/main.tsx` L7: `<StrictMode>` | En `npm run dev` el efecto de montaje corre dos veces y se ven **2** peticiones a `home-imagenes` (la primera la descarta `vigente`). El criterio de Network se mide en `npm run preview`. |
| `CLAUDE_CERTIFICADOS.md`, «Reglas duras»: «Nada se consulta al montar la página» y «Lo único externo es `src/common/` (ApiAdapter) y `MarqueeHome`» | Esta spec **amplía** las dos reglas (D1 y P2). La guía se actualiza en el último paso. `MarqueeHome` viene de `../../Home/components` (no de `home-ergo`). |
| `src/home-ergo/services/UseHomeImagenesService.ts` L27–36: `apiAdapter.getToken` sobre `${API}/home-imagenes`; lanza si `success !== true` o `data` no es array | Se clona en `src/Certificados/services/` (regla de aislamiento). `getToken` porque `ApiAdapter.get` inyecta `limit`/`offset`. |
| `src/home-ergo/interface/home.interface.ts` L186–201: `IHomeImagenApi { id, seccion, src, alt, caption: string \| null, activo, orden }` (`seccion: SeccionImagenHome`, L174 = `'promocion' \| 'alianza' \| 'galeria'`) y `IRespuestaHomeImagenes { success, message, data }` | Se clona la forma en `src/Certificados/interface/`. Mismo precedente que `src/chequeo-administrador/interface/imagen-home.interface.ts`. |
| `src/home-ergo/hooks/useImagenesHome.ts` L62–107: una petición al montar, bandera `vigente`, reparte por literal de `seccion` | Se toma el patrón (no el import): hook propio que filtra solo `'promocion'`. |
| `src/home-ergo/config/canales-contacto.tsx` L65–66 `urlWhatsappCon` arma `https://wa.me/<telefonoWhatsapp>?text=…`; L83–84 `urlWhatsappPromo(caption: string)` con `mensajeWhatsappPromo` de `home-contacto.json` | El CTA usa el mismo mensaje y número (P2: se importa). Recibe `string`: con `caption = null` se le pasa el `alt` (D10). |
| `src/home-ergo/components/CarruselPromociones.tsx` L9 `Autoplay, Navigation, Pagination, A11y`; L78–80 `prefers-reduced-motion`; L115 `autoplay` con `delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true`; L172 `objectFit: 'contain'` | Mismo stack y mismas defensas. Las promociones son flyers 3:4 con texto quemado: **`contain`**, nunca `cover` (`CLAUDE_HOME_ERGO.md` L422). |
| `package.json` L64 `"swiper": "^11.2.6"`; instalado 11.2.6, con `swiper/modules/effect-fade.css` y `effect-creative.css`; `node_modules/swiper/types/modules/autoplay.d.ts` L60: evento `autoplayTimeLeft(swiper, timeLeft, percentage)` | Sin dependencia nueva. La barra de progreso se alimenta de `autoplayTimeLeft`, por `ref` (D7). |
| `node_modules/swiper/modules/a11y.mjs` L283: el wrapper lleva `aria-live="off"` con autoplay y `"polite"` sin él | Sustenta D4: con autoplay, los cambios de imagen no se anuncian. |
| `node_modules/swiper/modules/autoplay.mjs` L210–214: `pauseOnMouseEnter` solo escucha `pointerenter`/`pointerleave`; L203–208: al salir el ratón reanuda si está en pausa, sin mirar por qué se pausó | Swiper **no** pausa con el foco y, con `pauseOnMouseEnter`, reanudaría aunque el foco siga dentro: D5 usa manejadores propios para ratón y foco, sin `pauseOnMouseEnter`. |
| `node_modules/swiper/shared/swiper-core.mjs` L1924: `loop` solo exige `slides.length >= slidesPerView + loopedSlides`; en Swiper 11 no duplica diapositivas, las reordena en el DOM | Se usa `rewind` y no `loop` (D6): no reordena el DOM bajo `EffectCreative` ni bajo `initialSlide`. |
| Back: `routes/api.php` L373–374 `GET home-imagenes` sin middleware; `HomeImagenController::listar` L174–187; `HomeImagenService::listar` L24–32 (solo `activo = true`, orden `FIELD(seccion…)`, `orden`, `id`); `docs/openapi.yaml` L5104 | El front no reordena la lista: respeta el `orden` del Administrador. Solo la **oferta inicial** de cada búsqueda es al azar (P4). |
| Back: `HomeImagenController` L56 `mimes:jpg,jpeg,png,webp`, `max:5120`, sin redimensionar. Las 11 promociones sembradas en `public/HomeImagenes/` suman **≈ 16,9 MB** (9 PNG de 1,5–2,2 MB) | Precargarlas todas costaría ≈ 17 MB por visita. Se precarga **solo la oferta inicial** (Q1), y las demás de a una, por delante de la que se ve. |

---

## 2. Alcance

### Entra

- Componente nuevo `src/Certificados/components/BannerOfertas.tsx`: una imagen grande a la vez,
  Swiper 11 con efecto de entrada y salida, autoplay configurable, barra de progreso del tiempo,
  puntos, caption y CTA a WhatsApp.
- Carga de las ofertas **al montar la página** (no al buscar), con una sola petición
  `GET {API}/home-imagenes`, filtrando `seccion === 'promocion'`, y precarga **solo de la oferta
  inicial** de la próxima búsqueda, elegida al azar (Q1). Las demás imágenes se piden de a una,
  por delante de la que se ve.
- Integración en `CertificadoPage.tsx`: con `estado === 'cargando'` va el banner en lugar del
  spinner si al empezar la búsqueda la oferta inicial estaba lista; si no, el spinner actual.
- Permanencia mínima de **2,5 s** desde que empieza la búsqueda, solo cuando el banner se muestra (P1). Después, el banner se retira y los resultados entran con un fundido (Q3).
- En móvil, la vista se desplaza hasta el banner al empezar la búsqueda (Q2).
- `prefers-reduced-motion`: sin autoplay ni efectos.
- Textos y parámetros en JSON del módulo.
- Actualización de `CLAUDE_CERTIFICADOS.md`.

### No entra

- Vigencia por fechas de las ofertas (decisión del usuario: sin fechas; el back no cambia).
- Optimizar las imágenes al subirlas (WebP, ancho máximo): es del back, ver §7.
- Cambios en el mantenedor de imágenes (`src/chequeo-administrador/`) ni en `src/home-ergo/`.
- Mostrar el banner fuera de la búsqueda (estado inicial, vacío, error o junto a los resultados).
- Alianzas y galería.
- Medición de clics o analítica.
- Cualquier cambio en la consulta de certificados, en las descargas o en la SPEC 07 del back.

---

## 3. Modelo de datos y contrato

### 3.1 `GET {API}/home-imagenes` (SPEC 03 del back, Implementado — se consume tal cual)

- Público, sin parámetros, sin `throttle`. Se llama con `apiAdapter.getToken` (no `get`).
- Éxito `200`:

```json
{
  "success": true,
  "message": "Imagenes obtenidas correctamente",
  "data": [
    { "id": 12, "seccion": "promocion", "src": "https://<API_PATH_HOME>/promo-noviembre.jpg", "alt": "Chequeo preventivo con 20 % de descuento", "caption": "Chequeo preventivo noviembre", "activo": true, "orden": 1 },
    { "id": 30, "seccion": "alianza", "src": "https://<API_PATH_HOME>/club.png", "alt": "Logo del club", "caption": null, "activo": true, "orden": 1 }
  ]
}
```

- Error `500`: `{ "success": false, "message": "Error obteniendo las imagenes", "error": "<detalle>" }` (axios lanza).
- Cualquier `200` que no sea `{ success: true, data: [...] }` se trata como error (igual que `UseHomeImagenesService`).
- Ejemplo con datos ficticios.

### 3.2 Interfaces nuevas (`src/Certificados/interface/oferta-banner.interface.ts`, exportadas por el barril)

```ts
/** Fila cruda de GET home-imagenes (copia de la SPEC 03 del back; no se importa de home-ergo). */
export interface IHomeImagenApi {
    id      : number;
    seccion : 'promocion' | 'alianza' | 'galeria';
    src     : string;
    alt     : string;
    caption : string | null;
    activo  : boolean;
    orden   : number;
}

export interface IRespuestaHomeImagenes {
    success : boolean;
    message : string;
    data    : IHomeImagenApi[];
}

/** Lo que pinta el banner. */
export interface IOfertaBanner {
    id      : number;
    src     : string;
    alt     : string;
    caption : string | null;
}

export type EstadoOfertas = 'cargando' | 'listo' | 'error';
```

### 3.3 Configuración (`src/Certificados/config/banner-ofertas.json`)

```json
{
    "segundosPorImagen": 3.5,
    "duracionTransicionMs": 700,
    "permanenciaMinimaMs": 2500
}
```

`permanenciaMinimaMs` (P1) se cuenta desde que empieza la búsqueda y solo aplica si el banner
se muestra. Con 3,5 s por imagen, en una búsqueda normal se ve la oferta inicial completa con su
transición de entrada.

### 3.4 Textos (`config/textos-certificados.json`, bloque nuevo `banner`)

```json
"banner": {
    "etiqueta": "Mientras buscamos, mira lo que está en oferta",
    "ariaRegion": "Ofertas de Ergosanitas",
    "cta": "Consultar por WhatsApp",
    "ariaCta": "{oferta}: consultar por WhatsApp (se abre en una pestaña nueva)",
    "ariaPunto": "Ver la oferta {{index}}",
    "ariaDiapositiva": "Oferta {{index}} de {{slidesLength}}"
}
```

`{oferta}` se reemplaza por el `caption` o, si es `null`, por el `alt`. `ariaPunto` y
`ariaDiapositiva` van al parámetro `a11y` de Swiper (`paginationBulletMessage` y
`slideLabelMessage`). Sin ellos, Swiper pone sus mensajes por defecto en inglés («Go to slide 1»,
«1 / 5»). Los marcadores `{{index}}` y `{{slidesLength}}` los reemplaza Swiper.

### 3.5 Estado de la página

No cambia el tipo `Estado`. Se añade el hook `useOfertasBanner()`:

```ts
// src/Certificados/hooks/useOfertasBanner.ts
export const useOfertasBanner = (): {
    ofertas       : IOfertaBanner[];
    estado        : EstadoOfertas;
    /** Índice en `ofertas` con el que arranca la próxima búsqueda; su imagen ya está en caché. */
    indiceInicial : number;
    /** Sortea y precarga la oferta inicial de la búsqueda siguiente. */
    rotarInicial  : () => void;
} => { /* … */ };
```

- Una petición al montar, con bandera `vigente` para descartar la respuesta si la página se desmonta.
- Filtra `seccion === 'promocion'` comparando contra el literal. No reordena.
- **Precarga solo la oferta inicial (Q1).** Sortea `indiceInicial` y precarga **esa** imagen con
  `new Image()` (`decoding = 'async'`). `estado` pasa a `'listo'` cuando carga. Si falla, esa
  oferta **se quita** de la lista (los índices se recalculan sobre la lista nueva) y se sortea
  otra (D3). Si no queda ninguna: `'listo'` con `ofertas` vacía, y la página usa el spinner.
- **`rotarInicial()`**: con 2 o más ofertas sortea un índice distinto del actual, lo precarga y
  **solo cuando cargó** actualiza `indiceInicial`. Mientras tanto sigue valiendo el anterior, que
  ya está en caché. Si la precarga falla, esa oferta se quita como en el punto anterior. Con una
  sola oferta no hace nada. La llama la página al terminar una búsqueda vigente que mostró el
  banner.
- Error de red o sobre inesperado → `estado: 'error'`, `console.warn` sin aviso al visitante.
- Peso al entrar: una imagen (≈ 2 MB con las actuales) en vez de las ≈ 17 MB de todas.

---

## 4. Plan de implementación

Cada paso lo ejecuta el `ergosanitas-developer` (FE) con `CLAUDE_CERTIFICADOS.md`, `ergo-code`,
`vercel-react-best-practices` (filtro §4.3) y `frontend-design` (adaptador §4.2). Cada paso
deja la página funcionando y pasa `npm run build` y `npx eslint src/Certificados/`.

1. **Tipos y configuración.** Crear `interface/oferta-banner.interface.ts` (§3.2) y exportarlo en
   `interface/index.ts`. Crear `config/banner-ofertas.json` (§3.3) y añadir el bloque `banner` a
   `config/textos-certificados.json` (§3.4). Sin cambios visibles.
2. **Servicio.** Crear `services/useOfertasService.ts` con `getOfertas(): Promise<IOfertaBanner[]>`:
   `getToken` sobre `${API}/home-imagenes`, validación del sobre (§3.1) y filtro
   `seccion === 'promocion'`. Clonado del patrón de `home-ergo`, sin importarlo.
3. **WhatsApp (P2 = reutilizar).** `BannerOfertas.tsx` importa solo `urlWhatsappPromo` de
   `src/home-ergo/config/canales-contacto.tsx`: una sola fuente del número y del mensaje. Es la
   segunda excepción documentada a la regla de aislamiento, junto a `MarqueeHome`. Se llama con
   `caption ?? alt` (D10).
4. **Hook.** Crear `hooks/useOfertasBanner.ts` (§3.5) y su barril `hooks/index.ts` (la carpeta
   `hooks/` no existe: la SPEC 01 borró la anterior). Llamarlo en `CertificadoPage` **sin pintar
   nada todavía**. En Network (`npm run preview`) aparecen al entrar una petición a `home-imagenes`
   y **una** imagen, y al buscar ninguna petición nueva a `home-imagenes`.
5. **Componente.** Crear `components/BannerOfertas.tsx` (dirección visual en §6.1) y exportarlo
   en `components/index.ts`. Props: `ofertas: IOfertaBanner[]` e `indiceInicial: number`.
   - **Swiper.** `modules={[Autoplay, Pagination, A11y, EffectCreative]}`, con `import 'swiper/css'`,
     `'swiper/css/pagination'` y `'swiper/css/effect-creative'` (o `EffectFade` con
     `'swiper/css/effect-fade'`, ver §6.1).
   - **Navegación.** `initialSlide={indiceInicial}` (P4: el sorteo vive en el hook) y `rewind`, no
     `loop` (D6).
   - **Autoplay.** `autoplay={{ delay: segundosPorImagen * 1000, disableOnInteraction: false }}`, sin
     `pauseOnMouseEnter` (ver D5).
     Con «reducir movimiento», `autoplay={false}` y `speed={0}`.
   - **Imágenes por delante (Q1).** Un `Set` `cargadas` arranca con `indiceInicial` y la
     siguiente. En `onSlideChange` se añade la siguiente a la activa. Solo las diapositivas de
     `cargadas` llevan `src`; las demás pintan el marco vacío y nunca llegan a ser la activa sin
     imagen. Si una imagen falla (`onError`), el marco muestra su `alt` centrado, sin hueco.
   - **Pausa por foco (D5).** `onFocus`/`onBlur` en la raíz llaman a `swiper.autoplay.pause()` /
     `resume()` (instancia por `onSwiper`). `resume` no se llama si el puntero sigue encima.
   - **Barra (D7).** `onAutoplayTimeLeft` escribe `transform: scaleX(1 - percentage)` en un `ref`,
     sin `setState` (`rerender-use-ref-transient-values`).
   - **Una sola imagen.** Sin autoplay, sin puntos y sin barra.
   - **Desplazamiento (Q2).** Al montarse llama a
     `scrollIntoView({ block: 'nearest', behavior: reducirMovimiento ? 'auto' : 'smooth' })`
     sobre su raíz. No mueve el foco.
6. **Integración.** En `CertificadoPage.tsx`:
   - `resumenDe` devuelve `textos.resultados.cargando` con `estado === 'cargando'`. Mientras
     carga, la región `role="status"` se oculta a la vista con un `sxSoloLectores` local (clip de
     1 px, declarado a nivel de módulo en la página) y queda con `mb: 0` (D9). Fuera de la carga se
     ve como hoy.
   - `buscar` fija `conBanner` (`useState`) **al empezar**: `estadoOfertas === 'listo' && ofertas.length > 0`.
     No cambia hasta la búsqueda siguiente (D8).
   - Con `estado === 'cargando'`:
     - si `conBanner`, `<Fade in appear timeout={reducir ? 0 : 300}>` con `BannerOfertas` dentro;
     - si no, `<EstadoResultado estado="cargando" />` como hoy.

     El banner **no tiene animación de salida**: se desmonta al cambiar el estado (Q3).
   - Los resultados (vacío, error y tarjetas) van dentro de un `Fade in appear timeout={reducir ? 0 : 250}`
     sobre un `Box`, que se monta al cambiar el estado: entran con fundido, sin salto de diseño (Q3).
   - **Permanencia mínima (P1).** Si `conBanner`, el handler espera
     `Promise.allSettled([consultarDocumentos(rut), esperar(permanenciaMinimaMs)])` antes de cambiar
     el estado. Un error de la consulta también espera el mínimo, para que el banner no corte en
     seco. `busquedaVigente` se comprueba **después** de esa espera; hoy no se puede lanzar otra
     búsqueda durante la carga (L84/L95), pero la comprobación se mantiene como defensa. Sin banner
     no hay espera: el spinner se comporta igual que hoy.
   - Al terminar una búsqueda vigente que mostró el banner, se llama a `rotarInicial()` (P4 y Q1).
   - Con `prefers-reduced-motion`, los dos `Fade` usan `timeout={0}`. La permanencia mínima se
     mantiene.
7. **Guía.** Actualizar `specs/certificados/CLAUDE_CERTIFICADOS.md`:
   - «Estructura»: los archivos nuevos;
   - reglas duras ampliadas (§6, D1 y D2), más la precarga de una sola imagen;
   - «Verificación»: la petición única a `home-imagenes` al montar, medida en `preview` por el
     StrictMode.

---

## 5. Criterios de aceptación

- [ ] `npm run build` termina sin errores.
- [ ] `npx eslint src/Certificados/` sin errores.
- [ ] `grep -rn "Chequeo/" src/Certificados` vacío.
- [ ] `grep -rnE "from ['\"].*home-ergo" src/Certificados` devuelve **una** línea: el import de `urlWhatsappPromo` en `BannerOfertas.tsx`.
- [ ] `grep -rn "react-query\|swr\|redux" src/Certificados` vacío y `package.json` sin dependencias nuevas (`git diff package.json` vacío).
- [ ] `grep -rnE "#[0-9a-fA-F]{3,6}|fontFamily" src/Certificados/components/BannerOfertas.tsx` vacío (colores del tema, sin fuente propia).
- [ ] Los textos visibles y los `aria-label` del banner salen de `textos-certificados.json` (`grep -n "WhatsApp\|oferta" src/Certificados/components/BannerOfertas.tsx` solo devuelve imports, claves, identificadores o comentarios, no frases visibles).
- [ ] Network (`npm run build && npm run preview`; en `npm run dev` el StrictMode duplica la petición de montaje):
  - al entrar a `/certificados` hay **una** petición a `home-imagenes` y **una** sola imagen de `HomeImagenes/`;
  - cada búsqueda hace **una** petición a `certificados/consulta` y **ninguna** a `home-imagenes`.
- [ ] Mientras el banner está a la vista se piden como mucho la imagen activa y la siguiente: nunca todas las ofertas de golpe.
- [ ] Con 2 o más ofertas activas, al buscar un RUT se ve el banner en lugar del spinner, con una imagen a la vez, barra de progreso y puntos; la imagen cambia sola cada `segundosPorImagen`.
- [ ] La imagen se ve completa (`objectFit: contain`), sin recorte, a 360 px y a 1440 px.
- [ ] Clic en la imagen o en «Consultar por WhatsApp» abre `https://wa.me/…` en una pestaña nueva con el mensaje de promoción que incluye el `caption`; la búsqueda sigue en la pestaña original.
- [ ] Una oferta con `caption = null` no pinta la línea del caption, y el mensaje de WhatsApp y el `aria-label` del CTA usan su `alt`.
- [ ] Con ofertas activas, el banner se ve **al menos 2,5 s** desde que se pulsa «Buscar» aunque la API responda antes; si la API tarda más, los resultados salen apenas llega la respuesta.
- [ ] Al terminar, el banner se retira sin salto de diseño y los resultados, el vacío o el error entran con un fundido de 250 ms.
- [ ] Sin ofertas (o con `home-imagenes` caído), la búsqueda no tiene ninguna espera añadida.
- [ ] Durante la carga, «Buscar» y «Limpiar» siguen deshabilitados y Enter en el campo no lanza otra búsqueda; en el diff, `busquedaVigente` se compara después de la espera mínima.
- [ ] Una búsqueda que empieza antes de que la oferta inicial esté lista muestra el spinner hasta el final, aunque las ofertas queden listas a mitad (D8).
- [ ] En varias búsquedas seguidas, la oferta inicial cambia (al azar) y luego rota en el `orden` del Administrador.
- [ ] Con `home-imagenes` caído (bloqueado en DevTools) o sin ofertas `promocion` activas, la búsqueda muestra el spinner actual y no hay aviso al visitante.
- [ ] Con una sola oferta activa: imagen fija, sin puntos ni barra.
- [ ] Con «reducir movimiento» del sistema activado: sin autoplay ni efecto; se ve la oferta inicial fija y los puntos permiten cambiar a mano.
- [ ] A 360×640, al empezar una búsqueda con banner, la vista baja hasta dejarlo a la vista (entero, o con su borde superior arriba si no cabe) y el foco no se mueve. Si el banner ya cabe entero en la ventana, no hay desplazamiento; a 1440×900 no cabe y la vista baja lo justo (≈ 160–200 px).
- [ ] Un lector de pantalla anuncia «Buscando documentos…» al empezar la búsqueda (región `role="status"` existente) y no anuncia cada cambio de imagen. En pantalla ese texto no aparece duplicado, ni con el banner ni con el spinner.
- [ ] Cada imagen lleva el `alt` que viene de la API.
- [ ] Con teclado: los puntos y el CTA reciben foco visible; el autoplay se detiene mientras el foco o el ratón están sobre el banner.
- [ ] Al terminar la búsqueda, el foco pasa al `h2` de resultados como hoy.

### 5.1 Resultado del cierre (2026-11-12)

- **Rama y back.** `spec-02-banner-ofertas-busqueda-rut`, creada desde `feat/descarga-certificados`; lleva también la SPEC 01. El back no cambia (SPEC 08 «sin impacto»).
- **Verificación mecánica.** `npm run build` (tsc -b + vite) OK y `npx eslint src/Certificados/` sin errores. Greps de §5: `Chequeo/` vacío, un solo import de `home-ergo` (`BannerOfertas.tsx`, `urlWhatsappPromo`), sin react-query/swr/redux, sin hex ni `fontFamily`, sin frases visibles en el `.tsx`. `git diff package.json` vacío.
- **Prueba de humo en local** (Vite 5173 + back 127.0.0.1, RUT ficticio `11111111-1`, **una** promoción activa):
  - a 1440 se ven la etiqueta, el flyer con `contain`, el caption y el CTA;
  - el banner dura ≈ 2,55 s;
  - la región `status` dice «Buscando documentos…» sin duplicar el texto en pantalla, y al terminar da el resumen;
  - el foco pasa al `h2`;
  - a 360×640 la vista baja y el banner queda entero;
  - en dev hay 2 peticiones a `home-imagenes` (StrictMode) y ninguna al buscar;
  - consola sin errores.
- **Revisión de `ergosanitas-developer`** con `vite preview`, tres ofertas ficticias y la red externa interceptada. Corrigió cuatro fallos que **solo se ven en producción**:
  - los puntos no salían al montar, y con «reducir movimiento» nunca (ahora: contenedor por callback ref en estado y carrusel montado cuando existe);
  - el autoplay se reanudaba tras cada transición aunque el ratón o el foco siguieran dentro (ahora: `onAutoplayResume` vuelve a pausar);
  - los puntos salían alineados a la izquierda;
  - el CTA quedaba cortado 18 px tras el `scrollIntoView`.

  Después de corregir midió: 3 puntos a los 600 ms, Enter sobre un punto cambia la oferta, pausa y reanudación correctas, y el banner entero a 900/900 y 640/640.
- **`code-review` (medium).** 8 hallazgos:
  - 3 corregidos: puntos al montar y objeto `pagination` (por el revisor), y el comentario de «Limpiar» en `CertificadoPage`;
  - 2 descartados por decisión documentada: la espera mínima también ante un error (P1) y la lectura de «reducir movimiento» una sola vez (mismo patrón que el Home);
  - 3 fuera de alcance, porque son código de la SPEC 01: un sobre 200 con `success: false` en `consultarDocumentos`, `renovarUrl` cuando la reconsulta vuelve vacía a mitad de una descarga, y `getCertificadoExiste` sin uso.
- **Pendientes de `/spec-verify-ergo-front`** (necesitan Playwright y, para la rotación real, 2 o más promociones activas en el back local): rotación con barra y puntos, oferta inicial al azar, pausa por ratón y foco, teclado, «reducir movimiento», `home-imagenes` caído, `caption = null` y Network en `npm run preview`. Los criterios quedan sin marcar hasta esa verificación.

---

## 6. Decisiones tomadas y descartadas

- **Sí (usuario):** el banner solo se ve **mientras busca**, en lugar del spinner.
- **Sí (usuario):** rota las ofertas `promocion` activas cada N segundos, sin fechas de vigencia. El back no cambia (SPEC 08).
- **Sí (usuario):** una imagen grande a la vez, transición de entrada y salida, barra de tiempo, puntos y clic a WhatsApp como en la Home.
- **D1 — Sí (diseñador):** las ofertas se cargan **al montar la página**. Si se pidieran al buscar, llegarían junto con los resultados y el banner nunca se vería. Amplía la regla «Nada se consulta al montar la página» de la guía: la regla sigue valiendo para los datos del paciente; `home-imagenes` es contenido comercial público. La regla «una petición por búsqueda» se mantiene.
- **D2 — Sí (diseñador):** servicio, tipos y hook **clonados** en `src/Certificados/`, sin importar de `home-ergo` (la única excepción es `urlWhatsappPromo`, por P2). Es la regla de aislamiento del repo y tiene precedente (`chequeo-administrador/interface/imagen-home.interface.ts`). No se reutiliza `useImagenesHome`: repartiría alianzas y galería que aquí no se usan, y acoplaría la página pública de certificados a la portada.
- **D3 — Sí (diseñador):** la oferta inicial siempre está precargada. Si su imagen falla, la oferta se quita y se sortea otra. Una imagen no inicial que falla muestra su `alt` en el marco.
- **D4 — Sí (diseñador):** un solo anuncio vivo («Buscando documentos…» en la región `role="status"` que ya existe). El carrusel no anuncia sus cambios: el módulo `A11y` de Swiper pone `aria-live="off"` mientras hay autoplay (`a11y.mjs` L283).
- **D5 — Sí (diseñador):** el autoplay se pausa con el ratón encima y con el foco dentro del banner, y solo se reanuda cuando no queda ninguno de los dos. Lo llevan manejadores propios (`onPointerEnter`/`onPointerLeave` y `onFocus`/`onBlur`), sin `pauseOnMouseEnter`: Swiper no pausa por foco (`autoplay.mjs` L210–214) y su salida del ratón reanuda aunque el foco siga dentro (L203–208; corregido durante la implementación). Así se cumple WCAG 2.2.2 si la búsqueda dura más de 5 s. `disableOnInteraction: false`, como en el Home: tocar un punto no apaga el autoplay.
- **D6 — Sí (diseñador):** `rewind` y no `loop`. En Swiper 11 `loop` reordena el DOM, y eso choca con `EffectCreative` y con `initialSlide`; `rewind` funciona con cualquier cantidad. Lo que se cede: al volver de la última a la primera, esta entra desde el estado `prev` (escala 0,98) en vez de 1,04.
- **D7 — Sí (diseñador):** la barra de tiempo se escribe por `ref` desde `autoplayTimeLeft`, que se emite en cada frame. Con `useState` re-renderizaría el Swiper a 60 fps.
- **D8 — Sí (diseñador):** banner o spinner se decide **al empezar** la búsqueda (`conBanner`). Si se decidiera en cada render, unas ofertas que llegan a mitad cambiarían el spinner por un banner sin permanencia mínima.
- **D9 — Sí (diseñador):** mientras carga, la región `role="status"` se oculta a la vista (clip), pero los lectores de pantalla la siguen leyendo. Si no, «Buscando documentos…» saldría dos veces: en la región y en el spinner o en la etiqueta del banner.
- **D10 — Sí (diseñador):** con `caption = null`, el mensaje de WhatsApp y el `aria-label` usan el `alt`, y la línea del caption no se pinta. `urlWhatsappPromo` exige `string`, y en el Home un caption vacío deja el mensaje cortado.
- **No:** reutilizar `CarruselPromociones` de `home-ergo`. Muestra varias tarjetas a la vez con flechas, y aquí se pide una imagen grande con transición.
- **No:** dependencia nueva de animación (framer-motion u otra). Swiper 11 ya trae `EffectFade` y `EffectCreative`.
- **No:** mostrar el banner en estado inicial o junto a los resultados. Lo descartó el usuario.
- **Sí (usuario, P1):** permanencia mínima de 2,5 s del banner, solo cuando se muestra. Es publicidad: se acepta retrasar hasta ~1,5 s los resultados de una búsqueda rápida.
- **Sí (usuario, P2):** reutilizar `urlWhatsappPromo` de `home-ergo` (import de solo lectura) en vez de clonarlo. Amplía la regla de aislamiento junto a `MarqueeHome` (D2).
- **Sí (usuario, Q1 — reemplaza a P3):** precargar **solo la oferta inicial**, y las demás de a una, por delante de la que se ve. P3 («precargar todas») partía de que las imágenes eran pocas y livianas; son ≈ 17 MB, y en una búsqueda normal solo se ve una.
- **Sí (usuario, P4):** la oferta inicial de cada búsqueda es al azar, para dar dinamismo; luego rota en el `orden` del Administrador. El sorteo vive en el hook (`rotarInicial`), para que la inicial ya esté precargada.
- **Sí (usuario, Q2):** en móvil la vista se desplaza hasta el banner al empezar la búsqueda (`scrollIntoView` con `nearest`). Si el banner ya cabe entero, no se mueve; a 1440×900 no cabe y baja lo justo (decisión del usuario en la implementación: se mantiene `nearest`).
- **Sí (usuario, Q3):** el banner se retira sin animación y los resultados entran con un fundido de 250 ms. Se descartan el fundido cruzado (más código, la altura cambia al final) y esperar la salida del banner (suma 250 ms a cada búsqueda).

### 6.1 Dirección visual (`frontend-design`, adaptador §4.2)

- **A quién sirve:** al apoderado o deportista que espera 1–2 s su certificado. Es publicidad y no puede parecer un error ni un muro. Lo memorable es **la imagen**; todo lo demás va callado.
- **Composición:** un panel centrado del ancho del contenedor (`maxWidth="md"`).
  - Arriba, la etiqueta «Mientras buscamos, mira lo que está en oferta» en `body2` y `text.secondary`, con un `CircularProgress` de 16 px. La espera sigue siendo legible.
  - Al centro, el flyer en un marco con proporción **3:4**, alto máximo `min(60vh, 440px)` en escritorio, sobre `grey.50`, con `contain`, radio 2 y sombra 1 del tema.
  - Debajo, en una línea, el caption (`subtitle1`, peso 600; no se pinta si es `null`) y el botón `variant="contained"` con el icono de WhatsApp (botón del tema, sin verde de marca).
- **Movimiento** (un único momento orquestado; el resto quieto):
  - Entrada: opacidad 0 → 1 y escala 1,04 → 1.
  - Salida: opacidad 1 → 0 y escala 1 → 0,98.
  - `EffectCreative` con `creativeEffect.prev/next` (`opacity: 0`, `scale`) y `speed` = `duracionTransicionMs`, curva por defecto. Si `EffectCreative` da problemas, se usa `EffectFade` con `crossFade: true` y se pierde solo la escala.
  - El banner entra con un `Fade` de 300 ms y sale sin animación; los resultados entran con un fundido de 250 ms (Q3).
- **Barra de tiempo:** un `Box` de 3 px bajo el marco, `bgcolor: 'primary.main'`, `transformOrigin: 'left'`, con `transform: scaleX(1 - percentage)` escrito por `ref` desde `autoplayTimeLeft` (D7). Se oculta con «reducir movimiento» y con una sola imagen.
- **Puntos:** `Pagination` de Swiper (`clickable`) con el color `primary.main` del tema vía `sx` (`--swiper-pagination-color`), debajo de la barra.
- **Móvil:** el marco no cambia de tamaño; la vista baja hasta el banner (Q2).
- **Estados:** sin ofertas o con error → spinner actual. Con una oferta → imagen fija. Imagen no inicial que falla → su `alt` centrado en el marco.
- **Se descarta:** colores fijos, fuentes nuevas, ken-burns continuo, flechas de navegación (ruido para una espera corta), texto superpuesto a la imagen (los flyers ya traen texto), `cover` y un `LinearProgress` con estado (re-render por frame, D7).

---

## 7. Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| La búsqueda dura ~1–2 s: el banner puede verse muy poco | P1: permanencia mínima de 2,5 s. Contrapartida: una búsqueda rápida tarda hasta ~1,5 s más en mostrar resultados. Ajustable en `banner-ofertas.json` sin tocar código. |
| La espera mínima pinta resultados de una búsqueda vieja | Hoy no se puede lanzar otra búsqueda durante la carga (L84/L95). Aun así, `busquedaVigente` se comprueba después de la espera (paso 6). |
| Peso de las imágenes: el back acepta hasta 5 MB y no redimensiona; las 11 promociones actuales suman ≈ 16,9 MB | Q1: al entrar se precarga solo la inicial (≈ 2 MB) y las demás se piden de a una mientras el banner está a la vista. La solución de fondo (WebP y ancho máximo al subir) es una spec del back, fuera de alcance. |
| La oferta inicial sigue sin cargar cuando el visitante busca (móvil lento) | La búsqueda usa el spinner (D8). No hay espera añadida. |
| Un cambio futuro del sobre de `home-imagenes` rompe la página de certificados | La SPEC 08 del back registra el tercer consumidor (§2.1). El servicio valida el sobre y cae al spinner. |
| Clic en WhatsApp durante la búsqueda: el visitante deja la pestaña | Se abre en pestaña nueva (`target="_blank" rel="noopener noreferrer"`). La búsqueda sigue en la pestaña original. |
| `loop` de Swiper 11 reordena el DOM y choca con los efectos y con `initialSlide` | D6: `rewind`. Se confirma con Context7 en la implementación. |
| El StrictMode duplica la petición de montaje en `npm run dev` | El criterio de Network se mide en `npm run preview`; `vigente` descarta la primera respuesta. |
| El import de `canales-contacto.tsx` mete en el chunk 5 iconos MUI y `home-contacto.json` | Son pocos KB; se acepta con P2. |
| `scrollIntoView` mueve la página mientras el visitante mira el buscador | Solo con `nearest` (no se mueve si ya cabe), sin animación con «reducir movimiento» y sin mover el foco. |

---

## 8. Lo que **no** entra en esta spec

- Vigencia por fechas de las ofertas, ni cambios en el back ni en el mantenedor de imágenes.
- Optimizar las imágenes del Home al subirlas (back).
- Cambios en `src/home-ergo/` o en `src/chequeo-administrador/`.
- El banner fuera del estado `cargando`.
- Alianzas, galería, analítica de clics.
- Cambios en la consulta, las descargas o la SPEC 07 del back.

Cada uno, si llega, va en su propia spec.

---

## Preguntas resueltas (2026-11-12, por el usuario)

1. **P1 — Permanencia mínima:** mínimo de 2,5 s desde que empieza la búsqueda, solo cuando el banner se muestra (`permanenciaMinimaMs`).
2. **P2 — WhatsApp:** reutilizar `urlWhatsappPromo` de `home-ergo/config/canales-contacto.tsx`.
3. **P3 — Precarga:** ~~todas las ofertas al llegar la lista~~. **Reemplazada por Q1.**
4. **P4 — Orden:** oferta inicial al azar en cada búsqueda; luego rota en el `orden` del Administrador.

En la revisión:

5. **Q1 — Precarga:** solo la oferta inicial (≈ 2 MB por visita en vez de ≈ 17 MB); las demás de a una, por delante de la que se ve.
6. **Q2 — Móvil:** desplazar la vista hasta el banner al empezar la búsqueda.
7. **Q3 — Salida:** el banner se retira sin animación y los resultados entran con un fundido de 250 ms.

No quedan preguntas abiertas. La spec sigue en `Borrador` hasta que una persona la apruebe.

## Notas de revisión

**2026-11-12 — `/spec-ergo-front` (modo revisión).** Se comprobaron las filas de §1.1 contra el
código, `node_modules/swiper` 11.2.6 y el back (`routes/api.php`, `HomeImagenController`,
`HomeImagenService`, `openapi.yaml`).

- ✏️ Cabecera: la SPEC 08 del back está **Implementado**, no «Aprobado en disco».
- ✏️ `canales-contacto.tsx`: `urlWhatsappCon` en L65–66 y `urlWhatsappPromo(caption: string)` en L83–84. `HomeImagenService::listar` en L24–32.
- ❌ El riesgo «pocas imágenes y ya optimizadas» era falso: hasta 5 MB por imagen sin redimensionar; las 11 promociones suman ≈ 16,9 MB. Se volvió a preguntar P3 → Q1.
- ❌ El criterio de `grep "home-ergo"` contaba con algo que no existe (`MarqueeHome` viene de `Home/components`), y lo habrían roto los comentarios. Ahora es un grep de imports.
- ❌ El criterio de Network no contaba con el `<StrictMode>` de `main.tsx`: ahora se mide en `preview`.
- ❌ El criterio «buscar otro RUT o Limpiar durante la permanencia» no se podía probar: los dos botones están deshabilitados mientras carga. Ahora comprueba ese bloqueo y la comparación de `busquedaVigente` en el diff.
- ❌ El riesgo «`loop` con 2 imágenes duplica diapositivas» era de Swiper ≤ 8 → D6 (`rewind`).
- ✏️ D5: Swiper no pausa con el foco; se piden manejadores propios.
- ➕ Decisiones del diseñador D6–D10, para dudas que un implementador habría resuelto a ciegas: barra por `ref`, `conBanner`, región `status` oculta mientras carga y caption `null`.
- ➕ Q2 (móvil) y Q3 (salida sin salto de diseño), respondidas por el usuario.
- ✏️ Kit: engram disponible, context7 en *Diseñar* y dos reglas de vercel más.

**2026-11-12 — `/spec-impl-ergo-front`, antes del paso 1 (decisión del usuario).** ➕ §3.4 suma
`ariaPunto` y `ariaDiapositiva` para los mensajes de A11y de Swiper. Sin ellas, los puntos y las
diapositivas se anunciarían en inglés, y el criterio «los `aria-label` salen del JSON» no se cumpliría.

**2026-11-12 — `/spec-impl-ergo-front`, pasos 5 y 6 (prueba local).**
- ✏️ D5 y paso 5: sin `pauseOnMouseEnter`, porque Swiper reanuda al salir el ratón aunque el foco siga dentro (`autoplay.mjs` L203–208). Ratón y foco los llevan manejadores propios.
- ✏️ Criterio de desplazamiento (decisión del usuario: mantener `nearest`): a 1440×900 el banner no cabe y la vista baja ≈ 160 px. El criterio pasa a «si ya cabe entero, no hay desplazamiento».
- ✏️ La ruta pública es `/certificados` y no `#/certificados`: `Navigation.tsx` L58 usa `BrowserRouter`.

**2026-11-12 — `/spec-impl-ergo-front`, cierre.** Correcciones del revisor (`ergosanitas-developer`) que **no cambian** ninguna decisión (D1–D10, P1–P4, Q1–Q3), solo cómo se cumplen:
- ➕ Puntos: el contenedor va por callback ref en estado y el `Swiper` se monta cuando existe. Con `useRef` + `onBeforeInit` la ref llegaba `null`, porque Swiper se inicia en un layout effect antes que el hermano posterior.
- ➕ D5: `onAutoplayResume` vuelve a pausar, porque Swiper reanuda tras cada transición sin mirar el motivo de la pausa (`autoplay.mjs` L42–50).
- ✏️ El desplazamiento se mide después de montar el carrusel. A 1440×900 bajó entre 160 y 200 px, según carguen o no las imágenes de `MarqueeHome`.

## Kit de ejecución

> Perfiles: `UI-PUBLICA` · `CONTRATO` — recalculado el 2026-11-12 por `/spec-ergo-front` (modo revisión)
> Módulo: `src/Certificados/` · guía `CLAUDE_CERTIFICADOS.md` · agente dueño `ergosanitas-developer + guía`
> Fuente: `.claude/MATRIZ-HERRAMIENTAS.md`

| Fase | Skills | Agentes | MCP |
|---|---|---|---|
| Diseñar | brainstorming (técnica), frontend-design (§4.2) · `ergo-contrato-api` (raíz, leída) | — | graphify, context7, engram |
| Implementar | ergo-code, vercel-react-best-practices (filtro §4.3: `rerender-use-ref-transient-values`, `rerender-lazy-state-init`, `rerender-*`, `rendering-conditional-render`, `bundle-preload`, `client-event-listeners`), frontend-design, error-handling-patterns (§4.5: errores en línea, sin Swal) · cierre: code-review `medium`, changelog-generator | ergosanitas-developer (FE) en cada paso y en el cierre | graphify, context7 (`swiper` 11.2.6: `EffectCreative`/`EffectFade` con `rewind`, `autoplayTimeLeft`, `autoplay.pause/resume`; MUI 5 `Fade` con `appear`), engram, LSP (`findReferences` de los barriles `components/`, `interface/` y el nuevo `hooks/`) |
| Verificar | ergo-code + vercel filtrada (2b), frontend-design (auditoría de capturas 5b) | ergosanitas-developer (2b) | graphify, context7, playwright (solo local, sobre `npm run preview`: Network con una petición a `home-imagenes` y una imagen, capturas a 360×640 y 1440 px, desplazamiento en móvil, `prefers-reduced-motion` emulado), engram, LSP |

**Por qué:**
- `UI-PUBLICA`: carpeta `certificados` (página pública `/certificados`) y un banner comercial (§2 «Entra»).
- `CONTRATO`: consume `GET {API}/home-imagenes` (§3.1) y depende de la SPEC 08 del back.

**Perfiles evaluados y no activados:**
- `SENSIBLE`: el banner no toca el RUT ni ningún dato personal; no hay `localStorage`, `html:` ni URL firmada nuevos. El RUT y la URL firmada solo se nombran en «No entra».
- `TRANSVERSAL`: no toca `src/common/` ni `src/routes/`. El import de `home-ergo` (P2) es de solo lectura y va en «Área afectada».
- `GRAFICOS`, `CLINICO`, `FIGMA`: no aplican.

**Restricciones:** no se modifican `src/home-ergo/`, `src/chequeo-administrador/`, `src/common/` ni el back. Sin dependencias nuevas.
