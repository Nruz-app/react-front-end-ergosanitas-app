/**
 * Silueta corporal: el SVG que colorea cada segmento según su estado clínico.
 *
 * Es un componente de presentación puro. No calcula nada y no conoce la bioimpedancia:
 * recibe ya resuelto qué color va en cada región y avisa hacia arriba cuando el usuario
 * pasa el mouse o hace click. La estimación vive en `utilities/segmentacion.ts`.
 */

import { ReactNode } from 'react';

import { EstadoClinico, SegmentoId } from '../../interface';
import { COLOR_ESTADO, ID_BRILLO, ID_SOMBRA, idGradiente } from './paleta';
import { CuerpoDefs } from './svg/CuerpoDefs';
import {
    PATH_BRAZO_DER,
    PATH_BRAZO_IZQ,
    PATH_CABEZA,
    PATH_PIERNA_DER,
    PATH_PIERNA_IZQ,
    PATH_TRONCO,
    VIEWBOX,
} from './svg/cuerpo-paths';

interface Props {
    /** Estado clínico ya resuelto para cada uno de los cinco segmentos. */
    colores          : Record<SegmentoId, EstadoClinico>;
    /** Segmento fijado o bajo el cursor. `null` cuando no hay ninguno. */
    segmentoActivo?  : SegmentoId | null;
    onHoverSegmento? : (id: SegmentoId | null) => void;
    onClickSegmento? : (id: SegmentoId) => void;
    /** Texto para lectores de pantalla. Debe describir lo que se está mostrando. */
    titulo?          : string;
    /**
     * Contenido extra dentro del propio `<svg>`, en coordenadas del `viewBox`.
     * Es la vía por la que se superponen los marcadores del electrocardiograma: si
     * fueran un elemento hermano no compartirían el sistema de coordenadas.
     */
    children?        : ReactNode;
}

/** Las cinco regiones que reciben masa, en orden de dibujo. */
const REGIONES: { id: SegmentoId; d: string }[] = [
    { id: 'tronco',    d: PATH_TRONCO     },
    { id: 'brazoIzq',  d: PATH_BRAZO_IZQ  },
    { id: 'brazoDer',  d: PATH_BRAZO_DER  },
    { id: 'piernaIzq', d: PATH_PIERNA_IZQ },
    { id: 'piernaDer', d: PATH_PIERNA_DER },
];

export const SiluetaCorporal = ({
    colores,
    segmentoActivo = null,
    onHoverSegmento,
    onClickSegmento,
    titulo = 'Silueta corporal con la distribución estimada por segmento',
    children,
}: Props) => {

    // La cabeza no es un segmento: no recibe masa propia porque su masa se agrupa en el
    // tronco, igual que en el vector de coeficientes. Toma prestado su estado para no
    // quedar como un hueco gris en medio de una figura coloreada.
    const estadoCabeza = colores.tronco;

    const interactiva = Boolean(onClickSegmento || onHoverSegmento);

    return (
        <svg
            viewBox={VIEWBOX}
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            style={{ display: 'block', width: '100%', height: 'auto' }}
            role="img"
            aria-label={titulo}
        >
            <title>{titulo}</title>

            <CuerpoDefs />

            <g filter={`url(#${ID_SOMBRA})`}>

                {/* Cabeza: se dibuja primero y no responde a eventos. */}
                <path
                    d={PATH_CABEZA}
                    fill={`url(#${idGradiente(estadoCabeza)})`}
                    stroke={COLOR_ESTADO[estadoCabeza]}
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    pointerEvents="none"
                />

                {REGIONES.map(({ id, d }) => {

                    const estado = colores[id];
                    const activo = segmentoActivo === id;

                    return (
                        <path
                            key={id}
                            d={d}
                            fill={`url(#${idGradiente(estado)})`}
                            stroke={COLOR_ESTADO[estado]}
                            // El segmento activo se engrosa además de brillar: el filtro
                            // solo no se distingue sobre un relleno que ya tiene color.
                            strokeWidth={activo ? 3 : 1.5}
                            strokeLinejoin="round"
                            filter={activo ? `url(#${ID_BRILLO})` : undefined}
                            style={{
                                cursor: interactiva ? 'pointer' : 'default',
                                transition: 'stroke-width 120ms ease, opacity 120ms ease',
                                // Los no seleccionados se atenúan apenas, lo justo para
                                // que el activo gane sin que el resto deje de leerse.
                                opacity: segmentoActivo && !activo ? 0.72 : 1,
                            }}
                            onMouseEnter={() => onHoverSegmento?.(id)}
                            onMouseLeave={() => onHoverSegmento?.(null)}
                            onClick={() => onClickSegmento?.(id)}
                        />
                    );
                })}
            </g>

            {/* Marcadores del electrocardiograma y cualquier otra capa superpuesta. */}
            {children}

            {/* Marcas de lateralidad. Son las del PACIENTE: como la silueta se mira de
                frente, la L queda a la derecha de la pantalla. Sin ellas, un lector
                asume su propia izquierda y lee el informe al revés. */}
            <g pointerEvents="none">
                <circle cx="152" cy="52" r="15" fill="#eceff1" stroke="#b0bec5" strokeWidth={1} />
                <text
                    x="152"
                    y="52"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="15"
                    fontWeight="600"
                    fill="#546e7a"
                >
                    R
                </text>

                <circle cx="248" cy="52" r="15" fill="#eceff1" stroke="#b0bec5" strokeWidth={1} />
                <text
                    x="248"
                    y="52"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="15"
                    fontWeight="600"
                    fill="#546e7a"
                >
                    L
                </text>
            </g>
        </svg>
    );
};

export default SiluetaCorporal;
