import { lazy } from 'react';

// Página principal del módulo (ficha clínica), cargada de forma lazy.
const AppPacientePages = lazy(
    () => import(/* webpackChunkName: "pacientePage" */ './pages/app-pacientes'),
);

export { AppPacientePages };

// Reexports del módulo
export * from './interface';
export * from './components';
export * from './utilities';
export { UsePacienteService } from './services';
