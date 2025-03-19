import { ModalState } from "./Modal-bar-Provider";

type ModalAction = 
 | { type : 'openModal', payload: ModalState }

export const ModalBarReducer = ( state: ModalState, action: ModalAction ) : ModalState  => {

    const { isModalOpen,typePresion} = action.payload;

    switch ( action.type ) {

        case  'openModal': 
            return {
                ...state,
                isModalOpen: isModalOpen,
                typePresion: typePresion
            }
        default:
            return state;           
    }

}