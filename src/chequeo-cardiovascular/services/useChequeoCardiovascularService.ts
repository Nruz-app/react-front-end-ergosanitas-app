import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type { LikeTextState } from '../context';
import type {
    EstadoGenerales,
    IChequeo,
    IData,
    IDataAll,
    IUrlCertificado,
    ResponseCargaMasiva,
} from '../interface';

/**
 * Los 9 métodos que el perfil `Colegios` realmente usa, contra los mismos endpoints de siempre.
 *
 * De los 23 métodos de `UseChequeoService` no se portan los que este perfil no ve (ECG, GPT,
 * bioimpedancia, filtros de club) **ni los dos de borrado**: `Colegios` no borra hoy —
 * la papelera está detrás de `isAdmin`— así que no se pierde ninguna capacidad.
 */
export const UseChequeoCardiovascularService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /** Lista paginada del colegio. Sin el `console.log` que el módulo viejo dejaba en producción. */
    const postChequeoSearch = async (likeTextState: LikeTextState, user_email: string,
        limit: number = 20, page: number = 1): Promise<IData> => {

        const response: IData = await apiAdapter.post(
            `${API}/chequeo-cardiovascular/search-chequeo?limit=${limit}&page=${page}`,
            { ...likeTextState, user_email },
        );
        return response;
    };

    /** Listado completo sin paginar: es lo que alimenta la exportación a Excel. */
    const postChequeoAll = async (user_email: string): Promise<IChequeo[]> => {

        const response: IDataAll = await apiAdapter.post(
            `${API}/chequeo-cardiovascular/chequeo-all`, { user_email },
        );
        return response.data;
    };

    const getChequeoRut = async (id_paciente: number): Promise<IChequeo> => {

        const response: IChequeo = await apiAdapter.get(
            `${API}/chequeo-cardiovascular/${id_paciente}`, 10, 0,
        );
        return response;
    };

    const postCreateChequeo = async (chequeo: IChequeo) => {

        const response = await apiAdapter.post(`${API}/chequeo-cardiovascular`, chequeo);
        return response;
    };

    const postUpdateChequeo = async (chequeo: IChequeo, id: number, user_email: string) => {

        const response = await apiAdapter.put(
            `${API}/chequeo-cardiovascular/${id}/${user_email}`, chequeo,
        );
        return response;
    };

    // Los PDF se abren en pestaña nueva, no se descargan por axios: es el patrón de todo el repo.
    const chequeoPDF = async (id_paciente: number) => {

        window.open(
            `${API}/chequeo-cardiovascular/pdf/${id_paciente}`,
            '_blank',
            'noopener,noreferrer',
        );
    };

    const pathUrlCertificado = async (rut?: string, id_paciente?: number): Promise<IUrlCertificado> => {

        const response: IUrlCertificado = await apiAdapter.post(`${API}/certificado/path-url`, {
            rut_paciente : rut,
            id_paciente  : id_paciente,
        });
        return response;
    };

    const getEstadoGeneral = async (user_email: string): Promise<EstadoGenerales> => {

        const response: EstadoGenerales = await apiAdapter.get(
            `${API}/chequeo-cardiovascular/estado-general/${user_email}`, 10, 0,
        );
        return response;
    };

    const postCargaMasiva = async (selectedFile: File, user_email: string): Promise<ResponseCargaMasiva> => {

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('user_email', user_email);

        const response = await apiAdapter.post<ResponseCargaMasiva>(
            `${API}/carga-masiva/excel`, uploadData,
        );
        return response;
    };

    return {
        postChequeoSearch,
        postChequeoAll,
        getChequeoRut,
        postCreateChequeo,
        postUpdateChequeo,
        chequeoPDF,
        pathUrlCertificado,
        getEstadoGeneral,
        postCargaMasiva,
    };
};
