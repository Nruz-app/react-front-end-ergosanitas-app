# SPEC 01 — Home comercial «home-ergo» con chat de ventas

> **Estado:** Implementado
> **Depende de:** ninguna. Es la primera spec del módulo `home-ergo`.
> **Referencia de patrón:** SPEC 04 de `ficha-clinica` (clonado del chat, servicio con
> interruptor de mock, clave propia de `localStorage`).
> **Fecha:** 2026-08-27
> **Área afectada:** `src/home-ergo/` (nueva), `src/routes/routes.ts` (una línea) y
> `public/home-ergo/` (renombrado de archivos). Nada más.
> **Objetivo:** Reemplazar la portada pública de ergosanitas.com por un Home comercial
> nuevo en `src/home-ergo/`, alimentado por JSON de configuración con el material real de
> la empresa y con un chat de ventas flotante.

---

## Por qué existe esta spec

La portada actual (`src/Home/`) muestra un marquee, un carrusel y una galería de fotos de
stock de `designerspics.com`. Nada de eso es Ergo SaniTas. Una empresa de salud domiciliaria
y deportiva que tiene 2.500 seguidores en Instagram, operativos en clubes y escuelas, y
material gráfico propio, está publicando una portada que no muestra nada de eso.

Esta spec cambia el material genérico por el real y ordena la página para vender: qué
servicios hay, cómo se contratan y a quién se le escribe.

Dos condicionantes marcan las decisiones del documento.

El primero es el **despliegue**: el sitio se sube estático por FTP a `ergosanitas.com`. No
hay servidor que procese imágenes ni que reescriba rutas. Todo lo que se vea tiene que
estar en `public/`.

El segundo es que **el sistema está en producción**. Por eso el Home nuevo es una carpeta
nueva y no una reforma de la existente: revertir tiene que costar una línea.

---

## Alcance

**Dentro (In):**

**Módulo nuevo**

- Crear `src/home-ergo/` con la estructura de módulo del repo: `components/`,
  `config/`, `interface/`, `pages/`, `services/`, `hooks/` y `index.ts` de barril.
- La página se llama `HomeErgoPage` y se monta en `pages/AppHomeErgoPage.tsx`,
  siguiendo el patrón `AppXPage` + `lazy()` del resto del proyecto.

**Ruta**

- En `src/routes/routes.ts`, la entrada `Home` (`to: '/'`) pasa a apuntar a
  `AppHomeErgoPage` en vez de `HomePage`. Se cambia el import y el `Component`.
- No se agregan ni quitan entradas: el menú del `AppBar` sigue mostrando los mismos
  cuatro botones (Home, Agendar, Certificados, Servicios).

**Contenido dirigido por JSON**

- Todo el contenido editable vive en `src/home-ergo/config/`, en seis archivos:
  `home-hero.json`, `home-servicios.json`, `home-galeria.json`,
  `home-promociones.json`, `home-videos.json` y `home-contacto.json`.
- Agregar una foto, un video o un servicio es **agregar un objeto al JSON**. Ningún
  componente lleva rutas de archivo ni textos de negocio escritos a mano.
- Cada entrada de galería, promoción y video tiene un campo `activo: boolean`. En
  `false` no se renderiza. Permite apagar una promoción vencida sin borrar la línea.

**Renombrado de assets**

- Los 27 archivos de `public/home-ergo/img/` y los 7 de `public/home-ergo/Video/` se
  renombran a `kebab-case` ASCII, sin espacios, tildes ni mayúsculas.
- La carpeta `Video/` se renombra a `video/` en minúscula.
- Se elimina el duplicado: `punto de salud Ergo Sanitas_.jpg` y `punto de salud
  deportiva chequeo cardiovascular_.jpg` son el mismo archivo (3.050.541 bytes
  ambos). Queda uno.

**Secciones de la página**, en este orden vertical:

1. **Hero** — foto de operativo real a pantalla ancha, titular, subtítulo, dos botones:
   «Ver servicios» (a `/servicios`) y «Escríbenos» (a WhatsApp).
2. **Barra de confianza** — tira con dos indicadores: +2.500 seguidores en Instagram y
   atención a domicilio.
3. **Servicios** — siete tarjetas con icono, nombre y descripción corta, cada una con
   botón a `/servicios`.
4. **Cómo funciona** — tres pasos: eliges el servicio, agendamos, te atendemos donde
   estés.
5. **Operativos en terreno** — galería con las fotografías reales.
6. **Videos** — los siete videos con carátula y reproducción al hacer clic.
7. **Promociones y alianzas** — carrusel con las gráficas de campaña (ALIANZA,
   ofertas, Fonasa, Pase Deportivo).
8. **Contacto** — teléfono, WhatsApp, correo, redes sociales, y cierre con botón a
   `/servicios`.

**Chat comercial flotante**

