# CLAUDE_CARRITO_COMPRA.md — guía del módulo `src/carrito-compra/`

> Última actualización: 2026-11-05 (Spec 01 `mantenedor-carrito-compra`).
> Back-end: SPEC 05 en `Back-end/ergosanitas-app/specs/05-mantenedor-carrito-compra.md`.

Mantenedor «Carrito Compra» del perfil **Administrador** (`routesErgo.ts`, `/carrito-compra/*`). Controla lo que entra
por la tienda pública `/servicios` (módulo `servicio-cart-flow`). Reemplazó en el menú a «Incidentes», que sigue en
`routesErgo.ts` con `status: false`.

---

## Reglas duras

1. **Solo importa de `src/common/`** (`ApiAdapter`, `LoginContext`). Nada de `servicio-cart-flow/` ni de `chequeo-administrador/`.
2. **Ningún `.tsx` escribe un hex**: colores en `config/tema.ts` (`COLORES`, `ESTADOS_COLOR`).
3. **Las acciones de estado salen del back** (`acciones` del detalle). El front no repite la máquina de estados.
4. Toda llamada lleva el `user_email` de `LoginContext`; sin sesión la página muestra un aviso y no llama a la API.
5. **No se borra nada**: anular pide motivo y deja historial en el back.
6. La orden médica se abre solo con la URL firmada de `POST .../ordenes/{id}/enlace` (5 min). La pestaña se abre antes del `await` para que el navegador no la bloquee.

## Mapa de archivos

| Carpeta | Qué hay |
| --- | --- |
| `pages/` | `app-carrito-compra.tsx` (pestañas + `user_email`), `pedidos-panel.tsx`, `cotizaciones-panel.tsx`, `catalogo-panel.tsx`. Los paneles hacen los fetch |
| `components/` | `ResumenTarjetas`, `FiltrosPedidos`, `TablaPedidos` (DataGrid, paginación de servidor), `DetallePedido` (Drawer), `AccionesEstado`, `ChipEstado`, `TablaCotizaciones`, `TablaCatalogo` |
| `services/` | `UseCarritoCompraService` (endpoints `cart-flow/admin/*`) y `ErrorCarritoCompra` (`status`, `codigo`) |
| `config/` | `tema.ts`, `textos.ts` (etiquetas, acciones, `FILTROS_VACIOS`) |
| `interface/` | `carrito-compra.interface.ts`: espejo de los JSON del back |
| `utilities/` | `formatoClp`, `formatoFecha`, `formatoFechaHora`, `etiquetaEstado`, `etiquetaMedio`, `mostrarError` |

No hay `hooks/` ni `context/`: cada panel guarda su propio estado (filtros, página, detalle abierto).

## Pestañas

- **Pedidos**:
  - Resumen: pedidos de hoy, pendientes de pago, pagados del mes, visitas de 7 días y cotizaciones nuevas.
  - Filtros: estado, pago, medio, fechas de creación o de visita, y texto (número, contacto o RUT). El texto se aplica con 400 ms de espera.
  - Tabla de 20 por página.
  - Click en una fila: se abre el detalle con contacto, visita, pacientes con RUT, líneas, preparación, desglose, pagos (Webpay con `buy_order`, `status`, código y autorización) e historial.
  - Tras una acción se recargan el detalle, la tabla y el resumen.
- **Cotizaciones**: selector de estado en la fila (nueva → contactada → cerrada).
- **Catálogo**:
  - Todos los productos, también los ocultos, con un switch «En tienda».
  - Si el back responde 409 `requiere_confirmacion` (producto no publicable), se muestra el motivo y se reenvía con `confirmar: true`.

## Verificación

```bash
npm run build
npx eslint src/carrito-compra/
grep -rn "#[0-9a-fA-F]\{3,6\}" src/carrito-compra --include=*.tsx   # vacío
```

El contrato se probó contra el back de demo (SQLite, Administrador ficticio, 2026-11-05):
- 403 sin Administrador.
- El resumen cuadra con los pedidos.
- `confirmar_pago` de una transferencia deja el pedido pagado, con historial.
- El catálogo de ocultos sale sin costos.

## Pendientes conocidos

- La pantalla no se recorrió en el navegador: entrar al panel exige el login real (sesión contra la base remota).
- Exportar a Excel, imprimir la hoja de ruta y editar la agenda o las reglas: fuera de alcance.
