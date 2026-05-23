import { lazy } from 'react'; //Carga Peresoza

const AppElectrocardiogramaPage = lazy( ()=> import(/* webpackChunkName: "electrocardiogramaPage" */'./electrocardiogramaPage') );

export { AppElectrocardiogramaPage }
