import { ApiAdapter, HttpAdapter } from '../../common/api/api.adapter';
import type {
    ILogoUsuario,
    INuevoUsuario,
    IRespuestaUsuario,
    IUsuarioRegistrado,
} from '../interface';

/**
 * Los 5 métodos de usuario que necesita el módulo, clonados de `src/User/service/user.service.ts`
 * y de `src/Login/services/useRegister.ts` (regla dura 1: no se importan).
 *
 * **No se clona `authRegister`**: la sesión sigue siendo de `src/common/` y `src/Login/`.
 */
export const UseUsuarioService = async () => {

    const API = `${import.meta.env.VITE_API}${import.meta.env.VITE_API_PATH}`;

    const apiAdapter: HttpAdapter = new ApiAdapter();

    /**
     * Usuarios de un perfil por su id numérico. `3` es el que alimenta los selectores de club.
     *
     * `getToken` y no `get`: `get` inyecta siempre `?limit=10&offset=0`, que `ListUserEmail`
     * ignora (verificado en el back). Es solo dejar de mandar ruido (§7.1).
     */
    const getUserEmail = async (perfil: number): Promise<IUsuarioRegistrado[]> => {

        const response: IUsuarioRegistrado[] = await apiAdapter.getToken(
            `${API}/auth-register/user_email/${perfil}`,
        );
        return response;
    };

    const PostUserSave = async (user: INuevoUsuario): Promise<IRespuestaUsuario> => {

        const response: IRespuestaUsuario = await apiAdapter.post(`${API}/user-save`, user);
        return response;
    };

    // La ruta del back se llama `UserUpdatePassowrd`, con typo: no se toca desde aquí.
    const PostUserPassword = async (password_user: string, email_user: string): Promise<IRespuestaUsuario> => {

        const response: IRespuestaUsuario = await apiAdapter.put(
            `${API}/user-update-password`, { password_user, email_user },
        );
        return response;
    };

    const PostUserErgoPass = async (ergo_pass: string, email_user: string): Promise<IRespuestaUsuario> => {

        const response: IRespuestaUsuario = await apiAdapter.put(
            `${API}/user-update-ergo-pass`, { ergo_pass, email_user },
        );
        return response;
    };

    const loadLogoUser = async (selectedFile: File, user_email: string): Promise<ILogoUsuario> => {

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('user_email', user_email);

        const response: ILogoUsuario = await apiAdapter.post(`${API}/auth-register/load-logo`, uploadData);
        return response;
    };

    return {
        getUserEmail,
        PostUserSave,
        PostUserPassword,
        PostUserErgoPass,
        loadLogoUser,
    };
};
