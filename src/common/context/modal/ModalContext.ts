import { createContext } from 'react';

export interface ModalContext {
    isDateModalOpen : boolean;
    onOpenModal : (isDateModalOpen : boolean) => boolean;
    isViewModalOpen : boolean;
    onOpenModalView : (isViewModalOpen : boolean) => boolean
}

export const ModalContext = createContext<ModalContext>({} as ModalContext);