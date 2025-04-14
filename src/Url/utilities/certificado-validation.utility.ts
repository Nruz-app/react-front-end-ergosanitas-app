import * as Yup from 'yup';
import { ICertificado } from '../interface/ICertificado';

import fromJson from '../config/custom-form.json';

const initialValues: Record<string, unknown> = {};

const fieldValidations: Record<string, Yup.AnySchema> = {};
for (const input of fromJson) {
    initialValues[input.name] = input.value;

    // Validaciones de los campos
    if (!input.validations) continue;

    let schema = input.type === 'number' ? Yup.number() : Yup.string();

    for (const rule of input.validations) {

        if (rule.type === 'required') {

            schema = schema.required(rule.message);
        } 
    }

    fieldValidations[input.name] = schema;
}

export const certificadoValidationSchema = Yup.object<ICertificado>().shape( {...fieldValidations } );