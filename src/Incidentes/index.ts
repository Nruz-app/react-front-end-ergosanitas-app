
import { lazy } from 'react'; //Carga Peresoza


const AppIncidentesPages = lazy( ()=> import(/* webpackChunkName: "estadisticasPage" */'./pages/app-incidentes'));

import { IncidentesForm } from './pages/incidentes-form';

import { UseIncidentesService } from './services/use-incidentes.service';

export { AppIncidentesPages,IncidentesForm,UseIncidentesService };