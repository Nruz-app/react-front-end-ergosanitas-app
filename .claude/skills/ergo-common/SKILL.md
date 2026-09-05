---
name: ergo-common
description: Conocimiento completo de `src/common/` de Ergosanitas — el módulo transversal del que dependen 64 archivos del proyecto: el `ApiAdapter` (capa HTTP), los tres contextos globales (Login, Modal, SubMenu), el servicio de localStorage y la tabla genérica. Úsalo antes de tocar cualquier archivo de `src/common/`, o al responder sobre la capa HTTP, la sesión, los providers globales, `isDateModalOpen`, persistencia en el navegador o la tabla común.
---

# ergo-common — el módulo transversal

Mapa de `src/common/`: **21 archivos, 929 líneas**. Es el módulo más pequeño en código y el más
peligroso en impacto: **64 archivos del proyecto importan de aquí**.

Estilo de código: skill `ergo-code`. Arquitectura general: `.claude/ARQUITECTURA.md`.

---

## 1. La regla de oro

Este módulo no tiene una interfaz de usuario propia: **es infraestructura**. Todo cambio se
propaga a módulos que no estás mirando.

| Zona | Líneas | Consumidores externos | Riesgo |
|---|---|---|---|
| `context/` | 261 | **47 archivos** | 🔴 máximo |
| `api/` | 49 | **19 archivos** | 🔴 máximo |
| `services/local-storage/` | 24 | 1 archivo | bajo |
| `table/` | 595 | **solo un tipo** | ninguno (código muerto, §6) |

**Trabaja en modo aditivo.** Agregar un método al adapter, un campo a un contexto o un helper
nuevo es seguro. Cambiar una firma existente, renombrar, o alterar el orden de los parámetros
rompe en cadena y `tsc -b` no siempre lo atrapa (los tipos son laxos en varios puntos).

---

## 2. `api/api.adapter.ts` — la capa HTTP (19 consumidores)

49 líneas. Una interfaz y una clase que envuelve axios:

```ts
export interface HttpAdapter {
    getToken<T>(url: string): Promise<T>;
    get<T>(url: string, limit: number, offset: number): Promise<T>;
    post<T>(url: string, dataJson: any): Promise<T>;
    put<T>(url: string, dataJson: any): Promise<T>;
    delete<T>(url: string): Promise<T>;
}
export class ApiAdapter implements HttpAdapter { … }
```

Lo que hay que saber antes de tocarlo:

- **`get` inyecta `{ params: { limit, offset } }`** con defaults `limit = 10, offset = 1`. Toda
  llamada `get` del proyecto manda esos query params, la use el backend o no. Los servicios
  suelen pasar `(url, 10, 0)` explícitamente.
- **`getToken` es un `get` sin params.** Ese es su único propósito; el nombre engaña — no
  gestiona tokens.
- **No hay interceptores, ni retry, ni baseURL, ni header `Authorization`.** Cada servicio arma
  su propia URL con `${VITE_API}${VITE_API_PATH}`. La autenticación efectiva es cookie/sesión del
  backend.
- **No hay manejo de errores**: un 4xx/5xx propaga la excepción de axios al llamador. Por eso los
  módulos envuelven las llamadas en `try/catch` y muestran Swal.
- `post`/`put` aceptan `dataJson: any`, así que también reciben `FormData` (subida de archivos).
- El adapter **no tipa la respuesta**: devuelve `data` tal cual y el genérico `<T>` es una
  promesa del llamador, no una validación. Si el backend cambia la forma, TypeScript no se entera.

⚠️ **Añadir un interceptor global aquí es un cambio de arquitectura**, no una mejora local:
afecta a los 19 consumidores y a la autenticación de toda la app. No lo hagas sin acordarlo.

---

## 3. `context/` — los tres contextos globales (47 consumidores)

Los tres siguen el mismo patrón: `XContext.ts` (createContext) + `XProvider.tsx` (useReducer) +
`xReducer.tsx`. Todos se reexportan desde `context/index.ts`.

Se montan en `src/App.tsx` en este orden:
`HelmetProvider → LoginProvider → ModalProvider → SubMenuProvider`.

