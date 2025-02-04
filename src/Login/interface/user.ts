

export interface IResponseUser {
    success : boolean,
    message : string,
    user : IUser
}

export interface IUser {
    user_id        : number;
    user_email     : string;
    user_name      : string;
    user_perfil    : string;
}