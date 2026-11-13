# SPEC 01 — Rediseño de «Descargar certificados»: una sola consulta, tarjetas por examen y estados claros

> **Estado:** Aprobado
> **Depende de:** SPEC 07 del back `Back-end/ergosanitas-app/specs/07-descarga-certificados-rut.md` (**Borrador**: el contrato de §3 puede cambiar hasta que se apruebe; el endpoint `POST /certificados/consulta` **aún no existe**).
> **Fecha:** 2026-11-11
> **Área afectada:** `src/Certificados/` (página pública `/certificados`, sin perfil). Nada fuera del módulo: `src/routes/routes.ts` no cambia y `getCertificadoRut` se conserva para `src/Chequeo/pages/AppChequeo.tsx`.
> **Objetivo:** Que la página pública de certificados busque por RUT con **una sola petición**, muestre el chequeo cardiovascular y la bioimpedancia en dos tarjetas coherentes y responsive, y descargue cada documento con estados de carga y error visibles, sin redirecciones forzadas.

---

## 1. Por qué existe esta spec

La pantalla «Descargar certificados» es pública: el deportista (o su apoderado) escribe su RUT y
descarga sus documentos. Hoy:

- Hace **cuatro peticiones** por búsqueda, dos de ellas descartadas, y probablemente más por un
  efecto que se vuelve a disparar en cada `dispatch`.
- Los cuatro botones tienen **cuatro estilos distintos** (tamaño, radio, tipografía, color fijo),
  dos de ellos con el mismo texto «Certificado - <Nombre>».
- El layout usa márgenes fijos (`ml={15}`), no está centrado y el título va en `cursive`.
- Si no hay documentos, un SweetAlert **redirige a ergosanitas.com** a los 5 s; los errores de
  descarga solo van a `console.error`.
- El módulo depende de `src/Chequeo/` (servicio e interfaces) y lleva en el bundle un JSON muerto
  con RUT y nombres de personas.

### 1.1 Lo que se verificó en el código (2026-11-11)

