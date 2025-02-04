import { CertificadoState } from "./CertificadoProvider";


type CertificadoAction = 
 | { type : 'onSetCertificado', payload: CertificadoState }  

 
export const CertificadoReducer = ( state: CertificadoState, action: CertificadoAction ) : CertificadoState  => {    
    const {isValidRut,banner,completed,rutUser,url_pdf,name_pdf,titulo} = action.payload;

    switch ( action.type ) {

        case  'onSetCertificado': 
            return {
                ...state,
                isValidRut,
                banner,
                completed,
                rutUser,
                url_pdf,
                name_pdf,
                titulo
            }
            
        default:
            return state;           
    }

}