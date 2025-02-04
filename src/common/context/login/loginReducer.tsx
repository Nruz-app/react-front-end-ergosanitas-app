import { LoginState } from "./LoginProvider";


type LoginAction = 
 | { type : 'ValidLogin', payload: LoginState }  

 

 export const LoginReducer = ( state: LoginState, action: LoginAction ) : LoginState  => {


    const { valid,user} = action.payload;

    switch ( action.type ) {

        case  'ValidLogin': 
            return {
                ...state,
                valid,
                user
            }
            
        default:
            return state;           
    }

}