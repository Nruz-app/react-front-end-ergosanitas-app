import { HomeErgoPage } from './HomeErgoPage';

/**
 * Envoltorio de la portada, siguiendo el patrón `AppXPage` del resto del proyecto.
 *
 * Es el componente que `src/routes/routes.ts` carga con `lazy()`. Existe como capa
 * separada para que, si algún día el Home necesita un provider propio, se monte aquí sin
 * tocar ni la página ni las rutas.
 */
export const AppHomeErgoPage = () => {
    return (
        <HomeErgoPage />
    );
};

export default AppHomeErgoPage;
