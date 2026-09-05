---
name: ergo-login
description: Conocimiento completo del módulo `src/Login/` de Ergosanitas — autenticación y registro: los 13 archivos, el modal dual login/registro, el formulario declarado en JSON, el servicio `UseRegister` y sus 5 consumidores externos, el flujo de sesión con `LoginContext`, y la deuda técnica conocida. Úsalo antes de tocar cualquier archivo de `src/Login/`, o al responder sobre login, registro, sesión, `ValidLogin`, `custom-form.json` o el modal de ingreso.
---

# ergo-login — el módulo de autenticación

Mapa completo de `src/Login/`, extraído leyendo sus 13 archivos (580 líneas). Es un módulo
pequeño pero **crítico**: es la puerta de entrada a la app y su servicio lo consumen otros
módulos.

Estilo de código: skill `ergo-code`. Arquitectura general: `.claude/ARQUITECTURA.md`.

---

## 1. Inventario (13 archivos, 580 líneas)

```
src/Login/
├── pages/AppLoginPages.tsx        (9)    monta <Register/>; RegisterGoogle comentado
├── pages/index.ts                 (1)
├── components/Register.tsx        (279)  ← el módulo entero está aquí
├── components/RegisterGoogle.tsx  (48)   modal alternativo con Google, DESACTIVADO
├── components/index.ts            (4)
├── services/useRegister.ts        (61)   UseRegister: 5 métodos
├── hooks/useRegister.ts           (27)   useUser: RHF + yup
├── hooks/index.ts                 (1)    export { default as useUser }
├── interface/user.ts              (20)   IUser, IResponseUser, ILogoUser
├── interface/index.ts             (2)
├── utilities/user.utility.ts      (29)   construye el esquema yup desde el JSON
├── config/custom-form.json        (94)   los 4 campos del formulario
└── config/keys.json               (5)    ⚠️ credenciales hardcodeadas, sin uso
```

**Nota de naming:** hay dos archivos `useRegister` distintos —
`hooks/useRegister.ts` exporta el hook `useUser` (default), y `services/useRegister.ts` exporta
`UseRegister` (named). No los confundas al importar.

## 2. Cómo se monta y se dispara

- `AppLoginPages` se monta en **`src/App.tsx`, fuera del router**, junto a `NavigationApp` y
  `Footer`. Está **siempre presente en el árbol**, en cualquier ruta.
- Lo que renderiza es un **`<Modal>` de MUI con `keepMounted`**, cuya visibilidad depende de
  `ModalContext.isDateModalOpen`.
- **Quién lo abre:** `src/routes/Navigation.tsx:51` — el botón de ingreso del navegador **no
  autenticado**. Es el único punto de entrada al login.
- **Quién cierra sesión:** los cuatro navegadores autenticados (`NavigationErgo`, `ED`, `Me`,
  `PA`) llaman `ValidLogin(false, {…})` al hacer click en el avatar.

⚠️ **`isDateModalOpen` es un flag global compartido**, no exclusivo del login: también lo usan
`src/Home/components/BoxVideo.tsx` y `VideoPlay.tsx`, y `Chequeo/components/FormUpload.tsx`. Si
cambias su semántica, rompes esos modales.

## 3. `Register.tsx` — el componente que lo hace todo

Un solo componente de 279 líneas con **modo dual** en estado local:

```tsx
const [formMode, setFormMode] = useState<"login" | "register">("login");
```

Un `<Link>` alterna entre los dos modos y el formulario se redibuja: `custom-form.json` se
filtra por `formMode` y se ordena por `order`.

Flujo de `onSubmit` (líneas 40–132):

1. Obtiene `{ authRegister, createUser, validaUser }` de `UseRegister()`.
2. **Lee los valores con `control._formValues`** — API privada de react-hook-form.
3. Cierra el modal y abre un Swal de "Validando…" con `showLoading()`.
4. Llama **siempre** a `validaUser(rut_paciente)` — también en modo login, donde el RUT no
   existe (devuelve 400 por la guarda del servicio).
5. Bifurca: `formMode === "register" && statusExiste === 200` → `createUser`; en cualquier otro
   caso → `authRegister`.
