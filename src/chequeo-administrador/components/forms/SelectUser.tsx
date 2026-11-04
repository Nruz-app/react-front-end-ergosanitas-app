import { useEffect, useRef, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { MenuItem, TextField } from '@mui/material';

import { COLORES, UI } from '../../config/tema';
import type { IChequeo, IUsuarioRegistrado } from '../../interface';
import { UseUsuarioService } from '../../services';

/** El id de perfil que el backend usa para la lista de clubes. Mismo valor que el original. */
const PERFIL_CLUBES = 3;

interface Props {
    control     : Control<IChequeo>;
    name        : keyof IChequeo;
    placeholder : string;
    label       : string;
    helperText? : string;
    disabled    : boolean;
    /**
     * Si el panel que lo contiene está a la vista. `TabPanel` oculta sin desmontar, así que sin
     * esto la lista de clubes se pediría nada más entrar al módulo (§4, carga diferida). Se pide
     * en la **primera** activación y no se vuelve a pedir.
     */
    activo      : boolean;
}

/**
 * Desplegable de club (`user_email`) del formulario de chequeo.
 *
 * Clon de `src/Chequeo/components/select-user/`, que importaba `UseRegister` de `src/Login/`.
 * Esta copia usa `UseUsuarioService` del módulo. Es el único componente de formulario que
 * consulta al backend, porque la lista no está en el JSON.
 */
export const SelectUser = ({ control, activo, ...props }: Props) => {

    const [usuarios, setUsuarios] = useState<IUsuarioRegistrado[]>([]);
    const yaCargado = useRef(false);

    useEffect(() => {

        if (!activo || yaCargado.current) return;
        yaCargado.current = true;

        const cargarClubes = async () => {

            try {
                const { getUserEmail } = await UseUsuarioService();
                setUsuarios(await getUserEmail(PERFIL_CLUBES));
            }
            catch (problema) {
                // Sin lista el campo queda vacío, como en el original; se permite reintentar.
                yaCargado.current = false;
                console.error(problema instanceof Error ? problema.message : 'No hay respuesta del servidor.');
            }
        };

        cargarClubes();

    }, [activo]);

    return (
        <Controller
            name={props.name}
            control={control}
            render={({ field: { onChange, ref, value, ...field }, fieldState: { error } }) => (
                <TextField
                    id={props.name}
                    {...field}
                    inputRef={ref}
                    // Mientras la lista no llega, MUI avisaría de un valor fuera de rango.
                    value={usuarios.some((usuario) => usuario.user_email === value) ? value : ''}
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
                    {usuarios.map(({ user_email, user_name }) => (
                        <MenuItem
                            key={user_email}
                            value={user_email}
                            sx={{
                                '&.Mui-selected'       : { backgroundColor: COLORES.primario, color: COLORES.textoSobrePrimario },
                                '&.Mui-selected:hover' : { backgroundColor: COLORES.primarioOsc },
                                '&:hover'              : { backgroundColor: COLORES.fondoSuave },
                            }}
                        >
                            { user_name }
                        </MenuItem>
                    ))}
                </TextField>
            )}
        />
    );
};
