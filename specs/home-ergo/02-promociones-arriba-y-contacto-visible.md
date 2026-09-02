# SPEC 02 — Promociones al inicio y contacto siempre visible

> **Estado:** Implementado
> **Depende de:** SPEC 01 de `home-ergo` (Home comercial «home-ergo» con chat de ventas).
> **Referencia de patrón:** `src/Home/components/MarqueeHome.tsx` y `MarqueeBox.tsx`, que
> se clonan y rediseñan dentro del módulo. No se importan.
> **Fecha:** 2026-08-27
> **Área afectada:** `src/home-ergo/` únicamente. No se toca `src/Home/`, ni
> `src/routes/`, ni `public/home-ergo/`.
> **Objetivo:** Subir las promociones al inicio de la portada, convertirlas en un canal de
> venta hacia WhatsApp, y hacer que las redes sociales y los canales de contacto estén
> siempre a la vista mediante una franja en el flujo y un rail fijo.

---

## Por qué existe esta spec

La Spec 01 dejó las promociones en el penúltimo lugar de la portada, después de la
galería y los videos. El material comercial de la empresa —once flyers de campaña con
precios y ofertas— es lo último que ve un visitante, y casi nadie llega hasta ahí.

Al mismo tiempo, los datos de contacto viven solo en la sección final. Quien entra, lee
tres secciones y se va, nunca vio el WhatsApp ni las redes. El Home viejo (`src/Home/`)
resolvía eso con una franja marquee de redes sociales que la Spec 01 no reprodujo.

Esta spec corrige las dos cosas: la oferta sube al segundo scroll y el contacto deja de
depender de que el visitante llegue al final.

---

## Alcance

**Dentro:**

- **Reordenar `pages/HomeErgoPage.tsx`.** El orden pasa a ser: Hero → Indicadores →
  Promociones → Servicios → Cómo funciona → Galería → Videos → Alianzas → Franja de
  redes → Contacto.
- **Separar promociones de alianzas.** Se agrega el campo `destacado` a
  `config/home-promociones.json`. Las 11 gráficas `promo-` suben al inicio; las 8
  `alianza-` se quedan en el hueco que dejan, entre Videos y Contacto.
- **`components/CarruselPromociones.tsx` pasa a recibir props.** Un solo componente se
  monta dos veces —una por variante— en vez de duplicar el archivo.
- **La tarjeta de promoción se vuelve un enlace a WhatsApp** con el mensaje ya redactado
  y el nombre de la promoción dentro. Las tarjetas de alianza no: un convenio no se
  compra.
- **Franja de redes y contacto en el flujo** (`components/FranjaRedes.tsx`), clon
  rediseñado de `MarqueeHome`, justo antes de la sección de contacto.
- **Rail fijo de contacto** (`components/RailContacto.tsx`), vertical, en el borde
  izquierdo, visible en pantallas anchas y oculto en móvil.
- **`components/PastillaContacto.tsx`**: la unidad visual —icono más etiqueta— que
  comparten franja y rail. Equivale al `MarqueeBox` viejo, sin su cadena de `if`.
- **`config/canales-contacto.tsx`**: deriva los seis canales desde
  `config/home-contacto.json` en un solo lugar. Hoy la URL de `wa.me` se arma en tres
  archivos distintos.
- **Un campo nuevo en `config/home-contacto.json`**: `mensajeWhatsappPromo`, la plantilla
  del mensaje que se envía al pulsar una promoción.
- **Actualizar `specs/home-ergo/CLAUDE_HOME_ERGO.md`** al cerrar la spec.

**Fuera de alcance (para specs futuras):**

- **El lightbox del flyer.** Se evaluó y se descartó: la letra chica de las gráficas sigue
  sin resolverse, y eso es un problema real. Va en su propia spec si se decide.
- **Optimizar las imágenes.** Las 11 promociones pesan 17 MB. Convertirlas a WebP exige
  tocar `public/home-ergo/`, que esta spec no toca. Es la mejora de rendimiento más
  grande disponible y merece spec propia.
