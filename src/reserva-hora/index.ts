import { lazy } from 'react';

const AppReservaHora = lazy( ()=> import(/* webpackChunkName: "reserva-hora" */'./pages/reserva-hora'));

export { AppReservaHora }