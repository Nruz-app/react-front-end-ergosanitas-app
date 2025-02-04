import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import { IResponseUser } from '../interface';


export const  UseRegister = async () => {

    const API = import.meta.env.VITE_API;
    
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const authRegister = async ( user_email:string , user_password:string ) => {


        //const result = keysJson.find(( user ) => user.userName === userName && user.password === password );
        //return result!;
        const response:IResponseUser = await  apiAdapter.post(`${API}/auth-register`,{
            user_email,
            user_password
        });
        return response;

    }

    

    return { authRegister };
}