
import { IAgendaHora } from '../interface/agenda-hora.interfaz';
import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IServicios } from '../interface/servicios.interfaz';
import { IWebPay, WebPayRequest } from '../interface/web-pay.interface';
import { ApiResponse } from '../interface/api-response';

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

    const postAgendaHora = async (agendaHora : IAgendaHora) => {
    
        const response: ApiResponse<IAgendaHora> = await  apiAdapter.post<ApiResponse<IAgendaHora>>(`${API}/agenda-horas`,agendaHora);
        return response;
    }

    const postWebPayRequest = async (webPayRequest : WebPayRequest) => {
        console.log('webPayRequest',webPayRequest);    
        const response:IWebPay = await  apiAdapter.post(`${API}/transbank/web-pay-request`,webPayRequest);
        console.log('response postWebPayRequest',response);
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

    const postEmailReservaHora = async (rut_paciente : string) => {

        const response = await  apiAdapter.post(`${API}/email/reserva-hora`,{rut_paciente});
        return response;
    }

    return {
        getServicios,
        getServicio,
        postAgendaHora,
        postWebPayRequest,
        postEmailReservaHora
    }

}