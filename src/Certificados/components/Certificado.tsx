import { Box } from "@mui/material"
import { Form, Formik } from "formik"

import * as Yup from 'yup';
import { TextInputBase } from './forms/TextInputBase';
import { CertificadoContext } from "../context";
import { useContext } from "react";
import { GetUrlPdf, ValidaExisteRut } from "../hooks";

import fromJson from '../config/custom-form.json';


/****************************************************************
* * Link
* * - https://formik.org/docs/tutorial
* * - https://www.npmjs.com/package/yup
* * INSTALAR
* * - npm i formik
* * - npm i yup
****************************************************************/

/***************************************************************************************************
* * { [key:string]: any} : Es una definición de un tipo de objeto en TypeScript, que significa 
* * que initialValues será un objeto cuya clave (key) es de tipo string y cuyo valor (value) puede 
* * ser de cualquier tipo (any).
* * Ejemplo : 
* *     ([ { 1 : { name:value } , { 2 : { name:value } ] )
****************************************************************************************************/


const initialValues: { [key: string] : any } = {};

const fieldValidations : { [key:string]: any} = {};


for ( const input of fromJson ) {

    initialValues [ input.name ] = input.value;

    //Validaciones de los campos
    if(  !input.validations ) continue;

    let schema = Yup.string();

    for ( const rule of input.validations ) {

        if ( rule.type === 'required'){
            schema = schema.required(rule.message)
        }
        else if ( rule.type === 'minLength'){
            schema = schema.min( (rule as any).value || 3 , rule.message)
        }
        else if ( rule.type === 'REGEX_RUN'){
            const REGEX_RUN = /(\d{7}|\d{8})\-(\d{1}|k|K)/;
            schema = schema.matches(REGEX_RUN,rule.message )
        }
        else if ( rule.type === 'validaExisteRut'){

            schema = schema.test("valida",rule.message,
                async ( value ) => {
                    if (!value) return false;
                    return ValidaExisteRut(value);
                }
            )
        }
    }
    fieldValidations[input.name] = schema ;
}

const validationSchema = Yup.object( { ...fieldValidations } );

export const Certificado = () => {

  const { onSetCertificado, ...certificadoContext }  = useContext( CertificadoContext );  

  return (
    <Box ml={ 4 } mr={ 4 } mt={ 2 } sx={{ flexGrow: 1 }} >
        <Formik
             initialValues = { initialValues }  
             validationSchema = { validationSchema }  
             onSubmit = { async  ( {  rutUser } ) => {

                const {url_pdf,name_pdf,titulo} = await GetUrlPdf(rutUser);

                console.log('url_pdf',url_pdf);
 
                onSetCertificado({
                    ...certificadoContext,
                    isValidRut: true,
                    rutUser,
                    url_pdf,
                    name_pdf,
                    titulo
                });

             }} 
        >
        {
            ({handleReset}) => (
                <Form>
                {
                    fromJson.map( ( { type,name,placeholder,label } ) => {

                        if (type == 'text')
                        {
                            return (
                                <TextInputBase
                                    key={ name }
                                    type= { type }
                                    name={ name } 
                                    label={ label }  
                                    placeholder= { placeholder}   
                                    handleReset = { handleReset }  
                                    title = { 'Certificado' }                                
                                />
                            )
                        }
                        throw new Error(`El Type: ${type}, NO es Soportado `)
                    })
                }    
                </Form>
            )
        }   
            
        </Formik>    
    
    </Box>
  )
}
