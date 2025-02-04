import { lazy } from 'react'; //Carga Peresoza


const AppUrlPage = lazy( ()=> import(/* webpackChunkName: "chequeoPage" */'./AppUrlPage'));



export { 
    AppUrlPage
 };