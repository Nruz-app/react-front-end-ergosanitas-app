import { lazy } from 'react';


const AppAsistenteVozPage = lazy( ()=> import(/* webpackChunkName: "asistenteVozPage" */'./pages/app-asistente-voz'));

export {
    AppAsistenteVozPage 
}