import { useReducer } from "react";
import { SubMenuContext } from "./SubMenuContext"
import { SubMenuReducer } from "./subMenuReducer";


export interface SubMenuState {
    active : boolean;
}
  

const INITIAL_STATE: SubMenuState = {
    active : false
}

interface Props {
    children: JSX.Element | JSX.Element[]
}

export const SubMenuProvider = ( { children } : Props ) => {

    const [state,dispatch] = useReducer (SubMenuReducer,INITIAL_STATE);


    const SubMenuActive = ( active : boolean ) : boolean  => {

        const subMenuState:SubMenuState = {active}

        dispatch({ type: 'SubMenuActive', payload: subMenuState });
        return subMenuState.active;
    }
    

    return (
        <SubMenuContext.Provider value = { {
            ...state,
            SubMenuActive 
         } } 
        >
            { children }
        </SubMenuContext.Provider>
    )
}