import { Alert, Stack } from '@mui/material';

import type { IBloqueo } from '../interface';

interface Props {
    bloqueos : IBloqueo[];
    avisos   : IBloqueo[];
    /** Códigos que no se muestran (p. ej. `carro_vacio` mientras se arma el carro). */
    omitir  ?: string[];
}

/** Bloqueos (impiden pagar) y avisos (informativos) que devuelve el back. */
export const AvisosCarro = ({ bloqueos, avisos, omitir = [] }: Props) => {

    const visibles = bloqueos.filter((b) => !omitir.includes(b.codigo));

    if (visibles.length === 0 && avisos.length === 0) return null;

    return (
        <Stack spacing={1}>
            {avisos.map((a, i) => <Alert key={`a-${i}`} severity="info">{a.mensaje}</Alert>)}
            {visibles.map((b, i) => <Alert key={`b-${i}`} severity="error">{b.mensaje}</Alert>)}
        </Stack>
    );
};
