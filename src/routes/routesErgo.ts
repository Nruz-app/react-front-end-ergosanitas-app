import { LazyExoticComponent } from 'react';


import { AppChequeo } from '../Chequeo/pages';
import { AppAgendarHoraPage } from '../AgendarHora/pages/';

import { AppUrlPage } from '../Url/page';

import { AppEstadisticasPages } from '../Estadisticas/pages';

type JSXComponent = () => JSX.Element;

interface Route {
    name      : string,
    to        : string,
    path      : string,
    perfil    : string,
    status    : boolean
    Component : LazyExoticComponent<JSXComponent> | JSXComponent
}

export const routesErgo:Route[] = [
    {
        name      : 'Chequeos',
        to        : '/',
        path      : '/*',
        perfil    : 'Testing',
        status    : true,  
        Component : AppChequeo
    },
    {
        name      : 'Reservas',
        to        : '/agendarHora',
        path      : '/agendarHora/*',
        perfil    : 'All', 
        status    : true,  
        Component : AppAgendarHoraPage
    },
    {
        name      : 'Certifiado',
        to        : '/certificado',
        path      : '/certificado/:rut_paciente_path',
        perfil    : 'All', 
        status    : false,  
        Component : AppUrlPage
    },
    {
        name      : 'Estadisticas',
        to        : '/Estadisticas',
        path      : '/estadisticas/*',
        perfil    : 'All', 
        status    : true,  
        Component : AppEstadisticasPages
    }
]