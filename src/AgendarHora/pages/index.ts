import { lazy } from 'react'; //Carga Peresoza


import { AgendaHoraPage  } from './AgendarHora';

const AppAgendarHoraPage = lazy( ()=> import(/* webpackChunkName: "agendarHoraPage" */'./AppAgendarHoraPage'));

export { 
    AgendaHoraPage,
    AppAgendarHoraPage
 };