
//import listCertificadoJson from '../config/list-certificados.json';
import { UseCertificadoService } from '../services/useCertificadoService';

export const GetUrlPdf = async (rutUser: string)  => {
    
    //const result = listCertificadoJson.find(({ rutUser }) => rutUser === rut);
    //return result!;

    const {  getCertificadoRut } = await UseCertificadoService();


    const {url_pdf,name_pdf,titulo}  = await getCertificadoRut(rutUser);

    
    return {
        url_pdf,
        name_pdf,
        titulo
    };
}