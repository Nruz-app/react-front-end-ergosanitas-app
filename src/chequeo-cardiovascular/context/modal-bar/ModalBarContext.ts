import { createContext } from 'react';
import type { ModalState } from './ModalBarProvider';

export interface ModalBarContextProps extends ModalState {
    onOpenModal: (action: ModalState) => ModalState;
}

export const ModalBarContext = createContext<ModalBarContextProps>({} as ModalBarContextProps);
