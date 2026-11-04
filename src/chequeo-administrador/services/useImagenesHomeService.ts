import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type { IImagenHome, IImagenHomeForm, IRespuestaImagenHome } from '../interface';

/**
 * Los 5 métodos del mantenedor de imágenes del Home (Spec 02), sobre los endpoints
 * `home-imagenes` de la SPEC 03 del back.
 *
 * Todos devuelven ya la `data` y **lanzan un `Error` con el `message` del back** si algo falla:
 * un 403 (no es Administrador), un 404, un 422 de validación o un 500. Así quien llama solo hace
 * `problema instanceof Error ? problema.message : …`, como en el resto del repo, y el usuario ve
 * el texto en español del back en vez de «Request failed with status code 422».
 *
 * El mensaje se lee por la forma del objeto y no con `axios.isAxiosError` (regla dura 6): axios
 * se importa en un solo archivo del repo, `api.adapter.ts`.
 */
export const UseImagenesHomeService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /** Ejecuta la llamada, comprueba el sobre y traduce cualquier fallo a un `Error` legible. */
    const llamar = async <T>(peticion: () => Promise<IRespuestaImagenHome<T>>, mensajePorDefecto: string): Promise<T> => {

        let response: IRespuestaImagenHome<T>;

        try {
            response = await peticion();
        }
        catch (problema) {
            const mensaje = (problema as { response?: { data?: { message?: unknown } } } | null)
                ?.response?.data?.message;

            throw new Error(typeof mensaje === 'string' && mensaje ? mensaje : mensajePorDefecto);
        }

        if (response?.success !== true) {
            throw new Error(response?.message || mensajePorDefecto);
        }

        return response.data;
    };

    /**
     * Todas las imágenes, activas e inactivas, ya ordenadas por sección y `orden`.
     *
     * `getToken` y no `get`: `get` inyecta siempre `limit`/`offset` y este endpoint devuelve
     * la lista completa.
     */
    const getImagenesAdmin = async (): Promise<IImagenHome[]> => {

        const data = await llamar<IImagenHome[]>(
            () => apiAdapter.getToken(`${API}/home-imagenes/admin`),
            'No se pudieron cargar las imágenes del Home',
        );

        if (!Array.isArray(data)) throw new Error('Respuesta inesperada de home-imagenes/admin');

        return data;
    };

    /**
     * Sube una imagen nueva, con `FormData` como `loadLogoUser`. `orden` vacío no se envía:
     * el back pone la imagen al final de su sección.
     */
    const postImagen = async (form: IImagenHomeForm, user_email: string): Promise<IImagenHome> => {

        const uploadData = new FormData();

        if (form.archivo) uploadData.append('file', form.archivo);
        uploadData.append('seccion', form.seccion);
        uploadData.append('alt', form.alt);
        uploadData.append('caption', form.caption);
        if (form.orden !== null) uploadData.append('orden', String(form.orden));
        uploadData.append('user_email', user_email);

        return llamar<IImagenHome>(
            () => apiAdapter.post(`${API}/home-imagenes`, uploadData),
            'No se pudo agregar la imagen',
        );
    };

    /**
     * Edita sección, alt, caption y orden.
     *
     * ⚠️ El `PUT` del back **reemplaza**: un `caption` que no viaje queda en `null`. Por eso se
     * mandan siempre los cuatro campos, con el valor actual del formulario.
     */
    const putImagen = async (id: number, form: IImagenHomeForm, user_email: string): Promise<IImagenHome> => {

        return llamar<IImagenHome>(
            () => apiAdapter.put(`${API}/home-imagenes/${id}`, {
                seccion : form.seccion,
                alt     : form.alt,
                caption : form.caption,
                orden   : form.orden,
                user_email,
            }),
            'No se pudo actualizar la imagen',
        );
    };

    /** Muestra u oculta la imagen en el Home. Es `PUT` porque el `ApiAdapter` no tiene `patch`. */
    const putActivo = async (id: number, activo: boolean, user_email: string): Promise<IImagenHome> => {

        return llamar<IImagenHome>(
            () => apiAdapter.put(`${API}/home-imagenes/${id}/activo`, { activo, user_email }),
            'No se pudo cambiar la visibilidad de la imagen',
        );
    };

    /** Borra la fila y el archivo. `user_email` va por query: un `DELETE` no lleva cuerpo. */
    const deleteImagen = async (id: number, user_email: string): Promise<void> => {

        await llamar<null>(
            () => apiAdapter.delete(`${API}/home-imagenes/${id}?user_email=${encodeURIComponent(user_email)}`),
            'No se pudo eliminar la imagen',
        );
    };

    return {
        getImagenesAdmin,
        postImagen,
        putImagen,
        putActivo,
        deleteImagen,
    };
};
