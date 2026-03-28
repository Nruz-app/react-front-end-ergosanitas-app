import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
//import { IAgendaHora, IAgendaHoras } from '../interface';

export const  AgendaService = async () => {


    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
    
    
    const apiAdapter: HttpAdapter = new ApiAdapter();


    const postReservaHoras= async (agendaHora : any) => {

        const response:any = await  apiAdapter.post(`${API}/agenda-horas`,agendaHora);
        return response;
    }

    return { postReservaHoras};    
}
