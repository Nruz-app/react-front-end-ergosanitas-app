import { ReactNode, useReducer } from 'react';
import { LikeTextContext } from './LikeTextContext';
import { LikeTextReducer } from './likeTextReducer';

/**
 * Criterios de búsqueda de la lista de deportistas.
 *
 * `selectClub` se conserva aunque el perfil `Colegios` no tenga selector de club: viaja en el
 * cuerpo de `search-chequeo` y quitarlo cambiaría la forma que espera el backend. Para este
 * perfil siempre va vacío.
 */
export interface LikeTextState {
    textoValue    : string;
    fechaCalendar : string;
    selectClub    : string;
}

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
