/**
 * Entidad central del chequeo cardiovascular.
 *
 * Se clona de `src/Chequeo/interface/` **sin retipar**: casi todo es `string` opcional,
 * incluidos peso, presión y temperatura. Es deuda heredada y se conoce, pero retiparla a
 * `number | null` obligaría a tocar el mapeo con el backend, que no cambia en esta spec.
 *
 * Las dos claves del modelo: `user_email` identifica al colegio dueño de los datos y
 * `rut` identifica a la persona evaluada. No hay id relacional.
 */
export interface IChequeo {
    id?                           : number;
    nombre                        : string;
    rut                           : string;
    fechaNacimiento               : string;
    edad                          : string;
    estatura?                     : string;
    peso?                         : string;
    hemoglucotest?                : string;
    pulso?                        : string;
    presionArterial?              : string;
    presion_sistolica?            : string;
    saturacionOxigeno?            : string;
    temperatura?                  : string;
    enfermedadesCronicas?         : string;
    medicamentosDiarios?          : string;
    sistemaOsteoarticular?        : string;
    sistemaCardiovascular?        : string;
    enfermedadesAnteriores?       : string;
    Recuperacion?                 : string;
    gradoIncidenciaPosterio?      : string;
    user_email                    : string;
    user_email_perfil?            : string;
    sexo_paciente                 : string;
    imc_paciente?                 : string;
    status?                       : string;
    division_paciente?            : string;
    medio_pago_paciente?          : string;
    /** Estado clínico del backend: 'ingresado', 'Testiado', 'ECG FOTO', 'REVISION MEDICA', … */
    estado_paciente?              : string;
    /**
     * ⚠️ Llega como **`string`**, no como número, y con `'-'` de centinela cuando no se ha
     * medido: comprobado en `chequeo-all` y en `search-chequeo` de `brisas@ergosanitas.com`.
     * `src/Chequeo/` lo declara `number`, que es lo que se clonó y era falso. Quien lo pinte
     * tiene que pasar por `hayDato`, o el centinela acaba en pantalla como «- lpm».
     */
    frecuencia_cardiaca_paciente? : string;
    derivacion_paciente?          : string;
    observacion_paciente?         : string;
    fecha_atencion?               : string;
    created_at?                   : string;
    email_paciente?               : string;
}

/** Respuesta paginada de `search-chequeo`. */
export interface IData {
    data         : IChequeo[];
    current_page : number;
    per_page     : number;
    total        : number;
}

/** Respuesta sin paginar de `chequeo-all`, usada para exportar a Excel. */
export interface IDataAll {
    data    : IChequeo[];
    status  : number;
    mensaje : string;
}
