import { LazyExoticComponent } from 'react';

import { AppChequeoCardiovascular } from '../chequeo-cardiovascular';

type JSXComponent = () => JSX.Element;

interface Route {
    name      : string,
    to        : string,
    path      : string,
    perfil    : string,
    status    : boolean
    Component : LazyExoticComponent<JSXComponent> | JSXComponent
}

/**
 * Rutas del perfil `Colegios`.
 *
 * `perfil` va con el literal `'Colegios'`, no con el comodín `'All'`: ese comodín solo lo
 * entiende `NavigationErgo`. `NavigationCol` compara el perfil inline, igual que `NavigationMe`
 * y `NavigationPA`, así que una entrada marcada `'All'` aquí no aparecería en el menú.
 */
export const routesCol: Route[] = [
    {
        name      : 'Chequeo Cardiovascular',
        to        : '/',
        path      : '/*',
        perfil    : 'Colegios',
        status    : true,
        Component : AppChequeoCardiovascular,
    },
];