- Botón flotante abajo a la derecha, presente en toda la página, cerrado por defecto.
- Al abrirse muestra un panel de chat con burbuja de bienvenida comercial, sin pedir
  RUT y sin micrófono.
- Todos sus archivos —componentes, servicio, interfaces— viven dentro de
  `src/home-ergo/`. Es un clon conceptual del asistente existente, no un import.
- El servicio queda escrito contra `POST {API}/chat-comercial/as-question` con
  `{ prompt, sessionId }`, pero con la constante `USAR_ECO = true` que devuelve la
  misma pregunta con retardo simulado. Se cambia a `false` cuando el backend exista.

**SEO**

- `<Helmet>` en la página con `title`, `description`, y etiquetas Open Graph
  (`og:title`, `og:description`, `og:image`). La imagen de vista previa es la fotografía
  del hero, tomada de `home-hero.json`: así ninguna ruta de imagen queda escrita a mano en
  el código y el enlace compartido muestra un operativo real en vez de un logo.
  `HelmetProvider` ya está montado en `src/App.tsx`.

**Responsive**

- La página funciona de 360 px a 1920 px de ancho, con la grilla de MUI.

**Fuera de alcance (para futuras specs):**

- **Modificar `src/Home/`.** Se conserva intacto en el repo, solo deja de estar
  ruteado. Es la vía de reversa: revertir el Home es cambiar una línea de `routes.ts`.
- **Modificar `src/AsistenteVirtual/`, `src/presentation/` o `src/asistente-voz/`.**
  El chat se clona, igual que en la SPEC 04 de ficha-clínica.
- **Modificar `src/routes/Navigation.tsx`.** Incluye no arreglar el bug conocido de
  que la ruta `/asistente-virtual` está declarada después del catch-all
  `<Navigate to="/">` y por eso es inalcanzable. Es un bug real, pero ajeno a esta spec.
- **Modificar `src/Servicios/` o `src/AgendarHora/`.** El Home solo enlaza a `/servicios`.
- **Implementar el backend del chat.** La spec define el contrato; el endpoint lo
  construye el usuario después.
- **Testimonios de pacientes.** No hay textos reales disponibles y no se inventan.
- **Formulario de contacto con envío.** La conversión va a `/servicios` y a WhatsApp.
- **Recomprimir o reencodear los videos y las imágenes.** Se publican tal como están.
- **Reconocimiento de voz en el chat del Home.** El micrófono no entra: es un chat de
  ventas, no de dictado clínico.
- **Analytics, píxel de Meta o seguimiento de conversiones.**
- **Blog, noticias o sección de novedades.**
- **Traducción a otros idiomas.**

---

## Modelo de datos

### Renombrado de `public/home-ergo/img/`

| Actual | Nuevo |
|---|---|
| `Agosto mes del corazón oferta.png` | `promo-mes-corazon-01.png` |
| `Agosto mes del Corazón oferta 2.png` | `promo-mes-corazon-02.png` |
| `Bioimpedancia Oferta agosto_.png` | `promo-bioimpedancia-01.png` |
| `Oferta bioimpedancia Agosto_.png` | `promo-bioimpedancia-02.png` |
| `Chequeo cardiovascular deportivo flayer_.jpg` | `promo-chequeo-cardiovascular.jpg` |
| `chequeo cardiólogo deportivo_.png` | `promo-chequeo-cardiologo-deportivo.png` |
| `Ergo Sanitas Servicios Adulto Mayor.png` | `promo-adulto-mayor.png` |
| `Ergo Sanitas exámenes de Laboratorio Fonasa 2.webp` | `promo-laboratorio-fonasa.webp` |
| `Laboratorio clínico y toma de muestras_.png` | `promo-laboratorio-toma-muestras.png` |
| `Holter Presión Arterial.png` | `promo-holter-presion-arterial.png` |
| `Pase deportivo Ergo Sanitas_.jpg` | `promo-pase-deportivo.jpg` |
| `BIOIMPEDANCIA ALIANZA.png` | `alianza-bioimpedancia.png` |
| `Chequeo Cardiovascular Deportivo ALIANZA.png` | `alianza-chequeo-cardiovascular.png` |
| `ECG A DOMICILIO ALIANZA.png` | `alianza-ecg-domicilio.png` |
| `ENFERMERIA ALIANZA.png` | `alianza-enfermeria.png` |
| `EXAMEN DE LABORATORIO ALIANZA.png` | `alianza-examen-laboratorio.png` |
| `HOLTER ALIANZA.png` | `alianza-holter.png` |
| `NEUROBIONTA ALIANZA.png` | `alianza-neurobionta.png` |
| `alianza la voz sn bdo redes sociales.png` | `alianza-la-voz-san-bernardo.png` |
| `Operativo en terreno electrocardiograma_.jpg` | `operativo-electrocardiograma-01.jpg` |
| `Operativo en terreno electrocardiograma 2.jpg` | `operativo-electrocardiograma-02.jpg` |
| `personal primeros auxilios_.jpg` | `operativo-primeros-auxilios.jpg` |
| `punto de salud deportiva chequeo cardiovascular_.jpg` | `operativo-punto-de-salud.jpg` |
| `Ergo Sanitas Esteban paredes.jpg` | `respaldo-esteban-paredes.jpg` |
| `Instrucciones para el paciente Holter Presión Arterial_.jpg` | `info-holter-instrucciones.jpg` |
| `logo Ergo Sanitas_.jpg` | `logo-ergo-sanitas.jpg` |
| `punto de salud Ergo Sanitas_.jpg` | **se elimina** (duplicado exacto del anterior) |

