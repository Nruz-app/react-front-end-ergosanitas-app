import * as Yup from 'yup';

import camposJson from '../config/custom-form.json';
import type { ICampoFormulario } from '../interface';

const campos = camposJson as ICampoFormulario[];

// Sin anclas, igual que en el módulo original: valida subcadenas. Endurecerlo cambiaría qué
// RUT se aceptan hoy, y eso no es parte de esta spec.
// El guion no necesita escaparse fuera de una clase de caracteres; el patrón es el mismo.
const REGEX_RUN  = /(\d{7}|\d{8})-(\d{1}|k|K)/;
const NUMBER_DOT = /^[0-9]+(\.[0-9]+)?$/;

/**
 * Construye el esquema yup recorriendo el JSON.
 *
 * ⚠️ **Solo valida los campos que se le pasan.** Es deliberado: 18 de los 25 campos tienen
 * `disabledText: true` y no se renderizan para `Colegios`, pero ocho de ellos declaran
 * `required` (temperatura, presión, peso, estatura, IMC…). Validarlos todos dejaría el
 * formulario imposible de enviar. El módulo original esquivaba el problema saltándose la
 * validación por completo —el botón llamaba a `onSubmit` directo, sin `handleSubmit`—, así que
 * en la práctica no validaba nada. Aquí sí valida, pero solo lo que el usuario puede ver.
 *
 * `LETRAS` está declarada en el campo `nombre` y **no se implementa**, igual que en el módulo
 * original: se ignora en silencio.
 */
export const buildChequeoValidationSchema = (camposVisibles: string[]) => {

    const fieldValidations: Record<string, Yup.AnySchema> = {};

    for (const input of campos) {

        if (!camposVisibles.includes(input.name)) continue;
        if (!input.validations || input.validations.length === 0) continue;

        let schema = input.type === 'number' ? Yup.number() : Yup.string();

        // Un campo numérico vacío falla el casteo **antes** que `required`, y yup escupe su
        // mensaje por defecto en inglés («edad must be a `number` type…»). Se sustituye por el
        // mensaje en español que el propio JSON ya declara.
        if (input.type === 'number') {
            const mensajeRequerido = input.validations.find((rule) => rule.type === 'required')?.message;
            schema = (schema as Yup.NumberSchema).typeError(mensajeRequerido ?? 'Debe ser un número');
        }

        for (const rule of input.validations) {

            if (rule.type === 'required') {
                schema = schema.required(rule.message);
            }
            else if (rule.type === 'REGEX_RUN') {
                schema = (schema as Yup.StringSchema<string>).matches(REGEX_RUN, rule.message);
            }
            else if (rule.type === 'MAX') {
                schema = schema.max(rule.value!, rule.message);
            }
            else if (rule.type === 'NUMBER_DOT') {
                schema = (schema as Yup.StringSchema<string>).matches(NUMBER_DOT, rule.message);
            }
        }

        fieldValidations[input.name] = schema;
    }

    return Yup.object().shape({ ...fieldValidations });
};

/** Todos los campos del formulario, en el orden declarado. */
export const camposFormulario = [...campos].sort((a, b) => a.order - b.order);

/**
 * Valores iniciales del formulario, tomados del `defaultValue` de cada campo del JSON.
 *
 * Hace falta porque el `Controller` de react-hook-form **pinta** su `defaultValue` pero no lo
 * mete en el estado del formulario: sin esto, los desplegables se veían con «Masculino» y
 * «No Pagado» elegidos mientras la validación los consideraba vacíos.
 */
export const valoresPorDefecto = (): Record<string, string> => {

    const valores: Record<string, string> = {};

    for (const campo of campos) {
        if (campo.defaultValue) valores[campo.name] = campo.defaultValue;
    }

    return valores;
};
