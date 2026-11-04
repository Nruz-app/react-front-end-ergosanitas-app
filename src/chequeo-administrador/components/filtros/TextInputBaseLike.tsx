import { ChangeEvent, useState } from 'react';
import { Box, IconButton, InputBase, Paper } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';

import { COLORES, SOMBRAS, UI, sxFocoVisible } from '../../config/tema';

interface Props {
    name          : string;
    label         : string;
    placeholder?  : string;
    /** Valor inicial, tomado del contexto de búsqueda. */
    value         : string;
    handleReset   : () => void;
    handlOnChange : (textoValue: string) => void;
}

/**
 * Campo del buscador por RUT o nombre, con el mismo aspecto que hoy.
 *
 * Dos diferencias con el original, ambas en la lista cerrada de la spec o de §7.1:
 *
 * - **`ClearIcon` en vez de la papelera roja del original** (§6.2): aquí no se borra nada,
 *   se vacía un filtro, y la papelera estaba junto a una tabla que sí borra registros.
 * - **Sin formik**: era un solo campo sin validaciones y formik no aportaba nada; el código
 *   nuevo del repo no lo usa.
 */
export const TextInputBaseLike = ({ handleReset, handlOnChange, ...props }: Props) => {

    const [value, setValue] = useState(props.value);

    const handClear = () => {
        setValue('');
        handleReset();
    };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        handlOnChange(event.target.value);
    };

    return (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                sx={{
                    // `border-box` y menos relleno en móvil: con 30 px laterales sobre un 100 %
                    // de ancho la tarjeta se salía del acordeón a 375 px.
                    boxSizing       : 'border-box',
                    p               : { xs: '12px', sm: '20px 30px' },
                    display         : 'flex',
                    alignItems      : 'center',
                    width           : { xs: '100%', sm: '80%' },
                    boxShadow       : SOMBRAS.campo,
                    borderRadius    : '16px',
                    backgroundColor : COLORES.fondoTarjeta,
                    border          : `1px solid ${COLORES.borde}`,
                }}
            >
                <PersonIcon
                    aria-hidden="true"
                    sx={{
                        display         : { xs: 'none', sm: 'inline-block' },
                        fontSize        : 42,
                        color           : COLORES.primario,
                        boxShadow       : SOMBRAS.icono,
                        borderRadius    : '50%',
                        backgroundColor : COLORES.fondoSuave,
                        padding         : '10px',
                    }}
                />
                <InputBase
                    id={props.name}
                    name={props.name}
                    sx={{
                        ml              : { xs: 0, sm: 2 },
                        flex            : 1,
                        minWidth        : 0,
                        fontSize        : 16,
                        padding         : '8px 12px',
                        backgroundColor : UI.fondoCampo,
                        borderRadius    : '8px',
                    }}
                    placeholder={props.placeholder}
                    inputProps={{ 'aria-label': props.label }}
                    value={value}
                    onChange={onChange}
                />

                <IconButton
                    type="button"
                    onClick={handClear}
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                    sx={{
                        ml              : 1,
                        p               : '10px',
                        color           : COLORES.textoSuave,
                        '&:hover'       : { backgroundColor: COLORES.fondoSuave, color: COLORES.primario },
                        ...sxFocoVisible,
                    }}
                >
                    <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Paper>
        </Box>
    );
};
