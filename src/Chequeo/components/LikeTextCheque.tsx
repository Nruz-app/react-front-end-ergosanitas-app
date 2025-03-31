import { useContext, useRef } from "react";

import { Box } from "@mui/material"
import { TextInputBaseLike } from "./forms/TextInputBaseLike"

import * as Yup from 'yup';
import fromJson from '../config/custom-likes.json';
import { Form, Formik } from "formik";
import { LikeTextContext } from "../context";
import { UseChequeoService } from "../services/useChequeoService";
import { IChequeo } from "../interface";
import { LoginContext } from "../../common/context";



const initialValues: { [key: string] : any } = {};

const fieldValidations : { [key:string]: any} = {};


for ( const input of fromJson ) {

    initialValues [ input.name ] = input.value;

    //Validaciones de los campos
    if(  !input.validations ) continue;

    const schema = Yup.string();

    fieldValidations[input.name] = schema ;
}

const validationSchema = Yup.object( { ...fieldValidations } );


interface Props {
    setRowTable  : (chequeo:IChequeo[]) => void;
}

export const LikeTextCheque = ({setRowTable}: Props) => {


  const { onSetLikeText,...likeTextContext }  = useContext( LikeTextContext );

  const { user }  = useContext( LoginContext );
  const { user_email }  = user;


  const debounceRef = useRef<NodeJS.Timeout>();  


  const handlOnChange = ( textoValue: string)  => {
     
    if ( debounceRef.current )
        clearTimeout( debounceRef.current )

        debounceRef.current = setTimeout( ()=>{

            fetchLikeText(textoValue)

        }, 350 )
    }

    const handleReset = async ( )  => {

        const { postChequeoUser } = await UseChequeoService() ;
       
        const response = await postChequeoUser(user_email);

        onSetLikeText({
            ...likeTextContext,
            chequeos : response,
            textoValue : ''
          });

        setRowTable(response);  
    }

    const fetchLikeText = async (textoValue:string) => {

        if(textoValue) {
        
          const { postLikeChequeoUser } = await UseChequeoService();
          
          const responseChequeos:IChequeo[] = await postLikeChequeoUser(textoValue,user_email);
  
          onSetLikeText({
            ...likeTextContext,
            chequeos : responseChequeos,
            textoValue : textoValue
          });
  
          const rows = [...responseChequeos];
          setRowTable(rows);
        
        }
  
    }

  return (
    <Box ml={ 4 } mr={ 4 } mt={ 2 } sx={{ flexGrow: 1 }} >
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
