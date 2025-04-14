import * as Yup from 'yup';
import { IChequeo } from '../interface/';

import fromJson from '../config/custom-form.json';


//Variables
const REGEX_RUN     = /(\d{7}|\d{8})\-(\d{1}|k|K)/;
const NUMBER_DOT    = /^[0-9]+(\.[0-9]+)?$/;

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
        else if (rule.type === 'REGEX_RUN') 
            {
            schema = (schema as Yup.StringSchema<string>).matches(new RegExp(REGEX_RUN), rule.message);
        }
        else if (rule.type === 'MAX') {

            schema = schema.max((rule as any).value,rule.message);
        }
        else if (rule.type === 'NUMBER_DOT') {
            schema = (schema as Yup.StringSchema<string>)
            .matches(new RegExp(NUMBER_DOT), rule.message);
        }
    }

    fieldValidations[input.name] = schema;
}

export const chequeoValidationSchema = Yup.object<IChequeo>().shape( {...fieldValidations } );