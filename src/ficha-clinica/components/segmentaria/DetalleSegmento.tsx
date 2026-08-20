/**
 * Tarjeta de detalle del segmento fijado.
 *
 * Aparece bajo la silueta al hacer click en una región. A diferencia de la ficha
 * lateral, que solo habla de la métrica activa, aquí se muestran las DOS: quien abre el
 * detalle de una extremidad quiere ver su grasa y su músculo juntos, no cambiar de
 * toggle para comparar.
 */

import { Box, IconButton, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import {
    EstadoClinico,
    ISegmentoCorporal,
    MetricaSegmentaria,
    OrigenSegmentario,
} from '../../interface';
import { SIN_DATO } from '../../utilities/format';
import { COLOR_ESTADO, ETIQUETA_ESTADO } from './paleta';

interface Props {
    segmento      : ISegmentoCorporal;
    estadoGrasa   : EstadoClinico;
    estadoMusculo : EstadoClinico;
    /** Métrica que colorea la silueta: su fila se destaca. */
    metrica       : MetricaSegmentaria;
    /** Variación de cada métrica respecto al examen base, si hay comparación. */
    deltaGrasa?   : number | null;
    deltaMusculo? : number | null;
    /** Fecha del examen base, para rotular contra qué se compara. */
    fechaBase?    : string;
    onCerrar      : () => void;
}

/** Misma convención que las fichas laterales: flecha de dirección, sin color semántico. */
const textoDelta = (delta: number): string => {

    if (Math.abs(delta) < 0.005) return '0.00 kg';

    return `${delta > 0 ? '▲ +' : '▼ −'}${Math.abs(delta).toFixed(2)} kg`;
};

interface FilaProps {
    etiqueta : string;
    valorKg  : number | null;
    fraccion : number;
    origen   : OrigenSegmentario;
    estado   : EstadoClinico;
    activa   : boolean;
    delta?   : number | null;
}

const Fila = ({ etiqueta, valorKg, fraccion, origen, estado, activa, delta }: FilaProps) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            bgcolor: activa ? 'action.selected' : 'transparent',
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
                sx={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    bgcolor: COLOR_ESTADO[estado],
                    flexShrink: 0,
                }}
            />
            <Typography variant="body2" sx={{ fontWeight: activa ? 700 : 500 }}>
                {etiqueta}
            </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {valorKg === null ? SIN_DATO : `${valorKg.toFixed(2)} kg`}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {(fraccion * 100).toFixed(1)}% del total
                {origen === 'estimado' && ' · est.'} · {ETIQUETA_ESTADO[estado]}
            </Typography>
            {delta !== undefined && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {delta === null ? SIN_DATO : textoDelta(delta)}
                </Typography>
            )}
        </Box>
    </Box>
);

export const DetalleSegmento = ({
    segmento,
    estadoGrasa,
    estadoMusculo,
    metrica,
    deltaGrasa,
    deltaMusculo,
    fechaBase,
    onCerrar,
}: Props) => {

    // Basta con que una de las dos métricas sea estimada para que el pie tenga que
    // explicar la marca «est.» que el lector está viendo.
    const hayEstimacion =
        segmento.origenGrasa === 'estimado' || segmento.origenMusculo === 'estimado';

    return (

    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, mt: 2 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {segmento.nombre}
                </Typography>
                {fechaBase && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Variación respecto al examen del {fechaBase}
                    </Typography>
                )}
            </Box>
            <IconButton size="small" onClick={onCerrar} aria-label="Cerrar detalle del segmento">
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>

        <Fila
            etiqueta="Masa grasa"
            valorKg={segmento.grasaKg}
            fraccion={segmento.fraccionGrasa}
            origen={segmento.origenGrasa}
            estado={estadoGrasa}
            activa={metrica === 'grasa'}
            delta={deltaGrasa}
        />

        <Fila
            etiqueta="Masa muscular"
            valorKg={segmento.musculoKg}
            fraccion={segmento.fraccionMusculo}
            origen={segmento.origenMusculo}
            estado={estadoMusculo}
            activa={metrica === 'musculo'}
            delta={deltaMusculo}
        />

        {/* El recordatorio se repite aquí a propósito: es la vista donde aparecen las
            cifras con más decimales, y por lo tanto donde más parecen una medición. */}
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
            {hayEstimacion
                ? 'Las cifras marcadas «est.» no las mide el equipo: se estiman repartiendo '
                  + 'el total del examen entre los segmentos. '
                : 'Masa medida por el equipo de bioimpedancia. '}
            El estado corresponde a la evaluación global de la métrica, no a este segmento
            por separado.
        </Typography>

    </Paper>
    );
};

export default DetalleSegmento;
