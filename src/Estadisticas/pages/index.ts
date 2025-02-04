

import { lazy } from 'react'; //Carga Peresoza


const AppEstadisticasPages = lazy( ()=> import(/* webpackChunkName: "estadisticasPage" */'./AppEstadisticasPage'));


import { EstadisticasPage } from './EstadisticasCardPage';

import { ChartsPage } from './chartsPage';


export { 
    AppEstadisticasPages,
    EstadisticasPage,
    ChartsPage
 };