import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IAgendaMensual } from '../interfaces/agenda-mensual';
//import { IAgendaHora, IAgendaHoras } from '../interface';

export const  AgendaService = async () => {
    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
    
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const postReservaHoras= async (agendaHora : any) => {

        const response:any = await  apiAdapter.post(`${API}/agenda-horas`,agendaHora);
        return response;
    }
    const postAgendamensual = async (periodo : string) => {
        const response:IAgendaMensual[] = await  apiAdapter.post(`${API}/estadisticas/agenda-mensual`,
            {"periodo": periodo});
        return response;
    }

    return { postReservaHoras, postAgendamensual};    
}