- **La barra inferior fija en móvil.** El rail no se muestra en pantallas angostas. Si
  más adelante se quiere contacto fijo en el celular, hay que reubicar el FAB del chat, y
  eso es un cambio al chat comercial.
- **Tocar el chat comercial.** `components/chat/` no se modifica. Ni su posición, ni su
  endpoint, ni su `USAR_ECO`.
- **`src/Home/`.** Sigue intacto y sin rutear. El marquee se clona, no se importa.
- **Assets nuevos.** No se copia ningún PNG ni video a `public/home-ergo/`.
- **Dependencias nuevas.** `react-fast-marquee` y `swiper` ya están en `package.json`.
- **Reescribir `SeccionContacto.tsx`.** Solo se le cambia de dónde saca los canales, para
  que use `canales-contacto.tsx` en vez de armarlos ella misma. Su diseño no cambia.

---

## Modelo de datos

Cuatro cambios. Ninguno es una estructura nueva grande: tres son campos añadidos y uno es
un derivado que hoy no existe.

### `interface/home.interface.ts` — tipo nuevo `IPromocionHome`

```ts
/**
 * Una gráfica del carrusel de promociones.
 *
 * Extiende `IImagenHome` con `destacado`, que decide en qué carrusel aparece: `true`
 * la sube al bloque de promociones del inicio, `false` la deja en la franja de
 * alianzas del final. Es un campo aparte de `activo` porque responden a preguntas
 * distintas: `activo` es «¿se muestra?» y `destacado` es «¿dónde?».
 *
 * La galería de operativos sigue usando `IImagenHome` a secas: sus fotos no se
 * reparten entre dos bloques.
 */
export interface IPromocionHome extends IImagenHome {
    destacado : boolean;
}
```

### `config/home-promociones.json` — campo `destacado` en las 20 entradas

```json
{
    "id": "promo-bioimpedancia-01",
    "src": "/home-ergo/img/promo-bioimpedancia-01.png",
    "alt": "Oferta de bioimpedancia de Ergo SaniTas",
    "caption": "Bioimpedancia",
    "activo": true,
    "destacado": true
}
```

Reparto exacto:

| Entradas | `activo` | `destacado` | Dónde salen |
|---|---|---|---|
| Las 11 con prefijo `promo-` | `true` | `true` | Carrusel del inicio |
| Las 8 con prefijo `alianza-` | `true` | `false` | Franja de alianzas del final |
| `info-holter-instrucciones` | `false` | `false` | En ninguna parte |

El filtro se hace por el campo, **nunca por el prefijo del `id`**. Una promoción que
mañana se llame distinto no debe cambiar de sitio sola.

### `config/home-contacto.json` — campo `mensajeWhatsappPromo`

```json
"mensajeWhatsappPromo": "Hola, vengo desde el sitio web y me interesa la promoción: {promocion}"
```

`{promocion}` se sustituye por el `caption` de la tarjeta pulsada. Es un marcador de texto
plano, no una plantilla de librería: un `replace` de una línea. `IContactoHome` gana el
campo como `string` obligatorio.

### `config/canales-contacto.tsx` — los seis canales, en un solo sitio

```ts
/** Un canal de contacto listo para pintar: ya trae su URL armada y su icono. */
export interface ICanalContacto {
    id       : 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'telefono' | 'correo';
    grupo    : 'red' | 'canal';        // red social, o canal directo
    etiqueta : string;                 // 'WhatsApp'
    valor    : string;                 // '+56 9 6114 9975'  — el texto que se ve
    url      : string;                 // 'https://wa.me/56961149975?text=…'
    externo  : boolean;                // true → target="_blank" + rel="noopener noreferrer"
    Icono    : ComponentType<SvgIconProps>;
}

export const CANALES_CONTACTO : ICanalContacto[];

/** Arma la URL de WhatsApp de una promoción, sustituyendo `{promocion}` por su caption. */
export const urlWhatsappPromo : ( caption: string ) => string;
```

