import { lazy } from 'react'; //Carga Peresoza

const AppPagosMedicosPage = lazy( ()=> import(/* webpackChunkName: "pagosMedicosPage" */'./pages/app-pagos-medicos'));

const AppHomeMedico = lazy( ()=> import(/* webpackChunkName: "homeMedicoPage" */'./pages/app-home-medico'));


export { 
    AppPagosMedicosPage,
    AppHomeMedico
 };