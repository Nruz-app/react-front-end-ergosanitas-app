import { lazy } from 'react'; //Carga Peresoza

const AppAsistenteVirtualPage = lazy( ()=> import(/* webpackChunkName: "asistenteVirtualPage" */'./AppAsistenteVirtualPage'));

export { 
    AppAsistenteVirtualPage
 };