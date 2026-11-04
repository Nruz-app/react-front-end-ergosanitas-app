import { Control, Controller, FieldValues, Path, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { TextField } from '@mui/material';

import { COLORES } from '../../config/tema';
import type { IChequeo } from '../../interface';
import { UseCalculoIMC } from '../../hooks';

interface Props<T extends FieldValues> {
    control       : Control<T>;
    type          : string;
    name          : Path<T>;
    placeholder   : string;
    label         : string;
    defaultValue? : string;
    helperText?   : string;
    disabled      : boolean;
    multiline?    : boolean;
    /**
     * Solo los pasa el formulario de chequeo: con ellos el campo recalcula el IMC. El resto de
     * formularios (ECG, calculadora, usuario) no los pasa y el campo es un input sin más.
     */
    setValue?     : UseFormSetValue<IChequeo>;
    getValues?    : UseFormGetValues<IChequeo>;
}

/**
 * Campo de texto de los formularios del módulo.
 *
 * Clon del `InputText` compartido de `src/components/forms/`, que importaba el `UseCalculoIMC`
 * de `src/Chequeo/`. Esta copia apunta al **de este módulo** y lee el formulario con
 * `getValues()` en vez de `control._formValues`, que es API privada de react-hook-form (§7.1).
 */
export const InputText = <T extends FieldValues>({
    control, multiline = false, setValue, getValues, ...props
}: Props<T>) => {

    const recalcularImc = async () => {

        if (!getValues || !setValue) return;

        const { edad, estatura, peso, sexo_paciente, fechaNacimiento } = getValues();

        if (edad && estatura && sexo_paciente && peso) {

            // `UseCalculoIMC` lanza con valores a medio escribir («1.»): en el módulo viejo eso
            // quedaba como promesa rechazada sin capturar. Aquí se ignora igual, sin el ruido.
            try {
                const imc = await UseCalculoIMC(estatura, peso);
                setValue('imc_paciente', imc.toString());
            }
            catch {
                // Sin IMC hasta que estatura y peso sean números válidos.
            }
        }

        // Solo aplica si `fechaNacimiento` se pinta como texto; hoy es un DatePicker. Se
        // conserva por paridad con el original.
        if (fechaNacimiento) {

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
            render={({ field: { onChange, value, ref, ...field }, fieldState: { error } }) => (
                <TextField
                    id={props.name}
                    {...field}
                    inputRef={ref}
                    onChange={(event) => {
                        onChange(event);
                        recalcularImc();
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
                            color      : error ? 'error.main' : COLORES.primario,
                            fontSize   : '1rem',
                        },
                    }}
                    InputProps={{
                        sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? 'error.main' : COLORES.primario,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? 'error.main' : COLORES.primarioHover,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: error ? 'error.main' : COLORES.primarioOsc,
                            },
                            '& .MuiInputBase-input': {
                                color      : error ? 'error.main' : COLORES.primarioOsc,
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
