import { lazy } from 'react';

const AppChequeoCardiovascular = lazy(
    () => import(/* webpackChunkName: "chequeoCardiovascularPage" */ './AppChequeoCardiovascular'),
);

export { AppChequeoCardiovascular };
export { HomePage } from './HomePage';
export { ChequeoPage } from './ChequeoPage';
