import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IChequeo } from '../interface';

import { type formData } from '../interface/';

export const  UseChequeoService = async () => {


    const API = import.meta.env.VITE_API;

    const apiAdapter: HttpAdapter = new ApiAdapter();


    const chequeoPDF =  async (rut : string) => {

        console.log('window',rut);
        
        window.location.href = `${API}/chequeo-cardiovascular/pdf/${rut}`; 
    }

    const getChequeo =  async () : Promise<IChequeo[]> => {

        const response:IChequeo[] = await  apiAdapter.get(`${API}/chequeo-cardiovascular`,10,0)
        return response;
    }
    const postChequeoUser =  async (user_email : string) : Promise<IChequeo[]> => {

        
        const response:IChequeo[] = await  apiAdapter.post(`${API}/chequeo-cardiovascular/user`,{user_email})
        return response;
    }

    const postCreateChequeo = async (Chequeo : IChequeo) => {
       
        console.log('api',`${API}/chequeo-cardiovascular`);
        const response = await  apiAdapter.post(`${API}/chequeo-cardiovascular`,Chequeo);
        return response;
    }

    const postUploadFile = async(selectedFile : File,formData : formData) => {

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('rut', formData.rut);
        uploadData.append('nombre', formData.nombre);

        const response = await  apiAdapter.post(`${API}/file-upload`,uploadData);
        
        return response;
    }

    const getChequeoRut =  async (rut_paciente : string) : Promise<IChequeo> => {
        
        const response:IChequeo = await  apiAdapter.get(`${API}/chequeo-cardiovascular/${rut_paciente}`,10,0)
        return response;
    }

    const postUpdateChequeo = async (Chequeo : IChequeo,rut : string) => {
       
        
        const response = await  apiAdapter.put(`${API}/chequeo-cardiovascular/${rut}`,Chequeo);
        return response;


    }

    const postLikeChequeo = async (textoValue : string) => {
       
        const response:IChequeo[] = await  apiAdapter.post(`${API}/chequeo-cardiovascular/like-chequeo`,{textoValue});
        return response;
    }
    const postLikeChequeoUser = async (textoValue : string,user_email : string) => {
       
        const response:IChequeo[] = await  apiAdapter.post(`${API}/chequeo-cardiovascular/like-chequeo/user`,{
            textoValue,
            user_email
        });
        return response;
    }

    const getDeleteRut =  async (rut_paciente : string)  => {
        
        const response = await  apiAdapter.delete(`${API}/chequeo-cardiovascular/${rut_paciente}`)
        return response;
    }

    const postFilterCalendar = async (fecha_calendar : string,user_email : string) => {
       
        const response:IChequeo[] = await  apiAdapter.post(`${API}/chequeo-cardiovascular/filter-calendar`,{
            fecha_calendar,
            user_email
        });
        return response;
    }
   
    return { 
        getChequeo,
        postChequeoUser,
        postCreateChequeo,
        chequeoPDF,
        postUploadFile,
        getChequeoRut,
        postUpdateChequeo,
        postLikeChequeo,
        postLikeChequeoUser,
        getDeleteRut,
        postFilterCalendar
    };
    
}
