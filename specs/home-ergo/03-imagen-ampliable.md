# SPEC 03 — Ampliación de gráficas al pasar el cursor y contacto solo en móvil

> **Estado:** Implementado
> **Depende de:** SPEC 01 de `home-ergo` (Home comercial «home-ergo» con chat de ventas)
> y SPEC 02 de `home-ergo` (Promociones al inicio y contacto siempre visible).
> **Resuelve un pendiente declarado:** la Spec 02 dejó «el lightbox del flyer» fuera de
> alcance con el motivo «la letra chica de las gráficas sigue sin resolverse, y eso es un
> problema real». Esta spec lo resuelve.
> **Fecha:** 2026-09-01
> **Área afectada:** `src/home-ergo/` únicamente. No se toca `src/Home/`, ni `src/routes/`,
> ni `public/home-ergo/`, ni `components/chat/`.
> **Objetivo:** Que las gráficas de los dos carruseles se amplíen en un overlay centrado
> tras tres segundos de cursor encima, mediante un componente reutilizable
> `ImagenAmpliable`, y que la sección de contacto se muestre solo por debajo de 1200 px.

---

## Alcance

**Dentro:**

- **Nuevo `components/ImagenAmpliable.tsx`.** Envuelve una imagen y, tras un retardo con
  el cursor encima, la repinta ampliada en un overlay centrado sobre fondo oscurecido.
  Recibe `src`, `alt` y `retardoMs` (3000 por defecto). No conoce promociones ni
  carruseles: es genérico.
- **El overlay se renderiza con un portal a `document.body`.** No es un detalle de
  implementación menor y por eso está en el alcance: Swiper aplica `transform` a
  `.swiper-wrapper`, y un ancestro con `transform` se vuelve el bloque contenedor de sus
  descendientes `position: fixed`. Sin portal, el overlay se centraría respecto del
  carrusel y quedaría recortado, no respecto de la pantalla.
- **El overlay lleva `pointer-events: none`.** El cursor sigue sobre la tarjeta mientras
  el overlay está abierto: el hover no se corta, el clic sigue llegando al enlace de
  WhatsApp y al salir de la tarjeta el overlay se cierra solo.
- **Montarlo en `components/CarruselPromociones.tsx`,** en las dos variantes. Es un solo
  punto de montaje: el componente ya se instancia dos veces.
- **Apertura por pulsación larga en táctil,** con `contextmenu` cancelado únicamente
  dentro de `ImagenAmpliable`. Se cierra al levantar el dedo.
- **Reinicio del contador al cambiar de tarjeta.** Pasar el cursor de una gráfica a otra
  antes de cumplirse el retardo arranca de cero en la nueva.
- **Respeto a `prefers-reduced-motion: reduce`:** el overlay aparece sin transición, no se
  desactiva. Ampliar una imagen ilegible es funcional, no decorativo.
- **`components/index.ts`:** exportar el componente nuevo.
- **`components/SeccionContacto.tsx`:** ocultarla desde 1200 px con
  `display: { xs: 'block', lg: 'none' }` en su `Box` raíz. El componente se hace cargo de
  su propia visibilidad, igual que `RailContacto` hace con la suya.
- **Actualizar `specs/home-ergo/CLAUDE_HOME_ERGO.md`** al cerrar la spec.

**Fuera de alcance (para specs futuras):**

- **Montar `ImagenAmpliable` en la galería y en las carátulas de video.** El componente
  queda genérico y listo para ello, pero la galería usa `cover` con un recorte
  deliberado (`objectPosition: 'center 35%'`) y los videos ya tienen su propio gesto de
  play. Son dos discusiones distintas.
- **Zoom y desplazamiento dentro del overlay.** Se amplía a un tamaño fijo. Ni lupa, ni
  rueda del ratón, ni pinza.
- **Servir una imagen de mayor resolución en el overlay.** Se usa el mismo archivo que ya
  está en la tarjeta. No existe otra versión de los flyers.
- **Optimizar las imágenes a WebP.** Sigue pendiente desde la Spec 02 y sigue siendo la
  mejora de rendimiento más grande disponible. Exige tocar `public/home-ergo/`.
- **Reubicar el llamado a `/servicios`.** Decisión tomada: al ocultar la sección de
  contacto en escritorio, la portada se queda sin ese botón desde 1200 px y se acepta.
