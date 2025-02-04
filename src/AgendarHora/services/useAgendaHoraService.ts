import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IAgendaHora, IAgendaHoras, IServicios, IWebPay,WebPayRequest } from '../interface';

export const  UseAgendaHoraService = async () => {


    const API = import.meta.env.VITE_API;
    
    const apiAdapter: HttpAdapter = new ApiAdapter();
   

    const getServicios =  async ()  => {

        const response:IServicios[] = await  apiAdapter.get(`${API}/servicios`,10,0)
        return response;
    }
    const getServicio =  async (nombre : string)  => {

        const response:IServicios = await  apiAdapter.get(`${API}/servicios/${nombre}`,10,0)
        return response;
    }

    const getAgendaHora =  async () : Promise<IAgendaHoras[]> => {

        const response:IAgendaHoras[] = await  apiAdapter.get(`${API}/agenda-horas`,10,0)
        return response;
    }

    const postAgendaHora = async (agendaHora : IAgendaHora) => {

        const response:IAgendaHoras = await  apiAdapter.post(`${API}/agenda-horas`,agendaHora);
        return response;
    }

    const postEmailReservaHora = async (rut_paciente : String) => {

        const response = await  apiAdapter.post(`${API}/email/reserva-hora`,{
            rut_paciente
        });
        return response;
    }

    const postLikeServicios = async (textoValue : string) : Promise<IServicios[]>=> {
           
            const response:IServicios[] = await  apiAdapter.post(`${API}/servicios/like`,{textoValue});
            return response;
    }

    const postWebPayRequest = async (webPayRequest : WebPayRequest) => {

        const response:IWebPay = await  apiAdapter.post(`${API}/transbank/web-pay-request`,webPayRequest);
        
        const tokenWs = response.token;
        const url = response.url;

        // Crear un formulario dinámico
        const form = document.createElement('form') as HTMLFormElement;
        form.method = 'POST';
        form.action = url;

        // Crear un campo hidden para el token_ws
        const input = document.createElement('input') as HTMLInputElement;
        input.type = 'hidden';
        input.name = 'token_ws';
        input.value = tokenWs || ''; // Si tokenWs es undefined, asigna una cadena vacía

        // Añadir el campo al formulario y enviarlo
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        
    }


    return { 
        getServicios,
        getServicio,
        getAgendaHora,
        postAgendaHora,
        postWebPayRequest,
        postEmailReservaHora,
        postLikeServicios
     };    
}
