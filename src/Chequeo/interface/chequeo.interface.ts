

export interface IChequeo {
    id?                     : number;
    nombre                  : string;
    rut                     : string;
    fechaNacimiento         : string;
    edad                    : string;
    estatura                : string;
    peso                    : string;
    hemoglucotest           : string;
    pulso                   : string;
    presionArterial         : string;
    presion_sistolica       : string;
    saturacionOxigeno       : string;
    temperatura             : string;
    enfermedadesCronicas    : string;
    medicamentosDiarios     : string;
    sistemaOsteoarticular   : string;
    sistemaCardiovascular   : string;
    enfermedadesAnteriores  : string;
    Recuperacion            : string;
    gradoIncidenciaPosterio : string;
    user_email              : string;
    user_email_perfil?      : string; 
    sexo_paciente           : string;
    imc_paciente            : string;
    status                  : string;
    division_paciente       : string;
    medio_pago_paciente     : string;
    estado_paciente?        : string;
    frecuencia_cardiaca_paciente? : number;
    derivacion_paciente?    : string;
    observacion_paciente?   : string;
    fecha_atencion?         : string;      
    created_at?             : string;    
}