import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, UseFormSetValue } from 'react-hook-form';
import 'dayjs/locale/es';
interface Props {
    control       : any;
    name          : string;
    label         : string;
    defaultValue? : string;   
    setValue     : UseFormSetValue<any>;   
}

export const DatePickers = ( { control,setValue,...props } : Props ) => {

  const [value] = React.useState<Dayjs | null>(dayjs(new Date()));

  const handleChanger = (newValue: any) => { 

    if (newValue) {
      
      const formattedValue = dayjs(newValue).toISOString();
      
      const dateNacimiento = new Date(formattedValue);
        const today = new Date();

        let edad = today.getFullYear() - dateNacimiento.getFullYear();
        const mes = today.getMonth() - dateNacimiento.getMonth();

        // Si la fecha de hoy es antes del cumpleaños de este año, resta 1 de la edad
        if (mes < 0 || (mes === 0 && today.getDate() < dateNacimiento.getDate())) {
          edad--;
        }
        setValue('edad', edad.toString());

    } 
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es"> 
    <DemoContainer components={['DatePicker', 'DatePicker']}>

    <Controller
     name={ props.name}
     control={ control}
     defaultValue={ value ? dayjs(value).toISOString() : dayjs().toISOString() } 
      render={({
        field: { onChange,value, ref, ...field },
      }) => (

        <DatePicker
          {...field}
          label={ props.label }
          inputRef={ ref }
          defaultValue={ value ? dayjs( value ) : dayjs() } 
          value={value ? dayjs(value) : dayjs() }
          onChange={(newValue) => {

            onChange(newValue ? dayjs(newValue).toISOString() : null); 
            handleChanger(newValue)
              

          }}
          slotProps={{
            textField: {
              helperText: 'MM/DD/YYYY',
              variant: 'outlined',
              InputLabelProps: {
                style: {
                  color: '#6c757d', // Color elegante para la etiqueta
                },
              },
              InputProps: {
                style: {
                  borderRadius: '8px', // Bordes redondeados
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Sombra suave
                },
                
              },
              sx: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#ced4da', // Color del borde
                  },
                  '&:hover fieldset': {
                    borderColor: '#80bdff', // Color del borde al pasar el mouse
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007bff', // Color del borde cuando está enfocado
                  },
                },
              },
            },
          }}
          
        />
      )}
    />


   
    </DemoContainer>
  </LocalizationProvider>
  );
}