26 archivos quedan, 1 se borra. El prefijo dice para qué sirve: `promo-`, `alianza-`,
`operativo-`, `respaldo-`, `info-`, `logo-`.

### Renombrado de `public/home-ergo/Video/` → `public/home-ergo/video/`

| Actual | Nuevo |
|---|---|
| `Ergo Sanitas en terreno.mp4` | `ergo-sanitas-en-terreno.mp4` |
| `Operativo chequeo cardiovascular_.mp4` | `operativo-chequeo-cardiovascular.mp4` |
| `Operativo escuela menesianos_.mp4` | `operativo-escuela-menesianos.mp4` |
| `Oferta mes del corazón_.mp4` | `oferta-mes-del-corazon.mp4` |
| `ergo sanitas Esteban paredes.mp4` | `esteban-paredes.mp4` |
| `Matando la seka Ergo Sanitas_.mp4` | `matando-la-seka-01.mp4` |
| `Matando la seka Ergo Sanitas 2.mp4` | `matando-la-seka-02.mp4` |

### Las seis configuraciones

```ts
// src/home-ergo/interface/home.interface.ts

export interface IHeroHome {
    imagen    : string;   // '/home-ergo/img/operativo-punto-de-salud.jpg'
    titulo    : string;
    subtitulo : string;
    ctaTexto  : string;   // 'Ver servicios'
    ctaTo     : string;   // '/servicios'
}

export interface IIndicadorHome {
    valor : string;       // '+2.500'
    texto : string;       // 'seguidores en Instagram'
}

export interface IServicioHome {
    id          : string;
    nombre      : string;
    descripcion : string;
    icono       : string;  // nombre de icono MUI: 'MonitorHeart', 'Science', …
    activo      : boolean;
}

export interface IImagenHome {
    id      : string;
    src     : string;      // ruta bajo /home-ergo/img/
    alt     : string;      // obligatorio: accesibilidad y SEO
    caption : string;
    activo  : boolean;
}

export interface IVideoHome {
    id      : string;
    src     : string;      // ruta bajo /home-ergo/video/
    poster  : string;      // imagen de carátula, bajo /home-ergo/img/
    titulo  : string;
    activo  : boolean;
}

export interface IContactoHome {
    telefono         : string;  // '+56 9 6114 9975'
    telefonoWhatsapp : string;  // '56961149975' — solo dígitos, para wa.me
    mensajeWhatsapp  : string;  // texto prellenado
    email            : string;  // 'contacto@ergosanitas.com'
    instagram        : string;
    facebook         : string;
    tiktok           : string;
}
```

**Convenciones de los JSON:**

- Las rutas son **absolutas desde la raíz del sitio** (`/home-ergo/img/...`), no imports
  de Vite. Así agregar una foto es copiar el archivo y agregar la línea, sin tocar código.
- `alt` es obligatorio en cada imagen. Una galería sin `alt` no la lee Google ni un lector
  de pantalla.
- `icono` es el **nombre** del icono MUI, no el componente. Un mapa `iconos.ts` dentro del
  módulo traduce el string al componente. Un nombre desconocido cae a un icono por defecto
  en vez de romper el render.
- `activo: false` oculta la entrada sin borrarla.

**Reparto del material:**

- `home-hero.json` → `operativo-punto-de-salud.jpg`.
- `home-servicios.json` → los siete servicios: Chequeo Cardiovascular Deportivo, ECG a
  Domicilio, Bioimpedancia, Holter MAPA, Exámenes de Laboratorio, Enfermería a Domicilio y
  Primeros Auxilios / Operativos.
- `home-galeria.json` → las 3 fotos de operativo restantes + `respaldo-esteban-paredes.jpg`.
- `home-promociones.json` → las 19 gráficas `promo-` y `alianza-`.
  `info-holter-instrucciones.jpg` entra con `activo: false`: es material para pacientes que
  ya compraron, no material de venta.
- `home-videos.json` → los 7, todos `activo: true`, cada uno con su carátula.
- `home-contacto.json` → un solo objeto.

**Carátulas de los videos**, asignación de partida editable en el JSON:

