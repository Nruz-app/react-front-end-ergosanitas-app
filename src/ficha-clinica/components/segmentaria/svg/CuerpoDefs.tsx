/**
 * Definiciones compartidas del SVG de la silueta: gradientes, sombra y realce.
 *
 * Va dentro del `<svg>` de `SiluetaCorporal`, una sola vez. Todo es local al documento:
 * ninguna definición carga un recurso externo, en línea con la regla de la Spec 03 de
 * no depender de imágenes ni librerías de visualización.
 */

import { COLOR_ESTADO, COLOR_ESTADO_CLARO, ESTADOS, ID_BRILLO, ID_SOMBRA, idGradiente } from '../paleta';

export const CuerpoDefs = () => (
    <defs>

        {/* Un gradiente radial por estado clínico. El foco está arriba y al centro
            (cy=32%) para simular una luz cenital: da volumen sin recurrir a sombreado
            manual sobre cada región. */}
        {ESTADOS.map((estado) => (
            <radialGradient
                key={estado}
                id={idGradiente(estado)}
                cx="50%"
                cy="32%"
                r="78%"
            >
                <stop offset="0%" stopColor={COLOR_ESTADO_CLARO[estado]} stopOpacity={0.95} />
                <stop offset="65%" stopColor={COLOR_ESTADO_CLARO[estado]} stopOpacity={0.75} />
                <stop offset="100%" stopColor={COLOR_ESTADO[estado]} stopOpacity={0.55} />
            </radialGradient>
        ))}

        {/* Sombra suave que despega la figura del fondo de la tarjeta. Muy poco
            desplazamiento y mucho desenfoque: la silueta debe verse apoyada, no
            recortada y pegada encima. */}
        <filter id={ID_SOMBRA} x="-20%" y="-10%" width="140%" height="125%">
            <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="5"
                floodColor="#263238"
                floodOpacity={0.18}
            />
        </filter>

        {/* Realce del segmento activo (hover o fijado). Se aplica encima del relleno
            que ya tiene la región, así que no compite con el color del estado: solo
            lo hace destacar. */}
        <filter id={ID_BRILLO} x="-25%" y="-15%" width="150%" height="130%">
            <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="6"
                floodColor="#37474f"
                floodOpacity={0.45}
            />
        </filter>

    </defs>
);

export default CuerpoDefs;
