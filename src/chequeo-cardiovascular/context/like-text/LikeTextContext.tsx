import { createContext } from 'react';
import type { LikeTextState } from './LikeTextProvider';

export interface LikeTextContextProps extends LikeTextState {
    onSetLikeText: (likeTextState: LikeTextState) => void;
}

export const LikeTextContext = createContext<LikeTextContextProps>({} as LikeTextContextProps);
