import { LikeTextState } from "./LikeTextProvider";


type LikeTextAction = 
 | { type : 'onSetLikeText', payload: LikeTextState }  

 
export const LikeTextReducer = ( state: LikeTextState, action: LikeTextAction ) : LikeTextState  => {    
    const textoValue = action.payload;

    switch ( action.type ) {

        case  'onSetLikeText': 
            return textoValue;
            
        default:
            return state;           
    }

}