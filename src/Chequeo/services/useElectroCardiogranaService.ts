import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IElectroCardiograma } from '../interface';

export const  UseElectroCardiogranaService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
   
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const postCreateElectroCardiograma = async (electroCardiograma : IElectroCardiograma) => {
           
        const response = await  apiAdapter.post(`${API}/electro-cardiograma/save`,electroCardiograma);
        
        return response;

    }

    return {
        postCreateElectroCardiograma
    }
}