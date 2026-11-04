/**
 * Tipos de usuario clonados de `src/User/` y `src/Login/` para no importarlos (regla dura 1).
 * Los nombres de campo son los del backend y no se tocan, aunque `user-save` y
 * `auth-register` usen convenciones distintas (`email_user` frente a `user_email`).
 */

/** Cuerpo de `POST /user-save` («Crear usuario»). */
export interface INuevoUsuario {
    nombre_user   : string;
    email_user    : string;
    password_user : string;
    /** Id numérico del perfil en el backend (`1` = Administrador). */
    perfil_user   : number;
}

/** Usuario registrado, tal como lo devuelve `GET /auth-register/user_email/{perfil}`. */
export interface IUsuarioRegistrado {
    user_id       : number;
    rut_paciente? : string;
    user_email    : string;
    user_name     : string;
    user_perfil   : string;
    user_logo?    : string;
}

/** Sobre de `user-save`, `user-update-password` y `user-update-ergo-pass`. */
export interface IRespuestaUsuario {
    success : boolean;
    message : string;
}

/** Respuesta de `POST /auth-register/load-logo`. */
export interface ILogoUsuario {
    message   : string;
    user_logo : string;
}
