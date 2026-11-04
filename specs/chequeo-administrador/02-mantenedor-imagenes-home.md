# SPEC 02 — Mantenedor de imágenes del Home

> **Estado:** Implementado
> **Depende de:** Spec 01 de `chequeo-administrador` (módulo y rail). En el **backend**, de la SPEC 03 «Mantenedor de imágenes del Home (`home_imagenes`)», en `Back-end/ergosanitas-app/specs/03-mantenedor-imagenes-home.md`. Se coordina con la Spec 04 de `home-ergo`, que es la que hace visibles los cambios en el Home.
> **Fecha:** 2026-11-03
> **Área afectada:** `src/chequeo-administrador/` únicamente. No se toca `src/routes/`, `src/common/` ni `src/home-ergo/`.
> **Objetivo:** Dar al Administrador un tab «Imágenes del Home» donde vea, como una grilla de cartas, las promociones, alianzas y fotos de galería del Home, y pueda agregarlas, editarlas, ocultarlas y eliminarlas.

---

## 1. Por qué existe esta spec

Cambiar una promoción del Home exige hoy editar un JSON, hacer commit y esperar el FTP. La
SPEC 03 del back lleva esas imágenes a la tabla `home_imagenes`. Esta spec es la pantalla con la
que el Administrador las mantiene.

El usuario pidió que se vea «en modelo de juego de cartas»: una grilla de tarjetas verticales con
la imagen como protagonista. Es la forma de `chequeo-cardiovascular/pages/JuegoCartasPage.tsx`
(grilla, filtro por chips, buscador y «Ver más»). La regla dura del módulo prohíbe importarla,
así que se **clona la forma, no el código clínico**: aquí no hay nivel, atributos ni estrellas.

Nota de numeración: la guía del módulo reservaba 02–07 para rediseños sin redactar. Esta spec
toma el 02, y esos rediseños pasan a numerarse a partir del 03.

## 2. Alcance

**Dentro:**

- Constante `TAB_IMAGENES` y tab «Imágenes del Home» (icono `CollectionsIcon`), insertado **antes** de «Mi cuenta», que sigue siendo el último. Queda `TAB_IMAGENES = 6` y `TAB_CUENTA = 7`. Todos los `<Tab>` y `<TabPanel>` usan sus constantes, y ningún handler usa un literal.
- `pages/ImagenesHomePage.tsx`, que recibe `activo={tab === TAB_IMAGENES}` y pide `GET home-imagenes/admin` en la **primera** activación.
- Componentes en `components/imagenes-home/`:
  - `TarjetaImagen`: imagen 2:3 con `object-fit: contain`, caption, chip de sección, chip «Visible»/«Oculta» y tres acciones (ocultar/mostrar, editar, eliminar). Una imagen oculta se pinta atenuada.
  - `FiltroSecciones`: chips «Todas · Promociones · Alianzas · Galería», con el conteo de cada una.
  - `DialogoImagen`: un solo diálogo para «Agregar» y «Editar».
- Buscador en memoria por `caption` y `alt`, con `ClearIcon` para limpiar.
- Diálogo con react-hook-form + yup:
  - `archivo` es obligatorio solo al agregar, con jpg/png/webp hasta 5 MB validados también en el front y vista previa con `URL.createObjectURL`, que se libera al cerrar.
  - `seccion` es obligatoria. `alt` es obligatorio, de 255 caracteres como máximo. `caption` tiene un máximo de 150. `orden` es un entero ≥ 0 y opcional.
  - Al editar no se cambia el archivo: para cambiarlo se elimina y se vuelve a agregar.
- Eliminar con Swal de confirmación que muestra la miniatura y el caption, escapados con `escaparHtml`.
- `services/useImagenesHomeService.ts`, con los métodos del §3.2 sobre `ApiAdapter`.
- Colores nuevos, si hacen falta, en `config/tema.ts`, bloque `IMAGENES`. Ningún `.tsx` escribe un hex.
- Actualizar `CLAUDE_CHEQUEO_ADMINISTRADOR.md`: tabla de specs, §4 (de 7 a 8 tabs), §10 (endpoints, de 18 a 23) y la regla de turno. También `.claude/ARQUITECTURA.md` (catálogo de endpoints) y el `CLAUDE.md` del front, donde dice «7 tabs fijos».