| Video | Carátula |
|---|---|
| `ergo-sanitas-en-terreno` | `operativo-electrocardiograma-01.jpg` |
| `operativo-chequeo-cardiovascular` | `operativo-punto-de-salud.jpg` |
| `operativo-escuela-menesianos` | `operativo-electrocardiograma-02.jpg` |
| `esteban-paredes` | `respaldo-esteban-paredes.jpg` |
| `oferta-mes-del-corazon` | `promo-mes-corazon-01.png` |
| `matando-la-seka-01` | `operativo-primeros-auxilios.jpg` |
| `matando-la-seka-02` | `operativo-primeros-auxilios.jpg` |

### El chat

```ts
// src/home-ergo/interface/chat-home.interface.ts

export interface IMensajeChatHome {
    text  : string;
    isGpt : boolean;
}

export interface IRespuestaChatHome {
    response : string;
}
```

- Historial en `useState` dentro del componente del chat. Sin contexto ni store.
- Clave de sesión: **`home_chat_session_id`**. Distinta de `chat_session_id` (asistente
  global) y de `ficha_chat_session_id` (ficha clínica). Tres chats, tres hilos, sin
  contaminación cruzada.
- La burbuja de bienvenida se renderiza fija, no vive en el array.

---

## Plan de implementación

Cada paso deja el proyecto compilando (`npm run build` en verde) y es commiteable por
separado.

1. **Renombrar los assets.** Aplicar las dos tablas de renombrado: renombrar los 26
   archivos de `public/home-ergo/img/`, borrar el duplicado
   `punto de salud Ergo Sanitas_.jpg`, renombrar la carpeta `Video/` a `video/` y sus 7
   archivos. Sin cambios de código. Verificación: `ls public/home-ergo/img` no muestra
   espacios, tildes ni mayúsculas.

2. **Crear `interface/home.interface.ts` y `interface/chat-home.interface.ts`** con las
   siete interfaces del modelo de datos y las dos del chat. Barril `interface/index.ts`
   que las reexporta con `export type`.

3. **Crear los seis JSON en `config/`**: `home-hero.json`, `home-servicios.json`,
   `home-galeria.json`, `home-promociones.json`, `home-videos.json` y
   `home-contacto.json`, con el reparto de material descrito arriba.

4. **Crear `config/iconos.ts`.** Mapa `Record<string, SvgIconComponent>` que traduce el
   string del JSON al icono de MUI. Incluye un icono por defecto para nombres
   desconocidos, de modo que un typo en el JSON no rompa el render.

5. **Crear el esqueleto de la página y engancharla a la ruta.**
   - `pages/HomeErgoPage.tsx` con un `<Box>` vacío y un título.
   - `pages/AppHomeErgoPage.tsx` que la envuelve.
   - `pages/index.ts` con el `lazy()`, igual que `src/Home/pages/index.ts`.
   - En `src/routes/routes.ts`: cambiar el import de `HomePage` por `AppHomeErgoPage` y
     el `Component` de la entrada `Home`.

   Verificación: `npm run dev`, abrir `/`, se ve la página nueva vacía bajo el AppBar.
   **Desde aquí cada paso siguiente es visible en el navegador.**

6. **Crear `components/Hero.tsx`.** Lee `home-hero.json`. Imagen de fondo con capa
   oscura para que el texto se lea, titular, subtítulo y los dos botones. El de
   servicios usa `NavLink` a `/servicios`; el de WhatsApp abre `wa.me` en pestaña nueva.
   Montarlo en `HomeErgoPage`.

7. **Crear `components/BarraIndicadores.tsx` y `components/ComoFunciona.tsx`.** La barra
   con los dos indicadores; «Cómo funciona» con los tres pasos numerados. Ambos son
   componentes de presentación sin estado. Montarlos.

8. **Crear `components/SeccionServicios.tsx` y `components/TarjetaServicio.tsx`.**
   Recorre `home-servicios.json` filtrando por `activo`, resuelve el icono con el mapa
   del paso 4 y pinta una grilla responsive. Cada tarjeta enlaza a `/servicios`.

9. **Crear `components/GaleriaOperativos.tsx`.** Grilla con las fotos reales de
   `home-galeria.json`, con `loading="lazy"` en cada `<img>` y el `caption` visible.

10. **Crear `components/SeccionVideos.tsx` y `components/TarjetaVideo.tsx`.** Cada video
    es un `<video controls poster={...} preload="none">`. `preload="none"` es lo que
    impide que los 139 MB se descarguen al abrir la página: el navegador solo baja la
    carátula hasta que alguien da play.

11. **Crear `components/CarruselPromociones.tsx`** con Swiper, recorriendo
    `home-promociones.json` filtrado por `activo`. Navegación por flechas y paginación,
    autoplay lento, adaptable a 1/2/3 tarjetas según el ancho.

12. **Crear `components/SeccionContacto.tsx`.** Teléfono, WhatsApp, correo y redes desde
    `home-contacto.json`, más el cierre con botón a `/servicios`.

