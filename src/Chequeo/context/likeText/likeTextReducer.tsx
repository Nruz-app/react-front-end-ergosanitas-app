import { LikeTextState } from "./LikeTextProvider";


type LikeTextAction = 
 | { type : 'onSetLikeText', payload: LikeTextState }  

 
export const LikeTextReducer = ( state: LikeTextState, action: LikeTextAction ) : LikeTextState  => {    
    const {chequeos,textoValue} = action.payload;

    switch ( action.type ) {

        case  'onSetLikeText': 
            return {
                ...state,
                chequeos,
                textoValue
            }
            
        default:
            return state;           
    }

}