**Fuera de alcance:**

- Que el Home público lea de la API: es la Spec 04 de `home-ergo`.
- Videos, hero, servicios y contacto.
- Reordenar arrastrando las cartas. El orden se edita con el campo `orden`.
- Reemplazar el archivo de una imagen existente.
- Recortar o comprimir en el navegador.

## 3. Modelo de datos

### 3.1 Tipos (`interface/imagen-home.interface.ts`)

```ts
export type SeccionImagenHome = 'promocion' | 'alianza' | 'galeria';

export interface IImagenHome {
    id      : number;
    seccion : SeccionImagenHome;
    src     : string;
    alt     : string;
    caption : string | null;
    activo  : boolean;
    orden   : number;
}

export interface IImagenHomeForm {
    archivo? : File | null;      // solo al agregar
    seccion  : SeccionImagenHome;
    alt      : string;
    caption  : string;
    orden    : number | null;    // null → el back pone MAX + 1
}

/** Sobre `{success, message, data}` de la SPEC 03 del back. */
export interface IRespuestaImagenHome<T> {
    success : boolean;
    message : string;
    data    : T;
    // En un 422 el back devuelve la lista de errores; en el resto, un texto.
    error?  : string | string[];
}
```

Las etiquetas visibles («Promociones», «Alianzas», «Galería de operativos») viven en
`config/imagenes-home.ts`, junto con los mime aceptados y el tamaño máximo. Nada de eso se
escribe dentro de un `.tsx`.

### 3.2 Servicio (`useImagenesHomeService`)

| Método | Llamada |
| --- | --- |
| `getImagenesAdmin()` | `getToken('/home-imagenes/admin')`. Sin `limit`/`offset`. |
| `postImagen(form, user_email)` | `post('/home-imagenes', FormData)` con `file`, `seccion`, `alt`, `caption`, `orden` y `user_email`, igual que `loadLogoUser`. |
| `putImagen(id, form, user_email)` | `put('/home-imagenes/{id}', { seccion, alt, caption, orden, user_email })` |
| `putActivo(id, activo, user_email)` | `put('/home-imagenes/{id}/activo', { activo, user_email })` |
| `deleteImagen(id, user_email)` | `delete('/home-imagenes/{id}?user_email=...')`, con `encodeURIComponent`. |

`user_email` sale del `LoginContext`. El back responde `403` si no es Administrador.

### 3.3 Estado de la página

Una sola lista `imagenes: IImagenHome[]` en `ImagenesHomePage`. Tras cada operación correcta se
actualiza **en memoria** con la fila que devuelve el back: se reemplaza por `id`, se agrega o se
quita. No se recarga la lista entera.

## 4. Plan de implementación

1. Tipos y `config/imagenes-home.ts`. Exportarlos desde el barril de `interface/`.
2. `services/useImagenesHomeService.ts`. Prueba: llamar a `getImagenesAdmin()` desde la consola de desarrollo y ver 24 filas.
3. `TarjetaImagen` y `FiltroSecciones`. Tokens en `tema.ts` si hacen falta.
4. `ImagenesHomePage` con carga en la primera activación, turno en `useRef` (`turnoImagenes`), filtro, buscador y «Ver más» de 24 en 24. Estados vacío, cargando y error con «Reintentar».
5. Conectar el tab: constantes `TAB_IMAGENES = 6` y `TAB_CUENTA = 7`, entradas del rail y `TabPanel`. Prueba: los 8 tabs caben en 900 px de alto y bajo 900 px de ancho se ven solo los iconos.
6. Acción ocultar/mostrar con `putActivo`. El botón se deshabilita mientras la petición está en vuelo, para que un doble clic no envíe dos peticiones.
7. `DialogoImagen` en modo agregar (`postImagen`) y en modo editar (`putImagen`).
8. Eliminar con confirmación Swal y `deleteImagen`.
9. Documentación: guía del módulo, `ARQUITECTURA.md` y `CLAUDE.md`.

## 5. Criterios de aceptación