13. **Crear `services/UseChatComercialService.ts`.** Patrón `UseXService` del repo:
    instancia `ApiAdapter`, arma `${VITE_API}${VITE_API_PATH}`, gestiona el `sessionId`
    en `home_chat_session_id`. Expone `preguntar(prompt)`. Con `USAR_ECO = true`
    devuelve `{ response: prompt }` tras un retardo simulado; con `false` hace el
    `POST /chat-comercial/as-question`. Ambas ramas escritas desde ya.

14. **Crear los componentes de chat en `components/chat/`**: `BurbujaBot.tsx`,
    `BurbujaVisitante.tsx`, `CajaMensaje.tsx` y `LoaderEscribiendo.tsx`. Clonados en
    espíritu de los del asistente, sin micrófono y sin botón de cambiar paciente.

15. **Crear `components/chat/ChatComercial.tsx` y `components/chat/BotonChatFlotante.tsx`.**
    El botón fijo abajo a la derecha alterna el panel. El panel monta el chat con la
    burbuja de bienvenida comercial. Montarlo en `HomeErgoPage`, fuera del flujo de
    secciones, con `position: fixed`.

16. **Cerrar el módulo.** `<Helmet>` con título, descripción y Open Graph en
    `HomeErgoPage`. Completar `components/index.ts`, `config/index.ts`,
    `services/index.ts` y el barril `src/home-ergo/index.ts`.

---

## Criterios de aceptación

**Compilación y estilo**

- [ ] `npm run build` termina sin errores (`tsc -b` incluido).
- [ ] `npx eslint src/home-ergo/` sale en 0.
- [ ] No se agregó ninguna dependencia nueva: `package.json` no cambia.

**Assets renombrados**

- [ ] `ls public/home-ergo/img` devuelve 26 archivos, ninguno con espacios, tildes ni
      mayúsculas.
- [ ] La carpeta `public/home-ergo/Video` ya no existe; existe `public/home-ergo/video`
      con 7 archivos en `kebab-case`.
- [ ] El archivo `punto de salud Ergo Sanitas_.jpg` fue eliminado y no quedó ninguna
      referencia a él.

**Ruta**

- [ ] Abrir `/` muestra el Home nuevo, no el antiguo `MarqueeHome` + galería de stock.
- [ ] El `AppBar` sigue mostrando los cuatro botones: Home, Agendar, Certificados,
      Servicios.
- [ ] Navegar a `/servicios` y volver a `/` funciona sin recargar la página.

**Contenido dirigido por JSON** — el criterio que prueba el requisito central

- [ ] Agregar un objeto nuevo a `home-galeria.json` y recargar hace aparecer la foto en
      la galería, **sin tocar ningún archivo `.tsx`**.
- [ ] Cambiar `activo` a `false` en una entrada de `home-promociones.json` la quita del
      carrusel; volverla a `true` la devuelve.
- [ ] Poner un valor inventado en el campo `icono` de un servicio pinta el icono por
      defecto y **no** rompe la página.
- [ ] Ningún componente `.tsx` contiene una ruta de imagen o video escrita a mano: todas
      salen de los JSON.

**Secciones**

- [ ] La página muestra, en este orden: hero, barra de indicadores, servicios, cómo
      funciona, galería de operativos, videos, promociones y contacto.
- [ ] Se ven **siete** tarjetas de servicio y ninguna dice «Terapia Floral».
- [ ] La barra de indicadores muestra exactamente **dos** indicadores.
- [ ] Todas las imágenes tienen atributo `alt` no vacío.
- [ ] El botón principal del hero navega a `/servicios`.
- [ ] El botón de WhatsApp abre `https://wa.me/56961149975` en una pestaña nueva, con el
      mensaje prellenado.
- [ ] El bloque de contacto muestra el teléfono `+56 9 6114 9975` y el correo
      `contacto@ergosanitas.com`.

**Videos**

- [ ] Al cargar `/`, la pestaña Network **no** registra la descarga de ningún `.mp4`.
- [ ] Cada video muestra su carátula antes de reproducirse.
- [ ] Al pulsar play, y solo entonces, empieza la descarga de ese `.mp4` y el video se
      reproduce.
- [ ] Ningún video se reproduce solo al abrir la página.

**Chat comercial**

- [ ] Hay un botón flotante abajo a la derecha, visible al abrir la página y mientras se
      hace scroll.
- [ ] El panel está cerrado por defecto; el botón lo abre y lo cierra.
- [ ] Al abrirse muestra una burbuja de bienvenida comercial que **no** pide RUT.
- [ ] Escribir «hola» y enviar muestra la burbuja del visitante, luego el loader, y
      después una burbuja del bot que dice «hola» (comportamiento de eco).
