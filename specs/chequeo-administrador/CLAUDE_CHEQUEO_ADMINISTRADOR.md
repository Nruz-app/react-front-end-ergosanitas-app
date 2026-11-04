# CLAUDE_CHEQUEO_ADMINISTRADOR.md

Guía del módulo `src/chequeo-administrador/`. Recoge el estado tras las Specs 01 y 02 y lo que **no** hay
que romper. Léela antes de tocar el módulo. Si esta guía y una skill discrepan, **manda esta guía**.

El módulo **no tiene agente ni skill propios** todavía: se trabaja con `ergosanitas-developer` más
esta guía. Si se crean, hay que actualizar las tablas de la skill `ergo-father` §2 y §5.

| Spec | Qué hizo | Estado |
|---|---|---|
| `01-modulo-perfil-administrador.md` | Creó el módulo para el perfil `Administrador`: 7 tabs con etiqueta, paridad 1:1 con `src/Chequeo/` | Ver la cabecera de la spec |
| `02-mantenedor-imagenes-home.md` | Tab «Imágenes del Home»: grilla de cartas de las promociones, alianzas y galería del Home público, con agregar, editar, ocultar/mostrar y eliminar sobre `home-imagenes` (SPEC 03 del back) | Ver la cabecera de la spec |
| 03 – 08 | Rediseño de «Mi cuenta», lista, ficha, calculadora, cargas y un Home (§12 de la Spec 01; eran 02 – 07 y se corrieron un número al tomar la 02 el mantenedor) | Sin redactar |
| — | `Medicos` y `Usuario` siguen en `src/Chequeo/`; `Colegios` en `src/chequeo-cardiovascular/` | — |

---

## 1. Por qué existe

`src/Chequeo/` ramifica toda su interfaz por perfil en `AppChequeo`, con índices de tab que no
coinciden entre bloques. La estrategia del repo es **migrar perfil por perfil**: `Colegios` fue el
primero (`chequeo-cardiovascular`) y `Administrador` el segundo. `src/Chequeo/` queda **intacto**
y sirve a `Medicos` y `Usuario` exactamente como antes; además es la vía de reversa.

## 2. Reglas duras

1. **Solo importa de `src/common/`.** Nada de `src/Chequeo/`, `src/chequeo-cardiovascular/`,
   `src/User/`, `src/Login/`, `src/Certificados/`, `src/components/forms/` ni `src/Url/`. Lo que
   necesita, lo clona. Comprobación (debe salir vacío):
   `grep -rnE "from '\.\./+.*(Chequeo|chequeo-cardiovascular|User|Login|Certificados|components/forms|Url)/" src/chequeo-administrador/`
2. **No ramifica por perfil.** Ninguna comparación de `user_perfil` dentro del módulo. La decisión
   de quién entra está **fuera**, en `src/routes/ChequeoSegunPerfil.tsx`.
3. **Dos borrados, ninguno más**, los dos con confirmación Swal que identifica lo que se borra:
   - `getDeleteById` → `DELETE /chequeo-cardiovascular/{id}` (D2 de la Spec 01), con nombre y RUT.
     `getDeleteRut` **no se porta** (su ruta está comentada en el back y pegaba un RUT a la ruta
     del id).
   - `deleteImagen` → `DELETE /home-imagenes/{id}` (Spec 02), con miniatura y título. Borra fila
     **y archivo**; por eso la carta ofrece antes «ocultar», que es reversible.

   `DeleteIcon` solo aparece en esas dos acciones; los buscadores limpian con `ClearIcon`.
4. **`config/tema.ts` es la única fuente de color.** Ningún `.tsx` escribe un hex. Los `argb` de
   ExcelJS son formato de celda y viven en los `.ts` que generan el Excel.
5. **La lógica clínica no se toca** (§7.2 de la spec): `useCalculoIMC` está clonado literal, con
   el bug de recomendaciones del adulto con IMC normal documentado. Los umbrales inline de
   `CalculadoraImc` y su rótulo «Clasificación pediátrica» también. Cambiarlos es decisión médica.
