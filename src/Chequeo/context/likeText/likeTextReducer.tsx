import { LikeTextState } from "./LikeTextProvider";


type LikeTextAction = 
 | { type : 'onSetLikeText', payload: LikeTextState }  

 
export const LikeTextReducer = ( state: LikeTextState, action: LikeTextAction ) : LikeTextState  => {    
    const {textoValue,fechaCalendar,selectClub} = action.payload;

    switch ( action.type ) {

        case  'onSetLikeText': 
            return {
                ...state,
                textoValue,
                fechaCalendar,
                selectClub
            }
            
        default:
            return state;           
    }

}