import { LazyExoticComponent } from 'react';


import { AppHomePage } from '../EmergenciaDeportivas/';

type JSXComponent = () => JSX.Element;

interface Route {
    name      : string,
    to        : string,
    path      : string,
    perfil    : string,
    status    : boolean
    Component : LazyExoticComponent<JSXComponent> | JSXComponent
}

export const routesED:Route[] = [
    {
        name      : 'Home',
        to        : '/',
        path      : '/*',
        perfil    : 'All',
        status    : true,  
        Component : AppHomePage
    }
]