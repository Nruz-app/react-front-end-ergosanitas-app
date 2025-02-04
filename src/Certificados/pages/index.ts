import { lazy } from 'react'; //Carga Peresoza


import { CertificadoPage  } from './CertificadoPage';

const AppCertificadoPage = lazy( ()=> import(/* webpackChunkName: "certificadoPage" */'./AppCerteficadoPage'));

export { 
    CertificadoPage,
    AppCertificadoPage
 };