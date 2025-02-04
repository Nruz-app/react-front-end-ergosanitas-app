import { useReducer } from "react";
import { CertificadoReducer } from "./certificadoReducer";
import { CertificadoContext } from "./CertificadoContext";

export interface CertificadoState {
    isValidRut : boolean;
    banner     : boolean;
    completed  : number;
    rutUser    : string;
    url_pdf    : string;
    name_pdf   : string;
    titulo     : string; 
}
  
const INITIAL_STATE: CertificadoState = {
    isValidRut : false,
    banner     : false,
    completed  : 20,
    rutUser    : '',
    url_pdf    : '',
    name_pdf   : '',
    titulo     : '', 
}

interface Props {
    children: JSX.Element | JSX.Element[]
}


export const CertificadoProvider = ( { children } : Props ) => {

    const [state,dispatch] = useReducer (CertificadoReducer,INITIAL_STATE);

    const onSetCertificado = ( certificadoState : CertificadoState )   => {

        dispatch({ type: 'onSetCertificado', payload: certificadoState });
        
    }

    return (
        <CertificadoContext.Provider value = { {
            ...state,
            onSetCertificado 
         } } 
        >
            { children }
        </CertificadoContext.Provider>
    )

}