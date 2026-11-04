import * as Yup from 'yup';

import electroJson from '../config/electro-form.json';
import type { ICampoFormulario } from '../interface';

const campos = electroJson as ICampoFormulario[];

/**
 * Esquema de la revisión médica (ECG). Solo implementa `required`, como el original.
 *
 * ⚠️ El JSON declara para la frecuencia cardiaca el mensaje «La Edad es Requerido». Es un
 * error de texto heredado; se clona igual porque cambiarlo no es parte de la lista cerrada §6.2.
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
            if (rule.type === 'required') schema = schema.required(rule.message);
        }

        fieldValidations[campo.name] = schema;
    }

    return Yup.object().shape({ ...fieldValidations });
};

export const electroCardiogramaValidationSchema = construirEsquema();

/** Campos de la revisión médica, en el orden declarado. */
export const camposElectro = [...campos].sort((a, b) => a.order - b.order);
