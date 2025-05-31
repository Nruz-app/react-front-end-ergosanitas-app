
import { lazy } from 'react'; //Carga Peresoza

import { default as EmergencyFlowStepper } from './components/emergency-fow-stepper';

import {  ListIncidenciasDeportivas } from './components/list-incidencias-deportivas';

import { IncidentesRecientes } from './components/incidentes-recientes';


const AppHomePage = lazy( ()=> import(/* webpackChunkName: "EmhomePage" */'./pages/home-page'));


export { 
    AppHomePage,
    EmergencyFlowStepper,
    ListIncidenciasDeportivas,
    IncidentesRecientes
};