import { LazyExoticComponent } from 'react';

import { AppHomeErgoPage } from '../home-ergo/pages';
import { AppCertificadoPage } from '../Certificados/pages/';
import { AppAgendarHoraPage } from '../AgendarHora/pages/';
// Flujo anterior de /servicios: se conserva intacto como vía de reversa (basta descomentar y
// volver a usar AppServiciosPage abajo). Spec 01 de servicio-cart-flow.
// import { AppServiciosPage } from '../Servicios/pages';
import { AppServicioCartFlowPage } from '../servicio-cart-flow';

type JSXComponent = () => JSX.Element;

interface Route {
    name      : string,
    to        : string,
    path      : string,
    Component : LazyExoticComponent<JSXComponent> | JSXComponent
}

export const routes: Route[] = [

    {
        name      : 'Home',
        to        : '/',
        path      : '/',
        Component : AppHomeErgoPage
    },

    {
        name      : 'Agendar',
        to        : '/agendarHora',
        path      : '/agendarHora/*',
        Component : AppAgendarHoraPage
    },

    {
        name      : 'Certificados',
        to        : '/certificados',
        path      : '/certificados/*',
        Component : AppCertificadoPage
    },

    {
        name      : 'Servicios',
        to        : '/servicios',
        path      : '/servicios/*',
        // Component : AppServiciosPage
        Component : AppServicioCartFlowPage
    }

];