| Hallazgo | Consecuencia |
| --- | --- |
| `src/routes/routes.ts` L36–41: `/certificados/*` → `AppCertificadoPage` (`pages/AppCerteficadoPage.tsx` L6–12, envuelve en `CertificadoProvider`) | La ruta y el nombre del export no cambian. |
| `components/Certificado.tsx` L81–92 → `hooks/GetUrlPdf.ts` L12 `GET certificado/validar/{rut}` y L15 `GET certificado/{rut}` (`services/useCertificadoService.ts` L15, L22) | 2 peticiones al enviar. Se reemplazan por la consulta única. |
| `components/DownloadFile.tsx` L31–37: `Promise.all` de `validaCertificado` (`POST certificado/valida-certificado`) y `getUrlBio` (`POST bioimpedancia/first-rut`) de `src/Chequeo/services/useChequeoService.ts` L165–183 | 2 peticiones más al montar; lo que dejó `GetUrlPdf` se pisa en L50–58. |
| `DownloadFile.tsx` L109: el `useEffect` depende de `onSetCertificado`, que **no** está memoizado (`context/certificado/CertificadoProvider.tsx` L34) y el reducer devuelve siempre un objeto nuevo (`certificadoReducer.tsx` L13–23) | Cada `onSetCertificado` re-renderiza, crea una función nueva y vuelve a ejecutar el efecto: **bucle de peticiones** (confirmar en Network antes de implementar). Se elimina el contexto. |
| `DownloadFile.tsx` L11–13 importa `UseChequeoService`, `IUrlCertificado` e `IUrlBio` de `src/Chequeo/` | Rompe el aislamiento de módulos (`CLAUDE.md` L410). Servicio e interfaces propios. |
| `DownloadFile.tsx` L140–156: «Certificado» ECG y bio con `window.open` a `…/pdfRut/{rut}` (`useChequeoService.ts` L17–25, L185–192); L217–239 y L289–310: `<Button href>` a la URL pública del archivo | Pasan a `<a href>` con la `url` que devuelve el back (firmada para los certificados, pública para los archivos). |
| `DownloadFile.tsx` L198–209, L223–235, L272–283, L296–306: cuatro bloques `sx` con colores fijos (`#4CAF50`, `#1976D2`, `#FF9800`), `fontSize: 18px` vs. sin tamaño, `borderRadius: "12px"` vs. `2` | Un solo componente de botón con variante única del tema. |
| `DownloadFile.tsx` L74–97: sin documentos → `Swal.fire` con `willClose: window.location.href = "https://ergosanitas.com/"` | Estado vacío en línea, sin redirección. |
| `DownloadFile.tsx` L99–100, L144–145, L153–154: errores solo en `console.error`; L68 `console.log` con datos del paciente | Error en línea; se quitan los `console.log` con datos. |
| `pages/CertificadoPage.tsx` L16 `ml={15}`, L21 `fontFamily: 'cursive'`, L27 `animation: 'rotateIn …'` | Layout centrado con `Container` y tipografía del tema. |
| `hooks/ValidaExisteRut.ts` L1–9 y `config/list-certificados.json` L1–25: no se usan en la validación (`custom-form.json` no tiene la regla `validaExisteRut`), y el JSON trae RUT y nombres de personas | Se eliminan ambos archivos (no son datos clínicos de la BD: es un archivo estático del bundle). |
| `components/Banner.tsx` L13, L52 y `components/ProgressBar.tsx` L13–32 dependen de `banner`/`completed` del contexto; `Banner` se exporta (`components/index.ts`) pero ninguna página lo renderiza | Con el contexto eliminado quedan muertos: se borran junto con `config/list-banner.json` si un `grep` lo confirma al implementar. |
| `src/Chequeo/pages/AppChequeo.tsx` L20, L69–70 importa `UseCertificadoService().getCertificadoRut` de este módulo | **`getCertificadoRut` y `getCertificadoExiste` se conservan** con su firma; el método nuevo se agrega. |
| `pages/CertificadoPage.tsx` L2 importa `MarqueeHome` de `src/Home/components` | Otra dependencia externa; queda **fuera de alcance** (ver §6 y §8). |
| `common/api/api.adapter.ts` L30–33: `post<T>(url, dataJson)` no inyecta `limit`/`offset` | La consulta usa `apiAdapter.post`. |
| `src/Certificados/` no tiene agente dueño ni guía `CLAUDE_CERTIFICADOS.md` | Implementa `ergosanitas-developer` (FE) con `ergo-code`; esta spec propone crear la guía. |

---

## 2. Alcance

### Entra

- Servicio propio `consultarDocumentos(rut)` en `src/Certificados/services/useCertificadoService.ts`
  (una sola petición) e interfaces propias en `src/Certificados/interface/`.
- Cero imports de `src/Chequeo/` en el módulo.
- Eliminar `context/certificado/*` (Provider, Context, reducer) y manejar el estado con `useState`
  en la página.
- Eliminar `hooks/ValidaExisteRut.ts`, `hooks/GetUrlPdf.ts`, `config/list-certificados.json` y, si
  quedan sin uso, `components/Banner.tsx`, `components/ProgressBar.tsx`, `config/list-banner.json`.
