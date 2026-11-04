import { useContext, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

import camposLike from '../../config/custom-likes.json';
import { LikeTextContext } from '../../context';
import { TextInputBaseLike } from './TextInputBaseLike';

/**
 * Buscador por RUT o nombre, con debounce de 350 ms para no pedir una búsqueda por tecla.
 *
 * Paridad con el original: borrar el texto a mano **no** quita el filtro (solo se propaga un
 * texto no vacío); para quitarlo está el botón de limpiar. Es un comportamiento heredado que
 * revisará la spec de la lista.
 */
export const LikeTextChequeo = () => {

    const { onSetLikeText, ...likeTextContext } = useContext(LikeTextContext);

    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // El debounce escribe 350 ms después de la tecla: si en ese intervalo cambia la fecha o el
    // club, el contexto capturado por el `setTimeout` ya es viejo y los pisaría. Por eso lee el
    // último contexto de una ref, no el del render en que se tecleó.
    const contextoRef = useRef(likeTextContext);
    useEffect(() => { contextoRef.current = likeTextContext; });

    // Sin esto, un debounce en vuelo dispararía un setState después de desmontar.
    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const handlOnChange = (textoValue: string) => {

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (textoValue) onSetLikeText({ ...contextoRef.current, textoValue });
        }, 350);
    };

    const handleReset = () => {

        clearTimeout(debounceRef.current);
        onSetLikeText({ ...likeTextContext, textoValue: '' });
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {camposLike.map(({ name, label, placeholder }) => (
                <TextInputBaseLike
                    key={name}
                    name={name}
                    label={label}
                    placeholder={placeholder}
                    value={likeTextContext.textoValue}
                    handleReset={handleReset}
                    handlOnChange={handlOnChange}
                />
            ))}
        </Box>
    );
};
