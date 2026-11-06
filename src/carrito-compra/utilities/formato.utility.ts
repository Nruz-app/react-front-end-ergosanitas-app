import Swal from 'sweetalert2';

import { ETIQUETAS_ESTADO, ETIQUETAS_MEDIO } from '../config/textos';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

export const formatoClp = (monto: number | null | undefined): string =>
    monto === null || monto === undefined ? '—' : CLP.format(monto);

/** "05-11-2026" a partir de "2026-11-05" (fecha civil, sin zona horaria). */
export const formatoFecha = (fecha: string | null | undefined): string => {
    if (!fecha) return '—';
    const [a, m, d] = fecha.slice(0, 10).split('-');
    return a && m && d ? `${d}-${m}-${a}` : fecha;
};

/** "05-11-2026 18:39" a partir de un ISO 8601. */
export const formatoFechaHora = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const fecha = new Date(iso);
    return Number.isNaN(fecha.getTime())
        ? iso
        : fecha.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const etiquetaEstado = (estado: string | null | undefined): string =>
    estado ? ETIQUETAS_ESTADO[estado] ?? estado : '—';

export const etiquetaMedio = (medio: string | null | undefined): string =>
    medio ? ETIQUETAS_MEDIO[medio] ?? medio : '—';

export const mostrarError = (problema: unknown) =>
    Swal.fire({ icon: 'error', title: 'Carrito Compra', text: problema instanceof Error ? problema.message : 'Ocurrió un error inesperado' });