- Interfaz nueva (MUI 5):
  - Buscador centrado: campo RUT + botón «Buscar» + botón «Limpiar», validación con la regex
    actual, `Enter` envía.
  - Dos tarjetas: **«Chequeo cardiovascular»** (botones «Certificado» y «Examen ECG») y
    **«Bioimpedancia»** (botones «Certificado» e «Informe bioimpedancia»), con nombre del paciente
    y fecha de cada documento. Una tarjeta solo aparece si tiene al menos un documento; un botón
    solo aparece si su `tipo` viene en la respuesta.
  - Botones de **variante única** (`variant="contained"`, `color="primary"`, mismo tamaño,
    `startIcon`), sin colores fijos en `sx`.
  - Responsive de 360 px a 1440 px: tarjetas en columna en móvil y lado a lado desde `md`.
  - Estados en línea: **vacío** («No encontramos documentos para este RUT…»), **cargando**
    (skeleton o spinner en el área de resultados, botón «Buscar» deshabilitado), **error** (`Alert`
    con reintento), **429** (mensaje del back).
  - Spinner **por botón** mientras se descarga un certificado firmado; si la URL venció
    (`expira` < ahora), se rehace la consulta antes de abrirla.
  - Accesibilidad: `aria-label` en cada botón (p. ej. «Descargar certificado del chequeo
    cardiovascular»), `aria-live="polite"` en la región de resultados y **foco** en el título de
    resultados al terminar la búsqueda.
  - Textos (títulos, etiquetas, mensajes) en `src/Certificados/config/textos-certificados.json`.
  - Título sin `fontFamily: 'cursive'` ni animación.
- Crear `specs/certificados/CLAUDE_CERTIFICADOS.md` al cerrar la implementación.

### No entra

Ver §8.

---

## 3. Modelo de datos y contrato

Copiado de la SPEC 07 del back (§3.4–§3.5). **Provisional** hasta que esa spec se apruebe e
implemente.

### 3.1 `POST {API}/certificados/consulta`

- Body: `{ "rut": "11111111-1" }`. Middleware `throttle:certificados`, sin autenticación.
- Llamada: `apiAdapter.post<ICertificadosConsultaResponse>(`${API}/certificados/consulta`, { rut })`.

Éxito con documentos (200):

```json
{
  "success": true,
  "message": "Documentos encontrados",
  "data": {
    "rut": "11111111-1",
    "nombre": "Paciente Ficticio",
    "documentos": [
      { "tipo": "certificado_ecg", "fecha": "2026-05-04", "url": "https://<api>/api/certificados/descarga/ecg/123?expires=…&signature=…", "expira": "2026-11-11T15:10:00-03:00" },
      { "tipo": "ecg",             "fecha": "2026-05-04", "url": "https://<api>/Certificado/11111111-1-123.pdf", "expira": null },
      { "tipo": "certificado_bio", "fecha": "2026-06-30", "url": "https://<api>/api/certificados/descarga/bio/45?expires=…&signature=…", "expira": "2026-11-11T15:10:00-03:00" },
      { "tipo": "bio",             "fecha": "2026-06-30", "url": "https://<api>/Bioimpedancia/archivo-ficticio.pdf", "expira": null }
    ]
  }
}
```

Sin documentos (200): `{ "success": true, "message": "No hay documentos disponibles para este RUT", "data": { "rut": "11111111-1", "nombre": null, "documentos": [] } }`

RUT inválido (422, axios lanza): `{ "success": false, "message": "El RUT no tiene un formato válido.", "errors": { "rut": ["El RUT no tiene un formato válido."] } }`

Demasiadas consultas (429, axios lanza): `{ "success": false, "message": "Demasiadas consultas seguidas. Espera un momento y vuelve a intentarlo.", "data": null }`

Error interno (500, axios lanza): `{ "success": false, "message": "No fue posible consultar los documentos. Intenta más tarde.", "data": null }`

### 3.2 Descargas

| `tipo` | Tarjeta · botón | Cómo se abre |
| --- | --- | --- |
| `certificado_ecg` | Chequeo cardiovascular · «Certificado» | `<a href={url}>` (URL firmada, 10 min; vencida o manipulada → 403) |
| `ecg` | Chequeo cardiovascular · «Examen ECG» | `<a href={url} target="_blank" rel="noopener noreferrer">` (archivo público) |
| `certificado_bio` | Bioimpedancia · «Certificado» | `<a href={url}>` (URL firmada; el primer PDF puede tardar porque el back genera el análisis) |
| `bio` | Bioimpedancia · «Informe bioimpedancia» | `<a href={url} target="_blank" rel="noopener noreferrer">` |

