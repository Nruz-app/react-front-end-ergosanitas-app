import type { ModalState } from './ModalBarProvider';

type ModalAction =
    | { type: 'openModal', payload: ModalState };

export const ModalBarReducer = (state: ModalState, action: ModalAction): ModalState => {

    switch (action.type) {

        case 'openModal':
            return { ...state, ...action.payload };

        default:
            return state;
    }
};