- **Cambiar `RailContacto` o su punto de corte.** El corte en 1200 px es justamente lo
  que hace que no quede hueco.
- **Cualquier otro cambio a `SeccionContacto.tsx`.** Solo se le agrega el `display`. Su
  diseño, sus textos y sus canales no se tocan.
- **Tocar el chat comercial.** `components/chat/` no se modifica.
- **`src/Home/`.** Sigue intacto y sin rutear.
- **Assets nuevos y dependencias nuevas.** El overlay se construye con MUI, que ya está.

---

## Modelo de datos

Esta spec **no introduce ni modifica ninguna estructura de contenido**. Los seis JSON de
`config/` quedan intactos: no hay campos nuevos en `home-promociones.json`, y las
interfaces `IPromocionHome` e `IImagenHome` no cambian. La carpeta `interface/` no se
toca.

Lo único que aparece es el contrato del componente, local a su archivo, siguiendo la
convención de los otros diez componentes del módulo.

### `components/ImagenAmpliable.tsx`

```ts
interface Props {
    /** Ruta de la imagen que se muestra ampliada. Absoluta desde la raíz del sitio. */
    src        : string;
    /** Texto alternativo del overlay. Obligatorio, igual que en el resto del módulo. */
    alt        : string;
    /** Milisegundos de cursor encima antes de ampliar. */
    retardoMs ?: number;   // 3000
    /** La imagen tal como ya se pinta en la tarjeta. */
    children   : ReactNode;
}
```

**Es un envoltorio, no un reemplazo de la imagen.** Recibe por `children` el
`<Box component="img">` que la tarjeta ya renderiza, con su `aspectRatio`, su
`objectFit`, su `loading="lazy"` y su `sx`. El componente no absorbe ninguna de esas
decisiones: solo escucha el puntero sobre lo que envuelve y pinta el overlay.

Esa es la forma que lo hace reutilizable de verdad. La galería recorta con
`objectFit: 'cover'` y `objectPosition: 'center 35%'`; las promociones ajustan con
`contain`. Un componente que renderizara la imagen él mismo tendría que reexponer todas
esas props para servir a los dos casos.

### Estado interno

```ts
const [ ampliada, setAmpliada ] = useState( false );
const temporizador = useRef< number | null >( null );
```

Convenciones:

- El temporizador vive en un `ref` y no en el estado: cambiarlo no debe repintar nada.
- Se limpia en tres sitios: al salir el puntero, al abrir el overlay y al desmontar el
  componente. Un temporizador vivo tras el desmontaje dispara un `setState` sobre un
  componente que ya no existe.
- No hay estado compartido entre tarjetas. Cada `ImagenAmpliable` es independiente, y el
  «reinicio del contador al cambiar de tarjeta» sale solo de eso: la que se abandona
  limpia el suyo y la nueva arranca el propio.
- Nada se persiste. Ni `localStorage`, ni contexto, ni store.

---

## Plan de implementación

Cada paso deja la portada funcionando y es commiteable por separado. No hay runner de
tests en el proyecto: la verificación de cada paso es `npm run build` en verde más una
comprobación en el navegador.

1. **`SeccionContacto` solo por debajo de 1200 px.**
   Agregar `display: { xs: 'block', lg: 'none' }` al `Box` raíz de
   `components/SeccionContacto.tsx`. Es el único cambio del archivo.
   *Verificación:* en una ventana de 1400 px la sección «Agenda tu hora hoy» no aparece y
   el rail izquierdo sí; estrechando por debajo de 1200 px se invierte. Nunca se ven las
   dos a la vez, y nunca ninguna de las dos.

2. **`ImagenAmpliable` como envoltorio transparente.**
   Crear `components/ImagenAmpliable.tsx` con la `interface Props` de la sección anterior.
   Por ahora solo devuelve `children` dentro de un `<Box>` con `display: 'block'`.
   Exportarlo en `components/index.ts`. Envolver con él el `<Box component="img">` de
   `CarruselPromociones.tsx`, que sirve a las dos variantes de una vez.
   *Verificación:* los dos carruseles se ven exactamente igual que antes. Este paso no
   cambia nada visible a propósito: aísla el cableado de la conducta.

