# CLAUDE_HOME_ERGO.md — Guía del módulo `src/home-ergo/`

Documento de referencia para trabajar sobre la portada comercial de ergosanitas.com.
Recoge lo que decidieron las Specs 01 y 02, por qué, y qué **no** hay que romper.

> **Lee esto antes de tocar `src/home-ergo/`.** Las specs
> (`01-home-comercial-chat-ventas.md` y `02-promociones-arriba-y-contacto-visible.md`)
> tienen el detalle y la justificación de cada decisión; este archivo es el estado
> consolidado.

**Última actualización:** 2026-09-01 (cierre de la Spec 03)

---

## Reglas duras del módulo

1. **Solo se tocan tres cosas:** `src/home-ergo/`, las dos líneas de `src/routes/routes.ts`
   y los archivos de `public/home-ergo/`. Nada más.
2. **`src/Home/` no se toca y no se borra.** Sigue en el repositorio, intacto y sin rutear.
   Es la vía de reversa: si la portada nueva falla en producción, volver atrás es cambiar
   una línea de `routes.ts`.
3. **`src/AsistenteVirtual/`, `src/presentation/` y `src/asistente-voz/` quedan intactas.**
   El chat del Home es un **clon**. Si hay que cambiar algo del chat, se cambia la copia
   del módulo.
4. **`src/routes/Navigation.tsx` no se toca desde el módulo.** Incluye no arreglar sus dos
   bugs conocidos (ver «Bugs ajenos» más abajo). El humano sí lo editó al cerrar la Spec 01
   para alinear el color del `AppBar`; queda registrado ahí.
5. **Sin dependencias nuevas.** Todo se resuelve con lo que ya está en `package.json`:
   MUI 5, Swiper 11, react-helmet-async.
6. **El contenido vive en JSON, no en los componentes.** Ningún `.tsx` puede llevar una
   ruta de imagen o de video escrita a mano.
7. **Sin tests.** El proyecto no tiene runner configurado. No inventes comandos de test.
8. **`npm run build` debe quedar en verde.** `tsc -b` corre antes de Vite.

---

## Estado actual

| Spec | Título | Estado |
|------|--------|--------|
| 01 | Home comercial «home-ergo» con chat de ventas | **Implementado** |
| 02 | Promociones al inicio y contacto siempre visible | `Aprobado` — código implementado, falta verificar en navegador |
| 03 | Ampliación de gráficas al pasar el cursor y contacto solo en móvil | **Implementado** |

La 02 sigue marcada **`Aprobado`** a propósito: el paso a `Implementado` lo hace el humano
tras comprobar los criterios en el navegador, no el agente.

---

## Mapa de archivos

```
src/home-ergo/
├── index.ts                      barril del módulo
├── config/
│   ├── index.ts
│   ├── tema-home.ts              tokens de color, ancho, estilos tipográficos
│   ├── iconos.ts                 nombre (string) → componente de icono MUI
│   ├── canales-contacto.tsx      fuente única de los 6 enlaces de contacto
│   ├── home-hero.json            hero + los 2 indicadores
│   ├── home-servicios.json       7 servicios
│   ├── home-galeria.json         4 fotografías reales
│   ├── home-promociones.json     20 gráficas (11 destacadas + 8 alianzas + 1 apagada)
│   ├── home-videos.json          5 videos (hay 7 archivos en el servidor)
│   └── home-contacto.json        teléfono, WhatsApp, correo, redes, mensajes
├── interface/
│   ├── index.ts
│   ├── home.interface.ts         IHeroHome, IPortadaHome, IIndicadorHome,
│   │                             IServicioHome, IImagenHome, IPromocionHome,
│   │                             IVideoHome, IContactoHome, ICanalContacto
│   └── chat-home.interface.ts    IMensajeChatHome, IRespuestaChatHome
├── services/
│   ├── index.ts
│   └── UseChatComercialService.ts
├── components/
│   ├── index.ts
│   ├── TrazoEcg.tsx              elemento firma
│   ├── EncabezadoSeccion.tsx     etiqueta + titular compartidos
│   ├── Hero.tsx
│   ├── BarraIndicadores.tsx
│   ├── SeccionServicios.tsx  +  TarjetaServicio.tsx
│   ├── ComoFunciona.tsx
│   ├── GaleriaOperativos.tsx
│   ├── SeccionVideos.tsx     +  TarjetaVideo.tsx
│   ├── CarruselPromociones.tsx   dos variantes: promociones y alianzas
│   ├── ImagenAmpliable.tsx       envoltorio: amplía en overlay tras 3 s de puntero
│   ├── PastillaContacto.tsx      un canal, en variante franja o rail
│   ├── FranjaRedes.tsx           marquee de los 6 canales
│   ├── RailContacto.tsx          rail fijo al borde izquierdo (≥1200 px)
│   ├── SeccionContacto.tsx
│   └── chat/
│       ├── index.ts
│       ├── ChatComercial.tsx       estado y panel
│       ├── BotonChatFlotante.tsx   el FAB
│       ├── BurbujaBot.tsx
│       ├── BurbujaVisitante.tsx
│       ├── CajaMensaje.tsx
│       └── LoaderEscribiendo.tsx
└── pages/
    ├── index.ts                  barril con lazy()
    ├── HomeErgoPage.tsx          compone las 10 secciones + Helmet + chat + rail
    └── AppHomeErgoPage.tsx
```

