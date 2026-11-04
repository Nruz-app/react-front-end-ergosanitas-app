import * as Yup from 'yup';

import camposJson from '../config/custom-form.json';
import { SECCION_OBLIGATORIA } from '../config/secciones';
import type { ICampoFormulario, IValidacionCampo } from '../interface';

const campos = camposJson as ICampoFormulario[];

// Sin anclas, igual que en el módulo original: valida subcadenas. Endurecerlo cambiaría qué
// RUT se aceptan hoy, y eso no es parte de esta spec.
const REGEX_RUN  = /(\d{7}|\d{8})-(\d{1}|k|K)/;
const NUMBER_DOT = /^[0-9]+(\.[0-9]+)?$/;

const vacio = (valor: unknown): boolean =>
    valor === undefined || valor === null || String(valor).trim() === '';

/** Campo de la sección obligatoria: se aplican todas sus reglas, `required` incluida. */
const esquemaObligatorio = (campo: ICampoFormulario, reglas: IValidacionCampo[]): Yup.AnySchema => {

    let schema: Yup.AnySchema = campo.type === 'number' ? Yup.number() : Yup.string();

    // Un número vacío falla el casteo **antes** que `required`, y yup escupe su mensaje por
    // defecto en inglés. Se sustituye por el mensaje en español que el JSON ya declara.
    if (campo.type === 'number') {
        const mensajeRequerido = reglas.find((rule) => rule.type === 'required')?.message;
        schema = (schema as Yup.NumberSchema).typeError(mensajeRequerido ?? 'Debe ser un número');
    }

    for (const rule of reglas) {

        if (rule.type === 'required') {
            schema = schema.required(rule.message);
        }
        else if (rule.type === 'REGEX_RUN') {
            schema = (schema as Yup.StringSchema).matches(REGEX_RUN, rule.message);
        }
        else if (rule.type === 'MAX') {
            schema = (schema as Yup.StringSchema).max(rule.value!, rule.message);
        }
        else if (rule.type === 'NUMBER_DOT') {
            schema = (schema as Yup.StringSchema).matches(NUMBER_DOT, rule.message);
        }
    }

    return schema;
};

/**
 * Campo fuera de la sección obligatoria: **`required` se ignora** y el formato se comprueba solo
 * si el campo trae algo. Admite `null` porque el backend devuelve `null` en presión, saturación
 * e IMC de las fichas a medias, y una edición no debe fallar por eso.
 */
const esquemaOpcional = (campo: ICampoFormulario, reglas: IValidacionCampo[]): Yup.AnySchema => {

    if (campo.type === 'number') {

        let schema = Yup.number()
            .transform((valor, original) => (vacio(original) ? undefined : valor))
            .typeError('Debe ser un número')
            .nullable()
            .optional();

        for (const rule of reglas) {
            if (rule.type === 'MAX') schema = schema.max(rule.value!, rule.message);
        }

        return schema;
    }

    let schema = Yup.string().nullable().optional();

    for (const rule of reglas) {

        if (rule.type === 'REGEX_RUN') {
            schema = schema.test('regex-run', rule.message, (valor) => vacio(valor) || REGEX_RUN.test(valor!));
        }
        else if (rule.type === 'NUMBER_DOT') {
            schema = schema.test('number-dot', rule.message, (valor) => vacio(valor) || NUMBER_DOT.test(valor!));
        }
        else if (rule.type === 'MAX') {
            // En un campo de texto `MAX` es largo máximo, igual que en el módulo original.
            schema = schema.max(rule.value!, rule.message);
        }
    }

    return schema;
};

/**
 * Esquema del formulario de chequeo del Administrador (decisión D4 b).
 *
 * El módulo original **no validaba nada**: el botón llamaba a `onSubmit` sin pasar por
 * `handleSubmit`. Validarlo todo, como en Colegios, bloquearía las fichas parciales que hoy se
 * guardan, porque 8 campos clínicos declaran `required`. Así que:
 *
 * - **Identificación** es obligatoria con todas sus reglas (nombre, RUT, nacimiento, edad, sexo).
 * - **El resto** solo se valida en formato (`NUMBER_DOT`, `MAX`, `REGEX_RUN`) y solo si viene
 *   relleno.
 *
 * `LETRAS` está declarada en el campo `nombre` y **no se implementa**, igual que en el módulo
 * original: se ignora en silencio (§7.2).
 */
const construirEsquema = () => {

    const fieldValidations: Record<string, Yup.AnySchema> = {};

    for (const campo of campos) {

        const reglas = campo.validations ?? [];
        if (reglas.length === 0) continue;

        fieldValidations[campo.name] = campo.seccion === SECCION_OBLIGATORIA
            ? esquemaObligatorio(campo, reglas)
            : esquemaOpcional(campo, reglas);
    }

    return Yup.object().shape({ ...fieldValidations });
};

export const chequeoValidationSchema = construirEsquema();

/** Todos los campos del formulario, en el orden declarado. */
export const camposFormulario = [...campos].sort((a, b) => a.order - b.order);

/**
 * Valores iniciales del formulario, tomados del `defaultValue` de cada campo del JSON.
 *
 * Hace falta porque el `Controller` de react-hook-form **pinta** su `defaultValue` pero no lo
 * mete en el estado: sin esto, los desplegables se ven elegidos mientras la validación los
 * considera vacíos (lo descubrió `chequeo-cardiovascular`).
 */
export const valoresPorDefecto = (): Record<string, string> => valoresPorDefectoDe(campos);

/**
 * Lo mismo para cualquier JSON de formulario del módulo (usuario, calculadora, ECG). Los
 * `Controller` del módulo no llevan `defaultValue`: el valor inicial entra por `defaultValues`
 * del formulario, que es lo único que react-hook-form escribe en el estado.
 */
export const valoresPorDefectoDe = (camposJson: ICampoFormulario[]): Record<string, string> => {

    const valores: Record<string, string> = {};

    for (const campo of camposJson) {
        if (campo.defaultValue) valores[campo.name] = campo.defaultValue;
    }

    return valores;
};
