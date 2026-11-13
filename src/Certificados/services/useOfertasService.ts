import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';

import type { IOfertaBanner, IRespuestaHomeImagenes } from '../interface';

/**
 * Ofertas del banner que se ve mientras se busca un RUT (SPEC 02 de certificados).
 *
 * Lee `GET {API}/home-imagenes` (SPEC 03 del back), el mismo endpoint de las promociones de la
 * portada. Es un clon del servicio de `home-ergo`, no un import: la regla de aislamiento del módulo
 * solo admite `src/common/`.
 *
 * Usa `getToken` y no `get` porque `ApiAdapter.get` inyecta siempre `limit`/`offset`, y este
 * endpoint devuelve la lista completa.
 */
export const UseOfertasService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /**
     * Ofertas activas de la sección «Lo que está en oferta», en el orden del Administrador.
     *
     * El genérico de `ApiAdapter` no valida nada: cualquier respuesta que no sea
     * `{ success: true, data: [...] }` es un error. Sin esa comprobación, un sobre de error con 200
     * llegaría al banner como si fueran ofertas. Se filtra por el literal `'promocion'` (las
     * alianzas y la galería no van al banner) y no se reordena: el back ya entrega el `orden`.
     */
    const getOfertas = async (): Promise<IOfertaBanner[]> => {

        const response = await apiAdapter.getToken<IRespuestaHomeImagenes>(`${API}/home-imagenes`);

        if (response?.success !== true || !Array.isArray(response?.data)) {
            throw new Error('Respuesta inesperada de home-imagenes');
        }

        return response.data
            .filter((fila) => fila.seccion === 'promocion')
            .map(({ id, src, alt, caption }) => ({ id, src, alt, caption: caption ?? null }));
    };

    return {
        getOfertas,
    };
};
