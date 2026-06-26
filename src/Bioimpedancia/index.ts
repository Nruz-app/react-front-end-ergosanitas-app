
import { lazy } from 'react'; //Carga Peresoza

const HomeBioimpedancia = lazy( ()=> import(/* webpackChunkName: "HomeBioimpedancia" */'./pages/home-bioimpefancia'));

export { HomeBioimpedancia };