3. **El overlay.**
   Estado `ampliada`, `ref` del temporizador y manejadores `onPointerEnter` /
   `onPointerLeave` / `onPointerCancel`.
   A los `retardoMs` se monta, **con `createPortal` sobre `document.body`**, un fondo
   `rgba(11,44,77,0.72)` a pantalla completa con la imagen centrada en `objectFit: contain`,
   limitada a `90vh` de alto y `90vw` de ancho. Todo el overlay lleva
   `pointer-events: none` y `zIndex: 1400`. El temporizador se limpia al salir el puntero,
   al abrir y al desmontar el componente.
   *Verificación:* dejar el cursor tres segundos sobre un flyer lo amplía centrado en la
   pantalla y legible; moverlo fuera lo cierra; **hacer clic mientras está abierto sigue
   abriendo WhatsApp**; deslizar el carrusel con el overlay abierto no lo descoloca.

4. **`prefers-reduced-motion`.**
   Con `reduce`, el overlay aparece sin transición de opacidad. No se desactiva.
   *Verificación:* activando «reducir movimiento» en el sistema, el overlay sigue
   apareciendo a los tres segundos, de golpe.

5. **Pulsación larga en táctil.**
   No hacen falta manejadores propios: los eventos de puntero del paso 3 ya cubren el
   táctil. `pointerenter` se dispara al apoyar el dedo y `pointerleave` al levantarlo, así
   que la misma cuenta atrás da hover en escritorio y pulsación larga en el móvil. Este
   paso agrega solo `onContextMenu` con `preventDefault`, **en el elemento y nunca en
   `document`**.
   *Verificación:* en el emulador táctil del navegador, mantener el dedo tres segundos
   sobre un flyer lo amplía; al soltar se cierra; no aparece el menú nativo de «guardar
   imagen» sobre las gráficas, y sí sigue apareciendo sobre las fotos de la galería.

6. **Actualizar `specs/home-ergo/CLAUDE_HOME_ERGO.md`.**
   Tres puntos: el componente nuevo en el mapa de archivos, la fila `1400` en la tabla de
   apilamiento, y que la sección de contacto y el rail son ahora excluyentes en 1200 px.

---

## Criterios de aceptación

### Contacto solo en móvil

- [ ] En una ventana de 1400 px de ancho, la sección «Agenda tu hora hoy» no se renderiza.
- [ ] En una ventana de 1100 px, la sección se ve y el rail izquierdo no.
- [ ] No existe ningún ancho de ventana en el que se vean la sección y el rail a la vez.
- [ ] No existe ningún ancho de ventana en el que no se vea ninguno de los dos.
- [ ] El diff de `SeccionContacto.tsx` es una sola propiedad. Sus textos, sus tres
      pastillas y sus tres redes son idénticos a los de antes.

### Ampliación de gráficas

- [ ] Existe `src/home-ergo/components/ImagenAmpliable.tsx` y `components/index.ts` lo
      exporta.
- [ ] Tres segundos de cursor sobre una gráfica del carrusel de promociones abren el
      overlay centrado.
- [ ] Tres segundos de cursor sobre una gráfica del carrusel de alianzas hacen lo mismo.
- [ ] Moviendo el cursor fuera antes de los tres segundos, el overlay no llega a aparecer.
- [ ] Pasar el cursor de una gráfica a otra antes de cumplirse el retardo no amplía
      ninguna de las dos: la segunda cuenta tres segundos desde cero.
- [ ] El overlay queda centrado respecto de la pantalla, no del carrusel, y sigue
      centrado después de deslizar el carrusel dos posiciones.
- [ ] El overlay no queda recortado por el borde del carrusel en ningún deslizamiento.
- [ ] Con el overlay abierto, un clic sobre una promoción abre WhatsApp con el mensaje de
      esa promoción.
- [ ] Con el overlay abierto, un clic sobre una alianza no navega a ninguna parte.
- [ ] Al sacar el cursor de la tarjeta, el overlay desaparece.
- [ ] Con «reducir movimiento» activo en el sistema, el overlay sigue apareciendo a los
      tres segundos, sin transición de opacidad.
- [ ] En táctil, tres segundos de dedo sobre una gráfica abren el overlay, y al levantar
      el dedo se cierra.
- [ ] En táctil no aparece el menú nativo del navegador sobre las gráficas de los dos
      carruseles.
- [ ] En táctil el menú nativo sí sigue apareciendo sobre las fotos de
      `GaleriaOperativos`, que esta spec no toca.
- [ ] Navegar a otra ruta con el overlay abierto no deja advertencias de React en la
      consola.

### Reglas del módulo

