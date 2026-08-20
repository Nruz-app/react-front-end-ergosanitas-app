/**
 * Líneas guía que conectan cada segmento con su ficha lateral.
 *
 * Van dentro del `<svg>` para compartir el sistema de coordenadas del `viewBox`: así
 * el punto de anclaje cae siempre sobre el segmento correcto, independientemente del
 * ancho al que se esté renderizando la silueta.
 *
 * La guía del tronco cruza por encima del brazo. Es inevitable —el tronco queda detrás
 * de las extremidades— y es lo que hace también el informe del equipo.
 */

import { SegmentoId } from '../../../interface';

interface Guia {
    id : SegmentoId;
    /** Punto sobre el segmento. */
    x1 : number;
    y1 : number;
    /** Salida al borde del lienzo, a la altura de la ficha. */
    x2 : number;
    y2 : number;
}

const GUIAS: Guia[] = [
    { id: 'tronco',    x1: 172, y1: 232, x2: 0,   y2: 190 },
    { id: 'brazoDer',  x1: 108, y1: 300, x2: 0,   y2: 300 },
    { id: 'brazoIzq',  x1: 292, y1: 300, x2: 400, y2: 300 },
    { id: 'piernaDer', x1: 163, y1: 505, x2: 0,   y2: 540 },
    { id: 'piernaIzq', x1: 237, y1: 505, x2: 400, y2: 540 },
];

interface Props {
    /** Segmento resaltado: su guía se dibuja opaca y el resto se atenúa. */
    segmentoActivo?: SegmentoId | null;
}

export const GuiasCallout = ({ segmentoActivo = null }: Props) => (

    <g pointerEvents="none" stroke="#90a4ae" fill="#90a4ae">
        {GUIAS.map(({ id, x1, y1, x2, y2 }) => {

            const activo = segmentoActivo === id;

            return (
                <g key={id} opacity={activo ? 1 : 0.55}>
                    <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        strokeWidth={activo ? 1.6 : 1}
                        strokeDasharray="4 3"
                    />
                    <circle cx={x1} cy={y1} r={activo ? 4 : 3} stroke="none" />
                </g>
            );
        })}
    </g>
);

export default GuiasCallout;