`public/home-ergo/img/` (26 archivos, **en el repositorio**) y `public/home-ergo/video/`
(7 archivos, **ignorados por git**; ver «Los videos no viven en el repositorio»).

---

## El contenido vive en JSON

Es el requisito central del módulo: **agregar una foto, un video o un servicio es agregar
un objeto al JSON.** Ningún componente lleva rutas ni textos de negocio escritos a mano.

### Cómo agregar material

1. Copia el archivo a `public/home-ergo/img/` o `public/home-ergo/video/`, con nombre en
   `kebab-case` ASCII y el prefijo que corresponda.
2. Agrega un objeto al JSON de esa sección.
3. Recarga. No se toca código ni se recompila nada a mano.

### El campo `activo`

Galería, promociones y videos lo llevan. En `false` la entrada no se renderiza pero no se
borra. Existe para apagar una promoción vencida sin perder la línea: en septiembre se
apagan las ofertas de agosto y el año siguiente se vuelven a encender.

Hoy hay exactamente una entrada apagada: `info-holter-instrucciones`, que es material para
pacientes que ya compraron, no material de venta.

### El campo `destacado` (solo promociones)

Lo agregó la Spec 02 y **decide en qué carrusel aparece la gráfica**, no si aparece:

| `activo` | `destacado` | Dónde sale |
|---|---|---|
| `true` | `true` | Carrusel de promociones, arriba, tras la barra de indicadores |
| `true` | `false` | Franja de alianzas, abajo, entre los videos y la franja de redes |
| `false` | cualquiera | En ninguna parte |

Hoy son 11 destacadas —las de prefijo `promo-`— y 8 alianzas.

Dos cosas que hay que respetar:

- **El filtro se hace por el campo, nunca por el prefijo del `id`.** El prefijo se usó una
  sola vez, en la migración del dato. Una promoción que mañana se llame distinto no debe
  cambiar de sitio sola.
- **Se compara contra `true` y `false` de forma explícita**, y no con la verdad o falsedad
  del valor. El JSON se tipa con una aserción, así que TypeScript no obliga a que el campo
  exista: con `!destacado`, una entrada nueva que lo olvide caería disimuladamente entre
  las alianzas. Comparando contra `false` no aparece en ningún bloque, que es un error
  visible en vez de uno escondido.

### Los enlaces de contacto salen de `config/canales-contacto.tsx`

Es la **fuente única** del módulo. Ningún componente arma por su cuenta una URL de `wa.me`,
`tel:` ni `mailto:`. Lo consumen el Hero, el carrusel de promociones, la franja, el rail y
la sección de contacto; cambiar el teléfono es editar `home-contacto.json` y ya.

- `CANALES_CONTACTO` — los seis, en orden: teléfono, WhatsApp, correo, Instagram,
  Facebook, TikTok.
- `CANALES_DIRECTOS` y `REDES_SOCIALES` — los mismos, partidos por `grupo`.
- `CANALES_COMPACTOS` — los mismos, con el valor de WhatsApp cambiado al número. La franja
  y el rail usan este; la sección de contacto usa los otros. Sin él la píldora diría
  «WHATSAPP / Escríbenos por WhatsApp».
- `urlWhatsapp` — saludo genérico, para el botón del Hero.
- `urlWhatsappPromo( caption )` — sustituye `{promocion}` en `mensajeWhatsappPromo`.
- `IconoTiktok` — MUI no lo trae; se dibuja en SVG inline.

> **Es el único `.tsx` de `config/`**, y por eso: el icono de TikTok exige JSX. Dejarlo en
> `components/` e importarlo desde `config/` crearía una dependencia de `config` hacia
> `components`, que va al revés de como está ordenado el módulo.

