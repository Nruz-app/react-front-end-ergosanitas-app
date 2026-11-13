# CLAUDE_CERTIFICADOS — guía del módulo `src/Certificados/`

Página pública `/certificados` (sin perfil, `src/routes/routes.ts`; el navegador público usa
`BrowserRouter`, así que la URL es `/certificados`, sin `#`). El deportista o su apoderado escribe
un RUT y descarga los certificados del **último chequeo en `REVISION MEDICA`** y de la **última
bioimpedancia**. La rediseñó la SPEC 01 de esta carpeta, sobre la SPEC 07 del back. La SPEC 02
añadió un banner de ofertas que reemplaza al spinner mientras se busca. Esta guía manda sobre
cualquier otra descripción del módulo.

## Estructura

| Archivo | Qué hace |
| --- | --- |
| `pages/CertificadoPage.tsx` | Única dueña del estado (`useState`). Guarda `estado` (`inicial · cargando · ok · vacio · error`), `resultado`, `mensajeError` y `banner` (la instantánea de ofertas de la búsqueda en curso), más dos refs: `busquedaVigente`, un contador que descarta respuestas de búsquedas viejas, y `rutBuscado`. Es la única que llama al servicio de certificados: pasa `onDescargar` y `onRenovarUrl` por props. Llama a `useOfertasBanner` al montar. |
| `pages/AppCerteficadoPage.tsx` | Entrada lazy. `pages/index.ts` exporta **solo** `AppCertificadoPage`; re-exportar `CertificadoPage` la metería en el bundle principal. Sin Provider. |
| `components/BuscadorRut.tsx` | Campo + Buscar + Limpiar; usa `limpiarRut` y `REGEX_RUT` de `utilities/`. Los dos botones quedan deshabilitados mientras carga. |
| `components/TarjetaDocumentos.tsx` | Una tarjeta por examen (`<section aria-labelledby>` a su `h3`); no se pinta si no trae botones. Fecha `DD-MM-YYYY` o `—`. |
| `components/BotonDescarga.tsx` | Una sola variante de botón para los cuatro documentos (ver «Descargas»). **No usa el servicio**: recibe `onDescargar` y `onRenovarUrl`; solo maneja su spinner y su error. |
| `components/EstadoResultado.tsx` | Cargando / vacío / error en línea, con «Reintentar». El de cargando es el respaldo del banner. |
| `components/BannerOfertas.tsx` | Banner de la SPEC 02: Swiper 11 (`EffectCreative`, `rewind`), barra de tiempo, puntos, caption y CTA a WhatsApp. Ver «Banner de ofertas». |
| `hooks/useOfertasBanner.ts` (barril `hooks/index.ts`) | Pide las ofertas al montar, sortea la inicial y la precarga; `rotarInicial` prepara la de la búsqueda siguiente. |
| `services/useCertificadoService.ts` | Trae `consultarDocumentos` y `descargarDocumento` (nuevos) y conserva `getCertificadoRut` / `getCertificadoExiste`. |
| `services/useOfertasService.ts` | `getOfertas()`: `GET home-imagenes` con `getToken`, valida el sobre y filtra `seccion === 'promocion'`. Es un clon del servicio de `home-ergo`, no un import. |
| `interface/` (barril `index.ts`) | `certificados-consulta.interface.ts` (contrato de `POST certificados/consulta`, copiado de la SPEC 07 del back), `boton-tarjeta.interface.ts` (`IBotonTarjeta`), `certificado-url.interface.ts` y `oferta-banner.interface.ts` (`IHomeImagenApi`, `IOfertaBanner`, `EstadoOfertas`). Se importa por el barril. |
| `utilities/` (barril `index.ts`) | Lógica pura. `certificados.utility.ts`: `REGEX_RUT`, `limpiarRut`, `formatearFecha`, `mensajeDelError`, `statusDelError`, `nombreParaArchivo`, `botonesDe`, `urlVencida`, `guardarBlob`. `banner-ofertas.utility.ts`: `nombreDeOferta`, `esperar`, `sortearIndice`, `precargarImagen`, `prefiereMenosMovimiento`. Nada de lógica pura en los `.tsx`. |
| `config/textos-certificados.json` | Todos los textos visibles y los `aria-label`, incluido el bloque `banner` (con los mensajes de A11y de Swiper en español). |
| `config/banner-ofertas.json` | `segundosPorImagen`, `duracionTransicionMs` y `permanenciaMinimaMs`: se ajustan sin tocar código. |

## Reglas duras

- **Una petición por búsqueda**: `POST {API}/certificados/consulta` con `{ rut }`. No volver a meter un contexto con reducer: el anterior re-disparaba las consultas en cada render.
- **Al montar solo se consulta `home-imagenes`** (D1 de la SPEC 02), una vez. Es contenido comercial público. Ningún dato del paciente se pide al montar.
- **Lo único externo** es:
  - `src/common/` (ApiAdapter);
  - `MarqueeHome` de `src/Home/components` (decorativo, fuera de alcance de la SPEC 01);
  - `urlWhatsappPromo` de `src/home-ergo/config/canales-contacto.tsx`, importado solo en `BannerOfertas.tsx` para que el número y el mensaje de WhatsApp tengan una sola fuente (P2 de la SPEC 02).

  No se importa nada de `src/Chequeo/`. Servicio, tipos y hook de las ofertas están **clonados**.