6. **axios solo en `common/api/api.adapter.ts`.** Para leer el mensaje de un error se mira la forma
   del objeto, no `axios.isAxiosError` (ver `ModalSubirEcg`).
7. **Texto que viene de fuera y va a un `html:` de Swal pasa por `escaparHtml`.** El informe de
   `GPT/analisis-ecg` se interpolaba crudo en el módulo viejo.

## 3. Ruteo

```
NavigationApp ── default ──► NavigationErgo ──► routesErgo '/Chequeos/*' (perfil 'All')
                                                   └─► ChequeoSegunPerfil
                                                         ├─ 'Administrador' → AppChequeoAdministrador
                                                         └─ cualquier otro  → AppChequeo (viejo)
```

- Solo dos archivos fuera del módulo: `src/routes/ChequeoSegunPerfil.tsx` y la entrada `/Chequeos/*`
  de `routesErgo.ts`. **Reversa:** volver a `Component: AppChequeo` en esa línea.
- No se usa una segunda ruta con `perfil: 'Administrador'`: `validatePerfil` le muestra todo al
  Administrador y vería **dos** botones «Chequeos».
- `Medicos` entra por `routesME` (`/chequeos/*`, minúscula) y `Colegios` por `NavigationCol`: no
  pasan por el selector.
- `src/routes/` importa de `chequeo-administrador/pages`, **no del barril raíz**: el barril reexporta
  todos los componentes y arrastraría el módulo al bundle principal. Por eso `pages/index.ts`
  solo exporta la página lazy (sale como chunk propio, ~77 kB).

## 4. Los 8 tabs

Índices estables por constante en `pages/AppChequeoAdministrador.tsx`; cada `<Tab>` lleva
`value={TAB_*}` explícito. **Nunca un literal**: en `chequeo-cardiovascular` insertar un tab corrió
los índices en silencio dos veces.

| # | Constante | Etiqueta | Contenido |
|---|---|---|---|
| 0 | `TAB_LISTA` | Lista de chequeos | `ChequeoTable` (filtros, exportar, 8 acciones) |
| 1 | `TAB_FICHA` | Ficha del chequeo | `FichaChequeoPage`: alta · edición · revisión médica |
| 2 | `TAB_CARGA` | Carga masiva Excel | `CargaMasiva` |
| 3 | `TAB_CARGA_ECG` | Carga masiva ECG | `CargaMasivaEcg` |
| 4 | `TAB_USUARIOS` | Crear usuario | `FormUsuario` |
| 5 | `TAB_CALCULADORA` | Calculadora IMC | `CalculadoraImc` |
| 6 | `TAB_IMAGENES` | Imágenes del Home | `ImagenesHomePage` (Spec 02): grilla de cartas, filtro por sección, buscador, `DialogoImagen` |
| 7 | `TAB_CUENTA` | Mi cuenta | `MiCuenta` (logo, contraseña, Ergo Pass) |

«Mi cuenta» va siempre **la última**: la Spec 02 insertó «Imágenes del Home» antes y corrió
`TAB_CUENTA` de 6 a 7. Como todo usa las constantes, no hubo que tocar ningún handler.

- **Rail (`components/navegacion/RailTabs`)**: icono + texto desde 900 px (232 px de ancho); solo
  icono bajo 900 px (64 px), con el nombre en `aria-label` y `title`. **Desde 900 px el rail se
  contrae a 64 px** con el botón `MenuOpenIcon` / `MenuIcon` de arriba (`aria-expanded`), para
  ganar ancho en el cuerpo; la preferencia se guarda en localStorage (`admin_rail_contraido`)
  con `setLocalStorage` en `try/catch`, porque no es defensivo. Bajo 900 px el botón no se
  muestra (el rail ya está contraído). Entró con la Spec 02, a pedido del usuario antes del commit. Sin `Tooltip` envolviendo al
  `Tab`, sin `scale` al pasar el ratón, `prefers-reduced-motion` respetado. Tabs de 52 px para que
  los 8 quepan en 900 px de alto.
