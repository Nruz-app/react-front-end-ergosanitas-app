import { lazy } from 'react'; //Carga Peresoza

const AppPagosMedicosPage = lazy( ()=> import(/* webpackChunkName: "pagosMedicosPage" */'./pages/app-pagos-medicos'));

export { 
    AppPagosMedicosPage
 };