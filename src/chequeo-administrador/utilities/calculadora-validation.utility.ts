import * as Yup from 'yup';

import imcJson from '../config/custom-IMC.json';
import type { ICampoFormulario } from '../interface';

const campos = imcJson as ICampoFormulario[];

const NUMBER_DOT = /^[0-9]+(\.[0-9]+)?$/;

/**
 * Esquema de la calculadora IMC: `required`, `NUMBER_DOT` y `MAX`, igual que el original.
 *
 * Los cuatro campos son visibles, así que aquí sí se valida todo (D4). Que el botón pase o no por
 * `handleSubmit` lo decide el componente del paso 7.
 */
const construirEsquema = () => {

    const fieldValidations: Record<string, Yup.AnySchema> = {};

    for (const campo of campos) {

        const reglas = campo.validations ?? [];
        if (reglas.length === 0) continue;

        let schema: Yup.AnySchema = campo.type === 'number' ? Yup.number() : Yup.string();

        if (campo.type === 'number') {
            const mensajeRequerido = reglas.find((rule) => rule.type === 'required')?.message;
            schema = (schema as Yup.NumberSchema).typeError(mensajeRequerido ?? 'Debe ser un número');
        }

        for (const rule of reglas) {

            if (rule.type === 'required') {
                schema = schema.required(rule.message);
            }
            else if (rule.type === 'NUMBER_DOT') {
                schema = (schema as Yup.StringSchema).matches(NUMBER_DOT, rule.message);
            }
            else if (rule.type === 'MAX') {
                schema = (schema as Yup.NumberSchema).max(rule.value!, rule.message);
            }
        }

        fieldValidations[campo.name] = schema;
    }

    return Yup.object().shape({ ...fieldValidations });
};

export const calculadoraIMCValidationSchema = construirEsquema();

/** Campos de la calculadora, en el orden declarado. */
export const camposCalculadora = [...campos].sort((a, b) => a.order - b.order);