- [ ] Un Administrador ve el tab «Imágenes del Home» en el rail, antes de «Mi cuenta».
- [ ] Al entrar a `/Chequeos` no se pide `home-imagenes/admin`. Se pide al abrir el tab por primera vez y no se repite al volver a él.
- [ ] La grilla muestra las 24 imágenes sembradas, y la inactiva aparece atenuada con el chip «Oculta».
- [ ] Los chips de sección filtran y muestran los conteos 11 · 9 · 4.
- [ ] El buscador filtra por caption y alt, y `ClearIcon` lo limpia.
- [ ] Agregar una imagen PNG con sección «Promociones» la muestra en la grilla sin recargar, y aparece en `GET home-imagenes`.
- [ ] El diálogo rechaza un PDF o una imagen de más de 5 MB **antes** de enviarla, con un mensaje junto al campo.
- [ ] El diálogo no deja guardar sin `alt`.
- [ ] Editar el caption y el orden de una alianza se refleja en la carta y en `GET home-imagenes`.
- [ ] Ocultar una imagen la atenúa en la grilla, y deja de salir en `GET home-imagenes`. Mostrarla la devuelve.
- [ ] Eliminar pide confirmación con la miniatura y el caption. Cancelar no hace nada. Confirmar quita la carta.
- [ ] Un error del back (403, 422 o 500) se muestra en un Swal con el `message` del back, y la grilla queda como estaba.
- [ ] Con todos los tabs, cambiar de tab por el rail no rompe la ficha: «Editar» sigue saltando a «Ficha del chequeo».
- [ ] `grep -rnE "from '\.\./+.*(Chequeo|chequeo-cardiovascular|User|Login|Certificados|components/forms|Url|home-ergo)/" src/chequeo-administrador/` sale vacío.
- [ ] Ningún `.tsx` nuevo contiene un color hex.
- [ ] Desde 900 px, el botón de arriba del rail lo contrae a solo iconos y lo vuelve a expandir; el cuerpo gana el ancho liberado y la preferencia se recuerda al volver a entrar al módulo. Bajo 900 px el botón no aparece.
- [ ] `npm run build` termina en verde y `npx eslint src/chequeo-administrador/` da 0 errores.

## 6. Decisiones tomadas y descartadas

- **Sí (añadido antes del commit, a pedido del usuario):** rail contraíble. `RailTabs` gana un botón que lo contrae a 64 px desde 900 px, para ensanchar el cuerpo. Vive en el componente, sin cambiar su firma; la preferencia va en localStorage (`admin_rail_contraido`) con `storage.service` de `src/common/`.

- **Sí:** clonar la forma de la grilla de `JuegoCartasPage`, sin importarla. Es la regla dura 1 del módulo.
- **Sí:** «Imágenes del Home» antes de «Mi cuenta». La cuenta es lo último en todos los rails del repo.
- **No:** ponerlo al final como índice 7 sin mover nada. Funciona, pero deja «Mi cuenta» en medio.
- **Sí:** un solo diálogo para agregar y editar. Mismos campos, solo cambia el archivo.
- **No:** reemplazar el archivo al editar. Duplica la lógica de subida y de borrado en el back. Eliminar y agregar cubre el caso.
- **Sí:** actualizar en memoria con la fila que devuelve el back. Ahorra recargar 24 imágenes por cada clic.
- **Sí:** `object-fit: contain` en las cartas. Son flyers 2:3 con texto quemado, la misma razón que en el Home.
- **No:** un componente de subida con arrastrar y soltar. Un `<input type=file>` con `useId` basta, como en «Mi cuenta».

## 7. Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| El back no autentica: el mantenedor solo exige un `user_email` de Administrador (D3 de la SPEC 03) | Fuera del alcance del front. Queda escrito en la guía del módulo. |
| Insertar un tab corre los índices | Constantes `TAB_*` en todo, y un criterio de aceptación que prueba el salto «Editar» → ficha. |
| Ocho tabs de 52 px no caben en pantallas bajas | 8 × 52 = 416 px, holgado en 900 px. Se prueba en el paso 5. |
| Fugas de memoria por las vistas previas | `URL.revokeObjectURL` al cambiar de archivo y al cerrar el diálogo. |
| Eliminar una imagen es irreversible | Confirmación explícita y la alternativa «Ocultar» visible en la misma carta. |

## 8. Lo que **no** entra en esta spec

- El Home público leyendo de la API (Spec 04 de `home-ergo`).
- Videos, hero, servicios y contacto.
- Reordenar arrastrando las cartas y reemplazar el archivo de una imagen.
- Autenticación real.
