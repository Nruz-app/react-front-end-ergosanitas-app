# CLAUDE_SERVICIO_CART_FLOW.md — guía del módulo `src/servicio-cart-flow/`

> Última actualización: 2026-11-04 (Spec 01 `flujo-carro-servicios`).
> Back-end: SPEC 04 en `Back-end/ergosanitas-app/specs/04-servicio-cart-flow.md`.

Página pública `/servicios`: carro de servicios con catálogo completo (laboratorio, enfermería, cardiovascular,
vacunas, eventos), varios pacientes en la misma dirección, agenda por bloques y pago por Webpay, transferencia o
efectivo. Reemplaza en el router a `src/Servicios/`, que sigue en el repo **intacto** como vía de reversa.

---

## Reglas duras

1. **El front nunca calcula precios.** Cada acción llama al back y reemplaza el carro con la respuesta
   (`CartFlowProvider`). Ni totales, ni descuentos de plan, ni domicilio, ni redondeo se suman aquí.
2. **Solo importa de `src/common/`**, más el lazy de la página SEO `Servicios/SEO` (que se importa, nunca se edita).
3. **Ningún `.tsx` escribe un hex**: los colores salen de `config/tema.ts`.
4. **axios solo vía `ApiAdapter`**. Los GET usan `getToken` (sin `limit`/`offset`: el catálogo son ~230 filas).
5. **En `localStorage` solo vive el `uuid` del carro** (`CLAVE_STORAGE_CARRITO`), con try/catch. Nunca datos del paciente.
6. **No se borra nada**: quitar paciente o línea llama a `.../quitar` (soft delete en el back).
7. Datos de prueba **siempre ficticios** (RUT `11111111-1`, correos `@example.com`).

## Volver al flujo anterior

En `src/routes/routes.ts`: descomentar `import { AppServiciosPage } from '../Servicios/pages'` y
`Component : AppServiciosPage`, y comentar las dos líneas de `AppServicioCartFlowPage`.

## Mapa de archivos

| Carpeta | Qué hay |
| --- | --- |
| `index.ts` | Barril: `AppServicioCartFlowPage` (lazy), interfaces, servicio y utilidades |
| `pages/` | `app-servicio-cart-flow.tsx` (subrutas + provider), `servicio-cart-flow-page.tsx` (la única que orquesta los pasos), `resultado-page.tsx` (vuelta de Webpay), `cotizar-page.tsx` |
| `context/` | `CartFlowProvider` / `useCartFlow`: comunas, catálogo, carro, pedido, paso, carga y todas las acciones |
| `services/` | `UseCartFlowService` (un método por endpoint `cart-flow/*`) y `CartFlowError` (`message`, `status`, `detalle`) |
| `hooks/` | `useFormPacientes` (yup campo a campo, todos los pacientes a la vez), `useAgenda` |
| `components/` | `StepperCartFlow`, `SelectorComuna`, `CatalogoProductos` + `ProductoCard`, `CarroResumen`, `DesgloseTotal`, `PreparacionConsolidada`, `AvisosCarro`, `PasoPacientes` + `FormPaciente`, `AgendaBloques`, `PasoPago`, `ConfirmacionPedido`, `FormCotizacion` |
| `config/` | `tema.ts` (paleta), `textos.ts` (pasos, planes, medios de pago, instrucciones) |
| `interface/` | `cart-flow.interface.ts`: espejo 1:1 del JSON del back |
| `utilities/` | `formatoClp`, `formatoFecha`, `edadA`, `normalizarRut`, `pacienteSchema` (yup), `mostrarError` (Swal con bloqueos del back) |

## Flujo

`Comuna → Catálogo → Carro → Pacientes → Agenda → Pago → Confirmación`. El paso vive en el contexto (no en la URL);
el stepper solo deja saltar hasta `pasoMaximo()` (sin comuna → 0; sin líneas → 1; con bloqueos → 2; sin datos
completos → 3; sin bloque elegido → 4).

- **Selector de comuna**: replica el `InputAutoCompleteComuna` del flujo anterior («Ingrese una Comuna»,
  mismos estilos). Las opciones salen siempre de `config/comunas-rm.json` (copia de
  `AgendarHora/config/comunas.json`) unidas con `GET cart-flow/comunas` (`opcionesComuna`, cruce por nombre sin
  tildes; alias `Santiago` → `Santiago Centro`). Si la API falla (p. ej. el hosting sin `migrate` + `CartFlowSeeder`)
  la lista igual se ve, aparece un aviso y solo se puede cotizar: el carro necesita el `comuna_id` del back.
- **Comuna `a_cotizar`** (fuera de RM) o sin par en el back (Alhué, Curacaví, María Pinto, San Pedro, Tiltil) y productos `solo_cotizacion` → `/servicios/cotizar?comuna=&sku=&servicio=`.
- **Pacientes**: al continuar se hace un `PUT` del carro (dirección) y uno por paciente, para que el back valide
  edad y sexo contra las líneas antes de pagar (D5).
- **Checkout**: `FormData` con `ordenes[{paciente_id}]` cuando la preparación pide orden médica.
- **Webpay**: tras el checkout se llama a `pedidos/{numero}/webpay` y se hace un form POST con `token_ws`. Transbank
  vuelve al back, y el back redirige a `/servicios/resultado?pago=&pedido=&t=`.
- Un 409 con `error` `carrito_convertido` o `carrito_expirado` reinicia el carro.

## Sistema visual

Paleta de la página anterior: tarjetas con degradado `primarioClaro → primario`, botones `navy`, chip de precio
`precioFondo`/`precioTexto`. El panel es un `Paper` translúcido sobre `FONDO_PAGINA`. La caja raíz de cada página
lleva `boxSizing: 'border-box'`: con `width: 100%` + padding se desbordaba en horizontal (la página anterior tiene ese
defecto).

## Verificación

```bash
npm run build
npx eslint src/servicio-cart-flow/
grep -rn "#[0-9a-fA-F]\{3,6\}" src/servicio-cart-flow --include=*.tsx   # debe salir vacío
grep -rn "from 'axios'" src/servicio-cart-flow                           # debe salir vacío
```

Prueba de punta a punta (2026-11-04): back local con SQLite de demo y `CartFlowSeeder`, front con
`MSYS_NO_PATHCONV=1 VITE_API=http://127.0.0.1:8001 VITE_API_PATH=/api npx vite`. En Git Bash, **sin
`MSYS_NO_PATHCONV=1` el `/api` se convierte en una ruta de Windows** y ninguna llamada llega. Recorrido: El Bosque →
Perfil Básico + Curación simple = $55.000 (ejemplo 7) → plan Te Cuida = $51.000 → datos ficticios → solo bloques de
mañana → transferencia → pedido `ES-2026-000001`.

## Pendientes conocidos

- `react-refresh/only-export-components` avisa (warning) porque `cart-flow.context.tsx` exporta el provider y el hook.
- Mantenedor del catálogo y panel de pedidos para Gerencia: spec futura en `chequeo-administrador`.
- El flujo con Webpay real solo se probó con la respuesta de Transbank simulada (tests del back).

## Trabajar con `/spec` y `/spec-impl`

Specs nuevas de este módulo en `specs/servicio-cart-flow/NN-slug.md`. Si cambia el contrato `cart-flow/*`, primero va
la spec del back y su OpenAPI; después la de aquí.
