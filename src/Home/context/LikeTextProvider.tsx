import { useReducer } from "react";
import { LikeTextReducer } from "./LikeTextReducer";
import { LikeTextContext } from "./LikeTextContext";

export interface LikeTextState {
    textoValue   : string;
}
const INITIAL_STATE: LikeTextState = {
    textoValue : '',
}

interface Props {
    children: JSX.Element | JSX.Element[]
}

export const LikeTextProvider = ( { children } : Props ) => {

    const [state,dispatch] = useReducer (LikeTextReducer,INITIAL_STATE);

    const onSetLikeText = async (likeTextState : LikeTextState )   => {

        try {
            
            dispatch({
                type: 'onSetLikeText',
                payload:likeTextState
            });

            
        }
        catch (error) {
            console.error('Error al obtener los chequeos:', error);
        }
    }

    return (
        <LikeTextContext.Provider value = { {
            ...state,
            onSetLikeText 
         } } 
        >
            { children }
        </LikeTextContext.Provider>
    )

}