### `LoginContext` — la sesión

```ts
{ valid: boolean, user: IUser, ValidLogin: (valid, user) => boolean }
```

- 🔴 **Dependencia invertida:** `LoginContext` y `LoginProvider` **importan `IUser` desde
  `src/Login/interface`**. El módulo transversal depende de un módulo de feature. Es así en el
  código; no lo "arregles" sin ver el impacto en toda la app.
- ⚠️ **La sesión no se persiste.** `INITIAL_STATE` siempre arranca en `valid: false` con el
  usuario vacío: **un F5 desloguea**. Existe `storage.service.ts` (§4) pero el provider no lo usa.
  Si te piden mantener la sesión, el trabajo es aquí, y hay que decidir qué se guarda (nunca la
  contraseña).
- El usuario vacío se construye a mano en **cinco sitios** del proyecto (`Register.tsx` y los
  cuatro navegadores), sin `rut_paciente`. Una constante exportada desde aquí lo arreglaría.
- Recuerda (ver `CLAUDE.md`): `NavigationApp` decide el navegador por `user_perfil` **antes** de
  mirar `valid`. **`valid` no protege vistas.**

### `ModalContext` — dos banderas de modal

```ts
{ isDateModalOpen, onOpenModal(bool), isViewModalOpen, onOpenModalView(bool) }
```

- 🔴 **`isDateModalOpen` es un flag compartido por medio proyecto**: lo usan el modal de login
  (`Login/components/Register.tsx`), los modales de video de `src/Home/` (`BoxVideo`,
  `VideoPlay`) y `Chequeo/components/FormUpload.tsx`. **Un solo booleano para modales que no
  tienen nada que ver entre sí.** Cambiar su semántica rompe los tres.
- ⚠️ **`ModalProvider` se monta tres veces, anidado**: el global en `App.tsx`, y otro propio en
  `Chequeo/pages/AppChequeo.tsx` y en `Home/pages/HomePage.tsx`. El provider anidado **sombrea al
  global**, aislando los modales de ese subárbol. Es deliberado; si lo quitas, los modales de
  Chequeo empezarían a competir con el de login.
- El nombre `isDateModalOpen` es histórico (venía de un date picker). Hoy significa "modal
  principal abierto".

### `SubMenuContext` — el submenú de navegación

```ts
{ active: boolean, SubMenuActive: (active) => boolean }
```

El más simple. Lo consumen los cinco navegadores de `src/routes/` para abrir y cerrar el submenú.

---

## 4. `services/local-storage/storage.service.ts` (1 consumidor)

24 líneas, tres funciones:

- **`getLocalStorage(key)`** — la única defensiva: comprueba `typeof window !== "undefined"`,
  envuelve el `JSON.parse` en `try/catch` y **devuelve `null`** si falla o no existe. (Hay una
  versión antigua comentada arriba que devolvía `''` en vez de `null`.)
- **`setLocalStorage(key, value)`** — `JSON.stringify` directo, sin try/catch. Su parámetro es
  `value: any`.
- **`removeLocalStorage(key)`** — `removeItem` directo.

**Único consumidor hoy: `LoginGoogle/components/GoogleOAuth.tsx`**, que guarda la clave
`"AuthRegister"` con la respuesta y el token de Google. ⚠️ **Nadie lee esa clave al arrancar**,
así que hoy no sirve para restaurar sesión (§3).

Reglas al usarlo: **nunca guardes contraseñas** y recuerda que `getLocalStorage` puede devolver
`null` legítimamente — trátalo siempre.

---

## 5. `table/` — la tabla genérica

Siete piezas: `Table`, `HeaderTable`, `Filters`, `Pagination` (componentes), `useTable`,
`useFiltersBase` (hooks), `pagination.utils.ts` (filtrado, orden y paginación en cliente) y
`interface/table.interface.ts` (`IColumnsTable`, `IFilterBase`, `IOrderBy`, `IPagination`).

## 6. 🔴 …y por qué la tabla es código muerto

