import * as Yup from 'yup';
import { IElectroCardiograma } from '../interface/';

import electroCardiogramaJson from '../config/electro-form.json';

const initialValues: Record<string, unknown> = {};

const fieldValidations: Record<string, Yup.AnySchema> = {};

for (const input of electroCardiogramaJson) {
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

export const electroCardiogramaValidationSchema = Yup.object<IElectroCardiograma>().shape( {...fieldValidations } );