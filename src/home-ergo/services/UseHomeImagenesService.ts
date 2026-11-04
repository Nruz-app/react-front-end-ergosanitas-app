import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type { IHomeImagenApi, IRespuestaHomeImagenes } from '../interface';

/**
 * Servicio de las imágenes del Home (Spec 04 de `home-ergo`).
 *
 * Lee `GET {API}/home-imagenes` (SPEC 03 del back): solo las imágenes activas, ya ordenadas
 * por sección y `orden`. Es la única llamada de contenido que hace el Home; el resto sigue en
 * los JSON de `config/`.
 *
 * Usa `getToken` y no `get` porque `ApiAdapter.get` inyecta siempre `limit`/`offset`, y este
 * endpoint devuelve la lista completa.
 */
export const UseHomeImagenesService = () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /**
     * Imágenes activas del Home.
     *
     * El genérico de `ApiAdapter` no valida nada, así que la forma se comprueba aquí: cualquier
     * respuesta que no sea `{ success: true, data: [...] }` es un error. Sin esa comprobación,
     * un sobre de error con 200 llegaría a los carruseles como si fuera contenido.
     */
    const getImagenesHome = async (): Promise<IHomeImagenApi[]> => {

        const response = await apiAdapter.getToken<IRespuestaHomeImagenes>(`${API}/home-imagenes`);

        if (response?.success !== true || !Array.isArray(response?.data)) {
            throw new Error('Respuesta inesperada de home-imagenes');
        }

        return response.data;
    };

    return {
        getImagenesHome,
    };
};