- [ ] El chat **no** tiene botón de micrófono.
- [ ] El chat **no** tiene el botón naranja de «Consultar por otro paciente».
- [ ] `localStorage` contiene `home_chat_session_id`, y **no** se crearon ni modificaron
      `chat_session_id` ni `ficha_chat_session_id`.
- [ ] Cambiar `USAR_ECO` a `false` hace que la petición salga a
      `POST {VITE_API}{VITE_API_PATH}/chat-comercial/as-question` con el cuerpo
      `{ prompt, sessionId }` (verificable en Network, aunque el endpoint responda 404).

**SEO**

- [ ] El `<head>` del documento renderizado contiene `<title>`, `<meta name="description">`
      y las etiquetas `og:title`, `og:description` y `og:image`.

**Responsive**

- [ ] A 360 px de ancho ninguna sección de `home-ergo` desborda horizontalmente.
- [ ] A 360 px el chat flotante no tapa el botón principal del hero.

**No regresión**

- [ ] `git status` no reporta cambios en `src/Home/`, `src/AsistenteVirtual/`,
      `src/presentation/`, `src/asistente-voz/` ni `src/Servicios/`.
- [ ] Dentro de `src/routes/`, el único archivo modificado es `routes.ts`.
- [ ] El diff de `routes.ts` tiene exactamente dos cambios: la línea del `import` y la
      línea del `Component` de la entrada `Home`.

> Nota sobre el criterio de responsive: está redactado como «ninguna sección de
> `home-ergo` desborda» y no como «la página no tiene scroll horizontal», porque hoy `/`
> ya tiene scroll horizontal en móvil y no es culpa del Home nuevo: `Navigation.tsx` le
> pone al `AppBar` un `width: { xs: '150%' }`. Ese bug seguirá ahí después de esta spec.

---

## Decisiones tomadas y descartadas

### Sobre el origen del material

- **No:** descargar las últimas 20 fotos de Instagram automáticamente. Se intentó y se
  verificó que no es posible: la petición al perfil devuelve 200 y 616 KB de HTML con
  **cero** URLs de fotos de publicaciones y sin `og:image`. Instagram pinta las
  publicaciones en el cliente mediante GraphQL autenticado.
- **No:** enlazar directamente a las URLs del CDN de Instagram o Facebook. Vienen
  firmadas y expiran en horas. El sitio se despliega estático por FTP: en pocos días el
  Home mostraría fotos rotas.
- **No:** incrustar los videos con el plugin `facebook.com/plugins/video.php`. Es viable
  técnicamente, pero el usuario dejó los archivos `.mp4` en el repositorio, que es mejor:
  sin iframe de terceros, sin bloqueadores de anuncios de por medio, sin depender de que
  la publicación siga pública.
- **Sí:** el material lo aporta el usuario en `public/home-ergo/`. Es la única vía que da
  un Home estable en un despliegue estático.

### Sobre los archivos

- **Sí:** renombrar los 33 archivos a `kebab-case` ASCII. Los nombres originales tienen
  espacios, tildes y mayúsculas; en una URL exigen `encodeURI` en cada uso y algunos
  servidores FTP y Linux se atragantan con las tildes. Se paga una vez y se acaba el
  problema.
- **Sí:** prefijos que dicen para qué sirve el archivo (`promo-`, `alianza-`,
  `operativo-`, `respaldo-`, `info-`, `logo-`). Al agregar material nuevo, el prefijo
  indica solo a qué JSON pertenece.
- **Sí:** borrar `punto de salud Ergo Sanitas_.jpg`. Es byte a byte el mismo archivo que
  `punto de salud deportiva chequeo cardiovascular_.jpg` (3.050.541 bytes ambos). Tener
  la misma foto dos veces son 3 MB extra en cada despliegue por FTP.
- **Sí:** los assets viven en `public/` y se referencian por ruta absoluta. Importarlos
  desde `src/assets` obligaría a un `import` por archivo, y entonces agregar una foto ya
  no sería «agregar una línea al JSON».
- **No:** recomprimir imágenes ni videos. Está fuera de alcance y cambiaría material que
  el usuario ya aprobó para sus redes.

### Sobre la estructura

- **Sí:** módulo nuevo en `src/home-ergo/` en vez de reformar `src/Home/`. El Home viejo
  queda intacto y revertir es cambiar una línea de `routes.ts`. En un sistema en
  producción, esa vía de reversa vale más que la limpieza de borrar lo anterior.
- **No:** borrar `src/Home/`. Se conserva sin rutear. Si el Home nuevo falla, hay a dónde
  volver.
- **No:** rutear el Home nuevo en `/inicio` y dejar el viejo en `/`. Duplicaría la portada
  y confundiría a Google con dos páginas casi iguales.
- **Sí:** seis archivos de configuración en vez de cinco. El hero tiene campos propios
  (imagen, titular, subtítulo, botón) que no pertenecen a contacto. Ordenar por dónde cabe
  y no por qué es se paga después.
