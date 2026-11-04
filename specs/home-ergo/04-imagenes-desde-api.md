# SPEC 04 — Imágenes del Home desde la API

> **Estado:** Implementado
> **Depende de:** SPEC 03 del **backend**, «Mantenedor de imágenes del Home (`home_imagenes`)», en `Back-end/ergosanitas-app/specs/03-mantenedor-imagenes-home.md`. Tiene que estar desplegada antes. También de las Specs 01–03 de `home-ergo`.
> **Fecha:** 2026-11-03
> **Área afectada:** `src/home-ergo/` únicamente.
> **Objetivo:** Que las promociones, las alianzas y la galería de operativos del Home se lean de `GET api/home-imagenes` en vez de los JSON compilados, para que el Administrador las cambie sin desplegar.

---

## 1. Por qué existe esta spec

Hoy `CarruselPromociones.tsx` importa `config/home-promociones.json` y reparte las entradas por
`destacado === true` (promociones, arriba) y `destacado === false` (alianzas, abajo).
`GaleriaOperativos.tsx` importa `config/home-galeria.json`. Los dos filtran por `activo` en el
ámbito del módulo, al cargar el archivo.

La Spec 02 de `chequeo-administrador` da al Administrador un mantenedor que escribe en la tabla
`home_imagenes`. Si el Home siguiera leyendo los JSON, lo que hace el Administrador no se vería.

El usuario decidió **solo API**: sin respaldo JSON. Si la API falla, la sección afectada no se
pinta y el resto del Home sigue funcionando.

## 2. Alcance

**Dentro:**

- `services/UseHomeImagenesService.ts`, con `getImagenesHome()` → `GET {VITE_API}{VITE_API_PATH}/home-imagenes`, por `ApiAdapter.getToken` (sin `limit`/`offset`).
- `hooks/useImagenesHome.ts`: **una** petición por visita al Home. Devuelve `{ promociones, alianzas, galeria, estado }`, con `estado` `'cargando' | 'listo' | 'error'`.
- `HomeErgoPage` llama al hook una vez y reparte por props a `CarruselPromociones` (que se usa dos veces: promociones y alianzas) y a `GaleriaOperativos`.
- Interfaces nuevas en `interface/home.interface.ts`: la cruda del back y el mapeo a `IImagenHome` / `IPromocionHome`, para no tocar los componentes de presentación más de lo necesario.
- Esqueletos de carga del alto de la sección, para que el Home no salte al llegar los datos.
- Borrar `config/home-promociones.json` y `config/home-galeria.json`.
- Actualizar `CLAUDE_HOME_ERGO.md` y la sección `home-ergo` del `CLAUDE.md` del front: «el contenido vive en JSON» pasa a decir «salvo promociones, alianzas y galería, que vienen de la API».

**Fuera de alcance:**

- Videos, hero, servicios y contacto: siguen en sus JSON.
- Borrar imágenes de `public/home-ergo/img/`: los `poster` de `home-videos.json` las usan.
- Caché en `localStorage` o `sessionStorage`.
- El mantenedor del Administrador (Spec 02 de `chequeo-administrador`).

## 3. Modelo de datos

```ts
/** Forma cruda de una fila de `GET api/home-imagenes` (SPEC 03 del back). */
export interface IHomeImagenApi {
    id      : number;
    seccion : 'promocion' | 'alianza' | 'galeria';
    src     : string;   // URL absoluta del back
    alt     : string;
    caption : string | null;
    activo  : boolean;
    orden   : number;
}
```

Mapeo a lo que ya consumen los componentes:

- `id` → `String(id)`.
- `caption: null` → `''`.
- `seccion === 'promocion'` → `IPromocionHome` con `destacado: true`.
- `seccion === 'alianza'` → `IPromocionHome` con `destacado: false`.
- `seccion === 'galeria'` → `IImagenHome`.
- Una `seccion` desconocida se **descarta**, no cae en un grupo por defecto.

La comparación es explícita contra cada literal, nunca por verdad/falsedad ni por el prefijo del
`id`: es la regla que ya tenía `destacado`.

El back ya devuelve solo las activas y ordenadas. El front no reordena: el orden lo decide el
Administrador.

## 4. Plan de implementación

