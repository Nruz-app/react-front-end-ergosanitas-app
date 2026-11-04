import { lazy } from 'react';

/*
 * Solo la página lazy. `FichaChequeoPage` no se reexporta aquí a propósito: el ruteo importa de
 * este archivo, y cualquier export estático arrastraría el módulo entero al bundle principal,
 * deshaciendo el `lazy`.
 */
const AppChequeoAdministrador = lazy(
    () => import(/* webpackChunkName: "chequeoAdministradorPage" */ './AppChequeoAdministrador'),
);

export { AppChequeoAdministrador };
