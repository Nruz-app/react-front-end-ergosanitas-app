import { Chip } from '@mui/material';

import { ESTADO_NEUTRO, ESTADOS_COLOR } from '../config/tema';
import { etiquetaEstado } from '../utilities';

interface Props {
    estado: string | null | undefined;
}

/** Chip con el color semántico del estado (pedido, pago o cotización). */
export const ChipEstado = ({ estado }: Props) => {

    const color = (estado && ESTADOS_COLOR[estado]) || ESTADO_NEUTRO;

    return (
        <Chip size="small" label={etiquetaEstado(estado)}
            sx={{ background: color.fondo, color: color.texto, fontWeight: 600 }} />
    );
};
