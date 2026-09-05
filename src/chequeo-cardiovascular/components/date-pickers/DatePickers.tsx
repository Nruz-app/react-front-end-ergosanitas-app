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
    control       : Control<IChequeo>;
    name          : keyof IChequeo;
    label         : string;
    defaultValue? : string;
    disabled      : boolean;
    setValue      : UseFormSetValue<IChequeo>;
}

/**
 * Campo de fecha del formulario.
 *
 * `fecha_atencion` arranca vacío a propósito: es un dato que pone quien atiende, y precargarlo
 * con hoy haría que se guardara una fecha que nadie eligió. El resto de fechas —en la práctica
 * `fechaNacimiento`— sí arrancan en hoy, y al cambiarlas **recalculan la edad**.
 */
export const DatePickers = ({ control, setValue, ...props }: Props) => {

    const esFechaAtencion = props.name === 'fecha_atencion';

    const [value] = useState<Dayjs | null>(esFechaAtencion ? null : dayjs(new Date()));

    const calcularEdad = (newValue: Dayjs | null) => {

        if (!newValue) return;

        const nacimiento = newValue.toDate();
        const hoy = new Date();

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        // Si todavía no ha llegado el cumpleaños de este año, resta uno.
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        setValue('edad', edad.toString());
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Controller
                name={props.name}
                control={control}
                defaultValue={esFechaAtencion ? undefined : dayjs(value ?? new Date()).toISOString()}
                render={({ field: { onChange, value: fieldValue, ref, ...field } }) => (
                    <DatePicker
                        {...field}
                        label={props.label}
                        inputRef={ref}
                        value={esFechaAtencion
                            ? (fieldValue ? dayjs(fieldValue) : null)
                            : (fieldValue ? dayjs(fieldValue) : dayjs())}
                        onChange={(newValue) => {
                            onChange(newValue ? dayjs(newValue).toISOString() : null);
                            if (!esFechaAtencion) calcularEdad(newValue);
                        }}
                        sx={{ display: props.disabled ? 'none' : 'block', width: '100%' }}
                        slotProps={{
                            textField: {
                                fullWidth   : true,
                                helperText  : 'DD/MM/YYYY',
                                variant     : 'outlined',
                                InputLabelProps : { shrink: true },
                                sx: {
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius : '8px',
                                        '& fieldset'              : { borderColor: COLORES.primario },
                                        '&:hover fieldset'        : { borderColor: COLORES.primarioHover },
                                        '&.Mui-focused fieldset'  : { borderColor: COLORES.primarioOsc },
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
