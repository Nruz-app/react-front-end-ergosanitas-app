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

export const routesDe:Route[] = [
    {
        name      : 'Chequeos',
        to        : '/',
        path      : '/*',
        perfil    : 'Testing',
        status    : true,  
        Component : AppChequeo
    }
]