6. Si `responseUser.success`: `ValidLogin(true, user)` + Swal de bienvenida. Si no:
   `ValidLogin(false, {…})` con un usuario vacío armado a mano + Swal de error.
7. `catch`: `console.error`, `Swal.close()` y Swal de fallo.

**Toda la retroalimentación al usuario es `sweetalert2` (Swal)**, no MUI. Es la convención del
módulo: no la cambies por Snackbar sin acordarlo.

## 4. El formulario vive en `config/custom-form.json`

Cuatro entradas, cada una con `order`, `formMode`, `type`, `name`, `placeholder`, `label`,
`helperText`, `defaultValue`, `value` y `validations`:

| formMode | order | name | type | Validaciones declaradas |
|---|---|---|---|---|
| `login` | 1 | `userName` | text | required |
| `login` | 2 | `password` | password | required |
| `register` | 1 | `rut_paciente` | text | required, **REGEX_RUN** |
| `register` | 2 | `password` | password | required |
| `register` | 3 | `userName` | text | required, **email** |

**Agregar un campo al login es agregar un objeto a este JSON.** No se toca el `.tsx`.

Dos trampas:

- **`userName` es en realidad el email**: el campo se llama `userName` en el formulario y viaja
  al backend como `user_email`. No lo renombres pensando que es un nombre de usuario.
- **`Register.tsx` solo soporta `type: 'text'` y `'password'`.** Cualquier otro tipo lanza
  `throw new Error` **dentro del `.map` del render**, lo que tumba el modal completo. Si agregas
  un tipo nuevo al JSON, hay que agregarlo también al `.map`.

## 5. Validación: `utilities/user.utility.ts`

Recorre el JSON y arma el esquema yup. **Solo implementa la regla `required`:**

```ts
if (rule.type === 'required') { schema = schema.required(rule.message); }
```

⚠️ **`REGEX_RUN` y `email` están declaradas en el JSON pero no se implementan.** Se ignoran en
silencio: hoy el RUT y el email no se validan de formato. Si te piden "que valide el RUT", el
arreglo va **aquí**, agregando ramas al bucle — no en el componente.

El hook `hooks/useRegister.ts` (`useUser`) es el patrón estándar del repo: `useForm` con
`yupResolver`, `mode: 'all'`, `criteriaMode: 'all'`, y un `useEffect` que hace `reset(user)`.
Devuelve `{ control, reset, handleSubmit, errors }`.

## 6. `services/useRegister.ts` — API pública del proyecto

```ts
UseRegister() → { authRegister, loadLogoUser, getUserEmail, createUser, validaUser }
```

| Método | Endpoint | Usado por |
|---|---|---|
| `authRegister(user_email, user_password)` | `POST /auth-register` | Login |
| `createUser(user_email, user_password, rut_paciente)` | `POST /login/create-user` | Login |
| `validaUser(rut_paciente?)` | `GET /certificado/validar/{rut}` | Login |
| `loadLogoUser(file, user_email)` | `POST /auth-register/load-logo` (FormData) | **Chequeo** |
| `getUserEmail(perfil: number)` | `GET /auth-register/user_email/{perfil}` | **4 archivos externos** |

🔴 **Lo más importante de este documento: `UseRegister` tiene cinco consumidores fuera de
`src/Login/`.** Cambiar la firma de `getUserEmail` o `loadLogoUser` rompe:

- `src/Chequeo/components/logo/fileUploadLogo.tsx` (`loadLogoUser`)
- `src/Chequeo/components/select-club/select-club.tsx` (`getUserEmail(3)`)
- `src/Chequeo/components/select-user/select-user.tsx` (`getUserEmail(3)`)
- `src/components/forms/InputAutoComplete.tsx` (`getUserEmail(perfil)`)
- `src/components/forms/select-club.tsx` (`getUserEmail(perfil)`)

Nota de inconsistencia: `getUserEmail` recibe el perfil como **número** (`3` = clubes/colegios),
mientras `IUser.user_perfil` es **string**. Son dos representaciones distintas del mismo
concepto; no las unifiques sin revisar el backend.

`validaUser` tiene una guarda propia: devuelve `400` si el RUT viene vacío, sin llamar a la API.

## 7. Sesión: `LoginContext`

Vive **fuera** del módulo, en `src/common/context/login/`, pero importa `IUser` **desde
`src/Login/interface`** — o sea, el tipo de usuario de toda la app lo define este módulo.

