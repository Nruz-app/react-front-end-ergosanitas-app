---
name: ergo-code
description: Escribe TypeScript, React y TSX con el estilo real de este proyecto — tipos estrictos, componentes como arrow function con `interface Props` local, estilos con `sx` de MUI 5, servicios por `ApiAdapter`, comentarios en español que explican el porqué. Úsalo siempre que vayas a crear o modificar un archivo `.ts` o `.tsx` en `src/`, o cuando te pregunten cómo se escribe algo "al estilo del proyecto".
---

# ergo-code — cómo se escribe código en Ergosanitas

Reglas extraídas **leyendo el código** de este repositorio, no de convenciones genéricas de
React. Si algo aquí no calza con lo que ves en el archivo que estás editando, gana el archivo:
la coherencia local vale más que esta guía.

Contexto de arquitectura y modelo de dominio: `.claude/ARQUITECTURA.md`. Convenciones de
proyecto y trampas: `CLAUDE.md`. Este documento es solo **cómo se escribe el código**.

---

## 0. Antes de escribir

Abre dos o tres archivos vecinos del módulo que vas a tocar y cópiales el estilo. Este repo
tiene **dos generaciones de código conviviendo**:

| | Módulos nuevos | Módulos antiguos |
|---|---|---|
| **Dónde** | `src/ficha-clinica/`, `src/home-ergo/` | `src/Chequeo/`, `src/Certificados/`, `src/Home/`, `src/Servicios/` |
| **Formularios** | react-hook-form + yup | formik + yup |
| **Tipos** | `number \| null`, sin `any` | `string` opcional para todo, `{ [key: string]: any }` |
| **Indentación** | 4 espacios | mezcla de 2 y 4 |
| **Comentarios** | JSDoc que explica decisiones | banners con links de instalación de npm |

**Escribe código nuevo con la columna izquierda.** Al editar un archivo de la derecha, respeta
su formato local: no reformatees de paso un archivo que viniste a arreglar por otra cosa.

---

## 1. TypeScript

La config es estricta (`tsconfig.app.json`) y **`npm run build` corre `tsc -b` antes de Vite**:
lo que no tipa, no compila.

```jsonc
"strict": true,
"noUnusedLocals": true,        // un import sin usar rompe el build
"noUnusedParameters": true,    // un parámetro sin usar también
"noFallthroughCasesInSwitch": true,
"isolatedModules": true,       // los tipos se reexportan con `export type`
"jsx": "react-jsx"             // NO importes React para usar JSX
```

Reglas prácticas:

- **Nunca dejes un import o una variable sin usar.** Es el error de build nº1 aquí, y no lo
  atrapa el editor: lo atrapa `tsc -b`.
- **`import type` / `export type`** para lo que solo son tipos. Con `isolatedModules`,
  reexportar un tipo sin `type` es error. El repo ya lo hace:
  `import type { IServicioHome } from '../interface';`
- **`interface` para props y entidades**, `type` para uniones y alias. Es lo que hay en todo el
  repo (`IUser`, `IChequeo`, `IFichaClinica`, `interface Props`).
- **Prefijo `I` en las interfaces de dominio** (`IChequeo`, `IBioimpedanciaAll`,
  `IServicioHome`). Las props locales de un componente se llaman simplemente `Props`, sin `I`.
- **`number | null` para ausencia de dato, jamás `0`.** Un cero en un signo vital es una
  medición, no un vacío. Y `null` explícito, no `undefined`, para lo que el backend puede no
  traer.
- **No uses `any`.** Existe en código antiguo (`const initialValues: { [key: string]: any }`);
  es deuda, no ejemplo. Si de verdad no conoces la forma, usa `unknown` y estrecha.
- **Tipa el retorno de las funciones exportadas**, sobre todo las `async`:
  `const getFichaClinica = async (rut: string): Promise<IFichaClinica> => {…}`.
- Errores en `catch`: el repo usa el patrón seguro, cópialo —
  `problema instanceof Error ? problema.message : 'No hay respuesta del servidor.'`

---

## 2. Componentes React

La forma canónica, tal como está en `src/ficha-clinica/components/KpiCard.tsx` y
`src/home-ergo/components/TarjetaServicio.tsx`:

```tsx
import { ReactNode } from 'react';
import { Box, Card, Typography } from '@mui/material';

interface Props {
    label: string;
    /** `null` significa que el backend no entregó el dato: se pinta '—', nunca 0. */
    valor: number | string | null;
    unidad?: string;
    icon: ReactNode;
}

/**
 * Qué es y por qué es así. El comentario explica la decisión, no repite el código.
 */
export const KpiCard = ({ label, valor, unidad, icon }: Props) => {

    const sinDato = valor === null;

    return ( … );
};
```

Lo que esto implica, punto por punto:

