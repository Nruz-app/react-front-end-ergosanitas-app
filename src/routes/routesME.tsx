import { LazyExoticComponent } from 'react';


import { AppChequeo } from '../Chequeo/pages';

type JSXComponent = () => JSX.Element;

interface Route {
    name      : string,
    to        : string,
    path      : string,
    perfil    : string,
    status    : boolean
    Component : LazyExoticComponent<JSXComponent> | JSXComponent
}

export const routesMe:Route[] = [
    {
        name      : 'Chequeos',
        to        : '/',
        path      : '/*',
        perfil    : 'Medicos',
        status    : true,  
        Component : AppChequeo
    }
]