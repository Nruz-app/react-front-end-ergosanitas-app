import { ReactElement, cloneElement } from 'react';
import { Button, Tooltip } from '@mui/material';

import { COLORES, sxFocoVisible } from '../../config/tema';

interface Props {
    /** Texto del tooltip y del `aria-label`: el botón es solo un icono. */
    titulo   : string;
    icono    : ReactElement;
    /** Fondo del círculo del icono, de `UI` en `tema.ts`. */
    color    : string;
    variant? : 'text' | 'outlined';
    onClick  : () => void;
}

/**
 * Una acción de la fila: un icono en un círculo de color, como hoy.
 *
 * Se extrae porque el original repetía ocho veces el mismo `Tooltip` + `Button` + `style` en
 * línea. Lo que se gana además es el `aria-label`, que el original no tenía en ninguna acción.
 */
export const BotonAccion = ({ titulo, icono, color, variant = 'text', onClick }: Props) => {

    return (
        <Tooltip title={titulo}>
            <Button onClick={onClick} variant={variant} aria-label={titulo} sx={{ minWidth: 0, ...sxFocoVisible }}>
                {cloneElement(icono, {
                    'aria-hidden' : true,
                    sx            : { backgroundColor: color, color: COLORES.textoSobrePrimario, borderRadius: '50%' },
                })}
            </Button>
        </Tooltip>
    );
};