Tres consecuencias de este archivo:

- **Es `.tsx` y no `.ts`.** El icono de TikTok no existe en MUI y se dibuja como SVG
  inline, lo que exige JSX. Hoy vive dentro de `SeccionContacto.tsx`; se muda aquí y pasa
  a ser la única definición. Es el primer `.tsx` de `config/`.
- **No entra en `config/iconos.ts`.** Ese mapa está tipado como `typeof SvgIcon` para
  resolver nombres que vienen de un JSON. Los canales no vienen de un JSON con nombres de
  icono: se declaran en código, y el TikTok inline no encaja en ese tipo.
- **`SeccionContacto.tsx` pierde sus constantes `REDES`, `CANALES`, `urlWhatsapp` y
  `IconoTiktok`,** y las importa de aquí. Su diseño no cambia ni una línea; cambia de
  dónde saca los datos.

`ICanalContacto` va en `interface/home.interface.ts` con el resto de tipos del módulo,
siguiendo la convención de las carpetas.

---

## Plan de implementación

Nueve pasos. Cada uno deja la portada funcionando y compilando: se puede parar después de
cualquiera de ellos y hacer commit. El proyecto no tiene runner de tests, así que la
verificación de cada paso son dos cosas — `npm run build` en verde (`tsc -b` corre antes
de Vite) y una comprobación a ojo en `npm run dev`.

### Paso 1 — Los datos, antes que nada

- `interface/home.interface.ts`: agregar `IPromocionHome` y el campo
  `mensajeWhatsappPromo` a `IContactoHome`.
- `config/home-promociones.json`: agregar `destacado` a las 20 entradas, con el reparto
  de la tabla del modelo de datos.
- `config/home-contacto.json`: agregar `mensajeWhatsappPromo`.
- `interface/index.ts`: exportar el tipo nuevo.

Nada cambia en pantalla: ningún componente lee todavía los campos nuevos.
**Verificación:** `npm run build` en verde y la portada se ve exactamente igual.

### Paso 2 — `config/canales-contacto.tsx`

Crear el archivo con `CANALES_CONTACTO`, `urlWhatsappPromo` y el `IconoTiktok` inline
—copiado desde `SeccionContacto.tsx`, que todavía conserva el suyo—. Agregar
`ICanalContacto` a `interface/home.interface.ts` y exportar desde `config/index.ts`.

Todavía no lo consume nadie.
**Verificación:** `npm run build` en verde. La portada sigue idéntica.

### Paso 3 — `SeccionContacto.tsx` consume el archivo nuevo

Borrar de ese componente `REDES`, `CANALES`, `urlWhatsapp` y `IconoTiktok`, e importar
`CANALES_CONTACTO`. Filtrar por `grupo` para separar las tres redes de los tres canales,
que es como ya está compuesta la sección.

**Verificación:** la sección de contacto del final se ve idéntica a antes, y los seis
enlaces siguen abriendo lo que abrían. Es un paso de refactor: si algo cambia
visualmente, está mal hecho.

### Paso 4 — `CarruselPromociones.tsx` acepta `variante`

Prop única `variante: 'promociones' | 'alianzas'`. De ella salen tres cosas: el filtro
(`destacado === true` o `destacado === false`, siempre junto a `activo`), los textos del
encabezado, y si la tarjeta es un enlace a WhatsApp o una imagen inerte.

La tarjeta de promoción pasa a ser un `<a>` a `urlWhatsappPromo(promo.caption)` con
`target="_blank"`, `rel="noopener noreferrer"` y `aria-label` propio. Mantiene
`object-fit: contain`: recortar un flyer borra la oferta que el flyer anuncia.

`pages/HomeErgoPage.tsx` monta `<CarruselPromociones variante="promociones" />` en la
posición que el carrusel ya ocupa. Todavía no se reordena nada.

**Verificación:** donde había 19 gráficas ahora hay 11, y al pulsar una se abre WhatsApp
con el mensaje que nombra esa promoción.

### Paso 5 — Reordenar la página

