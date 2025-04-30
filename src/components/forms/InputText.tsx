/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextField } from "@mui/material"
import { Controller, UseFormSetValue } from "react-hook-form";

import { UseCalculoIMC } from '../../Chequeo/hooks';

interface Props {
  control       : any;
  type          : string;
  name          : string;
  placeholder   : string;
  label         : string;
  defaultValue? : string;
  helperText?   : string;
  validations?  : any;
  disabled      : boolean;
  multiline?    : boolean;
  setValue?     : UseFormSetValue<any>;
}

export const InputText = ( { control,multiline = false,setValue,...props } : Props ) => {

    /********************************************************************* 
    const [helpers] = useState<{ [key: string]: string | undefined }>({
        [props.name]: props.helperText
    });
    ************************************************************************/
      
    
    const handleOnchanger = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)  => {
        
        event.preventDefault();        
        const {edad,estatura,peso,sexo_paciente,fechaNacimiento} = control._formValues || {};

        if(edad && estatura && sexo_paciente && peso) {

            const imc = await UseCalculoIMC(estatura,peso);
            if(setValue) 
                setValue('imc_paciente',imc);
            
            /*************************** 
            setHelpers(prevHelpers => ({
                ...prevHelpers,
                [fieldName]: 'Nuevo mensaje Helpers'
            }));
            *********************************/
        } 

        //calcula fecha nacimiento 
        if(fechaNacimiento) {

            const posicion:number =  fechaNacimiento.length;   

            if(posicion === 2 || posicion === 5 ) 
                setValue!('fechaNacimiento',`${fechaNacimiento}/`);
            
            if(posicion > 10)
                setValue!('fechaNacimiento',`${fechaNacimiento.slice(0,10)}`);
                
        }


    }

  return (
    <Controller
      name= { props.name }
      control={control}
      defaultValue={props.defaultValue}
      render={({
          field: { onChange,value, ref, ...field },
          fieldState: { error },
      }) => (
          <TextField
              id = { props.name }  
              {...field}
              inputRef={ref}
              ref={ref}
              onChange={(event) => {
                onChange(event); 
                handleOnchanger(event); 
              }}
              helperText={error ? error.message : props.helperText}
              error={!!error}
              type={props.type}
              fullWidth
              label={props.label}
              value={ value }
              placeholder={props.placeholder}
              variant="outlined"
              multiline = { multiline }
              //disabled = { props.disabled }
              sx={{ display: props.disabled ? 'none' : 'block' }}
              InputLabelProps={{
                  shrink: true,
                  sx: {
                      fontWeight: 'bold',
                      color: error ? 'red' : '#1976d2',
                      fontSize: '1rem',
                  },
              }}
              InputProps={{
                  sx: {
                      '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: error ? 'red' : '#1976d2',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: error ? 'red' : '#115293',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: error ? 'red' : '#0d47a1',
                      },
                      '& .MuiInputBase-input': {
                          color: error ? 'red' : '#0d47a1',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                      },
                      '&:hover .MuiInputBase-input': {
                          color: error ? 'red' : '#0d47a1',
                      },
                  },
              }}
              FormHelperTextProps={{
                  sx: {
                      color: error ? 'red' : 'grey',
                      fontStyle: error ? 'italic' : 'normal',
                      fontSize: '0.875rem',
                  },
              }}
          />
      )}
  />
  )
}
