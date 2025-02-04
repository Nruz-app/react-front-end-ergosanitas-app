
import listCertificadoJson from '../config/list-certificados.json';


export const ValidaExisteRut = (rut: string): boolean => {

    return listCertificadoJson.some( ( { rutUser } ) => rutUser ===  rut);

}