import { Button, Stack } from '@mui/material';
import Swal from 'sweetalert2';

import { ACCIONES } from '../config/textos';
import type { AccionPedido } from '../interface';

interface Props {
    acciones : AccionPedido[];
    cargando : boolean;
    onAccion : (accion: AccionPedido, motivo?: string) => void;
}

/**
 * Botones de las acciones que el back permite para el estado actual (`acciones` del detalle):
 * el front no repite la máquina de estados. Todas piden confirmación; anular pide motivo.
 */
export const AccionesEstado = ({ acciones, cargando, onAccion }: Props) => {

    const ejecutar = async (accion: AccionPedido) => {

        const texto = ACCIONES[accion];

        if (accion === 'anular') {
            const { isConfirmed, value } = await Swal.fire({
                icon: 'warning',
                title: texto.boton,
                text: texto.pregunta,
                input: 'textarea',
                inputLabel: 'Motivo (obligatorio)',
                inputValidator: (v) => (!v || !v.trim() ? 'Indica el motivo' : undefined),
                showCancelButton: true,
                confirmButtonText: 'Anular',
                cancelButtonText: 'Volver',
            });

            if (isConfirmed) onAccion(accion, String(value).trim());
            return;
        }

        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: texto.boton,
            text: texto.pregunta,
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Volver',
        });

        if (isConfirmed) onAccion(accion);
    };

    if (acciones.length === 0) return null;

    return (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {acciones.map((accion) => (
                <Button key={accion} size="small" disabled={cargando} color={ACCIONES[accion].color}
                    variant={accion === 'anular' ? 'outlined' : 'contained'}
                    onClick={() => ejecutar(accion)}>
                    {ACCIONES[accion].boton}
                </Button>
            ))}
        </Stack>
    );
};
