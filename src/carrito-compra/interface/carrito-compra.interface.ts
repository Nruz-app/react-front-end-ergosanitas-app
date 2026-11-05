/**
 * Tipos del mantenedor «Carrito Compra»: espejo 1:1 de `api/cart-flow/admin/*` (SPEC 05 del back).
 * Montos en CLP con IVA. Lo que puede faltar es `| null`, nunca `0`.
 */

export type AccionPedido = 'confirmar_pago' | 'confirmar' | 'atender' | 'anular';

export interface IRespuesta<T> {
    success : boolean;
    message : string;
    data    : T;
    error  ?: unknown;
}

export interface IResumen {
    pedidos_hoy         : number;
    pendientes_pago     : { cantidad: number; monto: number; por_medio: Record<string, { cantidad: number; monto: number }> };
    pagados_mes         : { cantidad: number; monto: number };
    por_estado          : Record<string, number>;
    proximas_visitas    : number;
    cotizaciones_nuevas : number;
}

export interface IFiltrosPedidos {
    estado      : string;
    estado_pago : string;
    medio_pago  : string;
    desde       : string;
    hasta       : string;
    por         : 'creacion' | 'visita';
    q           : string;
}

export interface IPedidoFila {
    numero            : string;
    creado            : string | null;
    fecha             : string;
    bloque            : string;
    comuna            : string;
    contacto_nombre   : string;
    contacto_telefono : string;
    total             : number;
    medio_pago        : string;
    estado            : string;
    estado_pago       : string;
    pacientes         : number;
}

export interface IPaginaPedidos {
    items         : IPedidoFila[];
    total         : number;
    pagina        : number;
    por_pagina    : number;
    ultima_pagina : number;
}

export interface ILineaAdmin {
    sku             : string;
    nombre          : string;
    tipo            : string;
    cantidad        : number;
    precio_unitario : number;
    subtotal        : number;
    automatica      : boolean;
}

export interface IOrdenMedica {
    id              : number;
    nombre_original : string;
    mime            : string;
    subida          : string | null;
}

export interface IPacienteAdmin {
    orden            : number;
    nombre           : string;
    rut              : string;
    fecha_nac        : string | null;
    sexo             : string | null;
    prevision        : string | null;
    telefono         : string | null;
    email            : string | null;
    apoderado_nombre : string | null;
    apoderado_rut    : string | null;
    preparacion      : { ayuno: boolean; horas_ayuno: number; requiere_orden_medica: boolean; indicaciones: string[] } | null;
    lineas           : ILineaAdmin[];
    ordenes_medicas  : IOrdenMedica[];
}

export interface IPagoAdmin {
    id                 : number;
    medio              : string;
    monto              : number;
    estado             : string;
    buy_order          : string | null;
    status             : string | null;
    response_code      : number | null;
    authorization_code : string | null;
    creado             : string | null;
    actualizado        : string | null;
}

export interface IHistorial {
    campo      : 'estado' | 'estado_pago';
    anterior   : string | null;
    nuevo      : string;
    motivo     : string | null;
    user_email : string;
    fecha      : string | null;
}

export interface IPedidoDetalle {
    numero         : string;
    creado         : string | null;
    estado         : string;
    estado_pago    : string;
    medio_pago     : string;
    anulado_motivo : string | null;
    atendido_en    : string | null;
    acciones       : AccionPedido[];
    contacto       : { nombre: string; email: string; telefono: string };
    visita         : { comuna: string; zona: number | null; direccion: string; referencia: string | null; fecha: string; bloque: string; requiere_manana: boolean };
    plan           : string;
    observaciones  : string | null;
    desglose       : {
        subtotal_lab: number; subtotal_servicios: number; toma_muestra: number; insumos: number;
        cargo_domicilio: number; descuento_plan: number; total_sin_redondeo: number; ajuste_redondeo: number; total: number;
    };
    pacientes      : IPacienteAdmin[];
    pagos          : IPagoAdmin[];
    historial      : IHistorial[];
}

export interface ICotizacion {
    id                : number;
    organizacion      : string | null;
    comuna            : string;
    personas          : number | null;
    servicio          : string;
    sku               : string | null;
    fecha_tentativa   : string | null;
    contacto_nombre   : string;
    contacto_email    : string;
    contacto_telefono : string;
    mensaje           : string | null;
    estado            : string;
    created_at        : string | null;
}

export interface IProductoAdmin {
    id                   : number;
    sku                  : string;
    tipo                 : string;
    categoria            : string;
    nombre               : string;
    precio               : number | null;
    publicable           : boolean;
    visible_tienda       : boolean;
    motivo_no_publicable : string | null;
    observacion          : string | null;
}
