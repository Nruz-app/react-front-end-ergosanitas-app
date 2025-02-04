

export interface IAuth {

    success: string;
    message : string;
    user : IUser;

}

export interface IUser {
    google_id : string;
    email     : string;
}