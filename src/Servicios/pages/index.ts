import { lazy } from 'react'; //Carga Peresoza


import { ServiciosPage  } from './ServiciosPages';

const AppServiciosPage = lazy( ()=> import(/* webpackChunkName: "serviciosPage" */'./AppServiciosPage'));

export { 
    ServiciosPage,
    AppServiciosPage
 };