En `pages/HomeErgoPage.tsx`: subir `<CarruselPromociones variante="promociones" />` para
que quede entre `<BarraIndicadores />` y `<SeccionServicios />`, y montar
`<CarruselPromociones variante="alianzas" />` entre `<SeccionVideos />` y
`<SeccionContacto />`.

Ajustar los colores de fondo de sección para que no queden dos bloques blancos pegados:
la portada alterna hueso y blanco, y el reordenamiento rompe esa alternancia.

**Verificación:** el orden en pantalla es Hero → Indicadores → Promociones → Servicios →
Cómo funciona → Galería → Videos → Alianzas → Contacto, y no hay dos fondos iguales
consecutivos.

### Paso 6 — `components/PastillaContacto.tsx`

La unidad compartida por franja y rail: recibe un `ICanalContacto` y una prop
`variante: 'franja' | 'rail'`. En `franja` pinta icono más etiqueta más valor; en `rail`,
solo el icono con `aria-label` y `title`.

Sustituye la cadena de cinco `if` del `MarqueeBox` viejo por un único render tomando los
datos del canal. No se monta todavía en ninguna parte.

**Verificación:** `npm run build` en verde.

### Paso 7 — `components/FranjaRedes.tsx`

`react-fast-marquee` con `autoFill`, `pauseOnHover` y `gradient` alineado al fondo de la
franja. Recorre `CANALES_CONTACTO` completo y pinta una `PastillaContacto` por canal.

Respeta `prefers-reduced-motion: reduce`: con esa preferencia activa no hay marquee, y
los seis canales se pintan en una fila estática envolvente. El carrusel de la portada ya
sigue esa misma regla con su autoplay.

Montarla en `pages/HomeErgoPage.tsx` justo antes de `<SeccionContacto />`.

**Verificación:** la franja desfila, se detiene al pasar el cursor, los seis enlaces
abren lo correcto, y con «reducir movimiento» activado en el sistema queda quieta.

### Paso 8 — `components/RailContacto.tsx`

Rail vertical `position: fixed` en el borde izquierdo, centrado en alto, con las seis
pastillas en variante `rail`. `display: { xs: 'none', lg: 'flex' }`: bajo 1200 px no
existe, y por tanto no puede chocar con el FAB del chat ni tapar el contenido.

`z-index` por debajo del panel del chat comercial y del `AppBar`. Montarlo en
`pages/HomeErgoPage.tsx` fuera del flujo de secciones, junto a `<ChatComercial />`.

**Verificación:** en escritorio el rail acompaña todo el scroll y no tapa contenido con
el navegador a 1280 px; en móvil no aparece; el chat abre y cierra sin quedar detrás.

### Paso 9 — Barril y documentación

- `components/index.ts`: exportar `PastillaContacto`, `FranjaRedes` y `RailContacto`.
- `specs/home-ergo/CLAUDE_HOME_ERGO.md`: actualizar el mapa de archivos, el orden de
  secciones, el campo `destacado` y la fecha de última actualización.
- Cambiar el estado de esta spec a `Implementado` **lo hace el humano**, tras revisar en
  el navegador.

---

## Criterios de aceptación

### Orden y contenido de la portada

- [ ] Al cargar `/` sin sesión, el orden de secciones es: Hero, indicadores,
      promociones, servicios, cómo funciona, galería, videos, alianzas, franja de redes,
      contacto.
- [ ] El carrusel del inicio muestra 11 gráficas y todas tienen prefijo `promo-`.
- [ ] La franja del final muestra 8 gráficas y todas tienen prefijo `alianza-`.
- [ ] `info-holter-instrucciones` no aparece en ninguno de los dos.
- [ ] Poner `"destacado": false` en una entrada `promo-` la mueve al bloque de alianzas
      sin tocar ningún `.tsx`.
- [ ] Poner `"activo": false` en cualquier entrada la saca de ambos bloques.
- [ ] No hay dos secciones consecutivas con el mismo color de fondo.

### La promoción como canal de venta

