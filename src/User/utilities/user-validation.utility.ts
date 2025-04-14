import * as Yup from 'yup';
import { Iuser } from '../';
import fromJson from '../config/custom-form.json';

//Variables
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
        else if (rule.type === 'email') {
                    
            schema = (schema as Yup.StringSchema<string>).email( rule.message);
        }
    }

    fieldValidations[input.name] = schema;
}

export const userValidationSchema = Yup.object<Iuser>().shape( {...fieldValidations } );