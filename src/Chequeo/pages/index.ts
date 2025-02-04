import { lazy } from 'react'; //Carga Peresoza


const AppChequeo = lazy( ()=> import(/* webpackChunkName: "chequeoPage" */'./AppChequeo'));



export { 
    AppChequeo
 };