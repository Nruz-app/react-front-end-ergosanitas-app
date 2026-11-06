import Swal from 'sweetalert2';

import { CartFlowError } from '../services';

/** Texto legible de los errores por paciente o bloqueos que manda el back en `error`. */
const detalleError = (detalle: unknown): string[] => {

    if (Array.isArray(detalle)) {
        return detalle.map((d) => (typeof d === 'string' ? d : (d as { mensaje?: string })?.mensaje ?? '')).filter(Boolean);
    }

    if (detalle && typeof detalle === 'object') {
        return Object.values(detalle as Record<string, unknown>).flat().map(String);
    }

    return [];
};

export const mostrarError = (problema: unknown) => {

    const mensaje = problema instanceof Error ? problema.message : 'Ocurrió un error inesperado';
    const lineas = problema instanceof CartFlowError ? detalleError(problema.detalle) : [];
    const lista = document.createElement('div');

    lista.innerText = lineas.length ? `${mensaje}\n\n• ${lineas.join('\n• ')}` : mensaje;
    lista.style.whiteSpace = 'pre-line';
    lista.style.textAlign = 'left';

    Swal.fire({ icon: 'warning', title: 'Revisa tu carro', html: lista });
};
