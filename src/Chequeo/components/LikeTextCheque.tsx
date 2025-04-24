import { useContext, useRef } from "react";

import { Box } from "@mui/material"
import { TextInputBaseLike } from "./forms/TextInputBaseLike"

import * as Yup from 'yup';
import fromJson from '../config/custom-likes.json';
import { Form, Formik } from "formik";
import { LikeTextContext } from "../context";

const initialValues: Record<string, unknown> = {};

const fieldValidations: Record<string, Yup.AnySchema> = {};

for ( const input of fromJson ) {

    initialValues [ input.name ] = input.value;

    //Validaciones de los campos
    if(  !input.validations ) continue;

    const schema = Yup.string();

    fieldValidations[input.name] = schema ;
}

const validationSchema = Yup.object( { ...fieldValidations } );

export const LikeTextCheque = () => {


  const { onSetLikeText,...likeTextContext }  = useContext( LikeTextContext );


  const debounceRef = useRef<NodeJS.Timeout>();  


  const handlOnChange = ( textoValue: string)  => {
     
    if ( debounceRef.current )
        clearTimeout( debounceRef.current )

        debounceRef.current = setTimeout( ()=>{

            fetchLikeText(textoValue)

        }, 350 )
    }

    const handleReset = async ( )  => {
        const newLikeTextState = {...likeTextContext, textoValue : ''}
        onSetLikeText(newLikeTextState);
    }

    const fetchLikeText = async (textoValue:string) => {

        if(textoValue) {
          const newLikeTextState = {...likeTextContext, textoValue}
          onSetLikeText(newLikeTextState);
        }
    }

  return (
    <Box   sx={{ flexGrow: 1 }} >
        <Formik
             initialValues = { initialValues }  
             validationSchema = { validationSchema }  
             onSubmit = { (  ) => { }} 
        >
            {
                () => (
                    <Form>
                    {
                        fromJson.map( ( { type,name,placeholder,label } ) => {

                            if (type == 'text')
                            {
                                return (
                                    <TextInputBaseLike
                                        key={ name }
                                        type= { type }
                                        name={ name } 
                                        label={ label }  
                                        placeholder= { placeholder}   
                                        handleReset = { handleReset }  
                                        title = { 'Chequeos' }   
                                        handlOnChange = { handlOnChange } 
                                        value= { likeTextContext.textoValue}                            
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
