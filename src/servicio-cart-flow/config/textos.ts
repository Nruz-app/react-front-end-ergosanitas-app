import type { MedioPago, PlanCarro } from '../interface';

/** Pasos del flujo (§4 de la especificación de negocio). El índice es el `paso` del contexto. */
export const PASOS = [
    'Comuna',
    'Catálogo',
    'Carro',
    'Pacientes',
    'Agenda',
    'Pago',
    'Confirmación',
] as const;

export const PASO = {
    comuna       : 0,
    catalogo     : 1,
    carro        : 2,
    pacientes    : 3,
    agenda       : 4,
    pago         : 5,
    confirmacion : 6,
} as const;

export const PLANES: { valor: PlanCarro; etiqueta: string; detalle: string }[] = [
    { valor: 'ninguno',  etiqueta: 'Sin plan',                  detalle: 'Precio normal' },
    { valor: 'te_cuida', etiqueta: 'Ergo Sanitas te Cuida',     detalle: '−20 % en servicios (no aplica a laboratorio)' },
    { valor: 'familiar', etiqueta: 'Plan Familiar',             detalle: '−25 % en servicios (no aplica a laboratorio)' },
];

export const MEDIOS_PAGO: { valor: MedioPago; etiqueta: string; detalle: string }[] = [
    { valor: 'webpay',        etiqueta: 'Webpay',                   detalle: 'Tarjeta de débito o crédito. Te llevamos a Transbank.' },
    { valor: 'transferencia', etiqueta: 'Transferencia',            detalle: 'Te enviamos los datos de la cuenta. La visita se confirma al recibir el pago.' },
    { valor: 'efectivo',      etiqueta: 'Efectivo en la atención',  detalle: 'Pagas al profesional el día de la visita.' },
];

export const PREVISIONES = ['Fonasa', 'Isapre', 'Particular', 'Otra'];

export const ETIQUETAS_DESGLOSE: { clave: 'subtotal_lab' | 'toma_muestra' | 'insumos' | 'subtotal_servicios' | 'cargo_domicilio'; etiqueta: string }[] = [
    { clave: 'subtotal_lab',       etiqueta: 'Laboratorio' },
    { clave: 'toma_muestra',       etiqueta: 'Toma de muestra' },
    { clave: 'insumos',            etiqueta: 'Insumos' },
    { clave: 'subtotal_servicios', etiqueta: 'Servicios' },
    { clave: 'cargo_domicilio',    etiqueta: 'Domicilio' },
];

export const AVISO_RESULTADOS = 'Los resultados llegan solo al paciente.';

export const INSTRUCCIONES_TRANSFERENCIA =
    'Te contactaremos por correo o WhatsApp con los datos de la cuenta. Indica tu número de pedido en la glosa: la visita se confirma al recibir el pago.';

export const INSTRUCCIONES_EFECTIVO =
    'Pagas al profesional el día de la visita. Ten el monto exacto, por favor.';

/** Clave del uuid del carro en localStorage. Solo el uuid: nunca datos del paciente. */
export const CLAVE_STORAGE_CARRITO = 'ergo-cart-flow-uuid';
