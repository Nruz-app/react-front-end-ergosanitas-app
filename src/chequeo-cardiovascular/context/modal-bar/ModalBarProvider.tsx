import { ReactNode, useReducer } from 'react';
import { ModalBarContext } from './ModalBarContext';
import { ModalBarReducer } from './modalBarReducer';

/** Estado del modal que amplía el gráfico de presión del Home. */
export interface ModalState {
    isModalOpen : boolean;
    typePresion : string;
}

const INITIAL_STATE: ModalState = {
    isModalOpen : false,
    typePresion : '',
};

interface Props {
    children: ReactNode;
}

export const ModalBarProvider = ({ children }: Props) => {

    const [state, dispatch] = useReducer(ModalBarReducer, INITIAL_STATE);

    const onOpenModal = (action: ModalState): ModalState => {

        dispatch({ type: 'openModal', payload: action });
        return action;
    };

    return (
        <ModalBarContext.Provider value={{ ...state, onOpenModal }}>
            { children }
        </ModalBarContext.Provider>
    );
};