1. Agregar `IHomeImagenApi` a `interface/home.interface.ts` y exportarla desde el barril.
2. Crear `services/UseHomeImagenesService.ts` siguiendo el patrón de `UseChatComercialService.ts`. Debe comprobar `response?.success === true && Array.isArray(response?.data)`. Cualquier otra forma lanza un error.
3. Crear `hooks/useImagenesHome.ts` con el mapeo y el reparto del §3, y una bandera `vigente` en el `useEffect` para ignorar la respuesta si el componente se desmonta.
4. `HomeErgoPage` llama al hook. `CarruselPromociones` y `GaleriaOperativos` reciben `imagenes` y `estado` por props, y eliminan el import del JSON y los filtros del ámbito del módulo.
5. Estados: `cargando` pinta un esqueleto con el mismo alto. `error`, o `listo` con cero imágenes, **no pinta la sección**, ni su encabezado. Sin aviso al visitante: el Home es comercial. Se deja un `console.warn` con el motivo.
6. Borrar los dos JSON y comprobar que no queda ninguna referencia con `grep -rn "home-promociones\|home-galeria" src/`.
7. Actualizar `CLAUDE_HOME_ERGO.md` y `CLAUDE.md`.

## 5. Criterios de aceptación

- [ ] Abrir `/` hace **una sola** petición `GET .../home-imagenes`, o dos en `npm run dev` por `StrictMode`.
- [ ] Con la siembra del back, el Home muestra 11 promociones arriba, 8 alianzas abajo y 4 fotos de galería, en el orden de `orden`. De las 24 filas, una alianza está inactiva, así que el total visible es 23. *(Corregido en la implementación: decía «9 alianzas», que son las filas, no las visibles.)*
- [ ] Ocultar una promoción desde el mantenedor y recargar `/` hace que ya no aparezca.
- [ ] Pulsar una promoción abre WhatsApp con su `caption` en el mensaje, igual que hoy.
- [ ] Con el back apagado, el Home carga, el hero, los servicios, los videos y el contacto se ven, y las tres secciones de imágenes no aparecen. No hay pantalla en blanco ni error sin capturar.
- [ ] Mientras carga, las secciones muestran un esqueleto y la página no salta de alto al llegar los datos.
- [ ] Promociones y alianzas siguen con `object-fit: contain`, y la galería con `cover`.
- [ ] `ImagenAmpliable` (Spec 03) sigue abriendo la imagen ampliada.
- [ ] `grep -rn "home-promociones\|home-galeria" src/` sale vacío.
- [ ] `git diff --stat` solo muestra archivos dentro de `src/home-ergo/` y documentación.
- [ ] `npm run build` termina en verde y `npx eslint src/home-ergo/` da 0 errores.

## 6. Decisiones tomadas y descartadas

- **Sí:** solo API, sin respaldo. Decisión del usuario: un respaldo JSON se desactualizaría en silencio y mostraría promociones que el Administrador ya quitó.
- **No:** caer a los JSON si la API falla. Por la misma razón.
- **Sí:** una petición en `HomeErgoPage` repartida por props. Tres secciones con su propio fetch serían tres peticiones al mismo endpoint.
- **Sí:** mapear a `IPromocionHome` con `destacado` en vez de reescribir los componentes con `seccion`. El cambio queda en el hook y los componentes de presentación casi no cambian.
- **No:** reordenar en el front. El `orden` es del Administrador.
- **Sí:** ocultar la sección vacía o con error. Una sección de ventas con «no se pudo cargar» resta más de lo que informa.

## 7. Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Se despliega el front antes que el back y el Home pierde sus tres secciones de imágenes | La cabecera exige la SPEC 03 del back desplegada. Hay que comprobar `GET api/home-imagenes` en producción antes de hacer push a `main` del front. |
| El back no tiene sembrada `public/HomeImagenes/` en el hosting, o le falta `API_PATH_HOME` | Paso 8 de la SPEC 03 del back (D6 corregida: producción es el hosting, no Docker). Si no está hecho, esta spec no debe salir. |
| Imágenes de otro origen sin CORS | `<img>` no necesita CORS. Solo afectaría a un `fetch` de la imagen, y aquí no se hace. |
| Imágenes de 5 MB subidas sin comprimir hacen lento el Home en móvil | `loading="lazy"` fuera de la primera pantalla, como hoy. Comprimir en el servidor queda fuera, en la SPEC 03. |

## 8. Lo que **no** entra en esta spec

- Videos, hero, servicios y contacto desde la API.
- Caché en el navegador.
- El mantenedor del Administrador.
- Borrar imágenes de `public/home-ergo/img/`.
