

export interface IUrlBio {
    id : number;
    rut : string;
    nombre : string;
    archivo : string;
}

export interface IUrlBioResponse {
    success: boolean;
    message: string;
    data: IUrlBio | null;
}