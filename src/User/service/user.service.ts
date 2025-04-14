
import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { Iuser } from '../';

export const  UserService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
            
    const apiAdapter: HttpAdapter = new ApiAdapter();
       
    const PostUserSave =  async (user : Iuser)  => {

        const response : {success: boolean, message: string}  = 
            await  apiAdapter.post(`${API}/user-save`,user)

        return response;
    }

    const PostUserPassword = async (password_user : string,email_user : string)  => {

        const response : {success: boolean, message: string}  = 
            await  apiAdapter.put(`${API}/user-update-password`,{password_user,email_user})

        return response;
    }

    return { 
        PostUserSave,
        PostUserPassword
    }

}