- **Sí:** campo `activo` en galería, promociones y videos. Una promoción de agosto se
  apaga en septiembre sin borrar la entrada, y vuelve el año siguiente cambiando un
  `false` por un `true`.
- **Sí:** `icono` como string traducido por un mapa. Un JSON no puede contener un
  componente de React. El mapa con icono por defecto evita que un typo tumbe la página.
- **Sí:** `alt` obligatorio en cada imagen. Es una página cuyo objetivo es vender: sin
  `alt` no la indexa Google ni la lee un lector de pantalla.

### Sobre el diseño

- **Sí:** separar fotografías de gráficas de campaña. De los 26 archivos, solo 5 son
  fotografías reales; las otras 21 son flyers, el logo y una gráfica informativa. Un flyer de fondo de hero deja
  dos textos peleando por el mismo espacio.
- **Sí:** `operativo-punto-de-salud.jpg` como hero. Es operativo real, con gente, y
  muestra el servicio en acción, que es lo que convierte.
- **Sí:** los flyers en su propio carrusel de promociones. Ahí su texto quemado es una
  virtud: cada uno ya dice su oferta.
- **No:** sección de testimonios. No hay textos reales de pacientes e inventarlos en una
  página de servicios médicos es, además de falso, un problema.
- **Sí:** barra de confianza con dos indicadores y no con cuatro. Solo hay dos datos
  respaldables: los seguidores de Instagram y la atención a domicilio. Rellenar con
  «10 años de experiencia» sin saberlo sería inventar.
- **Sí:** Swiper para el carrusel y `<video>` nativo para los videos. Ambas ya están en
  `package.json`. La spec no agrega dependencias.
- **No:** `react-player` para los videos, aunque esté instalado. Está pensado para
  YouTube y Vimeo; para un `.mp4` local, el `<video>` nativo da lo mismo con menos peso.
- **Sí:** `preload="none"` más carátula en cada video. Son 139 MB en siete archivos. Sin
  eso, abrir el Home en un celular con datos móviles sería intolerable.
- **No:** autoplay. Descartado por peso y porque un video que arranca solo espanta.
- **No:** «Terapia Floral» entre los servicios de la portada. Aparece en Instagram, pero
  junto a lo cardiovascular rompe el tono de la página.

### Sobre el chat

- **Sí:** clonar el chat dentro de `src/home-ergo/`. El usuario pidió explícitamente no
  tocar `src/AsistenteVirtual/` ni `src/presentation/`. Es el mismo criterio de la SPEC 04
  de ficha-clínica, y ya hay precedente en el repositorio.
- **No:** importar `AssistantPage` desde `src/presentation/`. Ese chat abre pidiendo el
  RUT de un paciente: sirve para una ficha clínica, no para un visitante anónimo que
  pregunta precios.
- **No:** reutilizar el endpoint `sam-assistant/as-question` con un prefijo comercial en
  el prompt. Ese asistente resuelve pacientes por RUT; exponerlo a un visitante anónimo
  arriesga filtrar datos clínicos. La separación es de seguridad, no de estilo.
- **Sí:** endpoint propio `POST /chat-comercial/as-question`, con el mismo contrato
  `{ prompt, sessionId }` que el existente. Mantiene la forma conocida del backend.
- **Sí:** `USAR_ECO = true` con respuesta de eco y retardo simulado. El usuario conecta el
  backend después. Es el mismo mecanismo que el `USAR_MOCK` de `UsePacienteService.ts`,
  así que el patrón ya es conocido en el repositorio.
- **Sí:** escribir desde ya la rama real del `POST`, aunque esté apagada. Conectar el
  backend será cambiar una constante, no escribir código nuevo.
- **Sí:** clave `home_chat_session_id`, distinta de `chat_session_id` y de
  `ficha_chat_session_id`. Tres chats con tres hilos: un hilo abierto en la ficha de un
  paciente no debe contaminar lo que ve un visitante anónimo en la portada.
- **Sí:** botón flotante abajo a la derecha, cerrado por defecto. Está siempre a mano sin
  robarle espacio al contenido que vende.
- **No:** micrófono ni reconocimiento de voz. Es un chat de ventas en una portada pública;
  el dictado es del contexto clínico.
- **No:** persistir el historial de la conversación entre recargas. Sin backend real
  todavía, guardar respuestas de eco no aporta nada.

### Sobre la conversión

- **Sí:** todos los llamados a la acción van a `/servicios`. Esa página ya tiene el flujo
  completo para tomar un servicio; duplicarlo en el Home sería mantener dos veces lo
  mismo.
- **Sí:** enlace interno con `NavLink`, no `https://ergosanitas.com/servicios`. Una URL
  absoluta forzaría una recarga completa de la SPA.
- **No:** formulario de contacto con envío. Necesita backend y competiría con `/servicios`
  por la misma conversión.
- **Sí:** WhatsApp con mensaje prellenado como vía secundaria. Es el canal donde ya
  atienden.
