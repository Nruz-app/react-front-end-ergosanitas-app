import Swal from 'sweetalert2';
//import listCertificadoJson from '../config/list-certificados.json';
import { UseCertificadoService } from '../services/useCertificadoService';

export const GetUrlPdf = async (rutUser: string)  => {
    
    //const result = listCertificadoJson.find(({ rutUser }) => rutUser === rut);
    //return result!;

    const {  getCertificadoExiste,getCertificadoRut } = await UseCertificadoService();

    const {status,mensaje}  = await getCertificadoExiste(rutUser);

    if(status == 200) {
        const {url_pdf,name_pdf,titulo}  = await getCertificadoRut(rutUser);

        return {
            url_pdf,
            name_pdf,
            titulo,
            isValidRut: true
        };
    }
    else {

        Swal.fire({
            icon: 'error',  
            title: 'Validar Certificado',
            text: mensaje
        });


        return {
            url_pdf : '',
            name_pdf : '',
            titulo : '',
            isValidRut : false
        };
    } 


}