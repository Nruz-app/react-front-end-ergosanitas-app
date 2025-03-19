

import { lazy } from 'react'; //Carga Peresoza


const AppEstadisticasPages = lazy( ()=> import(/* webpackChunkName: "estadisticasPage" */'./AppEstadisticasPage'));


import { EstadisticasPage } from './EstadisticasCardPage';

import { ChartsPage } from './chartsPage';

export  { BarPresionPage } from './bar-presion-page';

export  { PieChartIMC } from './PieChart';


export { 
    AppEstadisticasPages,
    EstadisticasPage,
    ChartsPage
 };