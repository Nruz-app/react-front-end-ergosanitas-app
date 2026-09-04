import { TextField } from '@mui/material';
import { Control, Controller, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

import type { IChequeo } from '../../interface';
import { UseCalculoIMC } from '../../hooks';

interface Props {
    control       : Control<IChequeo>;
    type          : string;
    name          : keyof IChequeo;
    placeholder   : string;
    label         : string;
    defaultValue? : string;
    helperText?   : string;
    disabled      : boolean;
    multiline?    : boolean;
    setValue?     : UseFormSetValue<IChequeo>;
    getValues?    : UseFormGetValues<IChequeo>;
}

/**
 * Campo de texto del formulario. Es un clon del `InputText` compartido de `src/components/`,
 * pero apunta al `UseCalculoIMC` **de este módulo**: así se rompe el acoplamiento raro en el
 * que un componente compartido dependía de un módulo de feature.
 *
 * Para el perfil `Colegios` el recálculo de IMC nunca llega a dispararse, porque peso, estatura
 * e IMC son campos ocultos. Se conserva para cuando el módulo se extienda a otros perfiles.
 */
export const InputText = ({ control, multiline = false, setValue, getValues, ...props }: Props) => {

    const handleOnChange = async () => {

        if (!getValues) return;

        const { edad, estatura, peso, sexo_paciente, fechaNacimiento } = getValues();

        if (edad && estatura && sexo_paciente && peso) {

            const imc = await UseCalculoIMC(estatura, peso);
            setValue?.('imc_paciente', imc.toString());
        }

        // Solo aplica si `fechaNacimiento` se renderiza como texto; hoy es un DatePicker.
        // Se conserva para no perder el autoformateo si un perfil futuro cambia su tipo.
        if (fechaNacimiento && setValue) {

            const posicion: number = fechaNacimiento.length;

            if (posicion === 2 || posicion === 5)
                setValue('fechaNacimiento', fechaNacimiento + '/');

            if (posicion > 10)
                setValue('fechaNacimiento', fechaNacimiento.slice(0, 10));
        }
    };

    return (
        <Controller
            name={props.name}
            control={control}
            defaultValue={props.defaultValue}
            render={({ field: { onChange, value, ref, ...field }, fieldState: { error } }) => (
                <TextField
                    id={props.name}
                    {...field}
                    inputRef={ref}
                    onChange={(event) => {
                        onChange(event);
                        handleOnChange();
                    }}
                    helperText={error ? error.message : props.helperText}
                    error={!!error}
                    type={props.type}
                    fullWidth
                    label={props.label}
                    value={value ?? ''}
                    placeholder={props.placeholder}
                    variant="outlined"
                    multiline={multiline}
                    sx={{ display: props.disabled ? 'none' : 'block' }}
                    InputLabelProps={{
                        shrink : true,
                        sx     : {
                            fontWeight : 'bold',
                            color      : error ? 'error.main' : '#1976d2',
                            fontSize   : '1rem',
                        },
                    }}
                    InputProps={{
                        sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? 'error.main' : '#1976d2',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? 'error.main' : '#115293',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? 'error.main' : '#0d47a1',
                            },
                            '& .MuiInputBase-input': {
                                color      : error ? 'error.main' : '#0d47a1',
                                fontWeight : 'bold',
                                fontSize   : '1rem',
                            },
                        },
                    }}
                    FormHelperTextProps={{
                        sx: {
                            color     : error ? 'error.main' : 'text.secondary',
                            fontStyle : error ? 'italic' : 'normal',
                            fontSize  : '0.875rem',
                        },
                    }}
                />
            )}
        />
    );
};