- [ ] Pulsar una tarjeta de promoción abre WhatsApp en una pestaña nueva.
- [ ] El mensaje precargado contiene el `caption` exacto de la tarjeta pulsada.
- [ ] Pulsar una tarjeta de alianza no abre nada: no es un enlace.
- [ ] Las gráficas se ven completas, sin recorte del texto quemado en el flyer.

### Redes y contacto siempre visibles

- [ ] La franja de redes muestra los seis canales: Instagram, Facebook, TikTok,
      WhatsApp, teléfono y correo.
- [ ] La franja se detiene al pasar el cursor por encima.
- [ ] Con `prefers-reduced-motion: reduce` activo en el sistema operativo, la franja no
      se mueve y los seis canales siguen siendo legibles y pulsables.
- [ ] En una ventana de 1280 px el rail izquierdo permanece en pantalla durante todo el
      scroll de la página.
- [ ] En una ventana de 600 px el rail no se renderiza.
- [ ] El rail no tapa el contenido de ninguna sección a 1280 px.
- [ ] Abrir el chat comercial no deja el panel por debajo del rail.
- [ ] Los seis destinos son correctos: `wa.me` con el número del JSON, `tel:` sin
      espacios, `mailto:` con el correo del JSON, y las tres redes con sus URL del JSON.
- [ ] Cada icono del rail tiene `aria-label` propio, verificable inspeccionando el DOM.

### Fuente única de los datos de contacto

- [ ] Cambiar `telefonoWhatsapp` en `config/home-contacto.json` actualiza a la vez el
      botón del Hero, las tarjetas de promoción, la franja, el rail y la sección de
      contacto.
- [ ] `grep -r "wa.me" src/home-ergo/` devuelve una sola coincidencia, en
      `config/canales-contacto.tsx`.
- [ ] La sección de contacto del final se ve igual que antes de esta spec.

### Reglas del módulo

- [ ] `npm run build` termina en verde.
- [ ] `npm run lint` no agrega errores nuevos.
- [ ] `git status` no muestra cambios fuera de `src/home-ergo/` y
      `specs/home-ergo/CLAUDE_HOME_ERGO.md`.
- [ ] `package.json` no cambió: ninguna dependencia nueva.
- [ ] `public/home-ergo/` no cambió: ningún asset nuevo.
- [ ] Ningún `.tsx` nuevo contiene una ruta de imagen, un número de teléfono ni una URL
      de red social escritos a mano.

---

## Decisiones

### Posición y forma del carrusel

- **Sí:** promociones entre los indicadores y los servicios. El visitante ve primero de
  quién es el sitio y qué hace, y la oferta llega en el segundo scroll — arriba de
  servicios, que es lo que se pidió.
- **No:** promociones antes del Hero. La oferta sería lo primero absoluto, pero el
  visitante vería un flyer sin saber de quién es, y el LCP de la página pasaría a ser una
  gráfica de promoción en vez del titular.
- **No:** carrusel vertical (`Swiper direction="vertical"`). Se propuso en la primera
  versión del pedido y se retiró en la segunda. El motivo técnico respalda el retiro: en
  móvil el arrastre vertical del carrusel compite con el scroll de la página y el dedo
  queda atrapado dentro del componente. Se mantiene deslizamiento horizontal con
  tarjetas verticales, que es la forma real de los flyers.
- **Sí:** `object-fit: contain` en ambos carruseles. Decisión heredada de la Spec 01 y no
  reabierta: los flyers traen el texto quemado en la imagen y `cover` recorta justo la
  oferta.

### Separar promociones de alianzas

- **Sí:** campo `destacado` en `home-promociones.json`. Es simétrico con `activo`, que ya
  existe y ya se entiende, y mantiene la regla del módulo: mover una promoción es editar
  una palabra en un JSON.
- **No:** campo `tipo: 'promocion' | 'alianza'`. Describe qué **es** la gráfica, no dónde
  va. El día que una alianza se quiera destacar arriba, `tipo` obligaría a mentir en el
  dato.
