import { createContext } from 'react';
import { LikeTextState } from './LikeTextProvider';

export interface LikeTextContext {
    textoValue : string,
    onSetLikeText : (likeTextState:LikeTextState) => void;
}

export const LikeTextContext = createContext<LikeTextContext>({} as LikeTextContext);