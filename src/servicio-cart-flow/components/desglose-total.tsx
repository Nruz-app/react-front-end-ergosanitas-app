import { Box, Divider, Stack, Typography } from '@mui/material';

import { ETIQUETAS_DESGLOSE } from '../config/textos';
import { COLORES, UI } from '../config/tema';
import type { IDesglose } from '../interface';
import { formatoClp } from '../utilities';

interface Props {
    desglose: IDesglose;
}

/** Desglose transparente que calcula el back: nunca se suma nada aquí. */
export const DesgloseTotal = ({ desglose }: Props) => (

    <Box sx={{ background: COLORES.fondoSutil, borderRadius: 3, p: 2.5, border: `1px solid ${COLORES.borde}` }}>
        <Stack spacing={1}>
            {ETIQUETAS_DESGLOSE.filter(({ clave }) => desglose[clave] > 0).map(({ clave, etiqueta }) => (
                <Fila key={clave} etiqueta={etiqueta} valor={formatoClp(desglose[clave])} />
            ))}

            {desglose.descuento_plan > 0 && (
                <Fila etiqueta="Ahorro con tu plan (ya descontado)" valor={`−${formatoClp(desglose.descuento_plan)}`} color={UI.exito} />
            )}

            {desglose.ajuste_redondeo > 0 && (
                <Fila etiqueta="Redondeo al $1.000" valor={formatoClp(desglose.ajuste_redondeo)} color={COLORES.textoSuave} />
            )}

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight="bold" color={COLORES.navy}>Total (IVA incluido)</Typography>
                <Typography variant="h5" fontWeight="bold" color={COLORES.navy}>{formatoClp(desglose.total)}</Typography>
            </Stack>
        </Stack>
    </Box>
);

const Fila = ({ etiqueta, valor, color }: { etiqueta: string; valor: string; color?: string }) => (
    <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color={color ?? COLORES.texto}>{etiqueta}</Typography>
        <Typography variant="body2" color={color ?? COLORES.texto}>{valor}</Typography>
    </Stack>
);
