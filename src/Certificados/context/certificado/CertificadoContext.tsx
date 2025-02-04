import { createContext } from 'react';
import { CertificadoState } from './CertificadoProvider';

export interface CertificadoContext {
    isValidRut : boolean;
    banner     : boolean;
    completed  : number;
    rutUser    : string;
    url_pdf    : string;
    name_pdf   : string; 
    titulo     : string; 
    onSetCertificado : (certificadoState:CertificadoState) => void;
}

export const CertificadoContext = createContext<CertificadoContext>({} as CertificadoContext);