### 3.3 Interfaces (`src/Certificados/interface/certificados-consulta.interface.ts`)

```ts
export type TipoDocumento = 'certificado_ecg' | 'ecg' | 'certificado_bio' | 'bio';

export interface IDocumentoCertificado {
    tipo   : TipoDocumento;
    fecha  : string | null;   // 'YYYY-MM-DD'; la UI muestra «—» si es null
    url    : string;
    expira : string | null;   // ISO 8601; null en archivos públicos
}

export interface ICertificadosConsulta {
    rut        : string;
    nombre     : string | null;
    documentos : IDocumentoCertificado[];
}

export interface ICertificadosConsultaResponse {
    success : boolean;
    message : string;
    data    : ICertificadosConsulta | null;
}
```

### 3.4 Estado de la página

`useState` en `CertificadoPage`: `rut`, `estado: 'inicial' | 'cargando' | 'ok' | 'vacio' | 'error'`,
`resultado: ICertificadosConsulta | null`, `mensajeError: string | null`. Sin contexto, sin
`useReducer`, sin react-query.

---

## 4. Plan de implementación

Rama `spec-01-rediseno-descarga-certificados`. Requiere la SPEC 07 del back **implementada**.
Agente: `ergosanitas-developer` (FE) con `ergo-code`. Pausa y confirmación tras cada paso.

1. **Servicio e interfaces**: `interface/certificados-consulta.interface.ts` (§3.3) y
   `consultarDocumentos(rut)` en `services/useCertificadoService.ts`, **conservando**
   `getCertificadoRut` y `getCertificadoExiste`.
2. **Textos**: `config/textos-certificados.json` con títulos, etiquetas de botones, `aria-label` y
   mensajes de vacío, error y 429.
3. **Componentes**: `BuscadorRut.tsx` (campo + Buscar + Limpiar, validación con la regex de
   `custom-form.json`), `TarjetaDocumentos.tsx` (título, nombre, fecha, botones),
   `BotonDescarga.tsx` (variante única, spinner propio, `aria-label`) y `EstadoResultado.tsx`
   (vacío / error / cargando).
4. **Página**: reescribir `pages/CertificadoPage.tsx` con `Container maxWidth="md"`, estado de §3.4,
   foco al título de resultados y región `aria-live`. `AppCertificadoPage` deja de envolver en
   el Provider. Se mantiene `MarqueeHome`.
5. **Limpieza**: borrar `context/`, `hooks/ValidaExisteRut.ts`, `hooks/GetUrlPdf.ts`,
   `config/list-certificados.json`, `components/Certificado.tsx`, `components/DownloadFile.tsx` y,
   si `grep` confirma que no se usan, `Banner.tsx`, `ProgressBar.tsx`, `config/list-banner.json` y
   `components/forms/TextInputBase.tsx`. Actualizar los `index.ts` de barril.
6. **Verificación**: §5. Revisión por `ergosanitas-developer` (FE) en modo revisor y por
   `ergosanitas-architect` (módulo sin dueño).
7. **Documentación**: crear `specs/certificados/CLAUDE_CERTIFICADOS.md` y actualizar la fila de
   `Certificados/` en `CLAUDE.md` (L160) y la de endpoints en `.claude/ARQUITECTURA.md` (L147).

---

## 5. Criterios de aceptación

- [x] `npm run build` termina sin errores.
  - ✅ Evidencia (2026-11-11, spec-verify, 2.ª ronda, `bb7e247` + árbol sin commit con los ajustes): `npm run build` → `✓ built in 1m 38s`, exit 0 (solo el aviso habitual de tamaño de chunk).
- [x] `npx eslint src/Certificados/` sin errores.
  - ✅ Evidencia (2026-11-11, spec-verify, 2.ª ronda): `npx eslint src/Certificados/` → sin salida, exit 0.
- [x] `grep -rn "Chequeo/" src/Certificados` no devuelve líneas.
  - ✅ Evidencia (2026-11-11, spec-verify, 2.ª ronda): salida vacía.
