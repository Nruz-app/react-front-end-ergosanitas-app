/**
 * Marcadores anatómicos del electrocardiograma, superpuestos a la silueta.
 *
 * Traducen a la figura los datos que NO vienen de la bioimpedancia: el corazón lleva
 * frecuencia cardíaca y presión, la cabeza la saturación de oxígeno, y hombros y
 * rodillas el estado del sistema osteoarticular.
 *
 * A diferencia de los segmentos, estos valores SÍ son medidos: salen del control
 * clínico, no de una estimación. Por eso se dibujan como marcas encima del cuerpo y no
 * como relleno de una región: son otra cosa y deben leerse como otra cosa.
 */

import { EstadoClinico } from '../../../interface';
import { COLOR_ESTADO } from '../paleta';

interface Props {
    /** Frecuencia cardíaca y presión arterial, resumidas en el peor de los dos. */
    estadoCardiaco       : EstadoClinico;
    estadoSaturacion     : EstadoClinico;
    /** Del campo `sistemaOsteoarticular` del electro. */
    estadoOsteoarticular : EstadoClinico;
}

/** Hombros y rodillas, sobre las articulaciones de la silueta. */
const ARTICULACIONES = [
    { id: 'hombroDer',  cx: 137, cy: 152 },
    { id: 'hombroIzq',  cx: 263, cy: 152 },
    { id: 'rodillaDer', cx: 165, cy: 446 },
    { id: 'rodillaIzq', cx: 235, cy: 446 },
];

/**
 * Corazón estilizado, centrado en (214, 197).
 *
 * Va desplazado a la izquierda del paciente —derecha de la pantalla— porque ahí está:
 * dibujarlo centrado sería más cómodo y anatómicamente falso.
 */
const PATH_CORAZON = `
    M 214 212
    C 208 206 200 200 200 192
    C 200 186 205 182 210 184
    C 212 185 213 187 214 189
    C 215 187 216 185 218 184
    C 223 182 228 186 228 192
    C 228 200 220 206 214 212
    Z
`;

/** Sin dato no se oculta el marcador: se atenúa, para que se vea que existe y falta. */
const opacidadDe = (estado: EstadoClinico): number => (estado === 'sinDato' ? 0.35 : 1);

export const MarcadoresElectro = ({
    estadoCardiaco,
    estadoSaturacion,
    estadoOsteoarticular,
}: Props) => (

    // Los marcadores son informativos: la interacción pertenece a los segmentos, y
    // capturar el mouse aquí rompería el hover de la región que hay debajo.
    <g pointerEvents="none">

        {/* Saturación de oxígeno, en la cabeza. */}
        <circle
            cx={200}
            cy={64}
            r={11}
            fill="#ffffff"
            fillOpacity={0.75}
            stroke={COLOR_ESTADO[estadoSaturacion]}
            strokeWidth={2.5}
            opacity={opacidadDe(estadoSaturacion)}
        />

        {/* Corazón: frecuencia cardíaca y presión arterial. */}
        <path
            d={PATH_CORAZON}
            fill={COLOR_ESTADO[estadoCardiaco]}
            fillOpacity={0.85}
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeLinejoin="round"
            opacity={opacidadDe(estadoCardiaco)}
        />

        {/* Sistema osteoarticular: un anillo por articulación. El relleno blanco
            translúcido los mantiene legibles sobre cualquier color de segmento. */}
        {ARTICULACIONES.map(({ id, cx, cy }) => (
            <circle
                key={id}
                cx={cx}
                cy={cy}
                r={7}
                fill="#ffffff"
                fillOpacity={0.7}
                stroke={COLOR_ESTADO[estadoOsteoarticular]}
                strokeWidth={2.5}
                opacity={opacidadDe(estadoOsteoarticular)}
            />
        ))}

    </g>
);

export default MarcadoresElectro;
