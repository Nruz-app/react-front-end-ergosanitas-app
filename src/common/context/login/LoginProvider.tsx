import { useReducer } from "react";
import { LoginContext } from "./LoginContext"
import { LoginReducer } from "./loginReducer";
import { IUser } from "../../../Login/interface";


export interface LoginState {
    valid : boolean;
    user : IUser;
}
  

const INITIAL_STATE: LoginState = {
    valid : false,
    user : {
        user_id     : 0,
        user_email  : '',
        user_name   : '',
        user_perfil : '',
        user_logo   : ''
    }
}

interface Props {
    children: JSX.Element | JSX.Element[]
}

export const LoginProvider = ( { children } : Props ) => {

    const [state,dispatch] = useReducer (LoginReducer,INITIAL_STATE);


    const ValidLogin = ( valid : boolean,user:IUser ) : boolean  => {

        const loginState:LoginState = {valid,user}

        dispatch({ type: 'ValidLogin', payload: loginState });
        return loginState.valid;
    }
    

    return (
        <LoginContext.Provider value = { {
            ...state,
            ValidLogin 
         } } 
        >
            { children }
        </LoginContext.Provider>
    )
}