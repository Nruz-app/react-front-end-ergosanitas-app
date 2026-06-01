
import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
//import { IChequeo } from '../interface/chequeo.interface';


export const  AsistenteVozService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;    
    const apiAdapter: HttpAdapter = new ApiAdapter();


    const postAsistenteVoz = async (prompt : any) => {
    
        const response:any = await  apiAdapter.post(`${API}/GPT/asistente-voz`,prompt);
        return response.data;
    }

    return {
        postAsistenteVoz
    }
}