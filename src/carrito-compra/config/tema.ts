/**
 * Tokens visuales del módulo `carrito-compra` (Spec 01): **la única fuente de color**.
 * El armazón usa el verde del menú del Administrador; los estados, una paleta semántica propia.
 */
export const COLORES = {
    primario      : '#2e7d32',
    primarioOsc   : '#1b5e20',
    primarioClaro : '#4caf50',
    fondoApp      : '#f1f8f2',
    fondoTarjeta  : '#ffffff',
    borde         : '#e0e0e0',
    fondoSutil    : '#fafafa',
    texto         : '#1f2937',
    textoSuave    : '#6b7280',
    blanco        : '#ffffff',
};

/** Color de fondo y de texto de cada chip de estado. */
export const ESTADOS_COLOR: Record<string, { fondo: string; texto: string }> = {
    pendiente_pago : { fondo: '#fef3c7', texto: '#92400e' },
    pagado         : { fondo: '#dcfce7', texto: '#166534' },
    confirmado     : { fondo: '#dbeafe', texto: '#1e40af' },
    atendido       : { fondo: '#e0e7ff', texto: '#3730a3' },
    anulado        : { fondo: '#fee2e2', texto: '#991b1b' },
    pendiente      : { fondo: '#fef3c7', texto: '#92400e' },
    rechazado      : { fondo: '#fee2e2', texto: '#991b1b' },
    iniciado       : { fondo: '#f3f4f6', texto: '#374151' },
    aprobado       : { fondo: '#dcfce7', texto: '#166534' },
    error          : { fondo: '#fee2e2', texto: '#991b1b' },
    nueva          : { fondo: '#fef3c7', texto: '#92400e' },
    contactada     : { fondo: '#dbeafe', texto: '#1e40af' },
    cerrada        : { fondo: '#e5e7eb', texto: '#374151' },
};

export const ESTADO_NEUTRO = { fondo: '#f3f4f6', texto: '#374151' };
