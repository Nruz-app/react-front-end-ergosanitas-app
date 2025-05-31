import * as Yup from 'yup';
import { IIncidentes } from '../interface/incidentes.interface';

import fromJson from '../config/incidentes-form.json';

//LInks dock
//https://www.npmjs.com/package/yup


//Variables
const REGEX_RUN     = /(\d{7}|\d{8})\-(\d{1}|k|K)/;
const LETRAS        = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/g; 
const REGEX_CELULAR = /\+(\d{12}|\d{11}|\d{10})/;

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
        else if (rule.type === 'LETRAS') {

            schema = (schema as Yup.StringSchema<string>).matches(new RegExp(LETRAS), rule.message);
        }
        else if (rule.type === 'MIN') {

            schema = (schema as Yup.NumberSchema<number>).min((rule as any).value, rule.message);
        } 
        else if (rule.type === 'MAX') {

            schema = (schema as Yup.NumberSchema<number>).max((rule as any).value, rule.message);
        }
        else if (rule.type === 'email') {
            
            schema = (schema as Yup.StringSchema<string>).email( rule.message);
        }
        else if (rule.type === 'REGEX_CELULAR') {
            
            schema = (schema as Yup.StringSchema<string>).matches(new RegExp(REGEX_CELULAR), rule.message);
        }
    }

    fieldValidations[input.name] = schema;
}

export const incidentesValidationSchema = Yup.object<IIncidentes>().shape( {...fieldValidations } );