
export interface LigaData {
    data : number[];
    labels : string[]
}


export interface Liga {
    status : string;
    message : string;
    data : LigaData
}


export interface Categoria {
    status : string;
    message : string;
    data : LigaData
}
