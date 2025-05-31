import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IIncidentes } from '../interface/incidentes.interface';

export const  UseIncidentesService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;    
    const apiAdapter: HttpAdapter = new ApiAdapter();
       
    
    const postIncidentesCreate =  async (incidentes : IIncidentes)  => {

        const response:{status : string,message:string,data:number} = 
            await  apiAdapter.post(`${API}/incidencia-deportivos/create`,incidentes);
        return response;
    }

    const getIncidentesFindByUser =  async (user_email : string)  => {

        const response:{status : string,message:string,data:IIncidentes[]} = await  apiAdapter.get(`${API}/incidencia-deportivos/find-by-user/${user_email}`,10,0)    
        return response.data
    }

    return { 
        postIncidentesCreate,
        getIncidentesFindByUser
    }
}