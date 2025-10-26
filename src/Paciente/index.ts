

import { lazy } from 'react'; 


const AppPacientePages = lazy( ()=> import(/* webpackChunkName: "pacientePage" */'./pages/app-pacientes'));

export { AppPacientePages };