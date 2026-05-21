import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';
import { IPagoMedicoMDC } from '../interface/pago-medico-mdc';
import { PagoMedico } from '../interface/pago-medicos';



export const  PagoMensualService = async () => {
     
    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;
    const apiAdapter: HttpAdapter = new ApiAdapter();

    const getEstadisticaPagoMensual =  async () : Promise<PagoMedico[]> => {

        const response:PagoMedico[] = await  apiAdapter.get(`${API}/estadisticas/estadistica-pago-mensual`,10,0)
        return response;
    }

    const postPagoMensual = async (user_email : string,valor_ecg : string, periodo: string) => {
           
        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, '0');
        const periodoCompleto = `${periodo}-${dia}`; 
        const response = await  apiAdapter.post(`
            ${API}/estadisticas/pago-mensual`,{
                user_email, 
                valor_ecg, 
                periodo:periodoCompleto,
                modo : "SET" 
            });
        return response;
    }
    const deletePagoMensual = async (user_email : string, periodo: string) => {
           
        const dia = "01"; 
        const periodoCompleto = `${periodo}-${dia}`;
        const response = await  apiAdapter.post(`
            ${API}/estadisticas/delete-pago-mensual`,{user_email, periodo: periodoCompleto });
        return response;
    }

    const getEstadisticaPagoMensualMDC =  async () : Promise<IPagoMedicoMDC[]> => {
        const response:IPagoMedicoMDC[] = await  apiAdapter.get(`${API}/estadisticas/estadistica-pago-mdc`,10,0)
        console.log(response);
        return response;
    }

    return { 
        getEstadisticaPagoMensual,
        postPagoMensual,
        deletePagoMensual,
        getEstadisticaPagoMensualMDC
    }

}