- [x] `grep -rn "list-certificados\|ValidaExisteRut\|CertificadoContext\|Swal" src/Certificados` no devuelve líneas.
  - ✅ Evidencia (2026-11-11, spec-verify, 2.ª ronda): salida vacía.
- [x] `grep -rn "cursive\|#4CAF50\|#1976D2\|#FF9800" src/Certificados` no devuelve líneas.
  - ✅ Evidencia (2026-11-11, spec-verify, 2.ª ronda): salida vacía; además `grep -rnE "#[0-9a-fA-F]{3,6}\b" --include=*.tsx src/Certificados` vacío.
- [x] `grep -rn "console.log" src/Certificados` no devuelve líneas.
  - ✅ Evidencia (2026-11-11, spec-verify, 2.ª ronda): salida vacía.
- [x] `grep -n "getCertificadoRut\|getCertificadoExiste" src/Certificados/services/useCertificadoService.ts` sigue mostrando ambas funciones, y `src/Chequeo/pages/AppChequeo.tsx` compila sin cambios.
  - ✅ Evidencia (2026-11-11, spec-verify, 2.ª ronda): L14 `getCertificadoExiste`, L21 `getCertificadoRut`, L67 los exporta junto a `consultarDocumentos` y `descargarDocumento`; `git diff --stat -- src/Chequeo/` vacío; `AppChequeo.tsx` L69–70 sigue llamando a `getCertificadoRut` y el build pasa.
- [ ] En el navegador (local, sin sesión, `/certificados`), pestaña Network: una búsqueda con un RUT ficticio genera **exactamente 1** petición a la API (`POST certificados/consulta`) y ninguna petición más mientras la página está quieta.
  - ⏸ No verificable (2026-11-11, spec-verify, 2.ª ronda): exige `POST /certificados/consulta` (SPEC 07 del back, sin desplegar) y no hay back local seguro. En `127.0.0.1:8000` responde un proceso (`/api/` → 404), pero el `.env` del back apunta a la BD de producción: Playwright vería datos reales (Ley 21.719). Front `localhost:5173` arriba (200).
- [ ] RUT ficticio con chequeo y bioimpedancia de prueba: se ven las dos tarjetas con nombre, fecha y sus dos botones del mismo tamaño y estilo.
  - ⏸ No verificable (2026-11-11, spec-verify, 2.ª ronda): mismo motivo (sin back local con BD ficticia y la SPEC 07).
- [ ] RUT sin documentos: aparece el mensaje de vacío en la página y **no** hay redirección.
  - ⏸ No verificable (2026-11-11, spec-verify, 2.ª ronda): mismo motivo. Estático: no hay `Swal` ni `window.location` en el módulo.
- [ ] Con el back detenido: aparece el `Alert` de error con «Reintentar»; con 429 se muestra el mensaje del back.
  - ⏸ No verificable (2026-11-11, spec-verify, 2.ª ronda): mismo motivo; el 429 exige el throttle del back local.
- [ ] Al pulsar «Certificado» se ve el spinner en ese botón y se descarga el PDF; con la URL vencida (esperar más de 10 min) el front rehace la consulta y la descarga funciona.
  - ⏸ No verificable (2026-11-11, spec-verify, 2.ª ronda): necesita las URL firmadas de la SPEC 07. Estático (2.ª ronda): `renovarUrl` (`CertificadoPage.tsx` L92–110) reconsulta con `resultado.rut` y descarta la respuesta si cambió `busquedaVigente`; `BotonDescarga.tsx` L77 solo renueva ante 403.
- [ ] A 360 px de ancho: sin scroll horizontal, tarjetas apiladas, botones a ancho completo. A 1440 px: contenido centrado, tarjetas lado a lado.
  - ⏸ No verificable (2026-11-11, spec-verify, 2.ª ronda): las tarjetas solo se pintan con una respuesta de la SPEC 07; sin back local seguro.
