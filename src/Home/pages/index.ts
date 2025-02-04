import { lazy } from 'react'; //Carga Peresoza


const AppHomePage = lazy( ()=> import(/* webpackChunkName: "homePage" */'./AppHomePage'));


import { HomePage } from './HomePage';


export { 
    AppHomePage,
    HomePage
 };