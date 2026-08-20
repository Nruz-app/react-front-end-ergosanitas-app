/**
 * Ficha de un segmento: los kg del segmento, cuánto pesan dentro del total corporal y el
 * estado clínico con su punto de color.
 *
 * El porcentaje es la FRACCIÓN DEL TOTAL, no un porcentaje respecto a un valor esperado.
 * Ojo: con datos medidos los cinco callouts NO suman 100% — el equipo no asigna cabeza ni
 * cuello a ninguna región y queda un residuo, que el pie del tab declara. El informe del
 * equipo Fitdays muestra además un porcentaje de otra naturaleza (287%, contra un valor de
 * referencia que este front no tiene), y confundirlos daría una lectura clínica falsa.
 */

import { Box, Typography } from '@mui/material';

import { EstadoClinico, OrigenSegmentario } from '../../interface';
import { SIN_DATO } from '../../utilities/format';
import { COLOR_ESTADO, ETIQUETA_ESTADO } from './paleta';

interface Props {
    nombre    : string;
    valorKg   : number | null;
    /** Fracción del total corporal: 0.541 se muestra como '54.1% del total'. */
    fraccion  : number;
    /** De dónde salió `valorKg`. Un valor estimado nunca se muestra sin marca. */
    origen?   : OrigenSegmentario;
    estado    : EstadoClinico;
    /** Alinea el texto hacia la silueta según el lado en el que se ubica. */
    alineacion?: 'izquierda' | 'derecha';
    activo?   : boolean;
    onHover?  : (dentro: boolean) => void;
    onClick?  : () => void;
    /** Variación respecto al examen base. `undefined` = sin comparación activa. */
    delta?    : number | null;
}

/**
 * Texto de la variación, con flecha de dirección.
 *
 * La flecha indica hacia dónde se movió el valor y nada más. No se colorea de verde ni
 * de rojo a propósito: subir masa muscular y subir masa grasa no significan lo mismo, y
 * un color que insinúe «mejor» o «peor» sin saber la métrica sería una lectura falsa.
 */
const textoDelta = (delta: number): string => {

    // Por debajo de 0.005 kg el redondeo a dos decimales daría '0.00': se muestra como
    // sin cambio, sin flecha, en vez de fingir una variación que no existe.
    if (Math.abs(delta) < 0.005) return '0.00 kg';

    return `${delta > 0 ? '▲ +' : '▼ −'}${Math.abs(delta).toFixed(2)} kg`;
};

export const CalloutSegmento = ({
    nombre,
    valorKg,
    fraccion,
    origen = 'medido',
    estado,
    alineacion = 'izquierda',
    activo = false,
    onHover,
    onClick,
    delta,
}: Props) => {

    const alineado = alineacion === 'izquierda' ? 'right' : 'left';

    return (
        <Box
            onMouseEnter={() => onHover?.(true)}
            onMouseLeave={() => onHover?.(false)}
            onClick={onClick}
            sx={{
                textAlign: alineado,
                cursor: onClick ? 'pointer' : 'default',
                px: 1.5,
                py: 1,
                borderRadius: 2,
                transition: 'background-color 120ms ease',
                bgcolor: activo ? 'action.hover' : 'transparent',
                // El borde del lado que mira a la silueta refuerza a qué segmento
                // pertenece la ficha, sin depender de que la línea guía se lea.
                [alineacion === 'izquierda' ? 'borderRight' : 'borderLeft']: 3,
                borderColor: COLOR_ESTADO[estado],
            }}
        >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {nombre}
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {valorKg === null ? SIN_DATO : `${valorKg.toFixed(1)} kg`}
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {(fraccion * 100).toFixed(1)}% del total
                {/* Marca mínima pero permanente: una cifra calculada no puede quedar
                    indistinguible de una que midió el equipo. */}
                {origen === 'estimado' && ' · est.'}
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mt: 0.5,
                    justifyContent: alineacion === 'izquierda' ? 'flex-end' : 'flex-start',
                }}
            >
                <Box
                    sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: COLOR_ESTADO[estado],
                        flexShrink: 0,
                    }}
                />
                <Typography variant="caption" sx={{ color: COLOR_ESTADO[estado], fontWeight: 600 }}>
                    {ETIQUETA_ESTADO[estado]}
                </Typography>
            </Box>

            {/* Variación respecto al examen base. Solo aparece con comparación activa;
                `null` significa que uno de los dos exámenes no traía el dato. */}
            {delta !== undefined && (
                <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 0.25, color: 'text.secondary', fontWeight: 600 }}
                >
                    {delta === null ? SIN_DATO : textoDelta(delta)}
                </Typography>
            )}
        </Box>
    );
};

export default CalloutSegmento;
