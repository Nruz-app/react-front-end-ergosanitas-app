import { LazyExoticComponent } from 'react';

import { AppPacientePages } from '../Paciente/';

type JSXComponent = () => JSX.Element;

interface Route {
    name      : string,
    to        : string,
    path      : string,
    perfil    : string,
    status    : boolean
    Component : LazyExoticComponent<JSXComponent> | JSXComponent
}

export const routesPA:Route[] = [
    {
        name      : 'Home',
        to        : '/',
        path      : '/*',
        perfil    : 'All', 
        status    : true,  
        Component : AppPacientePages
    }
]