- **No:** dos archivos JSON separados. Serían dos lugares que revisar para una pregunta
  tan simple como «¿qué estamos mostrando este mes?».
- **No:** filtrar por el prefijo del `id`. Funcionaría hoy y fallaría el día que alguien
  renombre una entrada. El nombre de un archivo no es un campo de datos.
- **Sí:** un solo componente con prop `variante`, montado dos veces. Duplicar el archivo
  daría dos copias que divergen en el primer arreglo de estilo.

### La promoción como enlace

- **Sí:** la tarjeta de promoción abre WhatsApp con el `caption` dentro del mensaje.
  Convierte una imagen decorativa en un canal de venta, y el equipo recibe el mensaje ya
  sabiendo qué promoción vio la persona.
- **No:** lightbox con el flyer en grande. Resuelve la letra chica de las gráficas, que
  es un problema real, pero deja al visitante sin siguiente paso. Queda fuera de alcance
  y con spec propia si se decide.
- **No:** tarjeta de alianza enlazada. Un convenio no se compra; enlazarlo a WhatsApp
  generaría consultas sobre algo que no está en venta.

### Redes y contacto siempre visibles

- **Sí:** franja en el flujo **y** rail fijo. La franja sola no cumple «siempre visible»:
  solo se ve cuando el scroll pasa por ella.
- **Sí:** rail en el borde izquierdo. El derecho ya lo ocupa el FAB del chat comercial, y
  apilar dos elementos flotantes distintos en el mismo lado obliga a coordinar sus
  posiciones para siempre.
- **Sí:** rail oculto en pantallas angostas. En móvil la pantalla es chica y el pulgar ya
  tiene el FAB del chat. Un rail ahí compite con el chat por el mismo gesto.
- **No:** barra inferior fija en móvil. Obligaría a mover el FAB del chat, y el chat es
  código que esta spec decidió no tocar.
- **Sí:** los seis canales en franja y rail — tres redes y tres canales directos. Es
  literalmente lo que se pidió, y `home-contacto.json` ya tiene los siete campos.

### Clonado del marquee

- **Sí:** clonar `MarqueeHome`/`MarqueeBox` dentro de `src/home-ergo/`. Es la regla dura
  del módulo heredada de la Spec 01: `src/Home/` queda intacto como vía de reversa.
- **Sí:** `react-fast-marquee`. Ya está en `package.json` y ya es lo que usa el Home
  viejo. Resuelve gratis el relleno automático y la pausa al pasar el cursor.
- **No:** animación CSS propia. Ahorraría una dependencia que de todos modos ya está
  instalada, a cambio de reimplementar a mano lo que la librería ya hace.
- **Sí:** iconos de `@mui/icons-material` más el SVG de TikTok inline. Cero assets
  nuevos, y coherencia con el resto de la portada.
- **No:** copiar los PNG del `MarqueeBox` viejo. Sumaría cuatro archivos a
  `public/home-ergo/` y arrastraría su import roto (`/public/assets/images/…`).
- **No:** conservar la cadena de cinco `if` por tipo del `MarqueeBox`. Agregar un canal
  hoy significa agregar un bloque de treinta líneas; con `PastillaContacto` es agregar un
  objeto a un arreglo.

### Fuente única de los datos de contacto

- **Sí:** `config/canales-contacto.tsx`. Sin él la URL de `wa.me` quedaría armada en
  cuatro archivos, y cambiar el número de teléfono exigiría acordarse de los cuatro.
- **Sí:** `.tsx` en `config/`, que es el primero del módulo. El icono de TikTok no existe
  en MUI y exige JSX. La alternativa —dejarlo en `components/` e importarlo desde
  `config/`— crearía una dependencia de `config` hacia `components`, que va al revés.
- **No:** meter los canales en `config/iconos.ts`. Ese mapa está tipado como
  `typeof SvgIcon` para resolver nombres que vienen de un JSON; el TikTok inline no
  encaja en ese tipo y los canales no vienen de un JSON.
