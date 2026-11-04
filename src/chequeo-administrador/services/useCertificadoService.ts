import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type { ICertificadoUrl } from '../interface';

/**
 * Solo `getCertificadoRut`, lo único de `src/Certificados/` que este módulo necesita: la URL
 * del ECG ya emitido, que se pide al editar o revisar un chequeo.
 */
export const UseCertificadoService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /**
     * Devuelve `null` si el paciente todavía no tiene certificado. El `ApiAdapter` no maneja
     * errores, así que un 404 llega aquí como excepción de axios y no debe romper la edición.
     */
    const getCertificadoRut = async (rut_paciente: string): Promise<ICertificadoUrl | null> => {

        try {
            const response: ICertificadoUrl = await apiAdapter.get(
                `${API}/certificado/${rut_paciente}`, 10, 0,
            );
            return response;
        }
        catch (problema) {
            console.error(problema instanceof Error ? problema.message : 'No hay respuesta del servidor.');
            return null;
        }
    };

    return { getCertificadoRut };
};