- [ ] `npm run build` termina en verde.
- [ ] `npx eslint src/home-ergo/` sale con 0 **errores**. Los 6 warnings de
      `react-refresh/only-export-components` en `config/canales-contacto.tsx` son previos
      a esta spec y quedan fuera de alcance.
- [ ] `git status` no muestra archivos modificados fuera de `src/home-ergo/` y
      `specs/home-ergo/`.
- [ ] `package.json` no tiene dependencias nuevas.
- [ ] Ningún archivo de `src/home-ergo/config/` cambió.
- [ ] `src/home-ergo/interface/` no cambió.

---

## Decisiones tomadas y descartadas

### Sobre el contacto en móvil

- **Sí:** ocultar desde `lg` (1200 px). Es exactamente el ancho en que aparece
  `RailContacto`. Cualquier otro corte deja un rango de anchos sin ningún dato de
  contacto en pantalla.
- **No:** ocultar desde `md` (900 px) bajando el rail a `md`. Exigiría tocar
  `RailContacto`, que se fijó en 1200 px porque el contenido se centra hasta 1400 y en
  ventanas más estrechas el rail taparía texto.
- **Sí:** ocultar la sección completa, incluido el botón «Ver servicios y agendar».
  Decisión explícita del usuario: «no hacer nada con el botón de agenda o servicio».
  **Consecuencia aceptada:** desde 1200 px la portada se queda sin su último llamado a
  `/servicios`, porque el rail solo ofrece contacto directo.
- **No:** ocultar solo las pastillas y las redes dejando el titular y el botón. Se propuso
  como forma de quitar la redundancia con el rail sin perder la conversión, y se descartó.
- **Sí:** la visibilidad la declara `SeccionContacto` en su propio `Box` raíz, no
  `HomeErgoPage`. Es el precedente que ya sentó `RailContacto` con su
  `display: { xs: 'none', lg: 'flex' }`.

### Sobre la ampliación

- **Sí:** overlay centrado sobre fondo oscurecido. Es la única de las tres formas que
  ataca el problema que la Spec 02 dejó abierto por escrito: la letra chica de los
  flyers.
- **No:** `transform: scale` sobre la tarjeta. Es la opción barata, pero el slide de
  Swiper la recorta y un 1,2× no vuelve legible un precio en cuerpo 10.
- **No:** panel flotante junto al cursor. Queda a merced del borde de la ventana y obliga
  a calcular posición en cada movimiento.
- **Sí:** `pointer-events: none` en el overlay y su fondo. Es lo que permite tener a la
  vez un overlay a pantalla completa y un clic que sigue llegando al enlace de WhatsApp.
  Sin eso, las dos decisiones son incompatibles.
- **Sí:** `createPortal` sobre `document.body`. Swiper aplica `transform` a
  `.swiper-wrapper`, y un ancestro con `transform` se convierte en el bloque contenedor
  de sus descendientes `position: fixed`. Es la razón técnica de la que depende que el
  overlay quede centrado en la pantalla.
- **No:** el módulo `Zoom` de Swiper. Amplía dentro del slide —donde se recorta— y solo
  sirve dentro de un carrusel, así que no deja nada reutilizable.
- **No:** una librería de lightbox. El módulo tiene como regla dura no agregar
  dependencias.
- **Sí:** envoltorio que recibe la imagen por `children`. Deja las decisiones de ajuste
  en la tarjeta, que es lo que lo hace servir igual a promociones (`contain`) y a la
  galería (`cover` con `objectPosition`).
- **No:** un componente que renderice el `<img>` recibiendo `src` y `sx`. Se ve más corto
  al usarlo, pero tendría que reexponer `loading`, `decoding`, `aspectRatio`, `objectFit`
  y `objectPosition` para cubrir los dos casos.
- **Sí:** `retardoMs` como prop con 3000 por defecto. **Reparo registrado:** tres
  segundos es un hover largo y la función va a descubrirse poco. Al ser prop, corregirlo
  es cambiar un número en un sitio.
- **Sí:** pulsación larga en táctil, con `contextmenu` cancelado únicamente dentro de
  `ImagenAmpliable`. **No:** cancelarlo a nivel de documento, que afectaría a las fotos de
  la galería y a todo lo demás.