- **`TabPanel` oculta con `display: none` sin desmontar** y pinta el nombre del tab como `h1`.
- 🔴 **Carga diferida (`activo`)**: `FichaChequeoPage` recibe `activo={tab === TAB_FICHA}` y su
  `SelectUser` pide `GET /auth-register/user_email/3` en la **primera** activación. Al entrar al
  módulo solo sale la petición del filtro de club de la lista. `ImagenesHomePage` hace lo mismo
  con `activo={tab === TAB_IMAGENES}`: pide `GET home-imagenes/admin` en la primera activación y no
  vuelve a pedirlo al regresar. Si un tab nuevo hace fetch al montar, dale `activo`. (En `npm run dev` se ven dobles por `StrictMode`; en producción, una.)

## 5. La ficha: `ModoFicha`

`interface/ficha.interface.ts` define `ModoFicha = 'alta' | 'edicion' | 'revision'` y
`SeleccionFicha`; `config/ficha.ts` define `FICHA_ALTA`. Reemplazan al `status` numérico del módulo
viejo (`0`/`1`/`3`), que **no viaja al backend** y no tiene relación con `estado_paciente`.

- Cambiar de tab por el rail → `FICHA_ALTA`. «Editar» / «Revisión Médica» → piden la URL del
  certificado y saltan a `TAB_FICHA`. Guardar en cualquier modo → `FICHA_ALTA` + recarga de lista.
- Los tipos no viven en la página (como dibujaba la spec) porque exportar algo más que componentes
  desde un `.tsx` da el aviso `react-refresh/only-export-components`.
- La tabla abre los modales «Ver» y «Subir archivo» ella misma: el orquestador monta el
  `ModalProvider` y no puede leer un contexto que él mismo provee.

### Respuestas tardías: solo la última escribe

Varias pantallas lanzan peticiones que pueden llegar fuera de orden: «Editar» / «Revisión» /
«Ver» en filas distintas, y la búsqueda de la lista con debounce, fecha, club y paginación. El
patrón del módulo es un **contador de turno en `useRef`** (`turnoFicha`, `turnoVer`,
`turnoBusqueda`, `turnoImagenes`) o una bandera `vigente` en el `useEffect` (`useChequeoRut`): la respuesta solo se
aplica si sigue siendo la última. Sin eso se pintaba la ficha de **otro** paciente. Además
`ChequeoFormUpdate` no muestra el formulario hasta tener el chequeo: en el original, pulsar el
botón con la carga en vuelo **creaba un chequeo nuevo**. Cualquier fetch nuevo disparado por el
usuario debe seguir el mismo patrón.

### Doble clic: la guardia es un `useRef`, no el estado

Las acciones del mantenedor de imágenes (ocultar/mostrar, guardar el diálogo, eliminar) se
protegen con un `useRef` (`activoEnVuelo`, `guardandoEnVuelo`, `eliminandoEnVuelo`). El estado
(`cambiandoActivo`, `guardando`) solo deshabilita el botón: dos clics que llegan antes del
siguiente render verían los dos el estado viejo y enviarían dos peticiones. La carta cambia
**cuando responde el back**, con la fila que devuelve, nunca antes.

## 5 bis. Mantenedor de imágenes del Home (Spec 02)

- **Es el juego de cartas de Colegios clonado** (grilla, chips, buscador, «Ver más» de 24 en 24),
  sin importar nada de `chequeo-cardiovascular/` (regla dura 1). Filtrado y búsqueda en memoria.
- **`IImagenHome` de este módulo es la fila cruda del back** (`id` numérico, `seccion`), no el
  tipo homónimo de `src/home-ergo/`, que es la forma ya repartida para el Home público.
