import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';


import { IAuth } from '../interface/auth.interface';

export const  UseLoginGoogleService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
    
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const postAuthLogin = async (token : string | undefined) => {

        const respose:IAuth = await  apiAdapter.post(`${API}/auth-login`,{ token });
        
        return respose;
        
    }

    return { postAuthLogin }

}