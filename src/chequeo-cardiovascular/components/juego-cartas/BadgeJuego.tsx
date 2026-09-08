import { Box } from '@mui/material';

import type { IBadgeCarta } from '../../interface';

interface Props {
    badge : IBadgeCarta;
    /** El badge de nivel pesa más que el de completitud: es el que resume la carta. */
    tamano?: 'normal' | 'pequeno';
}

/**
 * La etiqueta de una banda —nivel clínico o completitud— con los colores que manda el backend.
 *
 * 🔴 **Los colores salen del dato, no de `tema.ts`.** Es lo único del módulo que se pinta así, y
 * es deliberado: la tabla `juego_niveles` existe justo para retunear bandas y paleta con un
 * `UPDATE`, sin desplegar el front. La regla de «ningún `.tsx` escribe un hex» se mantiene.
 *
 * **El nombre de la banda va escrito dentro**, nunca solo el color: un badge que solo se
 * distingue por su tono no dice nada a quien no distingue esos tonos.
 */
export const BadgeJuego = ({ badge, tamano = 'normal' }: Props) => {

    const pequeno = tamano === 'pequeno';

    return (
        <Box
            component="span"
            sx={{
                display         : 'inline-block',
                px              : pequeno ? 1 : 1.5,
                py              : pequeno ? 0.25 : 0.6,
                borderRadius    : 5,
                fontSize        : pequeno ? 11 : 12,
                fontWeight      : 700,
                letterSpacing   : '0.02em',
                whiteSpace      : 'nowrap',
                backgroundColor : badge.color_fondo,
                color           : badge.color_texto,
            }}
        >
            { badge.nombre }
        </Box>
    );
};