- [ ] Con teclado: Tab llega al campo, a Buscar, a Limpiar y a cada botón de descarga; tras buscar, el foco queda en el título de resultados; cada botón tiene `aria-label`.
  - ⏸ No verificable (2026-11-11, spec-verify, 2.ª ronda): los botones de descarga y el foco tras buscar dependen de la respuesta del endpoint; sin back local seguro.
- [x] Los textos visibles salen de `config/textos-certificados.json` (revisión del diff: sin literales de interfaz en los `.tsx` nuevos).
  - ✅ Evidencia (2026-11-11, spec-verify): `grep -nE ">[^<{}]*[A-Za-z]{3,}[^<{}]*<"` en `components/*.tsx` y `pages/*.tsx` solo encuentra firmas de tipos; los únicos literales en mayúscula, `'Certificado'` y `'Certificado-Bioimpedancia'` (`CertificadoPage.tsx` L120, L124), son prefijos del nombre de archivo, no texto visible (2.ª ronda).
- [x] Existe `specs/certificados/CLAUDE_CERTIFICADOS.md`.
  - ✅ Evidencia (2026-11-11, spec-verify, 2.ª ronda): `ls specs/certificados/` → `01-rediseno-descarga-certificados.md`, `CLAUDE_CERTIFICADOS.md`.

### 5.1 Resultado del cierre (2026-11-11)

- Rama `feat/descarga-certificados` (sin commit). Back SPEC 07 implementado antes en su rama homónima.
- `npm run build` (tsc -b + vite): OK. `npx eslint src/Certificados/`: 0 problemas. Greps de los criterios: vacíos.
- **Pendientes manuales** (necesitan el back local con la SPEC 07 y datos ficticios): una sola petición en Network, tarjetas y estados, vencimiento de la URL, 360/1440 px y recorrido con teclado. Quedan sin marcar.
- Ajuste de implementación (ver §6): los certificados firmados se descargan con `fetch` + blob, no con `<a href>`.

- **Ajustes tras la verificación (2026-11-11):**
  - `renovarUrl` reconsulta con el RUT del resultado vigente y descarta la respuesta si cambió la búsqueda (`busquedaVigente`, contador en `useRef`, que también descarta respuestas tardías de `buscar`). Si la reconsulta vuelve sin documentos, la página pasa a «vacío».
  - `BotonDescarga` ya no instancia el servicio: recibe `onDescargar` y `onRenovarUrl` por props. Solo renueva la URL ante un **403**; `descargarDocumento` adjunta el `status` al error.
  - Lógica pura movida a `src/Certificados/utilities/` (barril) e `IBotonTarjeta` a `interface/` (barril). Regex de diacríticos con escapes `\u0300-\u036f`.
  - Accesibilidad: resumen en `role="status"` (las tarjetas ya no van dentro de la región viva) y cada tarjeta es `<section aria-labelledby>` a su `h3`.
  - `pages/index.ts` exporta solo `AppCertificadoPage`: el build vuelve a generar el chunk lazy `AppCerteficadoPage-*.js`.

---

## 6. Decisiones tomadas y descartadas

