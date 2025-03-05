import * as Yup from 'yup';
import { CalculadoraIMC } from '../interface/';

import fromIMCJson from '../config/custom-IMC.json';


//Variables
const NUMBER_DOT = /^[0-9]+(\.[0-9]+)?$/;

const initialValues: { [key: string] : any } = {};

const fieldValidations : { [key:string]: any} = {};

for (const input of fromIMCJson) {
    initialValues[input.name] = input.value;

    // Validaciones de los campos
    if (!input.validations) continue;

    let schema = input.type === 'number' ? Yup.number() : Yup.string();

    for (const rule of input.validations) {

        if (rule.type === 'required') {

            schema = schema.required(rule.message);
        } 
        else if (rule.type === 'NUMBER_DOT') {
            schema = (schema as Yup.StringSchema<string>)
            .matches(new RegExp(NUMBER_DOT), rule.message);
        }
        
        else if (rule.type === 'MAX') {

            schema = schema.max((rule as any).value,rule.message);
        }
    }

    fieldValidations[input.name] = schema;
}

export const calculadoraIMCValidationSchema = Yup.object<CalculadoraIMC>().shape( {...fieldValidations } );