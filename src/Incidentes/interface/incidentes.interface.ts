


export interface IIncidentes {
    nombres           : string;
    edad              : string;
    deporte           : string;
    tipo_lesion       : string;
    ubicacion         : string;
    parte_cuerpo      : string; 
    descripcion?       : string;
    primeros_auxilios? : string;
    gravedad          : string;
    estado            : string;
    created_at?       : string;   
    user_email        : string;
}