### Rutas absolutas, no imports

Las rutas son `/home-ergo/img/...`, absolutas desde la raíz del sitio, no imports de Vite.
Si fueran imports haría falta una línea de `import` por archivo, y entonces agregar una
foto ya no sería «agregar una línea al JSON».

### `alt` es obligatorio

Sin `?` en la interfaz. La portada existe para vender: una imagen sin texto alternativo no
la indexa un buscador ni la lee un lector de pantalla.

### El campo `icono`

Es el **nombre** del icono de MUI, no el componente: un JSON no puede contener un
componente de React. Lo traduce el mapa de `config/iconos.ts`.

> **Costo conocido:** agregar un servicio con un icono que no esté en el mapa son **dos**
> ediciones, no una — el JSON y una línea en `iconos.ts`. Un nombre desconocido cae a
> `ICONO_POR_DEFECTO` (`LocalHospital`) en vez de romper la grilla.

---

## Los assets

### Nombres

Todos en `kebab-case` ASCII, sin espacios, tildes ni mayúsculas. Los nombres originales de
Instagram traían las tres cosas, lo que obliga a `encodeURI` en cada uso y da problemas en
servidores FTP y Linux.

El prefijo dice para qué sirve el archivo, y por tanto a qué JSON pertenece:

| Prefijo | Qué es | Cuántos |
|---|---|---|
| `promo-` | gráfica de campaña | 11 |
| `alianza-` | gráfica de convenio | 8 |
| `operativo-` | fotografía real de terreno | 4 |
| `respaldo-` | fotografía con figura pública | 1 |
| `info-` | material para pacientes, no de venta | 1 |
| `logo-` | logo | 1 |

### Dimensiones medidas

Esto no es una impresión, está medido sobre los archivos, y **manda sobre el diseño**:

- **Los 7 videos son verticales.** Seis en 9:16 (720×1280) y uno en 4:5 (1080×1350). Son
  publicaciones de Instagram, no material grabado para una web.
- **Las imágenes son mayoritariamente verticales**: los flyers van de 1024×1536 (2:3) a
  1024×1820, y las fotos de operativo son 1200×1600.
- **Solo 5 archivos son fotografías reales.** Los otros 21 son flyers con texto quemado,
  el logo y una gráfica informativa.
- La foto del hero pesa **3 MB** y los videos **139 MB** en total.

### Los videos no viven en el repositorio

**Los siete `.mp4` están en el servidor y `public/home-ergo/video/` está en `.gitignore`.**
Se subieron a mano por FTP a `/public_html/home-ergo/video/`, y ahí se quedan.

Las tres razones, todas medidas:

1. **El deploy los re-subiría en cada push.** El CI hace `lftp … mirror -R dist/
   /public_html` con `mirror:parallel-transfer-count 1`, o sea transferencia serial.
   `mirror` compara tamaño y fecha, y Vite copia `public/` a `dist/` con fecha nueva en
   cada build: los siete archivos se ven siempre «más nuevos» que los del servidor. 139 MB
   por cambiar el texto de un botón.
2. **Git no olvida.** Aunque después se borraran, seguirían en el historial, y el checkout
   del CI usa `fetch-depth: 0`. Además el `docker build` los metería en la imagen que se
   publica en Docker Hub.
3. **El job corre en matriz `[18.x, 20.x, 22.x]`**, y la matriz aplica al job completo: hoy
   son **tres subidas FTP en paralelo** al mismo servidor por cada push.

Por qué funciona sin tocar código:

- **Las rutas del JSON son absolutas desde la raíz del sitio** (`/home-ergo/video/…`). Al
  navegador le da igual si el archivo llegó en el `dist/` o lo subió alguien por FTP.
- **`mirror` no borra lo que no reconoce.** Solo elimina en el servidor con `--delete` /
  `-e`, y el workflow no se lo pasa. Lo subido a mano sobrevive a todos los despliegues.

> **Agregar un video son dos pasos, no uno:** subirlo por FTP a
> `/public_html/home-ergo/video/` **y** agregar la entrada en `home-videos.json`.

> **Quien clone el repositorio desde cero no tendrá los videos.** Verá las carátulas y el
> botón de play sin reproducción. Los archivos siguen en el disco de quien ya los tenía:
> `.gitignore` deja de rastrearlos, no los borra.

### Dos videos subidos que no usa nadie

`matando-la-seka-01.mp4` y `matando-la-seka-02.mp4` están en el servidor y responden 200,
pero **no tienen entrada en `home-videos.json`**, así que la portada no los muestra. Son
46 MB parados. O se les agrega su objeto al JSON, o se borran del servidor.