- **Arrow function asignada a `export const`.** No `function Componente()`.
- **Nunca `React.FC`.** Solo lo usan cuatro archivos de `src/EmergenciaDeportivas/`; el resto del
  repo tipa las props en la firma. No lo extiendas a código nuevo.
- **`interface Props` local, declarada justo encima del componente, sin exportar** y sin prefijo
  `I`. Desestructura las props en la firma, con valores por defecto ahí mismo
  (`color = '#1976d2'`).
- **No importes `React`** — `jsx: react-jsx` lo hace innecesario. Importa solo lo que uses:
  `import { useState, useEffect } from 'react'`.
- **Línea en blanco después de la llave de apertura** del componente, antes de la primera
  declaración. Es un tic de estilo constante en los módulos nuevos.
- **Named export.** Muchos archivos añaden además `export default` al final; es residual y
  redundante. En archivos nuevos usa solo el named export, salvo que el barril del módulo espere
  un default.
- **Un componente por archivo**, en PascalCase con el mismo nombre del archivo.

### Hooks

- `useState`, `useEffect`, `useCallback`, `useContext`. **No hay react-query ni Redux en uso**
  en `src/`, aunque estén en `package.json`: el patrón es servicio + `useState` + `useEffect`.
- `eslint-plugin-react-hooks` está activo en modo recommended: **respeta el array de
  dependencias**. Si una función se usa dentro de un `useEffect`, envuélvela en `useCallback`
  —como hace `fetchFicha` en `pages/app-pacientes.tsx`— en vez de silenciar la regla.
- Hooks propios en `hooks/`, con nombre `useX`, devolviendo un objeto nombrado. El de
  formularios devuelve `{ control, reset, handleSubmit, setValue, errors }`.
- **`react-refresh/only-export-components` está en `warn` con `allowConstantExport`**: puedes
  exportar constantes junto a un componente, pero no funciones sueltas — esas van a
  `utilities/`.

### Reparto de responsabilidades

- **La página contenedora (`pages/`) es la única que hace fetch**, maneja `cargando` / `error` /
  datos, y reparte por props.
- **Los componentes de `components/` son presentacionales**: reciben todo por props, no llaman
  servicios, no leen contextos de datos.
- La lógica pura (formatear, parsear, mapear, calcular umbrales) va a `utilities/`, nunca dentro
  del JSX.

---

## 3. Formularios

Patrón vigente: **react-hook-form + yup**, con el hook en `hooks/` y el esquema en `utilities/`.

```ts
const { control, reset, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver<IChequeo | any>(chequeoValidationSchema),
    mode: 'all',
    criteriaMode: 'all',
});
```

- Inputs controlados reutilizables en `src/components/forms/` (`InputSelect`, `DatePickers`,
  `InputAutoComplete`, `auto-complete-comuna`). **Búscalos ahí antes de escribir uno nuevo.**
- **Formik existe en cinco archivos antiguos.** No lo propagues a código nuevo y no lo migres
  salvo que te lo pidan explícitamente.

---

## 4. Estilos y MUI 5

- **Todo con la prop `sx`.** No hay styled-components, ni CSS modules, ni `makeStyles`. El
  archivo global `src/style.css` existe pero no es donde se estiliza un componente.
- **Responsive con objeto de breakpoints**: `p: { xs: 3, md: 3.5 }`, `fontSize: { xs: 14, md: 16 }`.
- **Dos formas de importar MUI conviven** — barril (`import { Box, Card } from '@mui/material'`,
  estilo de `ficha-clinica`) e import directo (`import Box from '@mui/material/Box'`, estilo de
  `home-ergo`). Usa la del módulo en el que estás; no mezcles dentro de un archivo.
- **Iconos**: `@mui/icons-material` uno por import. `home-ergo` los resuelve por nombre desde
  JSON con `config/iconos.ts`, con fallback si el nombre no existe — ese patrón evita que un
  dato malo rompa la grilla entera.
- **Accesibilidad, que el repo sí cuida**: `aria-hidden="true"` en iconos decorativos,
  `'&:focus-visible'` con outline visible en elementos clicables, y
  `'@media (prefers-reduced-motion: reduce)'` para desactivar desplazamientos en las
  animaciones. Cópialo.
- El objetivo de clic es el elemento completo, no solo el texto (`component={NavLink}` sobre el
  `Box` de la tarjeta).

---

## 5. Servicios y datos

```ts
export const UseXService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const getAlgo = async (rut: string): Promise<IAlgo> => {
        return await apiAdapter.get(`${API}/algo/${rut}`, 10, 0);
    };

    return { getAlgo };
};
```

- **Nunca `axios` directo en un componente.** Todo pasa por `ApiAdapter`
  (`getToken/get/post/put/delete`).
