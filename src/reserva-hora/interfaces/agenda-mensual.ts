
export interface Idata {
    user_email : string;
    cantidad: number;
}

export interface IAgendaMensual {
    fecha: string;  
    total : number;
    data : Idata[];
}