- **Una imagen oculta no desaparece**: se atenúa con `IMAGENES.opacidadOculta` y lleva el chip
  «Oculta». Marco 2:3 con `contain`, igual que el Home: son flyers con texto quemado.
- **`DialogoImagen` sirve para agregar y editar.** Al agregar el archivo es obligatorio
  (jpg/png/webp ≤ 5 MB, validado en el front con los límites de `config/imagenes-home.ts`, los
  mismos del back) y la vista previa usa `URL.createObjectURL`, liberada al cambiar de archivo o
  cerrar. **Al editar el archivo no cambia**: se elimina y se vuelve a agregar. El botón de
  archivo es un `Button` que hace `click()` sobre el `<input hidden>` (como `CargaMasivaEcg`), no
  un `component="label"`: un `<label>` no se activa con teclado.
- 🔴 **Un Swal con el diálogo abierto** (error al guardar, y el aviso de éxito mientras se
  desvanece) lleva `willOpen: sobreElDialogo`, que sube su `z-index` por encima del de los modales
  de MUI (Swal trae 1060, el `Dialog` 1300: salía **detrás**). Y `DialogoImagen` lleva
  `disableEnforceFocus`: con la trampa de foco, el Enter que cerraba el aviso reenviaba el
  formulario.
- **`orden` viaja como texto en el formulario** (`IImagenHomeValores`) y se traduce a `null`
  si está vacío (`aFormularioImagen`): vacío no es `0`. Al agregar, `null` deja la imagen al
  final de su sección; al editar, conserva su orden.
- ⚠️ **El `PUT home-imagenes/{id}` del back reemplaza**: un `caption` que no viaje queda en
  `null`. `putImagen` manda siempre los cuatro campos.
- **Escrituras con `user_email`** del `LoginContext`: el back responde 403 si el correo no es de
  un perfil `Administrador` (D3 de la SPEC 03). El `DELETE` lo manda por query.
- Tras agregar o editar, la lista se reordena en el front con el mismo criterio que el back
  (sección, `orden`, `id`), sin recargar.
- Colores en `config/tema.ts`, bloque `IMAGENES`; el color de cada sección se mapea en
  `config/imagenes-home.ts` (`COLOR_SECCION`), no en un `.tsx`.

## 6. Validación (D4)

| Formulario | Qué valida |
|---|---|
| Chequeo (25 campos, 5 secciones) | **D4 (b)**: `identificacion` obligatoria con todas sus reglas; el resto solo en formato (`NUMBER_DOT`, `MAX`, `REGEX_RUN`) y solo si viene relleno; admite `null` del back. Permite guardar fichas parciales, como hoy |
| Revisión médica (ECG) | Todo lo visible (`required`), por `handleSubmit`. El original guardaba un diagnóstico vacío con el formulario sin tocar |
| Crear usuario | `required` + `email`, por `handleSubmit` |
| Calculadora IMC | `required`, `NUMBER_DOT`, `MAX`, por `handleSubmit` |

- Los `Controller` no llevan `defaultValue`: el valor inicial entra por `defaultValues` del
  formulario con `valoresPorDefecto` / `valoresPorDefectoDe(campos)`. Sin eso los desplegables se
  ven elegidos pero el estado está vacío (perfil `"1"`, sexo «Masculino», medio de pago…).
- `LETRAS` (campo `nombre`) sigue declarada y sin implementar, igual que en el original.
- Se lee el formulario con `getValues()`, nunca `control._formValues` / `_reset()`.

## 7. Paridad deliberada (heredado a propósito, va en specs siguientes)

- Lista: fila «reciente» (`ECG FOTO` de ≤ 3 días) con fondo rojo pleno; cabeceras de 14 y 20 px
  mezcladas; 8 iconos por fila; 50 filas por defecto.
- Filtro de club: el `Select` se ve siempre vacío y no se puede quitar el filtro. El de fecha
  tampoco se quita. Borrar el texto del buscador a mano no quita el filtro (sí el botón).
