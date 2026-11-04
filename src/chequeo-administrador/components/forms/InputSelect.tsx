import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { MenuItem, TextField } from '@mui/material';

import { COLORES, UI } from '../../config/tema';
import type { IOpcionCampo } from '../../interface';

interface Props<T extends FieldValues> {
    control       : Control<T>;
    name          : Path<T>;
    placeholder   : string;
    label         : string;
    helperText?   : string;
    disabled      : boolean;
    values        : IOpcionCampo[];
}

/**
 * Desplegable alimentado por el array `values` del JSON.
 *
 * Sin el `rules={{ required: true }}` del original: con un resolver yup, react-hook-form ignora
 * `rules`, así que no hacía nada. El valor por defecto llega por `defaultValues` del formulario.
 */
export const InputSelect = <T extends FieldValues>({ control, ...props }: Props<T>) => {

    return (
        <Controller
            name={props.name}
            control={control}
            render={({ field: { onChange, ref, value, ...field }, fieldState: { error } }) => (
                <TextField
                    id={props.name}
                    {...field}
                    inputRef={ref}
                    value={value ?? ''}
                    onChange={onChange}
                    error={!!error}
                    fullWidth
                    label={props.label}
                    select
                    helperText={error ? error.message : props.helperText}
                    placeholder={props.placeholder}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{
                        display: props.disabled ? 'none' : 'block',
                        '& .MuiOutlinedInput-root': {
                            borderRadius    : 2,
                            backgroundColor : UI.fondoSutil,
                            '&.Mui-focused fieldset' : { borderColor: COLORES.primario },
                            '&:hover fieldset'       : { borderColor: COLORES.primario },
                        },
                        '& .MuiFormHelperText-root': {
                            color     : error ? 'error.main' : 'text.secondary',
                            fontStyle : error ? 'italic' : 'normal',
                        },
                    }}
                >
                    {props.values.map(({ nombre, value: opcion }) => (
                        <MenuItem
                            key={opcion}
                            value={opcion}
                            sx={{
                                '&.Mui-selected'       : { backgroundColor: COLORES.primario, color: COLORES.textoSobrePrimario },
                                '&.Mui-selected:hover' : { backgroundColor: COLORES.primarioOsc },
                                '&:hover'              : { backgroundColor: COLORES.fondoSuave },
                            }}
                        >
                            { nombre }
                        </MenuItem>
                    ))}
                </TextField>
            )}
        />
    );
};
