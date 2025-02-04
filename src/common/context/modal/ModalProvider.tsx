import { useReducer } from "react";
import { ModalContext } from "./ModalContext"
import { ModalReducer } from "./modalReducer";


export interface ModalState {
    isDateModalOpen : boolean;
    isViewModalOpen : boolean;
}
  

const INITIAL_STATE: ModalState = {
    isDateModalOpen: false,
    isViewModalOpen: false,
}

interface Props {
    children: JSX.Element | JSX.Element[]
}

export const ModalProvider = ( { children } : Props ) => {

    const [state,dispatch] = useReducer (ModalReducer,INITIAL_STATE);


    const onOpenModal = ( isDateModalOpen : boolean ) : boolean  => {

        dispatch({ type: 'openModal', payload: isDateModalOpen });
        return isDateModalOpen;
    }
    const onOpenModalView = ( isViewModalOpen : boolean ) : boolean  => {

        dispatch({ type: 'openModalView', payload: isViewModalOpen });
        return isViewModalOpen;
    }
    

    return (
        <ModalContext.Provider value = { {
            ...state,
            onOpenModal,
            onOpenModalView 
         } } 
        >
            { children }
        </ModalContext.Provider>
    )
}