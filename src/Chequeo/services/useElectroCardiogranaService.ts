import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IElectroCardiograma } from '../interface';

export const  useElectroCardiogranaService = async () => {

    const API = import.meta.env.VITE_API;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    const postCreateElectroCardiograma = async (electroCardiograma : IElectroCardiograma) => {
           

        console.log('electroCardiograma',electroCardiograma);

        const response = await  apiAdapter.post(`${API}/electro-cardiograma/save`,electroCardiograma);
        
        return response;

    }

    return {
        postCreateElectroCardiograma
    }
}