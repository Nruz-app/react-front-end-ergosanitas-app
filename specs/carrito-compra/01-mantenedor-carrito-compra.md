# SPEC 01 — Mantenedor «Carrito Compra» del Administrador (`carrito-compra`)

> **Estado:** Implementado
> **Depende de:** SPEC 05 del **backend**, «Mantenedor del carro para el Administrador», en `Back-end/ergosanitas-app/specs/05-mantenedor-carrito-compra.md` (y su base, la SPEC 04). Spec 01 de `servicio-cart-flow` en este repo.
> **Fecha:** 2026-11-05
> **Área afectada:** `src/carrito-compra/` + `src/routes/routesErgo.ts` (Incidentes pasa a `status: false` y entra «Carrito Compra»).
> **Objetivo:** Que el Administrador vea y controle todo lo que entra por el carro: resumen, pedidos y pagos, cambios de estado con historial, cotizaciones y visibilidad del catálogo.

---

## 1. Por qué existe esta spec

Los pedidos del carro (`/servicios`) quedan en la base sin ninguna pantalla para Ergo. Las transferencias y los pagos
en efectivo no se pueden confirmar, y las cotizaciones no tienen seguimiento. El Administrador pidió reemplazar en su
menú el ítem «Incidentes», que se desactiva pero no se borra, por «Carrito Compra».

| Hallazgo | Consecuencia |
| --- | --- |
| `NavigationErgo` filtra por `status` y por `validatePerfil` | Basta con `status: false` en Incidentes y una entrada `perfil: 'Administrador'`. |
| El back exige `user_email` de Administrador (SPEC 05) | Se toma de `LoginContext` (`user.user_email`), igual que el mantenedor de imágenes del Home. |
| `@mui/x-data-grid` ya está en `package.json` | La tabla de pedidos usa paginación de servidor; no se agrega ninguna dependencia. |

## 2. Alcance

**Dentro:** módulo nuevo `src/carrito-compra/` con 3 pestañas:
- **Pedidos**: tarjetas de resumen, filtros, tabla y panel de detalle con las acciones de estado.
- **Cotizaciones**.
- **Catálogo**.

También cambian las dos entradas de `routesErgo.ts`.

**Fuera de alcance:**
- Exportar a Excel.
- Editar pedidos.
- Reembolsos.
- Editar agenda y reglas.
- Borrar `src/Incidentes/`: queda intacto, solo sin ruta visible.

## 3. Modelo de datos

- `interface/carrito-compra.interface.ts` refleja 1:1 los JSON de `cart-flow/admin/*` (§3.3 de la SPEC 05):
  `IResumen`, `IPedidoFila`, `IPaginaPedidos`, `IPedidoDetalle`, `IPagoAdmin`, `IHistorial`, `ICotizacion`,
  `IProductoAdmin`, `AccionPedido`.
- `services/use-carrito-compra.service.ts` (`UseCarritoCompraService`): un método por endpoint. Devuelve la `data` o
  lanza un `Error` con el `message` del back.
- La orden médica se abre con `window.open(url)` sobre la URL firmada que devuelve `POST .../ordenes/{id}/enlace`.

## 4. Plan de implementación

1. `config/` (tema, etiquetas y colores de estados), interfaces, servicio y utilidades.
2. Componentes: `ResumenTarjetas`, `FiltrosPedidos`, `TablaPedidos`, `DetallePedido` (Drawer) + `AccionesEstado`, `TablaCotizaciones`, `TablaCatalogo`.
3. Página `app-carrito-compra.tsx` con pestañas y el `user_email` de la sesión.
4. `routesErgo.ts`.
5. `npm run build`, `npx eslint src/carrito-compra/`.
6. `CLAUDE_CARRITO_COMPRA.md` y la sección en el `CLAUDE.md` del front.

## 5. Criterios de aceptación

- [ ] El menú del Administrador ya no muestra «Incidentes» y muestra «Carrito Compra».
- [ ] El resumen muestra pedidos de hoy, pendientes de pago (cantidad y monto), pagados del mes, próximas visitas y cotizaciones nuevas.
- [ ] La tabla pagina en el servidor (20 por página) y filtra por estado, estado de pago, medio, fechas (visita o creación) y texto (número, contacto, RUT).
- [ ] El detalle muestra contacto, visita, pacientes con RUT, líneas, preparación, pagos (Webpay con `buy_order` y código de respuesta), órdenes médicas e historial.
- [ ] Solo se ofrecen las acciones que el back devuelve en `acciones`. Anular pide motivo. Todo pide confirmación.
- [ ] Al cambiar un estado se refrescan el detalle, la fila y el resumen.
- [ ] «Ver orden» abre la orden médica en otra pestaña con la URL firmada.
- [ ] Las cotizaciones cambian de estado con un selector.
- [ ] El catálogo lista todo, también lo oculto; activar un producto no publicable muestra el motivo y pide confirmar.
- [ ] Ningún `.tsx` escribe un hex; solo se importa de `common/`; `npm run build` y `eslint` en verde.

## 6. Decisiones tomadas y descartadas

- **D1 · Sí:** módulo propio `src/carrito-compra/`. **No:** meterlo en `chequeo-administrador`, que ya es grande y tiene otro dominio.
- **D2 · Sí:** las acciones visibles vienen del back (`acciones`). **No:** duplicar la máquina de estados en el front.
- **D3 · Sí:** `Drawer` lateral para el detalle, para no perder los filtros ni la página de la tabla.
- **D4 · Sí:** Incidentes con `status: false`, sin borrar su import ni su entrada (vía de reversa).

## 7. Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| `user_email` vacío si la sesión no está cargada | La página muestra un aviso y no llama a la API. |
| Datos clínicos en pantalla | Solo en el detalle, solo para Administrador. La orden médica sale por un enlace que dura 5 minutos. |
| F5 desloguea (la sesión no se persiste, deuda conocida) | Igual que el resto del panel; no se resuelve aquí. |

## 8. Lo que **no** entra en esta spec

- Exportación, impresión de hoja de ruta y notificaciones al cliente.
- Gestión de bloques de agenda, cupos y reglas de precio.
