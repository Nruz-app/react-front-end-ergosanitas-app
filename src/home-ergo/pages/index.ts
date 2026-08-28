import { lazy } from 'react'; // Carga perezosa

// La portada entra por `lazy()` igual que el resto de páginas del proyecto: el bundle
// del Home no se descarga hasta que alguien visita `/`.
const AppHomeErgoPage = lazy( () => import(/* webpackChunkName: "homeErgoPage" */'./AppHomeErgoPage') );

import { HomeErgoPage } from './HomeErgoPage';

export {
    AppHomeErgoPage,
    HomeErgoPage
};
