import { ModalState } from "./ModalProvider";


type ModalAction = 
 | { type : 'openModal', payload: boolean }
 | { type : 'openModalView', payload: boolean }   

 
export const ModalReducer = ( state: ModalState, action: ModalAction ) : ModalState  => {

    switch ( action.type ) {

        case  'openModal': 
            return {
                ...state,
                isDateModalOpen: action.payload,
            }
           
        case  'openModalView': 
            return {
                ...state,
                isViewModalOpen: action.payload
            }

        default:
            return state;           
    }

}