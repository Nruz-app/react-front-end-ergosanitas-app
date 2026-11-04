import type { ModoFicha, SeleccionFicha } from '../interface';

/** La ficha limpia: entrar al tab por el rail o guardar en cualquier modo vuelve aquí. */
export const FICHA_ALTA: SeleccionFicha = { modo: 'alta', rut_paciente: '', id_paciente: 0, url_pdf: '' };

/** Título de la ficha según el modo. */
export const TITULOS_FICHA: Record<ModoFicha, string> = {
    alta     : 'Chequeo Preventivo Cardiovascular',
    edicion  : 'Chequeo Preventivo Cardiovascular',
    revision : 'Electro Cardiograma',
};
