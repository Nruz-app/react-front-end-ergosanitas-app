import * as Yup from 'yup';
import { IUser } from '../interface/';

import fromJson from '../config/custom-form.json';


const initialValues: { [key: string] : any } = {};

const fieldValidations : { [key:string]: any} = {};

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

export const userValidationSchema = Yup.object<IUser>().shape( {...fieldValidations } );