```ts
LoginContext = { valid: boolean, user: IUser, ValidLogin: (valid, user) => boolean }
```

⚠️ **La sesión no se persiste.** `LoginProvider` arranca siempre en `INITIAL_STATE`
(`valid: false`, usuario vacío): **un F5 desloguea al usuario**. Existe
`common/services/local-storage/storage.service.ts`, pero Login no lo usa; el único que escribe
algo es `LoginGoogle/components/GoogleOAuth.tsx` con la clave `"AuthRegister"`, y **nadie la lee
al arrancar**. Si te piden "mantener la sesión", ese es el trabajo, y toca `common/` — fuera
del módulo.

Recuerda además (ver `CLAUDE.md`): `NavigationApp` decide el navegador por `user_perfil`
**antes** de mirar `valid`, así que `valid` no protege vistas.

## 8. La vía de Google, desactivada

`RegisterGoogle.tsx` es un modal gemelo que envuelve `AppLoginGooglePage` del módulo
`src/LoginGoogle/`. **Está comentado en `AppLoginPages.tsx`**; reactivarlo es descomentar dos
líneas. Su `LoginContext` también está comentado dentro del componente.

`src/LoginGoogle/` es un módulo aparte, con su propio servicio (`POST /auth-login`) y
`@react-oauth/google` (`VITE_GOOGLE_CLIENT_ID`). No es parte de `src/Login/`.

## 9. Deuda técnica conocida

Documentada, no para arreglarla de oficio: **cada punto es un cambio de comportamiento** que
debe pedirse explícitamente.

1. 🔴 **`config/keys.json` contiene credenciales en texto plano** (`"ergo sanitas"` / `"123456"`)
   y está versionado. Ya no se usa —el login por JSON quedó comentado en el servicio— pero el
   archivo sigue en el repositorio y en `dist/`. Candidato claro a borrar.
2. **`REGEX_RUN` y `email` no se validan** (§5).
3. **El botón "Ingresar" usa `onClick={onSubmit}`**, no `type="submit"`: se salta
   `handleSubmit`, así que **la validación yup no corre al hacer click** (sí al enviar con
   Enter, porque el `<form>` sí usa `handleSubmit(onSubmit)`).
4. **`control._formValues`** es API privada de RHF; lo correcto sería recibir los datos como
   parámetro de `handleSubmit`.
5. **La sesión no sobrevive a un F5** (§7).
6. **`validaUser` se llama también en modo login**, donde no aplica.
7. **`throw new Error` dentro del render** para tipos no soportados (§4).
8. **`yupResolver<IUser | any>`** anula el tipado del formulario.
9. **El usuario vacío se arma a mano en 5 lugares** (`Register.tsx` y los 4 navegadores), sin
   `rut_paciente`. Pide una constante compartida.
10. **`InputText`** (`src/components/forms/`) está acoplado a Chequeo: en cada cambio calcula el
    IMC con `UseCalculoIMC`. Login lo usa igual; ten cuidado al modificarlo, porque es
    compartido.

## 10. Al trabajar en este módulo

- **Un campo nuevo del formulario** → `config/custom-form.json`. Si su `type` no es `text` ni
  `password`, además el `.map` de `Register.tsx`.
- **Una validación nueva** → `utilities/user.utility.ts`, agregando una rama al bucle.
- **Un endpoint nuevo de auth** → `services/useRegister.ts`, con el patrón `ApiAdapter`.
- **Cambiar el flujo de ingreso** → `Register.tsx`, función `onSubmit`.
- **Tocar `IUser`** → afecta a **toda la app** (`LoginContext`, los 5 navegadores, `ARQUITECTURA.md`).
  Es el tipo más transversal del proyecto.
- **Nunca cambies la firma de `getUserEmail` ni `loadLogoUser`** sin revisar los 5 consumidores
  externos (§6).
- Contraseñas: el front las manda en el payload y **no maneja token**; la sesión es cookie del
  backend. No introduzcas Bearer ni guardes contraseñas en storage.
- Verificación: `npm run build` y `npx eslint src/Login/`. No hay tests. Prueba a mano el modal
  en sus **dos modos**, y el logout desde el avatar.