- **Sí:** no arreglar el `width: { xs: '150%' }` del `AppBar` en `Navigation.tsx`.
  Decisión del usuario: el alcance se limita a `src/home-ergo/` y a `routes.ts`.

---

## Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| El `AppBar` de `Navigation.tsx` tiene `width: { xs: '150%' }` y provoca scroll horizontal en móvil. El Home nuevo lo hereda y parecerá defecto suyo | Documentado aquí como bug preexistente y ajeno. Los criterios de aceptación miden el desborde de las secciones de `home-ergo`, no el de la página completa. Arreglarlo es una spec de una línea sobre `Navigation.tsx` |
| Los 7 videos suman 139 MB y las 26 imágenes 30 MB. Todo se copia a `dist/` y se sube por FTP en **cada** despliegue | `preload="none"` protege al visitante, no al despliegue. El despliegue se hará más lento y es un costo aceptado. Si molesta, la salida es mover los videos a un hosting de video, y eso es otra spec |
| La imagen del hero pesa 3 MB y es lo primero que carga: el LCP se va a resentir en móvil | Aceptado en esta spec, que no recomprime material. Si el hero se siente lento, la corrección es una versión reducida del archivo, sin tocar código: se cambia la ruta en `home-hero.json` |
| El material viene de Instagram y es **vertical** casi por completo. Medido: los 7 videos son verticales (seis en 9:16, uno en 4:5) y la mayoría de las imágenes son 2:3 o 4:5. Puesto en una grilla horizontal se recorta o se deforma | Cada sección fija su proporción según lo que contiene y elige el ajuste en consecuencia. La galería usa cuadrado con `object-fit: cover`: son fotografías y recortarlas por los bordes no les quita información. Las promociones y los videos usan `object-fit: contain`: son flyers con texto quemado y videos verticales, y ahí un recorte borraría justo el mensaje. Ninguna imagen se estira |
| `USAR_ECO` queda en `true` al desplegar a producción y el chat le repite al visitante su propia pregunta | Riesgo real y vergonzoso en una página de ventas. La constante va al inicio del archivo, con comentario explícito. Verificarla es parte del cierre de la spec del backend, no de esta |
| El endpoint `/chat-comercial/as-question` no existe todavía. Al poner `USAR_ECO = false` sin backend, el chat responde error | Es la secuencia esperada: primero el front, después el backend. El contrato queda fijado en esta spec para que ambos lados coincidan |
| Cuando el chat se conecte a una IA real, puede inventar precios o prometer coberturas | Fuera del alcance de esta spec, pero se deja anotado: el prompt de sistema del backend debe prohibir dar precios que no estén en una lista cerrada. Es una decisión del backend, no del front |
| Las promociones son de campaña de agosto («Agosto mes del corazón», ofertas). En octubre el Home mostrará ofertas vencidas | El campo `activo` existe justamente para eso: se apagan editando el JSON, sin desplegar código nuevo. Requiere que alguien se acuerde de hacerlo |
| `respaldo-esteban-paredes.jpg` y su video usan la imagen de una figura pública. Publicarla en la portada comercial afirma un respaldo | El material salió de las redes de la propia empresa, así que se asume autorización previa. Si no la hay, se apaga con `activo: false` sin tocar código |
| El Home viejo queda en el repositorio sin rutear y con el tiempo nadie recuerda por qué está | La cabecera de esta spec lo declara: es la vía de reversa. Cuando el Home nuevo lleve unos meses estable, borrar `src/Home/` es una limpieza de una línea |
| El renombrado masivo rompe alguna referencia existente a esos archivos | Riesgo bajo y verificable: `public/home-ergo/` es una carpeta nueva que ningún código referencia todavía. Se confirma con una búsqueda de los nombres antiguos en `src/` antes de renombrar |

---

## Lo que **no** entra en esta spec

- Cualquier cambio en `src/Home/`, `src/AsistenteVirtual/`, `src/presentation/`,
  `src/asistente-voz/`, `src/Servicios/` o `src/AgendarHora/`.
- Cualquier cambio en `src/routes/` que no sea las dos líneas de `routes.ts`. Incluye no
  arreglar el `width: { xs: '150%' }` del `AppBar` ni la ruta `/asistente-virtual`
  inalcanzable.
- El backend del chat comercial. Esta spec fija el contrato; el endpoint es trabajo del
  usuario.
- Persistir el historial del chat.
- Reconocimiento de voz o text-to-speech en el chat.
- Testimonios de pacientes.
- Formulario de contacto con envío.
- Recomprimir, reencodear o generar miniaturas de las imágenes y los videos.
- Mover los videos a un hosting externo.
- Analytics, píxel de Meta o medición de conversiones.
- Blog, noticias o novedades.
- Traducción a otros idiomas.
- Borrar `src/Home/`.

Cada una de esas, si entra alguna vez, va en su propia spec.
