import { createContext } from 'react';
import { LikeTextState } from './LikeTextProvider';
import { IChequeo } from '../../interface';

export interface LikeTextContext {
    chequeos : IChequeo[],
    textoValue : string,
    onSetLikeText : (likeTextState:LikeTextState) => void;
}

export const LikeTextContext = createContext<LikeTextContext>({} as LikeTextContext);