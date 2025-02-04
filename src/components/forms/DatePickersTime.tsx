import * as React from 'react';
import { Controller } from 'react-hook-form';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

interface Props {
  control: any;
  name: string;
  label: string;
  defaultValue?: string;
}

export const DatePickersTime = ({ control, ...props }: Props) => {
  const [value] = React.useState<Dayjs | null>(dayjs(new Date()));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es"> 
      <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
        <Controller
          name={props.name}
          control={control}
          defaultValue={value ? dayjs(value).toISOString() : dayjs().toISOString()}
          render={({
            field: { onChange, value, ref, ...field },
          }) => (
            <DateTimePicker
              {...field}
              label={props.label}
              inputRef={ref}
              value={value ? dayjs(value) : dayjs()} // Maneja la fecha y la hora con dayjs
              onChange={(newValue) => {
                onChange(newValue ? dayjs(newValue).toISOString() : null); // Convierte a formato ISO
              }}
              slotProps={{
                textField: {
                  helperText: 'MM/DD/YYYY HH:mm',
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
};