- **`API` se arma dentro de cada servicio**; no hay constante global y no la inventes.
- **Env vars siempre con prefijo `VITE_`** y leídas con `import.meta.env`.
- **Si el backend viene sucio, mapper de por medio**: `api.interface.ts` (crudo, con los typos
  del backend) → `utilities/mappers.ts` → modelo de UI. Ningún componente importa la capa cruda.
  Es el patrón de `src/ficha-clinica/`.
- **Si el endpoint todavía no existe**, usa el patrón de flag del repo (`USAR_MOCK`, `USAR_ECO`)
  para poder desarrollar sin backend, y déjalo comentado.
- Los PDF se abren, no se descargan por axios:
  `window.open(url, '_blank', 'noopener,noreferrer')`.

---

## 6. Formato y comentarios

- **4 espacios** de indentación en código nuevo. Al editar un archivo antiguo, respeta el suyo.
- **Comillas simples**, punto y coma al final. (El código antiguo mezcla comillas dobles; no lo
  imites.)
- **Comentarios en español**, y explican **el porqué**, no el qué. El estándar del repo es alto,
  imítalo:

  ```ts
  // Sin esto un 404 o un 500 dejarían la vista en el spinner para siempre.
  // Que la API falle y que la app se cuelgue tienen que verse distinto.
  ```

- **JSDoc de bloque** encima de componentes, hooks y utilidades exportadas, describiendo la
  decisión de diseño. JSDoc de una línea (`/** … */`) en campos de `interface` que necesiten
  aclaración.
- **No escribas banners** con links de npm y pasos de instalación: eso es del código antiguo.
- La **alineación en columnas** de los dos puntos aparece en las interfaces de dominio y en los
  `sx` de `home-ergo` (`display : 'flex',`). Es opcional: mantenla si el archivo ya la usa.

---

## 7. Módulos y barriles

```
src/<modulo>/
├── index.ts       # página lazy + `export *` de las capas públicas
├── pages/  components/  hooks/  interface/  services/  utilities/
└── config/  context/    (si hacen falta)
```

```ts
const AppXPages = lazy(() => import(/* webpackChunkName: "xPage" */ './pages/app-x'));
export { AppXPages };
export * from './interface'; export * from './components';
export * from './utilities'; export * from './services'; export * from './hooks';
```

- **Cada carpeta lleva su `index.ts`** que reexporta lo público; los imports entre módulos van
  al barril, no al archivo hondo.
- **Nombres de archivo:** componentes en `PascalCase.tsx` igual al componente; páginas, hooks y
  utilidades tienden a `kebab-case.ts` (`app-pacientes.tsx`, `use-user-form.ts`,
  `chart-utils.ts`). El repo mezcla ambos: **sigue lo que use la carpeta en la que estás.**
- Subcarpetas temáticas dentro de `components/` cuando el módulo crece (`charts/`,
  `segmentaria/`, `tabs/`, `chat/`).

---

## 8. Node en este proyecto

**No hay backend Node aquí: es un front-end puro.** Node aparece solo como toolchain, y eso
tiene tres consecuencias reales al escribir código:

- **El código de `src/` corre en el navegador.** ESLint declara `globals.browser`: no uses
  `process.env` (va `import.meta.env`), ni `fs`, ni `path`, ni `Buffer`. `@types/node` está
  instalado para los archivos de config, no para `src/`.
- **El proyecto es ESM** (`"type": "module"`). Nada de `require`.
- **El CI construye en matriz Node 18 / 20 / 22**, así que no uses sintaxis o APIs que solo
  existan en las versiones nuevas.

Scripts: `npm run dev` · `npm run build` (`tsc -b && vite build`) · `npm run lint` ·
`npm run preview`. Instalación: `npm install --legacy-peer-deps`. **No hay tests: no existe
script `test` ni runner. Nunca inventes un comando de test.**

---

## 9. Antes de dar por terminado

```bash
npm run build            # tsc -b + vite build, en verde
npx eslint src/<modulo>/ # en 0
```

Checklist rápido de lo que más falla en este repo:

1. ¿Quedó algún import o parámetro sin usar? (`noUnusedLocals`/`noUnusedParameters`)
2. ¿Reexportaste un tipo sin `export type`? (`isolatedModules`)
3. ¿Mapeaste una ausencia de dato a `0` en vez de `null`?
4. ¿Metiste `any`, `React.FC`, `axios` directo, styled-components o react-query?
5. ¿El componente nuevo hace fetch en vez de recibir por props?
6. ¿Silenciaste `exhaustive-deps` en vez de usar `useCallback`?
7. Si agregaste una vista: ¿la registraste en el `routes*` correcto y verificaste cómo filtra
   *ese* navegador? (`'All'` solo funciona en `routesErgo` — ver `CLAUDE.md`)
