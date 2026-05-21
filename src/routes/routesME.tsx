import { LazyExoticComponent } from 'react';


import { AppChequeo } from '../Chequeo/pages';

import { AppHomeMedico } from '../pagos-mensual';

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
        name      : 'Home',
        to        : '/',
        path      : '/*',
        perfil    : 'Medicos',
        status    : true,  
        Component : AppHomeMedico
    },
    {
        name      : 'Chequeos',
        to        : '/chequeos',
        path      : '/chequeos/*',
        perfil    : 'Medicos',
        status    : true,  
        Component : AppChequeo
    }
]