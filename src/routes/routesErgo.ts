import { LazyExoticComponent } from 'react';


import { AppChequeo } from '../Chequeo/pages';
//import { AppAgendarHoraPage } from '../AgendarHora/pages/';
import { AppReservaHora } from '../reserva-hora';

import { AppUrlPage } from '../Url/page';

import { AppIncidentesPages } from '../Incidentes/';

import { AppPagosMedicosPage } from '../pagos-mensual';


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
        name      : 'Certifiado',
        to        : '/certificado',
        path      : '/certificado/:rut_paciente/:id_paciente',
        perfil    : 'All', 
        status    : false,  
        Component : AppUrlPage
    },
    {
        name      : 'Incidentes',
        to        : '/Incidentes',
        path      : '/incidentes/*',
        perfil    : 'All', 
        status    : true,  
        Component : AppIncidentesPages
    },
    {
        name      : 'Agenda Mensual',
        to        : '/reserva-hora',
        path      : '/reserva-hora/*',
        perfil    : 'All',
        status    : true,  
        Component : AppReservaHora
    },
    {
        name      : 'Pagos Mensual',
        to        : '/pagos-mensual',
        path      : '/pagos-mensual/*',
        perfil    : 'All',
        status    : true,  
        Component : AppPagosMedicosPage
    }
]
/*
{
        name      : 'Reservas',
        to        : '/agendarHora',
        path      : '/agendarHora/*',
        perfil    : 'All', 
        status    : true,  
        Component : AppAgendarHoraPage
    }
*/