- **Precargar solo la oferta inicial.** Las promociones pesan unos 2 MB cada una y el back no las optimiza (hasta 5 MB). Al entrar se baja una sola imagen, y en el banner solo tienen `src` la activa y la siguiente. No precargues la lista entera.
- **El orden de las ofertas lo decide el Administrador**: el front no reordena. Solo la oferta inicial de cada búsqueda es al azar.
- **`getCertificadoRut` es API pública**: lo usa `src/Chequeo/pages/AppChequeo.tsx`. No cambiar su firma.
- **Sin colores fijos ni `fontFamily` propia**: botones `variant="contained"` del tema.
- **Sin SweetAlert ni redirección**: los errores y el «sin documentos» se muestran en línea. Si fallan las ofertas, no hay aviso al visitante: queda el spinner y un `console.warn`.
- Textos en `config/textos-certificados.json`, no en los `.tsx`.
- **Accesibilidad**:
  - el resumen de la búsqueda va en un `role="status"` (región viva solo con ese texto, no con las tarjetas);
  - mientras carga, esa región dice «Buscando documentos…» y queda oculta a la vista (`sxSoloLectores`), porque el spinner o el banner ya lo muestran;
  - el foco pasa al `h2` de resultados.

## Banner de ofertas (SPEC 02)

- **Banner o spinner se decide al empezar la búsqueda.** `buscar` guarda la instantánea `{ ofertas, indiceInicial }` si la oferta inicial ya estaba precargada; si no, va el spinner hasta el final (D8).
- **Permanencia mínima** de `permanenciaMinimaMs`, solo con banner: `Promise.allSettled([consulta, esperar(...)])`. `busquedaVigente` se comprueba **después** de la espera. Sin banner, la búsqueda no espera nada.
- **Transiciones.** El banner entra con `Fade` de 300 ms y sale sin animación; los resultados entran con `Fade` de 250 ms. Si el banner saliera con fundido, convivirían banner y resultados un instante y luego todo saltaría.
- **Autoplay.** Se pausa con el ratón encima **o** el foco dentro, y lo llevan manejadores propios. No uses `pauseOnMouseEnter`: Swiper reanuda al salir el ratón aunque el foco siga dentro.
- **Swiper reanuda el autoplay después de cada transición**, sin mirar por qué estaba en pausa (`autoplay.mjs` L42–50). Por eso `onAutoplayResume` vuelve a pausar si el ratón o el foco siguen dentro.
- **Puntos externos.** El contenedor de los puntos va en **estado, por callback ref**, y el `Swiper` se monta cuando ya existe (`montarCarrusel`). No vuelvas a `useRef` + `onBeforeInit`: Swiper se inicia en un layout effect antes de que React enganche la ref de un hermano posterior. En `dev` funciona por el doble montaje del StrictMode; en producción los puntos no salen, y A11y no les engancha el teclado.
- **Barra de tiempo.** Se escribe por `ref` desde `onAutoplayTimeLeft`, nunca con `useState`: se emite en cada frame.
- **`rewind`, no `loop`.** `loop` reordena el DOM bajo `EffectCreative` y `initialSlide`.
- **Caption y CTA** van fuera del Swiper y siguen a la oferta activa. La imagen enlaza a WhatsApp solo para el ratón (`tabIndex={-1}`), y las diapositivas ocultas llevan `aria-hidden`. Con `caption = null` se usa el `alt` (`nombreDeOferta`).
- **Al montarse** hace `scrollIntoView({ block: 'nearest' })`, **después** de montar el carrusel: los puntos suman alto, y medir antes dejaba el CTA cortado. En móvil baja hasta el banner; en escritorio, solo si no cabe entero. A 1440×900 bajó entre 160 y 200 px, según carguen o no las imágenes de `MarqueeHome`.
- Con «reducir movimiento»: sin autoplay, transición, barra ni fundidos. Con una sola oferta: sin autoplay, puntos ni barra.

## Descargas

| `tipo` | Botón | Cómo |
| --- | --- | --- |
| `certificado_ecg` / `certificado_bio` | «Certificado» | URL **firmada** (10 min). `fetch` → blob → descarga, con spinner en el botón. Si `expira` ya pasó, o el back responde **403**, se rehace la consulta y se reintenta una vez. Un 404 (p. ej. la bioimpedancia ya no es la vigente) o un 500 no se reintentan. |
| `ecg` / `bio` | «Examen ECG» / «Informe bioimpedancia» | Archivo público de `public/` del back: `<a href target="_blank">`. |

La reconsulta usa el RUT del **resultado vigente**, no el texto del buscador. Si entre medio hubo otra búsqueda, la respuesta se descarta, y si vuelve sin documentos la página pasa a «vacío». La reconsulta no muestra el banner: no pasa por `cargando`.

Se usa `fetch` y no el `ApiAdapter` porque este no admite `responseType: 'blob'`. Las rutas
firmadas viven bajo `api/*`, así que el CORS por defecto de Laravel las cubre.

## Verificación

- **Comandos:** `npm run build` · `npx eslint src/Certificados/`.
- **Greps:** `grep -rn "Chequeo/" src/Certificados` (vacío) · `grep -rnE "from ['\"].*home-ergo" src/Certificados` (una línea: `BannerOfertas.tsx`).
- **En el navegador, pestaña Network:** 1 petición por búsqueda y ninguna a `home-imagenes` al buscar.
  - Al entrar hay 1 a `home-imagenes` y 1 imagen. En `npm run dev` se ven **2** peticiones, porque el StrictMode monta dos veces; la cuenta de 1 se mide en `npm run preview`.
- **Pruebas:** a 360×640 y 1440×900, con teclado y con «reducir movimiento». Los puntos, el teclado sobre ellos y el desplazamiento se prueban en `npm run preview`: en `dev`, el StrictMode tapa los fallos de inicialización de Swiper.
- **Requisitos:** el back con la SPEC 07 (certificados) y la SPEC 03 (`home-imagenes`) desplegadas. Para ver la rotación hacen falta al menos **dos** promociones activas.
