import { HttpAdapter, ApiAdapter } from '../../common/api/api.adapter';


import type { ICertificadoUrl, ICertificadosConsulta, ICertificadosConsultaResponse } from '../interface';


export const  UseCertificadoService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    // Se conserva por compatibilidad (SPEC 01 de certificados); hoy no tiene consumidores.
    const getCertificadoExiste =  async (rut_paciente : string)  => {

        const response:{status:number,mensaje:string} = await  apiAdapter.get(`${API}/certificado/validar/${rut_paciente}`,10,0)
        return response;
    }

    // Se conserva: lo usa AppChequeo.tsx del módulo Chequeo.
    const getCertificadoRut =  async (rut_paciente : string)  => {

        try {
            const response:ICertificadoUrl = await  apiAdapter.get(`${API}/certificado/${rut_paciente}`,10,0)
            return response;
        }
        catch(error){
            console.error(error);
            return null;
        }
    }

    /**
     * SPEC 01 — Una sola petición por búsqueda. Un 422/429/500 hace lanzar a axios: la página
     * lo atrapa y lo muestra en línea.
     */
    const consultarDocumentos = async (rut: string): Promise<ICertificadosConsulta> => {

        const response = await apiAdapter.post<ICertificadosConsultaResponse>(`${API}/certificados/consulta`, { rut });

        if (!response?.success || !response.data) {
            throw new Error(response?.message ?? 'Respuesta inesperada del servidor.');
        }

        return response.data;
    }

    /**
     * Descarga un PDF de URL firmada como blob. Se usa `fetch` y no el ApiAdapter porque este
     * no admite `responseType: 'blob'`; así el botón sabe cuándo terminó y si falló (403 si la
     * firma venció). Los archivos públicos no pasan por aquí.
     *
     * Un error HTTP se lanza con su `status` adjunto (ver `statusDelError`): el botón solo
     * renueva la URL ante un 403, no ante un 404 o un 500.
     */
    const descargarDocumento = async (url: string): Promise<Blob> => {

        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw Object.assign(new Error(`HTTP ${respuesta.status}`), { status: respuesta.status });
        }

        return respuesta.blob();
    }

    return { getCertificadoRut, getCertificadoExiste, consultarDocumentos, descargarDocumento }
}
