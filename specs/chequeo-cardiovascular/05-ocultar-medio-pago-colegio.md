# SPEC 05 — Ocultar «Medio de Pago» en el formulario del colegio

> **Estado:** Implementado
> **Depende de:** Spec 01 de `chequeo-cardiovascular` (formulario agrupado por `seccion`).
> **Fecha:** 2026-11-03
> **Área afectada:** `src/chequeo-cardiovascular/config/custom-form.json` y la guía del módulo. Nada más.
> **Objetivo:** Que el perfil `Colegios` deje de ver el campo «Medio de Pago» al dar de alta o editar un deportista, sin perder el valor que ya tenga guardado.

---

## 1. Por qué existe esta spec

El cobro del chequeo lo gestiona Ergo SaniTas, no el colegio. Hoy la sección «Identificación» del
tab «Agregar deportista» muestra 7 campos, y uno de ellos es `medio_pago_paciente` (desplegable
`No Pagado` / `Efectivo` / `Transferencia`). Un colegio puede marcar un deportista como «pagado»,
y además ve información de cobro que no le corresponde.

El módulo ya tiene un mecanismo para esto. `ChequeoForm.estaOculto` oculta para `Colegios` todo
campo con `disabledText: true`. Así se ocultan hoy los otros 18 campos clínicos y de gestión.
`medio_pago_paciente` es el único campo de esa familia que quedó con `disabledText: false`.

### 1.1 Lo que se verificó en el código

| Hallazgo | Consecuencia |
| --- | --- |
| `estaOculto` (`components/ChequeoForm.tsx:43`) oculta `disabledText === true` para `Colegios` | Basta con cambiar el flag en el JSON. No hace falta tocar código. |
| El módulo sirve **solo** a `Colegios`. `Administrador` usa su propio `chequeo-administrador/config/custom-form.json` | El cambio no afecta al Administrador, que sigue viendo y editando el medio de pago. |
| `useChequeo` hace `reset(chequeo ?? defaults)`, y `valoresPorDefecto()` incluye `medio_pago_paciente: "No Pagado"` | Un campo oculto **conserva su valor** en el estado del formulario: `"No Pagado"` en el alta y el valor guardado en la edición. Es el mismo comportamiento que ya tienen los 18 campos ocultos. |
| `buildChequeoValidationSchema` solo valida los campos visibles, y `medio_pago_paciente` no declara validaciones | Ocultarlo no cambia la validación. |
| 🔴 `ChequeoCardiovascularController::Store` (línea 344) y `::Update` (línea 412) asignan `$request->medio_pago_paciente` sin condición | Si el front dejara de **enviar** el campo, cada edición de un colegio pondría `null` sobre el pago que registró el Administrador. Por eso el campo se oculta y se sigue enviando (§5). |

## 2. Alcance

**Dentro:**

- `medio_pago_paciente` pasa a `"disabledText": true` en `src/chequeo-cardiovascular/config/custom-form.json`.
- Actualizar `specs/chequeo-cardiovascular/CLAUDE_CHEQUEO_CARDIOVASCULAR.md`: «Identificación» pasa de 7 a 6 campos visibles, y se explica por qué el medio de pago sigue viajando aunque esté oculto.
- Actualizar la línea equivalente («7 de los 25 campos») del `CLAUDE.md` del front.

**Fuera de alcance:**

- Cambiar el back para que `Update` ignore los campos ausentes. Sería lo correcto, pero toca un controlador que consumen los tres clientes. Si se hace, va en su propia spec del back.
- Ocultar la columna o el filtro de medio de pago en la lista o en el Excel exportado del colegio. Hay que revisarlo, pero no se pidió.
- Tocar `src/Chequeo/` o `src/chequeo-administrador/`.

## 3. Modelo de datos

Esta spec no introduce estructuras nuevas. El único cambio es un valor en el JSON:

```json
{ "order": 7, "seccion": "identificacion", "name": "medio_pago_paciente", "disabledText": true }
```

El payload de `POST`/`PUT chequeo-cardiovascular` **no cambia de forma**. Sigue llevando
`medio_pago_paciente`: `"No Pagado"` en el alta y el valor del chequeo en la edición.

## 4. Plan de implementación

1. Cambiar `disabledText` a `true` en la entrada `medio_pago_paciente` de `config/custom-form.json`. Prueba manual: entrar como Colegio al tab «Agregar deportista» y comprobar que «Identificación» muestra 6 campos.
2. Verificar el payload en la pestaña Red del navegador: el alta envía `medio_pago_paciente: "No Pagado"`, y editar un chequeo con `Transferencia` reenvía `Transferencia`.
3. Actualizar `CLAUDE_CHEQUEO_CARDIOVASCULAR.md` y el `CLAUDE.md` del front.

## 5. Criterios de aceptación

- [ ] Con un usuario `Colegios`, el formulario de alta no muestra «Medio de Pago».
- [ ] Con un usuario `Colegios`, el formulario de edición no muestra «Medio de Pago».
- [ ] El alta de un deportista desde un colegio guarda `medio_pago_paciente = "No Pagado"` en la base.
- [ ] Un chequeo con `medio_pago_paciente = "Transferencia"` sigue en `Transferencia` después de que el colegio lo edite y guarde.
- [ ] Con un usuario `Administrador`, el campo sigue visible y editable en `chequeo-administrador`.
- [ ] `git diff` solo muestra cambios en `custom-form.json` y en documentación.
- [ ] `npm run build` termina en verde y `npx eslint src/chequeo-cardiovascular/` da 0 errores.

## 6. Decisiones tomadas y descartadas

- **Sí:** reutilizar `disabledText: true`. Es la regla con la que el módulo ya oculta 18 campos. Un cambio de una línea no agrega un segundo mecanismo.
- **No:** agregar `campo.name === 'medio_pago_paciente'` a `estaOculto`. Funciona, pero deja dos sitios que deciden qué ve el colegio.
- **No:** borrar el campo del JSON. Desaparecería de `valoresPorDefecto()`, el alta dejaría de enviar `"No Pagado"` y el back guardaría `null`.
- **No:** corregir el `Update` del back en esta spec. El arreglo del front basta para no perder datos y no cambia ningún contrato.

## 7. Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Alguien quita después el campo del JSON y los colegios empiezan a borrar pagos con `null` | La guía del módulo lo deja escrito, con referencia a las líneas 344 y 412 del controlador. |
| Un chequeo antiguo trae `medio_pago_paciente = null` | Se reenvía `null`, igual que hoy. No empeora nada. |

## 8. Lo que **no** entra en esta spec

- Cambios en el back (`ChequeoCardiovascularController`).
- Ocultar el medio de pago en la lista, la vista o el Excel del colegio.
- Cualquier cambio en `chequeo-administrador` o en `Chequeo`.
