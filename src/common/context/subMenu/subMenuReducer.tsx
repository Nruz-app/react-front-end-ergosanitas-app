import { SubMenuState } from "./SubMenuProvider";


type SubMenuAction = 
 | { type : 'SubMenuActive', payload: SubMenuState }  

 

 export const SubMenuReducer = ( state: SubMenuState, action: SubMenuAction ) : SubMenuState  => {


    const { active } = action.payload;

    switch ( action.type ) {

        case  'SubMenuActive': 
            return {
                ...state,
                active
            }
            
        default:
            return state;           
    }

}