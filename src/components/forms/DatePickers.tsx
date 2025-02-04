import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller } from 'react-hook-form';
import 'dayjs/locale/es';
interface Props {
    control       : any;
    name          : string;
    label         : string;
    defaultValue? : string;    
}


export const DatePickers = ( { control,...props } : Props ) => {

    
  const [value] = React.useState<Dayjs | null>(dayjs(new Date()));

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