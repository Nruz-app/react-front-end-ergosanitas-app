/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextField } from "@mui/material"
import { Controller, UseFormSetValue } from "react-hook-form";

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
