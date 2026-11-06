import type { AccionPedido, IFiltrosPedidos } from '../interface';

export const ETIQUETAS_ESTADO: Record<string, string> = {
    pendiente_pago : 'Pendiente de pago',
    pagado         : 'Pagado',
    confirmado     : 'Confirmado',
    atendido       : 'Atendido',
    anulado        : 'Anulado',
    pendiente      : 'Pendiente',
    rechazado      : 'Rechazado',
    iniciado       : 'Iniciado',
    aprobado       : 'Aprobado',
    error          : 'Error',
    nueva          : 'Nueva',
    contactada     : 'Contactada',
    cerrada        : 'Cerrada',
};

export const ETIQUETAS_MEDIO: Record<string, string> = {
    webpay        : 'Webpay',
    transferencia : 'Transferencia',
    efectivo      : 'Efectivo',
};

export const ESTADOS_PEDIDO = ['pendiente_pago', 'pagado', 'confirmado', 'atendido', 'anulado'];
export const ESTADOS_PAGO = ['pendiente', 'pagado', 'rechazado'];
export const MEDIOS_PAGO = ['webpay', 'transferencia', 'efectivo'];
export const ESTADOS_COTIZACION = ['nueva', 'contactada', 'cerrada'];

/** Texto del botón y de la confirmación de cada acción de estado. */
export const ACCIONES: Record<AccionPedido, { boton: string; pregunta: string; color: 'success' | 'primary' | 'secondary' | 'error' }> = {
    confirmar_pago : { boton: 'Confirmar pago',     pregunta: '¿Confirmas que se recibió el pago de este pedido?', color: 'success' },
    confirmar      : { boton: 'Confirmar visita',   pregunta: '¿Confirmas la ruta de esta visita?',               color: 'primary' },
    atender        : { boton: 'Marcar atendido',    pregunta: '¿La visita ya se realizó?',                         color: 'secondary' },
    anular         : { boton: 'Anular pedido',      pregunta: 'El pedido quedará anulado y se liberará su cupo.', color: 'error' },
};

export const PESTANAS = ['Pedidos', 'Cotizaciones', 'Catálogo'] as const;

export const FILTROS_VACIOS: IFiltrosPedidos = { estado: '', estado_pago: '', medio_pago: '', desde: '', hasta: '', por: 'creacion', q: '' };
