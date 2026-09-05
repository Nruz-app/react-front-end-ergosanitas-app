import { Box, Chip, Typography } from '@mui/material';

import { COLORES, UI } from '../../config/tema';
import type { IChequeo } from '../../interface';
import {
    capitalizarPalabras, formatearPresion, getEstadoProps, hayDato, oGuion,
} from '../../utilities';

interface Props {
    row : IChequeo;
}

/**
 * Un signo vital de la tarjeta. Quien la usa decide con `hayDato` si hay valor; aquí `null`
 * se pinta «—». Un 0 sí se muestra: en un signo vital es una medición, no una ausencia.
 */
const Signo = ({ label, valor }: { label: string; valor: string | null }) => (

    <Box sx={{ minWidth: 62 }}>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            { label }
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: COLORES.primarioOsc }}>
            { valor ?? '—' }
        </Typography>
    </Box>
);

/**
 * Un deportista alterado pintado como tarjeta, para pantallas bajo 900 px.
 *
 * Es la misma fila que `ListaAlterados` en otro formato: **las dos se cambian juntas**. Ocho
 * columnas con signos vitales no caben en 375 px sin scroll horizontal, y el módulo lo prohíbe.
 */
export const TarjetaAlterado = ({ row }: Props) => {

    const { label, color } = getEstadoProps(row.estado_paciente ?? '');

    const presion = formatearPresion(row.presion_sistolica, row.presionArterial);

    return (
        <Box
            sx={{
                p            : 1.75,
                mb           : 1.25,
                borderRadius : 2,
                border       : `1px solid ${COLORES.borde}`,
                // El alterado se marca con barra lateral, igual que la fila «reciente» de la
                // lista del tab 1: el fondo rojo pleno dejaba el texto ilegible.
                borderLeft   : `5px solid ${UI.atencion}`,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start', mb: 1.25 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: COLORES.primarioOsc, wordBreak: 'break-word' }}>
                        { capitalizarPalabras(row.nombre) }
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.3 }}>
                        { oGuion(row.rut) } · { hayDato(row.edad) ? `${row.edad} años` : 'edad —' }
                    </Typography>
                </Box>
                <Chip label={label} color={color} size="small" sx={{ flexShrink: 0 }} />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Signo label="Presión" valor={presion} />
                <Signo
                    label="FC"
                    valor={hayDato(row.frecuencia_cardiaca_paciente)
                        ? `${row.frecuencia_cardiaca_paciente} lpm`
                        : null}
                />
                <Signo label="Sat." valor={hayDato(row.saturacionOxigeno) ? `${row.saturacionOxigeno}%` : null} />
                <Signo label="IMC" valor={hayDato(row.imc_paciente) ? String(row.imc_paciente) : null} />
            </Box>
        </Box>
    );
};
