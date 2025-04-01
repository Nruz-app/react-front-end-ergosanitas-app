import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IChequeo,EstadoGenerales, ResponseCargaMasica } from '../interface';

import { type formData } from '../interface/';

export const  UseChequeoService = async () => {


    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();


    const chequeoPDFRut =  async (rut_paciente : string) => {
 
        window.location.href = `${API}/chequeo-cardiovascular/pdfRut/${rut_paciente}`; 
    }

    const chequeoPDF =  async (id_paciente : number) => {
 
        window.location.href = `${API}/chequeo-cardiovascular/pdf/${id_paciente}`; 
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

    const getChequeoRut =  async (id_paciente : number) : Promise<IChequeo> => {
        
        const response:IChequeo = await  apiAdapter.get(`${API}/chequeo-cardiovascular/${id_paciente}`,10,0)
        return response;
    }

    const postUpdateChequeo = async (Chequeo : IChequeo,id : number,user_email : string) => {
       
        console.log('Chequeo',Chequeo);
        console.log('user_email',Chequeo.user_email)
        const response = await  apiAdapter.put(`${API}/chequeo-cardiovascular/${id}/${user_email}`,Chequeo);
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
    const getDeleteById =  async (id : number)  => {
        
        const response = await  apiAdapter.delete(`${API}/chequeo-cardiovascular/${id}`)
        return response;
    }

    const postFilterCalendar = async (fecha_calendar : string,user_email : string) :Promise<IChequeo[]> => {
       
        const response:IChequeo[] = await  apiAdapter.post(`${API}/chequeo-cardiovascular/filter-calendar`,{
            fecha_calendar,
            user_email
        });
        return response;
    }

    const getEstadoGeneral =  async (user_email : string)  => {
        
        const response:EstadoGenerales = await  apiAdapter.get(`${API}/chequeo-cardiovascular/estado-general/${user_email}`,10,0)
        return response;
    }

    const postCargaMasiva = async(selectedFile : File,user_email : string) => {

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('user_email', user_email);

        const response = await  apiAdapter.post<ResponseCargaMasica>(`${API}/carga-masiva/excel`,uploadData);
        return response;
    }

    const postFilterClubDeportivo = async (user_email : string) :Promise<IChequeo[]> => {
       
        const response:IChequeo[] = await  apiAdapter.post(`
            ${API}/chequeo-cardiovascular/club-deportivo`,{user_email});
        return response;
    }
   
    return { 
        getChequeo,
        postChequeoUser,
        postCreateChequeo,
        chequeoPDFRut,
        chequeoPDF,
        postUploadFile,
        getChequeoRut,
        postUpdateChequeo,
        postLikeChequeo,
        postLikeChequeoUser,
        getDeleteRut,
        getDeleteById,
        postFilterCalendar,
        getEstadoGeneral,
        postCargaMasiva,
        postFilterClubDeportivo
    };
    
}
