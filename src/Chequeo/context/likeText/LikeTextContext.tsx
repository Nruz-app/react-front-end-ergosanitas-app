import { createContext } from 'react';
import { LikeTextState } from './LikeTextProvider';
//import { Dayjs } from 'dayjs';
export interface LikeTextContext {
    //fechaCalendar : Dayjs | null,
    fechaCalendar : string,
    selectClub : string,
    textoValue : string,
    onSetLikeText : (likeTextState:LikeTextState) => void;
}

export const LikeTextContext = createContext<LikeTextContext>({} as LikeTextContext);