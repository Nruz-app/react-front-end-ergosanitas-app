import { createContext } from 'react';

export interface SubMenuContext {
    active : boolean,
    SubMenuActive : (active : boolean) => boolean
}

export const SubMenuContext = createContext<SubMenuContext>({} as SubMenuContext);