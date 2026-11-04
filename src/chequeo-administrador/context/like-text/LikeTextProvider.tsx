import { ReactNode, useReducer } from 'react';

import type { IFiltrosBusqueda } from '../../interface';
import { LikeTextContext } from './LikeTextContext';
import { LikeTextReducer } from './likeTextReducer';

/**
 * Criterios de búsqueda de la lista de chequeos.
 *
 * Es el mismo tipo que recibe el servicio (`IFiltrosBusqueda`): el estado del contexto viaja
 * tal cual como cuerpo de `search-chequeo`. El Administrador sí usa `selectClub`.
 */
export type LikeTextState = IFiltrosBusqueda;

const INITIAL_STATE: LikeTextState = {
    textoValue    : '',
    fechaCalendar : '',
    selectClub    : '',
};

interface Props {
    children: ReactNode;
}

export const LikeTextProvider = ({ children }: Props) => {

    const [state, dispatch] = useReducer(LikeTextReducer, INITIAL_STATE);

    const onSetLikeText = (likeTextState: LikeTextState) => {

        dispatch({ type: 'onSetLikeText', payload: likeTextState });
    };

    return (
        <LikeTextContext.Provider value={{ ...state, onSetLikeText }}>
            { children }
        </LikeTextContext.Provider>
    );
};