### El duplicado que se borró

`punto de salud Ergo Sanitas_.jpg` era byte a byte el mismo archivo que
`punto de salud deportiva chequeo cardiovascular_.jpg` (md5 `be7598f7…`). Se conservó uno,
renombrado a `operativo-punto-de-salud.jpg`.

---

## Sistema visual

### Paleta (`config/tema-home.ts`)

El proyecto **no tiene `createTheme`**: usa el tema por defecto de MUI. Estos tokens no lo
reemplazan, lo extienden solo dentro de `home-ergo`.

| Token | Hex | Uso |
|---|---|---|
| `azulErgo` | `#1976d2` | azul de marca. El mismo del `AppBar` y del `Footer` global |
| `azulProfundo` | `#0B2C4D` | velo del hero, secciones oscuras, titulares |
| `pulso` | `#E53935` | **reservado**: solo el trazo ECG |
| `hueso` | `#F5F7FA` | fondo de página |
| `grafito` | `#1C2733` | texto |
| `borde` | `#DDE4EC` | filetes |

`pulso` está reservado a propósito. Repartirlo por la página lo convertiría en decoración
y le quitaría el vínculo con lo que la empresa vende.

### Tipografía

**Restricción conocida:** agregar una familia tipográfica exige tocar `index.html`, que
está fuera del alcance del módulo. Se usa la Roboto por defecto de MUI y la personalidad
la carga el *tratamiento*:

- Titulares en peso 800 con `letterSpacing: -0.02em` y `lineHeight` compacto.
- Microetiquetas de sección en 12 px, mayúsculas, `letterSpacing: 0.18em`.

Ese contraste está encapsulado en `ETIQUETA_SECCION` y `TITULAR_SECCION`, y lo aplica
`EncabezadoSeccion` para que las seis secciones tengan el mismo ritmo.

### El trazo ECG es el elemento firma

`TrazoEcg.tsx` dibuja un electrocardiograma en SVG. Sale del instrumento propio del oficio:
todo lo que vende Ergo SaniTas orbita el corazón.

**Se usa una sola vez**, al pie del hero, animado durante 2,4 s. No se repite entre
secciones a propósito: su fuerza está en aparecer una vez, y regarlo por la página lo
convertiría en papel tapiz.

### Ritmo de fondos

Orden vigente desde la Spec 02:

```
 1  Hero                              azul profundo
 2  BarraIndicadores                  blanco
 3  CarruselPromociones «promociones» hueso
 4  SeccionServicios                  blanco
 5  ComoFunciona                      hueso
 6  GaleriaOperativos                 azul profundo
 7  SeccionVideos                     hueso
 8  CarruselPromociones «alianzas»    blanco
 9  FranjaRedes                       hueso
10  SeccionContacto                   azul profundo   (solo < 1200 px, Spec 03)
```

**Desde 1200 px la columna termina en la 9.** `SeccionContacto` no se renderiza, así que en
escritorio la última sección es `FranjaRedes` (hueso) contra el `<Footer />` global. La
alternancia se mantiene igual: lo que desaparece es el cierre oscuro.

**Ninguna sección puede quedar pegada a otra del mismo color.** Es la regla que ordena esa
columna, y es lo primero que se rompe al mover una sección de sitio: el fondo de los dos
carruseles se eligió en función de sus vecinas, no por gusto.

Las promociones van arriba porque un visitante que lee tres secciones y se va tiene que
haber visto ya lo que la empresa vende este mes. Las alianzas van abajo porque son
respaldo, no oferta.

Las dos secciones oscuras son deliberadas: la galería porque son las únicas fotos reales y
sostienen la credibilidad de todo lo demás, y el contacto porque cierra la página.

`EncabezadoSeccion` tiene la prop `sobreOscuro` para esos dos casos: sobre azul profundo,
el azul de marca no tiene contraste suficiente para un texto de 12 px.

---

## Patrones que hay que seguir

### Grillas: `auto-fit`, no columnas por breakpoint

```ts
gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
```

Servicios son 7 y la galería 4 — números que con columnas fijas dejan la última fila coja
en casi todos los anchos. Dejándolas fluir, el navegador reparte el espacio.

### El ajuste de imagen se elige por sección, no globalmente

Esta es una corrección hecha **durante** la implementación, cuando se midieron los
archivos:

