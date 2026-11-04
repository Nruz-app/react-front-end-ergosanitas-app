/**
 * Tipos del flujo `servicio-cart-flow`: reflejan 1:1 el JSON de `api/cart-flow/*` (SPEC 04 del
 * back, §3.2). Los montos son CLP con IVA. Lo que puede faltar es `| null`, nunca `0`.
 */

export type PlanCarro = 'ninguno' | 'te_cuida' | 'familiar';

export type MedioPago = 'webpay' | 'transferencia' | 'efectivo';

export type TipoProducto =
    | 'servicio_domicilio' | 'examen_lab' | 'perfil_lab' | 'pack_lab'
    | 'servicio_evento' | 'operativo' | 'a_cotizar' | 'toma_muestra';

/** Sobre {success, message, data} del back. */
export interface IRespuesta<T> {
    success : boolean;
    message : string;
    data    : T;
    error  ?: unknown;
}

export interface IComuna {
    id                : number;
    comuna            : string;
    zona              : number | null;
    a_cotizar         : boolean;
    cargo_servicio    : number | null;
    cargo_laboratorio : number | null;
}

export interface IProducto {
    id                    : number;
    sku                   : string;
    tipo                  : TipoProducto;
    categoria             : string;
    nombre                : string;
    precio                : number | null;
    precio_te_cuida       : number | null;
    precio_familiar       : number | null;
    precio_adulto_mayor   : number | null;
    edad_min_beneficio    : number | null;
    es_laboratorio        : boolean;
    incluye_toma_muestra  : boolean;
    requiere_orden_medica : boolean;
    requiere_ayuno        : boolean;
    horas_ayuno           : number | null;
    solo_ruta_manana      : boolean;
    edad_min              : number | null;
    edad_max              : number | null;
    sexo                  : 'F' | 'M' | null;
    aplica_plan           : boolean;
    descripcion_publica   : string | null;
    preparacion           : string | null;
    solo_cotizacion       : boolean;
}

export interface ICatalogo {
    productos  : IProducto[];
    categorias : string[];
}

export interface ILineaCarro {
    id                    : number | null;
    sku                   : string;
    nombre                : string;
    tipo                  : TipoProducto;
    cantidad              : number;
    precio_lista          : number;
    precio_unitario       : number;
    subtotal              : number;
    automatica            : boolean;
    requiere_orden_medica : boolean;
    bloqueada             : boolean;
}

export interface IPreparacion {
    ayuno                 : boolean;
    horas_ayuno           : number;
    requiere_orden_medica : boolean;
    indicaciones          : string[];
}

export interface IPacienteCarro {
    id                       : number;
    orden                    : number;
    nombre                   : string | null;
    rut                      : string | null;
    fecha_nac                : string | null;
    edad                     : number | null;
    sexo                     : 'F' | 'M' | null;
    prevision                : string | null;
    telefono                 : string | null;
    email                    : string | null;
    consentimiento           : boolean;
    apoderado_nombre         : string | null;
    apoderado_rut            : string | null;
    consentimiento_apoderado : boolean;
    lineas                   : ILineaCarro[];
    preparacion              : IPreparacion | null;
}

export interface IDesglose {
    subtotal_lab       : number;
    subtotal_servicios : number;
    toma_muestra       : number;
    insumos            : number;
    cargo_domicilio    : number;
    descuento_plan     : number;
    total_sin_redondeo : number;
    ajuste_redondeo    : number;
    total              : number;
}

export interface IBloqueo {
    codigo       : string;
    mensaje      : string;
    paciente_id ?: number | null;
    linea_id    ?: number | null;
}

export interface ICarrito {
    uuid                  : string;
    estado                : 'abierto' | 'convertido' | 'expirado';
    expira_en             : string | null;
    comuna                : IComuna | null;
    direccion             : string | null;
    referencia            : string | null;
    plan                  : PlanCarro;
    pacientes             : IPacienteCarro[];
    desglose              : IDesglose;
    requiere_manana       : boolean;
    requiere_orden_medica : boolean;
    a_cotizar             : boolean;
    bloqueos              : IBloqueo[];
    avisos                : IBloqueo[];
}

/** Lo que se envía al editar un paciente. */
export interface IPacienteForm {
    nombre                   : string;
    rut                      : string;
    fecha_nac                : string;
    sexo                     : 'F' | 'M' | '';
    prevision                : string;
    telefono                 : string;
    email                    : string;
    consentimiento           : boolean;
    apoderado_nombre         : string;
    apoderado_rut            : string;
    consentimiento_apoderado : boolean;
}

export interface IBloqueAgenda {
    id     : number;
    bloque : string;
    franja : 'manana' | 'tarde';
    cupo   : number;
    libres : number;
}

export interface IDiaAgenda {
    fecha      : string;
    dia_semana : number;
    bloques    : IBloqueAgenda[];
}

export interface IAgenda {
    requiere_manana : boolean;
    dias            : IDiaAgenda[];
}

export interface ICheckoutForm {
    fecha             : string;
    bloque_id         : number;
    medio_pago        : MedioPago;
    contacto_nombre   : string;
    contacto_email    : string;
    contacto_telefono : string;
    direccion         : string;
    referencia        : string;
    observaciones     : string;
    acepta_terminos   : boolean;
    /** Orden médica por id de paciente del carro. */
    ordenes           : Record<number, File | null>;
}

export interface IPedido {
    numero          : string;
    estado          : 'pendiente_pago' | 'pagado' | 'confirmado' | 'atendido' | 'anulado';
    medio_pago      : MedioPago;
    estado_pago     : 'pendiente' | 'pagado' | 'rechazado';
    comuna          : string;
    zona            : number | null;
    direccion       : string;
    referencia      : string | null;
    plan            : PlanCarro;
    agenda          : { fecha: string; bloque: string; requiere_manana: boolean };
    desglose        : IDesglose;
    pacientes       : {
        orden                : number;
        nombre               : string;
        preparacion          : IPreparacion | null;
        orden_medica_adjunta : boolean;
        lineas               : ILineaCarro[];
    }[];
    pagos           : { medio: MedioPago; monto: number; estado: string; fecha: string | null }[];
    creado          : string | null;
    /** Solo llega en la respuesta del checkout. */
    token_consulta ?: string;
}

export interface IWebPay {
    token : string;
    url   : string;
}

export interface ICotizacionForm {
    organizacion      : string;
    comuna            : string;
    personas          : number | null;
    servicio          : string;
    sku               : string;
    fecha_tentativa   : string;
    contacto_nombre   : string;
    contacto_email    : string;
    contacto_telefono : string;
    mensaje           : string;
}
