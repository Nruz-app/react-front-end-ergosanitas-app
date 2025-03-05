import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';


import { ICertificadoUrl } from '../interface/certificado-url.interface';


export const  UseCertificadoService = async () => {

    const API = import.meta.env.VITE_API;
    
    const apiAdapter: HttpAdapter = new ApiAdapter();


    const getCertificadoRut =  async (rut_paciente : string)  => {

        const response:ICertificadoUrl = await  apiAdapter.get(`${API}/certificado/${rut_paciente}`,10,0)
        return response;
    }

    return { getCertificadoRut }
}