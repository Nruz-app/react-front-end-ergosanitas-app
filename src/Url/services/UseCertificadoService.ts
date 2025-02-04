
import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';

import { ICertificado,} from '../interface/ICertificado';

export const  UseCertificadoService = async () => {

    const API = import.meta.env.VITE_API;
    
    const apiAdapter: HttpAdapter = new ApiAdapter();


    const postCerticadoSave= async (selectedFile : File,certificado : ICertificado) => {

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('rut_paciente', certificado.rut_paciente);
        uploadData.append('nombre_paciente', certificado.nombre_paciente);

        const response = await  apiAdapter.post(`${API}/certificado/save-url`,uploadData);
        return response;
    }

    return { postCerticadoSave } 
}