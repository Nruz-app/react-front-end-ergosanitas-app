import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IChequeo, IElectroCardiograma } from '../interface';

export const  UseElectroCardiogranaService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
   
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const postCreateElectroCardiograma = async (electroCardiograma : IElectroCardiograma) => {
           
        const response = await  apiAdapter.post(`${API}/electro-cardiograma/save`,electroCardiograma);
        return response;
    }

    const getChequeoCardiovascular = async (id_paciente: number): Promise<IChequeo> => {
        const response: IChequeo = await apiAdapter.get(`${API}/chequeo-cardiovascular/${id_paciente}`, 10, 0);
        return response;
    }
    const userUpdateErgoPass = async (ergoPass : string) => {
        const response = await  apiAdapter.post(`${API}/user-first-ergo-pass`,ergoPass);
        return response;
    }
    return {
        postCreateElectroCardiograma,getChequeoCardiovascular,userUpdateErgoPass
    }
}