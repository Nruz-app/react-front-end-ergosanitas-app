import { lazy } from 'react'; //Carga Peresoza

// Solo se exporta la entrada lazy: re-exportar CertificadoPage de forma estática la metería
// en el bundle principal y anularía el lazy (routes.ts solo usa AppCertificadoPage).
const AppCertificadoPage = lazy( ()=> import(/* webpackChunkName: "certificadoPage" */'./AppCerteficadoPage'));

export {
    AppCertificadoPage
 };
