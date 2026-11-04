import * as Yup from 'yup';

import usuarioJson from '../config/usuario-form.json';
import type { ICampoFormulario } from '../interface';

const campos = usuarioJson as ICampoFormulario[];

/**
 * Esquema de «Crear usuario», clonado de `src/User/utilities/`: `required` y `email`.
 *
 * `perfil_user` no declara reglas y arranca en `"1"` = Administrador (D5 a: se clona igual en
 * la 01; quitar el valor por defecto va en su propia spec).
 */
const construirEsquema = () => {

    const fieldValidations: Record<string, Yup.AnySchema> = {};

    for (const campo of campos) {

        const reglas = campo.validations ?? [];
        if (reglas.length === 0) continue;

        let schema = Yup.string();

        for (const rule of reglas) {

            if (rule.type === 'required') {
                schema = schema.required(rule.message);
            }
            else if (rule.type === 'email') {
                schema = schema.email(rule.message);
            }
        }

        fieldValidations[campo.name] = schema;
    }

    return Yup.object().shape({ ...fieldValidations });
};

export const usuarioValidationSchema = construirEsquema();

/** Campos del formulario de usuario, en el orden declarado. */
export const camposUsuario = [...campos].sort((a, b) => a.order - b.order);
