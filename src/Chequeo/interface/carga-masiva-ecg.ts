

export interface ICargaMasivaECG {
    success : boolean;
    total : number;
    procesados : ÏProcesados[]
}

export interface ÏProcesados {
    archivo: string;
    rut: string;
    id_chequeo: number | string;
    nombre: string;
    status: string;
    resultado: "OK" | "ERROR";
    mensaje: string;
}