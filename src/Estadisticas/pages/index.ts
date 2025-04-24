

import { lazy } from 'react'; //Carga Peresoza


const AppEstadisticasPages = lazy( ()=> import(/* webpackChunkName: "estadisticasPage" */'./AppEstadisticasPage'));


import { EstadisticasPage } from './EstadisticasCardPage';

import { ChartsPage } from './chartsPage';

export  { BarPresionPage } from './bar-presion-page';

import { PieChartIMC } from './pie-chart-IMC';

import  { PieChartHemoglucotest } from './pie-chart-hemoglucotest';

import  { PieChartSaturacion } from './pie-chart-saturacion';

export { 
    AppEstadisticasPages,
    EstadisticasPage,
    ChartsPage,
    PieChartIMC,
    PieChartHemoglucotest,
    PieChartSaturacion
 };