- «Exportar» descarga **toda la base** para el Administrador (R4). La carga Excel asigna las filas
  al `user_email` del Administrador (R5).
- «Crear usuario» arranca en perfil Administrador y no ofrece `Medicos` ni `Paciente` (D5 a).
- «Mi cuenta» dice «Sin logo» aunque el usuario tenga logo (D6 a: Spec 02).
- La cabecera del ECG rotula la estatura en «cm», pero `UseCalculoIMC` la exige en metros.
- `fechaNacimiento` arranca en hoy. La grilla de la carga ECG está en inglés.
- El mensaje «La Edad es Requerido» del campo de frecuencia cardiaca (`electro-form.json`).
- Aviso de consola `MUI: the styled(component)(...args)…`: lo emite `@mui/x-data-grid`
  (`GridColumnsManagementRow`) al cargarse; también pasaba con el módulo viejo.

## 8. Lo que se corrigió al clonar

Lista cerrada en §6.2 y §7.1 de la spec. Lo más importante: informe GPT y nombres escapados en los
Swal; `alert()` → Swal (descargar ECG, exportar); Excel sin archivo ya no envía `null`; contraseña /
Ergo Pass vacíos ya no se envían; errores de red avisados (antes dejaban botones bloqueados o eran
silencio); `fecha_atencion` se ve al editar; `ClearIcon` en el buscador; textos «Registrar
chequeo», «Carga masiva de chequeos», «Ingrese un nuevo perfil», «Calculadora IMC» (antes
«Calculos QTC»), sin «Modficar»; sin `console.log` de búsqueda; `getUserEmail` con `getToken`;
`IProcesadoEcg` sin la errata `ÏProcesados`; ids de `<input type=file>` con `useId`.

## 9. Duplicación aceptada

`ChequeoTable`, `ChequeoForm`, `InputText`, `DatePickers`, `useCalculoIMC`, `getEstadoProps`,
`TabPanel`, `LikeTextProvider` y el servicio de certificados existen en **tres** módulos
(`Chequeo`, `chequeo-cardiovascular`, `chequeo-administrador`). Es deliberado (R3): un bug
**clínico** hay que corregirlo en los tres.

## 10. Endpoints (23)

`useChequeoAdministradorService` (11): `search-chequeo`, `chequeo-all`, `GET/POST/PUT
chequeo-cardiovascular`, `pdf/{id}`, `DELETE {id}`, `certificado/path-url`, `GPT/analisis-ecg`,
`carga-masiva/excel`, `carga-masiva-ecg` · `useCertificadoService` (1): `certificado/{rut}` ·
`useElectroCardiogramaService` (1): `electro-cardiograma/save` · `useUsuarioService` (5):
`auth-register/user_email/{perfil}`, `user-save`, `user-update-password`, `user-update-ergo-pass`,
`auth-register/load-logo`. Detalle en §3.5 de la Spec 01 · `useImagenesHomeService` (5, Spec 02):
`GET home-imagenes/admin`, `POST home-imagenes` (multipart), `PUT home-imagenes/{id}`,
`PUT home-imagenes/{id}/activo` (el `ApiAdapter` no tiene `patch`), `DELETE home-imagenes/{id}`.

⚠️ El back **no autentica** estas rutas; el filtrado por perfil es de presentación. Las cuatro
escrituras de `home-imagenes` son la excepción parcial: exigen un `user_email` de perfil
`Administrador`. `GET home-imagenes/admin` sigue siendo público.

## 11. Verificación

```bash
npm run build
npx eslint src/chequeo-administrador/ src/routes/ChequeoSegunPerfil.tsx src/routes/routesErgo.ts
```

No hay tests. Prueba manual **con el perfil afectado**: un Administrador para el módulo, y un
`Usuario` para comprobar que sigue en `AppChequeo` (todavía no hay cuenta `Usuario` de prueba, D7).
