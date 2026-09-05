import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

import { COLORES } from '../../config/tema';
import { LikeTextContext } from '../../context';
import camposLike from '../../config/custom-likes.json';

/**
 * Buscador por RUT o nombre.
 *
 * A diferencia del original **no usa formik**: es un único campo controlado, y traer un motor
 * de formularios entero para eso no se justifica en código nuevo. El debounce de 350 ms evita
 * una petición por tecla.
 *
 * El botón de limpiar usa `ClearIcon` a propósito: aquí no se borra nada, se vacía un filtro.
 * El módulo no contiene ningún icono de papelera, ni siquiera decorativo, para que la
 * comprobación de «sin borrado» por búsqueda de texto siga siendo significativa.
 */
export const LikeTextChequeo = () => {

    const { onSetLikeText, ...likeTextContext } = useContext(LikeTextContext);

    const [campo] = camposLike;
    const [texto, setTexto] = useState(likeTextContext.textoValue);

    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Sin esto, salir del tab con un debounce en vuelo dispararía un setState sobre un
    // componente ya desmontado.
    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const propagar = (textoValue: string) => {

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSetLikeText({ ...likeTextContext, textoValue });
        }, 350);
    };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {

        setTexto(event.target.value);
        propagar(event.target.value);
    };

    const onLimpiar = () => {

        clearTimeout(debounceRef.current);
        setTexto('');
        onSetLikeText({ ...likeTextContext, textoValue: '' });
    };

    return (
        <TextField
            id={campo.name}
            value={texto}
            onChange={onChange}
            label={campo.label}
            placeholder={campo.placeholder}
            helperText={campo.helperText}
            size="small"
            fullWidth
            sx={{ maxWidth: 380 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: COLORES.primario }} aria-hidden="true" />
                    </InputAdornment>
                ),
                endAdornment: texto ? (
                    <InputAdornment position="end">
                        <IconButton onClick={onLimpiar} size="small" aria-label="Limpiar búsqueda">
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ) : null,
            }}
        />
    );
};