| Sección | Proporción | Ajuste | Por qué |
|---|---|---|---|
| Galería | `1 / 1` | `cover` | Son fotografías; recortarlas por los bordes no les quita información. Cuadrado es el mejor promedio entre 3:4, 1:1 y 1,15:1 |
| Promociones | `3 / 4` | **`contain`** | Son flyers con el texto quemado. `cover` **borraría la oferta** |
| Videos | `9 / 16` | **`contain`** | Seis son 9:16 y uno es 4:5; recortar ese último le quitaría un tercio del ancho |

La galería usa además `objectPosition: 'center 35%'`: en una foto de gente trabajando lo
que importa está en el tercio superior, y centrado el recorte se comería las caras.

### Videos: `preload="none"` es obligatorio

Es la línea más importante de `TarjetaVideo.tsx`. Los siete videos suman 139 MB; sin ella
el navegador empezaría a descargarlos al abrir la portada. Con `preload="none"` lo único
que viaja es la carátula, y el `.mp4` se pide al pulsar play.

**Nunca `autoplay`.**

### `ImagenAmpliable`: dos líneas que no se pueden tocar (Spec 03)

Envuelve una imagen y la amplía en un overlay centrado tras 3 s de puntero encima. Hoy lo
montan los dos carruseles; el componente es genérico y recibe `src`, `alt`, `retardoMs` y
la imagen por `children`.

**Es un envoltorio, no un reemplazo de la imagen.** La tarjeta sigue decidiendo su
`aspectRatio`, su `objectFit` y su `loading`. Por eso puede servir igual a las
promociones (`contain`) y, el día que se decida, a la galería (`cover` con
`objectPosition`).

Dos cosas parecen detalles y no lo son:

1. **El overlay se monta con `createPortal` sobre `document.body`.** Swiper aplica
   `transform` a `.swiper-wrapper`, y un ancestro con `transform` se vuelve el bloque
   contenedor de sus descendientes `position: fixed`. Sin portal, el overlay se centra
   respecto del carrusel y queda recortado por el borde del slide. **Compila igual y solo
   se ve al deslizar.**
2. **El overlay lleva `pointer-events: none`.** Es lo que permite que ocupe la pantalla
   entera y que el clic siga llegando al enlace de WhatsApp de la tarjeta. Si alguna vez
   hace falta un botón dentro del overlay, hay que reabrir esa decisión antes de escribir
   código: son incompatibles.

**Eventos de puntero, nunca `onMouse*` + `onTouch*`.** Un solo par `pointerenter` /
`pointerleave` da hover en escritorio y pulsación larga en táctil, sin ramificar por
`pointerType`. Con manejadores de ratón, la secuencia de compatibilidad que el navegador
emite tras un *tap* incluye un `mouseenter` sin `mouseleave`: el overlay se abría solo tres
segundos después de tocar una promoción y no se cerraba. Es un error ya cometido y
corregido; no hay que volver a él.

El `preventDefault` del menú contextual va **en el elemento**, nunca en `document`: a nivel
de documento le quitaría el «guardar imagen» a toda la portada, incluidas las fotos de la
galería.

### Movimiento

Todo lo que se mueve respeta `prefers-reduced-motion`: el trazo del hero, el autoplay del
carrusel, el zoom de la galería, el desplazamiento de las tarjetas, la apertura del panel
de chat y los puntos del loader.

### Conversión

**Todos los llamados a la acción van a `/servicios`**, con `NavLink`, nunca con la URL
absoluta `https://ergosanitas.com/servicios` — una URL absoluta forzaría una recarga
completa de la SPA. WhatsApp es la vía secundaria.

### El contacto no lleva copyright

`src/App.tsx` monta un `<Footer />` global bajo toda página que ya lo pone. Repetirlo
dejaría dos avisos seguidos.

---

## Contacto siempre visible

La Spec 02 lo resuelve con **dos piezas, no una**. La franja sola no cumple «siempre
visible»: solo se ve cuando el scroll pasa por ella.

| Pieza | Dónde | Qué muestra |
|---|---|---|
| `FranjaRedes` | en el flujo, antes del contacto | los 6 canales desfilando, con icono, etiqueta y valor |
| `RailContacto` | `position: fixed`, borde izquierdo | los 6 canales, solo iconos |

Las dos pintan `PastillaContacto`, que es la misma unidad en dos variantes. Sustituye al
`MarqueeBox` del Home viejo, que resolvía lo mismo con una cadena de cinco `if` y treinta
líneas de estilos repetidos dentro de cada rama.

### El rail solo existe desde 1200 px

