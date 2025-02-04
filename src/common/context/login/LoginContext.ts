import { createContext } from 'react';
import { IUser } from '../../../Login/interface';

export interface LoginContext {
    valid : boolean,
    user : IUser,
    ValidLogin : (valid : boolean,user:IUser) => boolean
}

export const LoginContext = createContext<LoginContext>({} as LoginContext);