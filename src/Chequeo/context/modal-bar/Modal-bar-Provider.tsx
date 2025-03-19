import { useReducer } from "react";
import { ModalBarContext } from "./Modal-bar-Context";
import { ModalBarReducer } from "./modal-bar-Reducer";


export interface ModalState {
    isModalOpen : boolean;
    typePresion : string;
}
  

const INITIAL_STATE: ModalState = {
    isModalOpen: false,
    typePresion : ''
}

interface Props {
    children: JSX.Element | JSX.Element[]
}

export const ModalBarProvider = ( { children } : Props ) => {

    const [state,dispatch] = useReducer (ModalBarReducer,INITIAL_STATE);


    const onOpenModal = ( action : ModalState ) : ModalState  => {

        dispatch({ type: 'openModal', payload: action });
        return action;
    }
    
    return (
        <ModalBarContext.Provider value = { {
            ...state,
            onOpenModal 
         } } 
        >
            { children }
        </ModalBarContext.Provider>
    )
}