`display: { xs: 'none', lg: 'flex' }`. No es un capricho: el contenido se centra hasta
1400 px, así que en ventanas más estrechas ocupa todo el ancho y el rail taparía texto. En
móvil, además, el pulgar ya tiene el botón del chat.

**Consecuencia aceptada:** en el celular no hay contacto fijo. Ponerlo exigiría reubicar el
FAB del chat, y el chat no se toca.

### El rail y `SeccionContacto` son excluyentes (Spec 03)

Desde la Spec 03, `SeccionContacto` lleva `display: { xs: 'block', lg: 'none' }`: el
**negativo exacto** del rail. Los dos pintan los mismos seis canales, y tenerlos a la vez
es repetir el dato.

| Ancho | Sección de contacto | Rail |
|---|---|---|
| < 1200 px | sí | no |
| ≥ 1200 px | no | sí |

**El corte tiene que seguir siendo el mismo `lg` en los dos archivos.** Si uno se mueve
sin el otro, aparece un rango de anchos con contacto duplicado o —peor— sin ningún
contacto a la vista. Es la razón de que la Spec 03 eligiera 1200 px y no 900.

**Consecuencia aceptada y registrada:** desde 1200 px la portada se queda sin su último
llamado a `/servicios`, porque el rail solo ofrece contacto directo. Fue decisión
explícita del cliente al definir la Spec 03; revertirla es quitar una propiedad.

### El apilamiento está medido, no puesto a ojo

| Elemento | `z-index` |
|---|---|
| **Overlay de `ImagenAmpliable`** | **1400** |
| Botón flotante del chat | 1300 |
| Panel del chat | 1299 |
| `AppBar` de MUI | 1100 (por defecto) |
| **Rail de contacto** | **1090** |

El rail va por debajo de todos a propósito: es el elemento menos urgente de la pantalla.

El overlay va por encima de todos, y puede hacerlo sin discusión porque lleva
`pointer-events: none`: tapa durante el hover pero no intercepta un solo clic.

### El marquee no se pausa: no se monta

Con `prefers-reduced-motion: reduce` la franja renderiza una fila estática centrada con las
seis píldoras envolviendo. Es distinto de dejar un marquee «pausado», que vuelve a arrancar
al primer re-render.

### El clon del marquee

`FranjaRedes` es un clon rediseñado de `src/Home/components/MarqueeHome.tsx`, no un import.
`src/Home/` queda intacto como vía de reversa. De aquel quedan la idea y la librería
—`react-fast-marquee`, que ya estaba en `package.json`—; los PNG de iconos **no** se
copiaron: se usan los de `@mui/icons-material` más el TikTok inline.

---

## El chat comercial

### Es un clon, y eso es deliberado

`src/home-ergo/components/chat/` no importa nada de `src/presentation/` ni de
`src/AsistenteVirtual/`. Es la misma decisión que tomó la Spec 04 de ficha clínica, y ya
hay precedente en el repositorio. Se paga duplicación a cambio de que la portada quede
inmune a cambios en el asistente global.

### No pide RUT, y no es un detalle de copy

El asistente que sí existe (`sam-assistant/as-question`) resuelve **pacientes por RUT**.
Exponerlo a un visitante anónimo de la portada arriesga filtrar datos clínicos. Por eso el
Home tiene endpoint propio:

```
POST {VITE_API}{VITE_API_PATH}/chat-comercial/as-question   { prompt, sessionId } → { response }
```

**La separación es de seguridad, no de estilo.** No reutilices `sam-assistant` aquí.

### `USAR_ECO`

```ts
const USAR_ECO = true;   // en services/UseChatComercialService.ts
```

El endpoint todavía **no existe**. En `true` el servicio devuelve la misma pregunta tras
700 ms de latencia simulada. Las dos ramas son código real y `tsc -b` las type-checkea: la
llamada HTTP no está comentada a propósito, porque un comentario no compila y se pudre sin
que nadie se entere.

Es el mismo mecanismo que el `USAR_MOCK` de `UsePacienteService.ts` en ficha clínica.

> ⚠️ **Mientras esté en `true`, el chat le repite al visitante su propia pregunta.**
> Antes de desplegar con el backend listo, esto va en `false`.

### Tres chats, tres claves de sesión

| Clave | Módulo |
|---|---|
| `chat_session_id` | asistente global (`src/presentation/`) |
| `ficha_chat_session_id` | ficha clínica (Spec 04) |
| `home_chat_session_id` | **portada** |

Están separadas para que un hilo abierto en la ficha de un paciente no se filtre a lo que
ve un visitante anónimo en el Home.

### Lo que se quitó del original

