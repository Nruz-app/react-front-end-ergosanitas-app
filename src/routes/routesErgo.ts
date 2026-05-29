import { LazyExoticComponent } from 'react';


import { AppChequeo } from '../Chequeo/pages';
//import { AppAgendarHoraPage } from '../AgendarHora/pages/';
import { AppReservaHora } from '../reserva-hora';

import { AppUrlPage } from '../Url/page';

import { AppIncidentesPages } from '../Incidentes/';

import { AppPagosMedicosPage } from '../pagos-mensual';
import { AppHomeMedico } from '../pagos-mensual';

type JSXComponent = () => JSX.Element;

interface RouteChild {
    name      : string,
    to        : string,
    path      : string,
    Component : LazyExoticComponent<JSXComponent> | JSXComponent
}

interface Route {
    name      : string,
    to        : string,
    path      : string,
    perfil    : string,
    status    : boolean,
    Component?: LazyExoticComponent<JSXComponent> | JSXComponent,
    children? : RouteChild[]
}

export const routesErgo:Route[] = [
    {
        name      : 'Chequeos',
        to        : '/',
        path      : '/*',
        perfil    : 'Administrador',
        status    : true,  
        Component : AppChequeo
    },
    {
        name      : 'Certifiado',
        to        : '/certificado',
        path      : '/certificado/:rut_paciente/:id_paciente',
        perfil    : 'Administrador', 
        status    : false,  
        Component : AppUrlPage
    },
    {
        name      : 'Incidentes',
        to        : '/Incidentes',
        path      : '/incidentes/*',
        perfil    : 'Administrador', 
        status    : true,  
        Component : AppIncidentesPages
    },
    {
        name      : 'Agenda Mensual',
        to        : '/reserva-hora',
        path      : '/reserva-hora/*',
        perfil    : 'Administrador',
        status    : true,  
        Component : AppReservaHora
    },
    {
    name      : 'Pagos Mensual',
    to        : '/pagos-mensual',
    path      : '/pagos-mensual/*',
    perfil    : 'Administrador',
    status    : true,
    children  : [
            {
                name      : 'Resumen Mensual',
                to        : 'resumen',
                path      : 'resumen',
                Component : AppPagosMedicosPage
            },
            {
                name      : 'Resumen Mensual MDC',
                to        : 'resumenMDC',
                path      : 'resumenMDC',
                Component : AppHomeMedico
            }
        ]
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