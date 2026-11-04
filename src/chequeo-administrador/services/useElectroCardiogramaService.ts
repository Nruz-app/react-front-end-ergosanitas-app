import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type { IElectroCardiograma } from '../interface';

/**
 * Guardado de la revisión médica (ECG).
 *
 * No se clonan `getChequeoCardiovascular`, que duplica `getChequeoRut` contra el mismo
 * endpoint, ni `userUpdateErgoPass`: la validación por Ergo Pass solo se activa para `Medicos`.
 */
export const UseElectroCardiogramaService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    const postCreateElectroCardiograma = async (electroCardiograma: IElectroCardiograma) => {

        const response = await apiAdapter.post(`${API}/electro-cardiograma/save`, electroCardiograma);
        return response;
    };

    return { postCreateElectroCardiograma };
};