- **Sí:** cerrar al levantar el dedo.
- **Sí:** Pointer Events (`onPointerEnter` / `onPointerLeave` / `onPointerCancel`) en vez
  de los pares `onMouse*` y `onTouch*`. **Corrección hecha durante la implementación**, no
  una decisión de diseño previa. Con manejadores de ratón, la secuencia de compatibilidad
  que el navegador emite tras un *tap* incluye un `mouseenter` sin `mouseleave` posterior:
  el overlay se abría solo tres segundos después de tocar una promoción y no se cerraba.
  Los eventos de puntero no tienen ese duplicado.
- **No:** un `ref` centinela que ignorara los eventos de ratón tras un toque. Arreglaba el
  síntoma manteniendo dos juegos de manejadores para lo mismo.
- **No:** ramificar por `evento.pointerType`. Se evaluó al tomar la decisión anterior y
  resultó innecesario: `pointerenter` y `pointerleave` ya se disparan en el momento
  correcto para el ratón y para el dedo, así que distinguirlos sería código muerto.
- **Sí:** montar el componente solo en los dos carruseles, dejándolo genérico. La galería
  recorta a propósito y las carátulas de video ya tienen su gesto de play: son dos
  discusiones distintas y no hay que abrirlas aquí.
- **Sí:** con `prefers-reduced-motion: reduce` se quita la transición, no la función.
  Ampliar una imagen ilegible no es decoración.
- **Sí:** el overlay muestra el mismo archivo que la tarjeta. No existe otra versión de
  los flyers, y los 1024×1536 dan de sobra para el tamaño de destino.
- **Sí:** `zIndex: 1400`, por encima del botón del chat (1300), que era lo más alto del
  módulo. Puede ocupar ese lugar sin discusión precisamente porque no intercepta clics.
- **Sí:** el nombre `ImagenAmpliable`, sustantivo descriptivo en español como
  `TarjetaVideo`, `PastillaContacto` o `FranjaRedes`. **No:** `VistaAmpliada` y
  `LupaImagen`, que describen el efecto y no la pieza.

### Sobre la spec

- **Sí:** las dos partes van en una sola spec, aunque son independientes entre sí. La del
  contacto es un cambio de una propiedad `display`, y darle spec propia sería más
  papeleo que trabajo.

---

## Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| Tres segundos de hover son muchos: la ampliación se descubre poco o nada. | `retardoMs` es prop con 3000 por defecto. Bajarlo es cambiar un número en `CarruselPromociones.tsx`, sin tocar el componente. |
| Un refactor futuro quita el `createPortal` y el overlay vuelve a quedar atrapado en el `transform` de Swiper. | Criterio de aceptación explícito sobre el recorte al deslizar, y un comentario en el archivo que explica por qué el portal no es opcional. |
| `pointer-events: none` impide cualquier interacción dentro del overlay, para siempre. | Es el precio de que el clic siga yendo a WhatsApp. Si algún día se quiere un botón dentro del overlay, hay que reabrir esa decisión antes de programar nada: son incompatibles. |
| Cancelar `contextmenu` quita «guardar imagen» sobre los flyers en táctil. | Acotado al componente. La galería y el resto de la portada conservan el menú nativo, y hay un criterio de aceptación que lo comprueba. |
| Desde 1200 px la portada pierde su último llamado a `/servicios`. | Decisión aceptada y registrada. Revertirla es quitar una propiedad `display` de un archivo. |
| El overlay tapa el botón del chat mientras está abierto. | No lo bloquea: `pointer-events: none` deja el chat pulsable, y el overlay se cierra en cuanto el cursor sale de la tarjeta. |

---

## Lo que **no** entra en esta spec

- Montar `ImagenAmpliable` en `GaleriaOperativos` ni en `TarjetaVideo`. El componente
  queda listo para ello; el montaje es otra spec.
- Zoom, desplazamiento, lupa o pinza dentro del overlay.
- Servir una imagen de mayor resolución que la que ya carga la tarjeta.
- Convertir las gráficas a WebP. Sigue pendiente desde la Spec 02 y sigue siendo la
  mejora de rendimiento más grande disponible en el módulo.
- Reubicar el botón «Ver servicios y agendar» a otra sección.
- Tocar `RailContacto`, su punto de corte, o cualquier cosa de `components/chat/`.
- Tocar `src/home-ergo/config/`, `src/home-ergo/interface/`, `public/home-ergo/`,
  `src/routes/` o `src/Home/`.
- La barra inferior fija de contacto en móvil, que la Spec 02 ya había diferido.

Cada una de ellas, si llega, va en su propia spec.
