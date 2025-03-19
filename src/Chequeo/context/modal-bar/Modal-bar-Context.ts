import { createContext } from 'react';
import { ModalState } from './Modal-bar-Provider';

export interface ModalBarContext {
    isModalOpen : boolean;
    typePresion : string;   //'alterial' | 'sistolica';
    onOpenModal : (action : ModalState) => ModalState;
}

export const ModalBarContext = createContext<ModalBarContext>({} as ModalBarContext);