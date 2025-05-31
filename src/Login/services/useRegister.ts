import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import { IResponseUser } from '../interface';
import { ILogoUser, IUser } from '../interface/user';


export const  UseRegister = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
    
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

    const loadLogoUser = async (selectedFile : File,user_email : string) => {
    
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('user_email', user_email);
        const response:ILogoUser = await  apiAdapter.post(`${API}/auth-register/load-logo`,uploadData);
        return response;
    }

    const getUserEmail =  async (perfil : number) : Promise<IUser[]> => {
            
        const response:IUser[] = await  apiAdapter.get(`${API}/auth-register/user_email/${perfil}`,10,0)
        return response;
    }

    return { authRegister,loadLogoUser,getUserEmail };
}