**Verificado: de las 595 líneas de `table/`, lo único que se usa fuera de `common/` es el tipo
`IColumnsTable`** (en `Chequeo/components/ChequeoTable.tsx` y
`AgendarHora/components/AgendarHoraTable.tsx`). Ambos módulos declaran sus columnas con ese tipo
y luego **dibujan la tabla con MUI directamente**, ignorando estos componentes.

Sin uso externo: `Table`, `HeaderTable`, `Filters`, `Pagination`, `useTable`, `useFiltersBase`,
`pagination.utils` completo, y los tipos `IFilterBase`, `IOrderBy`, `IPagination`.

**El propio código dice por qué.** En `Filters.tsx`:

```
/*
  ERROR EN theme?.breakpoints?.up("lg") POR ESO NO SE PUDO USAR ESTA TABLE
```

…y debajo, el parche que quedó: `const lgUp = 1;`.

Además **viene de otro proyecto**: `HeaderTable.tsx` conserva `//import Link from "next/link";`
(Next.js), usa `@tabler/icons-react` en vez de `@mui/icons-material`, y todo el estilo es ajeno
al repo — `export default function`, `Readonly<Props>`, useState tipado con tuplas explícitas,
comillas dobles. Compáralo con cualquier componente de `ficha-clinica` y se nota de inmediato.

Consecuencias prácticas:

- **No lo tomes como el patrón de tablas del proyecto.** Para un listado nuevo, mira lo que
  hacen `ChequeoTable` o `AgendarHoraTable` (MUI + `TablePagination`), o `@mui/x-data-grid`.
- **`table/components/index.ts` está vacío** (0 bytes): ni siquiera hay barril.
- **Bug latente si alguien lo revive:** `orderElementsByColumn` llama a `.sort()` sobre el array
  recibido, **mutando el original** en lugar de copiarlo.
- Borrarlo sería legítimo, pero **es una decisión del usuario**, no tuya: hay que conservar
  `IColumnsTable`, que sí se usa.

---

## 7. Deuda técnica conocida

Documentada, **no para arreglarla de oficio**:

1. 🔴 **`table/` sin uso** — 571 líneas muertas (todo menos `IColumnsTable`), el **61%** del
   módulo (§6).
2. 🔴 **La sesión no persiste**; `"AuthRegister"` se escribe y nunca se lee (§3, §4).
3. **`isDateModalOpen`, un booleano para tres modales sin relación** (§3).
4. **Dependencia invertida**: `common` importa `IUser` de `src/Login` (§3).
5. **`any` sin justificar** en `HttpAdapter.post/put` y en `setLocalStorage`.
6. **`getObjectKeys` y `orderElementsByColumn` mutan** el array de entrada (§6).
7. **`table/components/index.ts` vacío** y sin barril para `api/` ni `services/` (solo `context/`
   tiene `index.ts`).
8. **El adapter no valida respuestas**: el genérico `<T>` es una promesa, no una garantía (§2).

---

## 8. Al trabajar en este módulo

- **Antes de cambiar cualquier firma, haz Grep de los consumidores.** Son 64 archivos; el
  compilador no atrapa todo porque hay `any` de por medio.
- **Un método nuevo en el adapter** → agrégalo a la interfaz `HttpAdapter` **y** a la clase
  `ApiAdapter`; implementar solo la clase deja la interfaz mintiendo.
- **Un contexto nuevo** → sigue el trío `Context.ts` / `Provider.tsx` / `reducer.tsx`, expórtalo
  en `context/index.ts` y móntalo en `src/App.tsx` en el orden correcto.
- **Un campo nuevo en un contexto existente** → actualiza la interfaz, el `INITIAL_STATE`, el
  reducer y el `value` del provider. Los cuatro, o el contexto queda inconsistente en silencio.
- **Nunca guardes credenciales** en localStorage, ni las registres en consola.
- **No conviertas esto en un framework**: no agregues interceptores, caché ni react-query "de
  paso". Cada uno es una decisión de arquitectura que afecta a todo el proyecto (§2).
- Verificación: `npm run build` y `npx eslint src/common/`. **No hay tests.** Y como aquí no hay
  UI propia, la prueba real es **abrir la app y ejercitar los módulos que consumen lo que
  tocaste**: login, un listado con datos, un modal, el submenú.
