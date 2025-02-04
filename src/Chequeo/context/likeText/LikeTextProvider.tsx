import { useReducer } from "react";
import { LikeTextReducer } from "./likeTextReducer";
import { LikeTextContext } from "./LikeTextContext";
import { IChequeo } from "../../interface";

export interface LikeTextState {
    textoValue   : string;
    chequeos     : IChequeo[]; 
}
const INITIAL_STATE: LikeTextState = {
    textoValue : '',
    chequeos   : []
}

interface Props {
    children: JSX.Element | JSX.Element[]
}

export const LikeTextProvider = ( { children } : Props ) => {

    const [state,dispatch] = useReducer (LikeTextReducer,INITIAL_STATE);

    const onSetLikeText = async (likeTextState : LikeTextState )   => {

        const { textoValue,chequeos } = likeTextState;
        try {
            
            dispatch({
                type: 'onSetLikeText',
                payload: { chequeos, textoValue }
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