- **Micrófono y reconocimiento de voz.** Es un chat de ventas en una portada pública; el
  dictado es del contexto clínico.
- **Botón «Consultar por otro paciente».** Aquí no hay pacientes.

### Comportamiento

- Arranca **cerrado**. Un chat que se abre solo encima del contenido es lo que la gente
  cierra sin leer.
- La burbuja de bienvenida se pinta fija y **no vive en el historial**: nadie la escribió,
  así que no es un turno de la conversación.
- El historial vive en `useState` dentro de `ChatComercial`. Sin contexto, sin store y
  **sin persistencia** entre recargas.
- Los errores se pintan como turno del asistente y proponen WhatsApp como salida.
- Escape cierra el panel; el foco va al campo de texto al abrir.

---

## Verificación

```bash
npm run build                 # tsc -b + vite. Debe quedar en verde
npx eslint src/home-ergo/     # debe salir en 0
```

Comprobaciones que conviene repetir tras cualquier cambio:

```bash
# Ninguna ruta de imagen o video escrita a mano en los componentes
grep -rn "/home-ergo/img\|/home-ergo/video" src/home-ergo --include=*.tsx

# Una sola URL de WhatsApp en todo el módulo, en canales-contacto.tsx
grep -rn "wa\.me" src/home-ergo --include=*.tsx --include=*.ts

# Nombres de archivo sin espacios, tildes ni mayúsculas
ls public/home-ergo/img public/home-ergo/video | grep -E '[[:upper:][:space:]]|[áéíóúñ]'

# Los videos siguen fuera del repositorio y responden en el servidor
git check-ignore -v public/home-ergo/video/esteban-paredes.mp4
curl -sI -o /dev/null -w '%{http_code}\n' https://ergosanitas.com/home-ergo/video/esteban-paredes.mp4

# Las tres claves de sesión siguen aisladas
grep -rhno "[\"'][a-z_]*session_id[\"']" src/ --include=*.ts --include=*.tsx | sort -u

# Solo routes.ts modificado fuera del módulo
git status --porcelain
```

En el navegador, lo que no se puede verificar desde la terminal:

- Al cargar `/`, **ningún `.mp4` en la pestaña Network**; y sí al pulsar play.
- El chat responde «hola» a «hola», con el loader entre medio.
- `localStorage` tiene `home_chat_session_id` y `chat_session_id` no se tocó.
- A 360 px ninguna sección desborda horizontalmente.
- Agregar una entrada a `home-galeria.json` y recargar hace aparecer la foto sin tocar
  código.
- A 1280 px el rail acompaña todo el scroll y no tapa contenido; a 1100 px **no aparece**.
- Abrir el chat no deja su panel por debajo del rail.
- Pulsar una promoción abre WhatsApp con el `caption` dentro del mensaje; pulsar una
  alianza no abre nada.

---

## Pendientes conocidos

Ninguno de estos es un descuido: están medidos, documentados y decididos.

| Pendiente | Detalle |
|---|---|
| `USAR_ECO = true` | El chat repite la pregunta. Va en `false` cuando exista el backend |
| El endpoint `/chat-comercial/as-question` no existe | La spec fija el contrato; el backend es trabajo aparte |
| Open Graph no lo verán los rastreadores | Helmet inyecta los `<meta>` **en el cliente**. Facebook y WhatsApp no ejecutan JavaScript, así que en un SPA estático leerán el `index.html`, cuyo `<title>` sigue siendo «Ergo Sanitas SPA». Arreglarlo exige tocar `index.html` o prerenderizar: otra spec |
| ~~`dist/` pesa 201 MB~~ | **Resuelto en parte.** Los 139 MB de video salieron del repositorio y del `dist/`: viven en el servidor. Quedan los 30 MB de imágenes, que sí se despliegan. Apagar una imagen con `activo: false` sigue sin sacarla del despliegue: `public/` se copia completo |
| El CI despliega tres veces por push | El job corre en matriz `[18.x, 20.x, 22.x]` y la matriz aplica al job entero, así que el paso de `lftp` se ejecuta tres veces en paralelo contra el mismo FTP. Es un problema del workflow, fuera del alcance del módulo. Se arregla moviendo el deploy a un job aparte que dependa del build |
| El hero pesa 3 MB | Afecta al LCP en móvil. Se corrige con una versión reducida del archivo y cambiando la ruta en `home-hero.json`, sin tocar código |
| **Las 11 promociones pesan 17 MB y ahora están cerca del inicio** | Siete son PNG de más de 1,5 MB. La Spec 02 las subió al segundo scroll, así que el navegador las pide poco después del hero. Se mitiga con `loading="lazy"` y `decoding="async"`, pero la solución real es convertirlas a WebP —debería dejarlas bajo 3 MB— y eso exige tocar `public/home-ergo/`, que la Spec 02 no toca. **Es la mejora de rendimiento más grande disponible hoy y merece spec propia** |
| No hay contacto fijo en móvil | El rail solo existe desde 1200 px. Ponerlo abajo en el celular exige reubicar el FAB del chat |
| El flyer no se puede leer en grande | Las gráficas llevan la letra chica quemada en la imagen y no hay lightbox. Se evaluó en la Spec 02 y se descartó: resolvía la lectura pero dejaba al visitante sin siguiente paso |
| Las promociones son de agosto | El campo `activo` existe para apagarlas, pero alguien tiene que acordarse |
| `logo-ergo-sanitas.jpg` no lo usa nadie | Quedó libre cuando el `og:image` pasó a tomar la foto del hero desde el JSON |
| `respaldo-esteban-paredes.jpg` | Usa la imagen de una figura pública. Se asume autorización porque salió de las redes de la propia empresa. Si no la hay, se apaga con `activo: false` |