- **Sí:** tocar `SeccionContacto.tsx` para que consuma el archivo nuevo. Es alcance que
  no se pidió, pero dejarlo fuera daría dos fuentes de verdad desde el primer día.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| **17 MB de promociones suben cerca del inicio.** Las 11 gráficas `promo-` pesan 17 MB: siete son PNG de más de 1,5 MB. Hoy están al final y casi nadie llega; al subirlas al segundo scroll, el navegador las pide poco después del Hero. En móvil con datos es la diferencia entre una portada rápida y una que se arrastra. | Se mantiene `loading="lazy"` y `decoding="async"` en cada gráfica. Swiper monta todas las láminas en el DOM, así que el navegador puede anticipar las cercanas: aun así solo baja las que se acercan al viewport, no las 11 de golpe. **La optimización real —convertir los PNG a WebP— queda fuera de alcance**, porque esta spec no toca `public/home-ergo/`. Merece spec propia y es la que más rendimiento devuelve. |
| **Una promoción nueva sin `destacado` cae silenciosamente entre las alianzas.** El JSON se tipa con `as IPromocionHome[]`, y una aserción de tipo no obliga a que el campo exista: TypeScript no lo detecta y `undefined` se evalúa como falso. | El filtro se escribe como `p.destacado === true` para promociones y `p.destacado === false` para alianzas. Una entrada sin el campo no aparece en ninguno de los dos bloques: se nota de inmediato en vez de aparecer en el sitio equivocado. Queda anotado en `CLAUDE_HOME_ERGO.md`. |
| **El rail fijo tapa contenido entre 960 y 1200 px.** El contenido se centra hasta 1400 px de ancho: por debajo de eso ocupa toda la ventana y no hay margen lateral libre donde el rail pueda vivir. | El rail se muestra desde 1200 px (`lg`) y no desde 960 px (`md`). Entre 960 y 1200 px no se renderiza, igual que en móvil. El criterio de aceptación de los 1280 px verifica el caso bueno. |
| **Guerra de `z-index` entre rail, panel del chat y `AppBar`.** Son tres elementos flotantes de módulos distintos y ninguno declara hoy una escala compartida. | El rail se fija por debajo del panel del chat y por debajo del `AppBar`. Los tres valores se dejan escritos con su razón en el propio componente. El criterio «abrir el chat no deja el panel por debajo del rail» lo verifica. |
| **El desborde horizontal del `AppBar` mueve el rail.** `Navigation.tsx` tiene un `width: 150%` conocido que produce scroll horizontal en la página. Un elemento `fixed` se posiciona contra el viewport, así que al desplazarse a la derecha el rail queda encima de contenido. | Es un bug ajeno y `Navigation.tsx` está fuera de alcance por regla dura del módulo. Se verifica que el rail no empeore la situación. Si el desborde se arregla algún día, el rail se comporta correctamente sin cambios. |
| **El marquee repinta de forma continua en móvil.** `react-fast-marquee` anima sin parar mientras la franja está montada, y eso consume batería en celulares modestos. | Se respeta `prefers-reduced-motion: reduce`, que deja la franja estática. La franja es de alto reducido y el navegador suspende la animación cuando el elemento sale del viewport. |
| **El `caption` de una promoción rompe la URL de WhatsApp.** Los textos llevan tildes y guiones largos («Alianza — Bioimpedancia»). | El mensaje se arma siempre con `encodeURIComponent`, en `urlWhatsappPromo` y en un solo lugar. Es la misma función que ya usan el Hero y la sección de contacto. |

---

## Lo que **no** entra en esta spec

- Lightbox del flyer en grande.
- Optimizar las 11 promociones a WebP, aunque pesen 17 MB.
- Barra de contacto fija en móvil.
- Cualquier cambio al chat comercial: posición, endpoint o `USAR_ECO`.
- Cualquier cambio a `src/Home/`, `src/routes/`, `public/home-ergo/` o `package.json`.

Cada una de esas cosas, si se hace, va en su propia spec.
