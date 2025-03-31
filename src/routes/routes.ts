import { LazyExoticComponent } from 'react';


import { HomePage } from '../Home/pages';
import { AppCertificadoPage } from '../Certificados/pages/';
import { AppAgendarHoraPage } from '../AgendarHora/pages/';
import { AppAsistenteVirtualPage } from '../AsistenteVirtual/pages';
import { MapsPage } from '../Maps/pages';
//import { AppServiciosPage } from '../Servicios/pages';


type JSXComponent = () => JSX.Element;

interface Route {
    name      : string,
    to        : string,
    path      : string,
    Component : LazyExoticComponent<JSXComponent> | JSXComponent
}


export const routes:Route[] = [
    {
        name      : 'Home',
        to        : '/',
        path      : '/*',
        Component : HomePage
    },
    {
        name      : 'Certificados',
        to        : '/certificados',
        path      : '/certificados/*',
        Component : AppCertificadoPage
    },
    {
        name      : 'Agendar',
        to        : '/agendarHora',
        path      : '/agendarHora/*',
        Component : AppAgendarHoraPage
    },
    {
        name      : 'Asistente',
        to        : '/asistenteVirtual',
        path      : '/asistenteVirtual/*',
        Component : AppAsistenteVirtualPage
    },
    {
        name      : 'Mapas',
        to        : '/maps',
        path      : '/maps/*',
        Component : MapsPage
    }
]
/*
export const routes:Route[] = [
    {
        name      : 'Servicios',
        to        : '/servicios',
        path      : '/servicios/*',
        Component : AppServiciosPage
    }
]
*/