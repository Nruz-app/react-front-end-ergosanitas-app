# SPEC 01 — Flujo de carro de servicios (`servicio-cart-flow`)

> **Estado:** Implementado
> **Depende de:** SPEC 04 del **backend**, «Carro de servicios `servicio-cart-flow`», en `Back-end/ergosanitas-app/specs/04-servicio-cart-flow.md`. Tiene que estar desplegada antes (migraciones, `CartFlowSeeder` y variables de Webpay).
> **Fecha:** 2026-11-04
> **Área afectada:** `src/servicio-cart-flow/` + una línea en `src/routes/routes.ts` (el import de `Servicios` queda comentado).
> **Objetivo:** Reemplazar la página pública `/servicios` («elige un servicio → reserva → paga») por un carro de 7 pasos con catálogo completo, varios pacientes en la misma dirección, agenda por bloques y pago por Webpay, transferencia o efectivo.

---

## 1. Por qué existe esta spec

`src/Servicios/` muestra una tarjeta por fila de la tabla `servicios`, reserva **un** servicio con un formulario libre
y paga con Webpay. Lo que se verificó:

| Hallazgo | Consecuencia |
| --- | --- |
| `ServicioConfirmacionStep` envía `servicios_name: 'ECG'` fijo y `monto: servicioSeleccionado.precio` | El back cobra lo que diga el navegador. El flujo nuevo **no envía montos**: el back calcula y cobra. |
| `GET /servicios` pasa por `ApiAdapter.get`, que inyecta `limit=10` | Con 245 productos se perderían filas. El módulo nuevo usa `getToken` (sin paginación). |
| El chequeo de errores del formulario solo marca error si fallan **todos** los campos | El formulario nuevo valida con yup campo a campo. |
| No hay comuna, zona, laboratorio, preparación ni cupos | Todo viene de los endpoints `cart-flow/*` del back. |
| Las tarjetas muestran «Estamos en Proceso» (texto de la base) | El catálogo nuevo muestra `descripcion_publica` y `preparacion` del archivo del dueño. |

## 2. Alcance

**Dentro:**

- Módulo nuevo `src/servicio-cart-flow/` autocontenido: solo importa de `src/common/` y, para no duplicar la página SEO, el lazy de `src/Servicios/SEO` (sin modificarlo).
- Pasos: **Comuna → Catálogo → Carro → Pacientes → Agenda → Pago → Confirmación**.
- Subrutas de `/servicios/*`: `""` (flujo), `resultado` (vuelta de Webpay), `cotizar` (formulario de cotización), `electrocardiograma` (página SEO existente).
- `context/` con el carro y su `uuid` guardado en `localStorage` (con try/catch) para retomar el carro tras un F5.
- `routes.ts`: se comenta el import de `AppServiciosPage` y la ruta `Servicios` apunta a `AppServicioCartFlowPage`.

**Fuera de alcance:**

- Borrar o modificar `src/Servicios/` (queda como vía de reversa: basta descomentar el import).
- Mantenedor del catálogo para el Administrador (spec futura en `chequeo-administrador`).
- Login: el carro es anónimo.

## 3. Modelo de datos

- `interface/cart-flow.interface.ts` refleja 1:1 el JSON del back (§3.2 de la SPEC 04): `ICarrito`, `IPacienteCarro`, `ILineaCarro`, `IDesglose`, `IPreparacion`, `IBloqueo`, `IProducto`, `IComuna`, `IDiaAgenda`, `IPedido`, `IRespuesta<T>`.
- Los montos son `number`; los que pueden faltar son `number | null` y la UI muestra `—`.
- `services/use-cart-flow.service.ts` (`UseCartFlowService`): un método por endpoint. Devuelve la `data` o lanza `CartFlowError` con `message` y `error` del back (bloqueos, errores por paciente).

| Método | Endpoint |
| --- | --- |
| `getComunas` | `GET cart-flow/comunas` |
| `getCatalogo` | `GET cart-flow/catalogo?categoria&q` |
| `crearCarrito` / `getCarrito` / `actualizarCarrito` | `POST` / `GET` / `PUT cart-flow/carritos[/{uuid}]` |
| `agregarPaciente` / `actualizarPaciente` / `quitarPaciente` | `.../pacientes[/{id}[/quitar]]` |
| `agregarLinea` / `actualizarLinea` / `quitarLinea` | `.../lineas[/{id}[/quitar]]` |
| `getBloques` | `GET cart-flow/agenda/bloques?carrito=` |
| `checkout` | `POST .../checkout` (FormData con las órdenes médicas) |
| `getPedido` / `iniciarWebPay` | `GET cart-flow/pedidos/{numero}?t=` / `POST .../webpay` |
| `cotizar` | `POST cart-flow/cotizaciones` |

