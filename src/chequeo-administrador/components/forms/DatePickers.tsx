import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Control, Controller, UseFormSetValue } from 'react-hook-form';

import { COLORES } from '../../config/tema';
import type { IChequeo } from '../../interface';

interface Props {
    control  : Control<IChequeo>;
    name     : keyof IChequeo;
    label    : string;
    disabled : boolean;
    setValue : UseFormSetValue<IChequeo>;
}

/**
 * Campo de fecha del formulario de chequeo.
 *
 * - `fecha_atencion` arranca vacía: es un dato que pone quien atiende.
 * - El resto —en la práctica `fechaNacimiento`— arranca en hoy, igual que el original, y al
 *   cambiar **recalcula la edad**.
 *
 * Se toma la solución de `chequeo-cardiovascular` (§6.3): el original forzaba `value={null}`
 * en `fecha_atencion`, así que en una edición la fecha guardada **no se veía** aunque siguiera
 * en el formulario. Aquí se pinta el valor del campo. Sin `DemoContainer`, que es un import de
 * `internals` de MUI X.
 */
export const DatePickers = ({ control, setValue, ...props }: Props) => {

    const esFechaAtencion = props.name === 'fecha_atencion';

    const [hoy] = useState<Dayjs>(dayjs());

    const calcularEdad = (newValue: Dayjs | null) => {

        if (!newValue) return;

        const nacimiento = newValue.toDate();
        const ahora = new Date();

        let edad = ahora.getFullYear() - nacimiento.getFullYear();
        const mes = ahora.getMonth() - nacimiento.getMonth();

        // Si todavía no ha llegado el cumpleaños de este año, resta uno.
        if (mes < 0 || (mes === 0 && ahora.getDate() < nacimiento.getDate())) {
            edad--;
        }

        setValue('edad', edad.toString());
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Controller
                name={props.name}
                control={control}
                defaultValue={esFechaAtencion ? undefined : hoy.toISOString()}
                render={({ field: { onChange, value: fieldValue, ref, ...field } }) => (
                    <DatePicker
                        {...field}
                        label={props.label}
                        inputRef={ref}
                        value={fieldValue
                            ? dayjs(fieldValue as string)
                            : (esFechaAtencion ? null : hoy)}
                        onChange={(newValue) => {
                            onChange(newValue ? dayjs(newValue).toISOString() : null);
                            if (!esFechaAtencion) calcularEdad(newValue);
                        }}
                        sx={{ display: props.disabled ? 'none' : 'block', width: '100%' }}
                        slotProps={{
                            textField: {
                                fullWidth       : true,
                                helperText      : 'DD/MM/YYYY',
                                variant         : 'outlined',
                                InputLabelProps : { shrink: true },
                                sx: {
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius : '8px',
                                        '& fieldset'             : { borderColor: COLORES.primario },
                                        '&:hover fieldset'       : { borderColor: COLORES.primarioHover },
                                        '&.Mui-focused fieldset' : { borderColor: COLORES.primarioOsc },
                                    },
                                },
                            },
                        }}
                    />
                )}
            />
        </LocalizationProvider>
    );
};
