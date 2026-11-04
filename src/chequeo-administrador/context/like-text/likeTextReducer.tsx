import type { LikeTextState } from './LikeTextProvider';

type LikeTextAction =
    | { type: 'onSetLikeText', payload: LikeTextState };

export const LikeTextReducer = (state: LikeTextState, action: LikeTextAction): LikeTextState => {

    switch (action.type) {

        case 'onSetLikeText':
            return { ...state, ...action.payload };

        default:
            return state;
    }
};
