import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type {
    FormDataChequeo,
    ICargaMasivaEcg,
    IChequeo,
    IData,
    IDataAll,
    IFiltrosBusqueda,
    IRespuestaAnalisisEcg,
    IUrlCertificado,
    ResponseCargaMasiva,
} from '../interface';

/**
 * Los 11 métodos de chequeo que usa el perfil `Administrador` (endpoints 1-8 y 10-12 de §3.5).
 *
 * De los 23 de `UseChequeoService` se dejan fuera los que este perfil no ve. Del borrado se
 * porta **solo `getDeleteById`** (D2): `getDeleteRut` pegaba un RUT a la misma ruta que espera
 * un id, y su ruta propia está comentada en el back.
 */
export const UseChequeoAdministradorService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /** Lista paginada. Sin el `console.log` del cuerpo que el módulo viejo dejaba en producción. */
    const postChequeoSearch = async (filtros: IFiltrosBusqueda, user_email: string,
        limit: number = 20, page: number = 1): Promise<IData> => {

        const response: IData = await apiAdapter.post(
            `${API}/chequeo-cardiovascular/search-chequeo?limit=${limit}&page=${page}`,
            { ...filtros, user_email },
        );
        return response;
    };

    /** Listado completo sin paginar: alimenta «Exportar». */
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

    /** El único borrado del módulo. Quien lo llame tiene que haber pedido confirmación antes. */
    const getDeleteById = async (id: number) => {

        const response = await apiAdapter.delete(`${API}/chequeo-cardiovascular/${id}`);
        return response;
    };

    const pathUrlCertificado = async (rut?: string, id_paciente?: number): Promise<IUrlCertificado> => {

        const response: IUrlCertificado = await apiAdapter.post(`${API}/certificado/path-url`, {
            rut_paciente : rut,
            id_paciente  : id_paciente,
        });
        return response;
    };

    /** El nombre no lo delata: sube un ECG y devuelve el informe de `GPT/analisis-ecg`. */
    const postUploadFile = async (selectedFile: File, formData: FormDataChequeo): Promise<IRespuestaAnalisisEcg> => {

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('rut', formData.rut);
        uploadData.append('nombre', formData.nombre);

        const response = await apiAdapter.post<IRespuestaAnalisisEcg>(
            `${API}/GPT/analisis-ecg`, uploadData,
        );
        return response;
    };

    /**
     * ⚠️ Las filas quedan asignadas al `user_email` que se pase, que hoy es el del propio
     * Administrador, no el de un club. Es el comportamiento actual (riesgo R5 de la spec).
     */
    const postCargaMasiva = async (selectedFile: File, user_email: string): Promise<ResponseCargaMasiva> => {

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('user_email', user_email);

        const response = await apiAdapter.post<ResponseCargaMasiva>(
            `${API}/carga-masiva/excel`, uploadData,
        );
        return response;
    };

    /** `formData` llega con los `files[]`; aquí solo se le agrega el médico derivado. */
    const cargaMasivaECG = async (derivado_medico: string, formData: FormData): Promise<ICargaMasivaEcg> => {

        formData.append('derivado_medico', derivado_medico);
        const response: ICargaMasivaEcg = await apiAdapter.post(`${API}/carga-masiva-ecg`, formData);
        return response;
    };

    return {
        postChequeoSearch,
        postChequeoAll,
        getChequeoRut,
        postCreateChequeo,
        postUpdateChequeo,
        chequeoPDF,
        getDeleteById,
        pathUrlCertificado,
        postUploadFile,
        postCargaMasiva,
        cargaMasivaECG,
    };
};
