
import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IServicios } from '../interface/serviio.interfaz';

export const  ServiciosService = async () => {
    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;    
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const getServicios =  async ()  => {
    
        const response:IServicios[] = await  apiAdapter.get(`${API}/servicios`,10,0)
        return response;
    }
    const getServicio =  async (nombre : string)  => {

        const response:IServicios = await  apiAdapter.get(`${API}/servicios/${nombre}`,10,0)
        return response;
    }

    return {
        getServicios,
        getServicio
    }

}