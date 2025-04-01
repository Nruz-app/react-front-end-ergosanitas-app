import { ApiAdapter, HttpAdapter } from "../../common/api/api.adapter";
import { IEstadisticaIMC,IEstadisticaPresion } from "../interface";


export const UseEstadisticasService = () => {
  
    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
        
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const getEstadisticaIMC =  async (user_email : string)  => {
    
        const response:IEstadisticaIMC = await  apiAdapter.get(`${API}/estadisticas/estadistica-imc/${user_email}`,10,0)
        return response;
    }

    const getEstadisticaPresion =  async (user_email : string)  : Promise<IEstadisticaPresion> => {
    
        const response:IEstadisticaPresion = await  apiAdapter.get(`${API}/estadisticas/estadistica-presion/${user_email}`,10,0)
        return response;
    }

    return {
        getEstadisticaIMC,
        getEstadisticaPresion
    }
}