### Bugs ajenos que el Home hereda

Están **fuera del alcance** del módulo y no se arreglan desde él:

1. **`Navigation.tsx` le pone al `AppBar` `width: { xs: '150%' }`** (línea 63), lo que
   provoca scroll horizontal en móvil en todas las páginas, la portada incluida. **Sigue
   vigente.** Por eso el criterio de aceptación dice «ninguna sección de `home-ergo`
   desborda» y no «la página no tiene scroll horizontal».
2. **La ruta `/asistente-virtual` está declarada después del catch-all
   `<Navigate to="/">`**, así que es inalcanzable. Sigue vigente.
3. ~~El `<Footer />` global tiene el mismo problema de ancho (`width: { xs: '140%' }`).~~
   **Corregido fuera de esta spec**, por el humano: pasó a `width: '100%'` con
   `boxSizing: 'border-box'`.

### Cambios hechos fuera del módulo, por el humano

Al cerrar la Spec 01 el repositorio tenía dos archivos modificados que **la spec prohibía
tocar** y que no cambió el agente:

| Archivo | Cambio |
|---|---|
| `src/Footer/pages/FooterPages.tsx` | Arreglo del desborde (`140%` → `100%`) y fondo a `#0B2C4D` |
| `src/routes/Navigation.tsx` | `AppBar` de `color="primary"` a `backgroundColor: '#0B2C4D'` |

Ambos alinean el marco de la aplicación con el `azulProfundo` de la paleta del Home, así
que la portada se ve continua con la barra y el pie. **Es una decisión de diseño válida,
pero rompe dos cosas que conviene tener presentes:**

- El criterio de aceptación «dentro de `src/routes/`, el único archivo modificado es
  `routes.ts`» **ya no se cumple**.
- `#0B2C4D` está ahora escrito a mano en dos archivos fuera del módulo, desacoplado de
  `TEMA_HOME.azulProfundo`. Si algún día cambia el token, esos dos no se enteran.

---

## Trabajar con `/spec` y `/spec-impl`

- Las specs del módulo viven en `specs/home-ergo/`, numeradas correlativamente.
- Los estados van en español: `Borrador` → `Aprobado` → `Implementado`.
- **El cambio a `Aprobado` lo hace el humano**, nunca el agente.
- **Si durante la implementación una decisión de la spec resulta equivocada, se corrige en
  la spec**, no en el código por sorpresa. En la Spec 01 pasó tres veces: el conteo de
  archivos, el `object-fit` de los flyers y el origen del `og:image`.
- Al cerrar cada spec nueva, se actualiza este archivo.

### Ajustes hechos durante la Spec 02

Tres decisiones se afinaron al implementar, y quedan anotadas aquí porque el texto de la
spec conserva la versión previa:

| Qué | Cómo quedó |
|---|---|
| Alcance del Paso 3 | La spec solo nombraba `SeccionContacto.tsx`, pero dos criterios de aceptación cubrían el Hero. `Hero.tsx` también pasó a consumir `urlWhatsapp` |
| Orden de los canales directos | Se respetó el que ya usaba la sección de contacto —teléfono, WhatsApp, correo— para no cambiarle el aspecto |
| El valor de WhatsApp en la píldora | `CANALES_COMPACTOS` muestra el número. Con el texto largo la píldora decía «WHATSAPP / Escríbenos por WhatsApp» |