| Decisión | Motivo |
| --- | --- |
| Acceso público por RUT, sin login | Decisión del usuario (SPEC 07 del back). |
| Solo el último chequeo en `REVISION MEDICA` y la última bioimpedancia | Decisión del usuario; el back ya filtra. |
| `useState` en la página en vez de contexto + reducer | El contexto causa el bucle y no lo comparte nadie más. Sin react-query (regla del repo). |
| Buscador con `TextField` controlado + regex, sin Formik (se eliminan además `components/forms/TextInputBase.tsx`, `Banner.tsx`, `ProgressBar.tsx`, `config/custom-form.json` y `config/list-banner.json`, sin consumidores) | Un solo campo; Formik y la generación desde JSON no aportan. Reduce uno de los 5 usos de Formik que quedan (`ARQUITECTURA.md` L216). |
| Sin documentos → estado vacío en línea | La redirección a ergosanitas.com a los 5 s impedía corregir un RUT mal escrito. |
| Certificados firmados con `fetch` + blob; archivos públicos con `<a href>` | **Ajustado al implementar** (antes: `<a href>` para todo). Con un enlace el botón no puede saber cuándo terminó la descarga ni si el back respondió 403/500, así que el spinner por botón y el error en línea serían falsos. `fetch` va directo (el `ApiAdapter` no admite blob) y las rutas firmadas están bajo `api/*`, con CORS. |
| Botones de variante única del tema | Consistencia; los colores por examen se reemplazan por el título de la tarjeta e iconos. |
| Se conservan `getCertificadoRut` / `getCertificadoExiste` | Los usa `src/Chequeo/pages/AppChequeo.tsx` L69–70. |
| Se mantiene `MarqueeHome` (import de `src/Home/`) | Es decorativo; clonarlo o quitarlo es decisión aparte. |

---

## 7. Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| La SPEC 07 del back sigue en `Borrador`: el contrato puede cambiar | No implementar hasta que la 07 esté `Implementado`; volver a copiar el contrato desde el código del back. |
| Desplegar el front antes que el back deja la página sin endpoint | Orden fijo: back en producción primero, luego front. |
| La URL firmada vence a los 10 min | El front compara `expira` y rehace la consulta antes de abrir. |
| El primer certificado de bioimpedancia tarda (el back llama a OpenAI una vez) | Spinner por botón; el texto de ayuda avisa que puede tardar unos segundos. |
| Los endpoints viejos (`valida-certificado`, `first-rut`, `pdfRut`) quedan sin consumidor en este módulo pero siguen en `src/Chequeo/services/useChequeoService.ts` | No se tocan aquí; `src/Chequeo/` es de `ergo-chequeo`. |
| El bucle de peticiones se infiere del código, no se ha observado | Confirmar en Network antes del paso 1 y dejar la evidencia en la verificación. |

---

## 8. Lo que **no** entra en esta spec

- Login o segundo factor del paciente.
- Listar chequeos o bioimpedancias históricos.
- Cambios en `src/Chequeo/` (incluido quitar `validaCertificado`, `getUrlBio`, `chequeoPDFRut`, `bioPDFRut` de `useChequeoService.ts`).
- Cambios en `src/routes/`, menús o perfiles.
- Quitar o clonar `MarqueeHome`.
- Rediseño del resto del sitio público o cambios del tema MUI.
- App móvil.

---

## Estado de verificación

> Última verificación: 2026-11-11 (2.ª ronda, tras «Ajustes tras la verificación» de §5.1) · `spec-verify-ergo-front` (agente, lanzado por `ergo-father`) · commit `bb7e247` + cambios sin commit · rama `feat/descarga-certificados`
> Entorno: front local `localhost:5173` · `VITE_API` → `127.0.0.1:8000`; el back del 8000 **no se usa** (su `.env` apunta a la BD de producción) · perfiles: ninguno (página pública)

| Resultado | Criterios |
|---|---|
| ✅ Verificados | 9 |
| ❌ Fallan | 0 |
| ⏸ No verificables | 7 — 8 a 14: UI que necesita `POST /certificados/consulta` (SPEC 07 del back, sin desplegar) y un back local con BD ficticia |