## 4. Plan de implementación

1. `config/tema.ts` (paleta de la captura de `/servicios`: azules `#0ea5e9`/`#38bdf8`, navy `#082f49`, verde precio `#bef264`) y `config/textos.ts` (pasos, planes, medios de pago, etiquetas).
2. Interfaces, servicio y utilidades (`formatoClp`, edad, esquema yup del paciente).
3. Contexto `CartFlowProvider` (carro, paso, carga, acciones que recargan el carro desde la respuesta del back).
4. Componentes presentacionales y la página `servicio-cart-flow-page.tsx`, la única que orquesta.
5. Páginas `resultado` y `cotizar`.
6. `routes.ts`.
7. `npm run build` y `npx eslint src/servicio-cart-flow/`.
8. `CLAUDE_SERVICIO_CART_FLOW.md` y la sección del módulo en el `CLAUDE.md` del front.

## 5. Criterios de aceptación

**Flujo**
- [ ] Sin comuna no se ve el catálogo; una comuna `a_cotizar` lleva a «Solicitar cotización».
- [ ] El catálogo agrupa por categoría, busca por nombre y marca ayuno, orden médica y «solo cotización».
- [ ] Agregar un producto actualiza el desglose con lo que devuelve el back (el front no suma precios).
- [ ] «Agregar otro paciente en la misma dirección» crea un paciente sin cargo de domicilio extra.
- [ ] La preparación consolidada de cada paciente se ve en el carro y en la confirmación.
- [ ] Los bloqueos del back (ticket mínimo, edad, sexo, cotización) se muestran y deshabilitan avanzar.
- [ ] La agenda muestra solo bloques con cupo libre; con ayuno o laboratorio, solo la mañana.
- [ ] El checkout pide orden médica por paciente cuando corresponde y datos del apoderado si es menor.
- [ ] Webpay redirige a Transbank con form POST; la vuelta muestra el pedido en `/servicios/resultado`.
- [ ] Transferencia y efectivo muestran el número de pedido y las instrucciones.
- [ ] Un F5 retoma el carro abierto; un carro convertido o expirado empieza uno nuevo.

**Reglas del módulo**
- [ ] Ningún `.tsx` escribe un hex: todo color sale de `config/tema.ts`.
- [ ] No importa de otros módulos salvo `common/` y el lazy SEO de `Servicios/SEO`.
- [ ] axios solo se usa vía `ApiAdapter`.
- [ ] `npm run build` en verde y `npx eslint src/servicio-cart-flow/` sin errores.

## 6. Decisiones tomadas y descartadas

- **D1 · Sí:** módulo nuevo y router apuntando a él; `src/Servicios/` intacto. **No:** reescribir `Servicios/`.
- **D2 · Sí:** el back es la única fuente de precios; cada acción reemplaza el carro con la respuesta. **No:** cálculo optimista en el front.
- **D3 · Sí:** `uuid` del carro en `localStorage`. **No:** guardar datos del paciente en el navegador (datos clínicos).
- **D4 · Sí:** pasos como estado del contexto, sin subrutas por paso: el retorno de Webpay es la única URL que tiene que existir.
- **D5 · Sí:** los datos del paciente se guardan en el back al pasar del paso «Pacientes» (un `PUT` por paciente), para que la edad y el sexo validen las líneas antes de pagar.

## 7. Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| El navegador público usa `BrowserRouter`: `/servicios/resultado` necesita la reescritura del hosting | Es la misma que ya sirve `/servicios`; se prueba con la URL directa tras el despliegue. |
| `CART_FLOW_FRONT_URL` del back mal configurada | El resultado del pago no llega al front; queda documentado en la puesta en marcha de la SPEC 04. |
| Catálogo de ~230 productos en una sola respuesta | Filtro por categoría y búsqueda en cliente sobre la lista ya cargada; la respuesta pesa < 200 KB. |

## 8. Lo que **no** entra en esta spec

- Mantenedor del catálogo y panel de pedidos para Gerencia.
- Correo de confirmación.
- Borrar `src/Servicios/` o `src/AgendarHora/`.
