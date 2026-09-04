import { MenuItem, TextField } from '@mui/material';
import { Control, Controller } from 'react-hook-form';

import type { IChequeo, IOpcionCampo } from '../../interface';

interface Props {
    control       : Control<IChequeo>;
    name          : keyof IChequeo;
    placeholder   : string;
    label         : string;
    defaultValue? : string;
    helperText?   : string;
    disabled      : boolean;
    values        : IOpcionCampo[];
}

/** Desplegable del formulario, alimentado por el array `values` del JSON. */
export const InputSelect = ({ control, ...props }: Props) => {

    return (
        <Controller
            name={props.name}
            defaultValue={props.defaultValue}
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
                            backgroundColor : '#f9f9f9',
                            '&.Mui-focused fieldset' : { borderColor: '#1976d2' },
                            '&:hover fieldset'       : { borderColor: '#1976d2' },
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
                                '&.Mui-selected'       : { backgroundColor: '#1976d2', color: '#fff' },
                                '&.Mui-selected:hover' : { backgroundColor: '#0d47a1' },
                                '&:hover'              : { backgroundColor: '#e3f2fd' },
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