**Mapa (graphify):** grafo construido con `graphify update .` (AST). Archivos de la spec según `git status` (sin commits): nuevos `components/BotonDescarga.tsx`, `BuscadorRut.tsx`, `EstadoResultado.tsx`, `TarjetaDocumentos.tsx`, `config/textos-certificados.json`, `interface/` (`boton-tarjeta`, `certificado-url`, `certificados-consulta`, `index.ts`), `utilities/` (`certificados.utility.ts`, `index.ts`); modificados `components/index.ts`, `pages/AppCerteficadoPage.tsx`, `pages/CertificadoPage.tsx`, `pages/index.ts`, `services/useCertificadoService.ts`; 15 borrados. El módulo queda en 15 archivos TS/TSX, igual que la fila de `CLAUDE.md` L160.
**Impactos:** `git diff -- src/Chequeo/` vacío; consumidores externos: `routes.ts` L4 (`AppCertificadoPage`, sigue exportado) y `Chequeo/pages/AppChequeo.tsx` L20/L69–70 (`getCertificadoRut`, conservado); los demás `grep` de `Certificados/` fuera del módulo son comentarios en clones. Único import externo además de `common/`: `MarqueeHome` (`CertificadoPage.tsx` L6), deuda aceptada en §6.
**Revisión de calidad (agentes):** hallazgos de `ergosanitas-developer` + `ergo-code` y `ergosanitas-architect` (1.ª ronda, lanzados por `ergo-father`), re-comprobados en esta ronda leyendo las líneas. Ninguno queda abierto salvo la deuda declarada.

| Hallazgo (1.ª ronda) | Severidad | Estado en la 2.ª ronda (evidencia) | Agente |
|---|---|---|---|
| `BotonDescarga` instancia el servicio | mayor | ✅ Resuelto: sin `UseCertificadoService` en `components/`; `onDescargar`/`onRenovarUrl` por props (`BotonDescarga.tsx` L17–19, L75). | developer / architect |
| Carrera en `renovarUrl` (Ley 21.719) y grilla vacía | mayor | ✅ Resuelto: `CertificadoPage.tsx` L94–106 usa `resultado.rut`, descarta si cambió `busquedaVigente` (`useRef`, L43; también en `buscar` L66/L71 y `limpiar` L80) y pasa a `vacio` sin documentos. | developer / architect |
| Inventario y guía en `CLAUDE.md` | mayor | ✅ Resuelto: L160 «15 · 816»; L583–587 lista el módulo y remite a `CLAUDE_CERTIFICADOS.md`; L612 «siete carpetas». | architect |
| Renovación ante cualquier error | menor | ✅ Resuelto: `BotonDescarga.tsx` L77 solo reintenta con `statusDelError(...) === 403`. | developer |
| Lógica pura en componentes/página | menor | ✅ Resuelto: `utilities/certificados.utility.ts` + barril; la página importa `botonesDe`, `mensajeDelError`. | developer |
| `IBotonTarjeta` en un componente | menor | ✅ Resuelto: `interface/boton-tarjeta.interface.ts`, exportada por `interface/index.ts` L10. | developer |
| Regex con combinantes literales | menor | ✅ Resuelto: `certificados.utility.ts` L40 `/[\u0300-\u036f]/g`; `grep -P` de U+0300–036F en el módulo, vacío. | developer |
| Doble anuncio `aria-live` | menor | ✅ Resuelto: solo el resumen va en `role="status" aria-live="polite"` (`CertificadoPage.tsx` L163); la tarjeta es `section` con `aria-labelledby` (`TarjetaDocumentos.tsx` L30). | architect |
| `pages/index.ts` anula el lazy | menor | ✅ Resuelto: solo exporta `AppCertificadoPage` (lazy). | architect |
| Docs con Formik / inventario viejo | menor | ✅ Resuelto: `grep` de «Formik» junto a Certificados en `CLAUDE.md`, `README.md`, `ARQUITECTURA.md`, `ergo-code/SKILL.md` vacío; README L271 y ARQUITECTURA L147 actualizados. | architect |
| `MarqueeHome` de `src/Home/` | menor | ⏳ Abierto como deuda declarada (§6, §8: fuera de alcance). | architect |

**Buenas prácticas (Context7):** no ejecutada: el MCP `context7` no está disponible en esta sesión del agente. No se reemplazó con memoria.
**Recomendación:** mantener el estado (sin ❌ ni hallazgos abiertos salvo la deuda declarada). Para cerrar falta verificar los 7 criterios de UI con la SPEC 07 en un back local con BD ficticia. Decide una persona.
