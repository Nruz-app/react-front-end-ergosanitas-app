import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type { IEstadistica, IEstadisticaPresion } from '../interface';

/**
 * Las series del Home que vienen del backend, clonadas de `src/Estadisticas/services/` para que
 * el módulo no dependa de otro módulo de feature. Se filtran por `user_email`, la clave del
 * colegio.
 *
 * ⚠️ Eran cuatro. **`getEstadisticaSaturacion` se retiró**: su endpoint devuelve HTTP 500 desde
 * que existe el módulo (`Call to undefined method
 * ChequeoCardiovascular::SP_estadistica_saturacion()`) y el dato ya venía en `saturacionOxigeno`
 * de `chequeo-all`, así que la saturación se deriva en el front con `resumirPorSaturacion`. Si
 * el backend lo arregla algún día, volver a él es una decisión aparte.
 */
export const UseEstadisticasService = () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    const getEstadisticaIMC = async (user_email: string): Promise<IEstadistica> => {

        const response: IEstadistica = await apiAdapter.get(
            `${API}/estadisticas/estadistica-imc/${user_email}`, 10, 0,
        );
        return response;
    };

    const getEstadisticaPresion = async (user_email: string): Promise<IEstadisticaPresion> => {

        const response: IEstadisticaPresion = await apiAdapter.get(
            `${API}/estadisticas/estadistica-presion/${user_email}`, 10, 0,
        );
        return response;
    };

    const getEstadisticaHemoglucotest = async (user_email: string): Promise<IEstadistica> => {

        const response: IEstadistica = await apiAdapter.get(
            `${API}/estadisticas/estadistica-hemoglucotest/${user_email}`, 10, 0,
        );
        return response;
    };

    return {
        getEstadisticaIMC,
        getEstadisticaPresion,
        getEstadisticaHemoglucotest,
    };
};
