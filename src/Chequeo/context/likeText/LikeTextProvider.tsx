import { useReducer } from "react";
import { LikeTextReducer } from "./likeTextReducer";
import { LikeTextContext } from "./LikeTextContext";
//import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';


export interface LikeTextState {
    textoValue    : string;
    //fechaCalendar : Dayjs | null;
    fechaCalendar : string,
    selectClub    : string;
}
const INITIAL_STATE: LikeTextState = {
    textoValue : '',
    //fechaCalendar : dayjs(new Date()),
    fechaCalendar : '',
    selectClub    : ''
}

interface Props {
    children: JSX.Element | JSX.Element[]
}

export const LikeTextProvider = ( { children } : Props ) => {

    const [state,dispatch] = useReducer (LikeTextReducer,INITIAL_STATE);

    const onSetLikeText = async (likeTextState : LikeTextState )   => {

        const { textoValue,fechaCalendar,selectClub } = likeTextState;
        try {
            
            dispatch({
                type: 'onSetLikeText',
                payload: { textoValue,fechaCalendar,selectClub }
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