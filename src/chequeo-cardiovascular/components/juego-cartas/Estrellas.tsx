import { Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { JUEGO } from '../../config/tema';

const TOTAL = 5;

interface Props {
    /** 0–5. Es `0` cuando la carta no tiene puntaje, no cuando el alumno «va mal». */
    cantidad : number;
    tamano?  : number;
}

/**
 * Las cinco estrellas de una carta.
 *
 * **El texto alternativo no es decoración.** Las estrellas son iconos: sin él, un lector de
 * pantalla no lee nada de esta fila. Los cinco iconos van `aria-hidden` y el grupo entero se
 * anuncia con una sola frase, que es como se lee una puntuación.
 *
 * ⚠️ Las estrellas **casi no discriminan**: derivan de `CEIL(puntaje/20)` y el puntaje se
 * concentra alto, así que la mayoría de cartas evaluadas tienen 5. Son el lenguaje del juego;
 * el orden real lo da el puntaje, que va escrito en la carta.
 */
export const Estrellas = ({ cantidad, tamano = 20 }: Props) => {

    const llenas = Math.max(0, Math.min(TOTAL, cantidad));

    return (
        <Box
            role="img"
            aria-label={`${llenas} de ${TOTAL} estrellas`}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}
        >
            { Array.from({ length: TOTAL }, (_, indice) => (
                indice < llenas
                    ? <StarIcon key={indice} aria-hidden="true" sx={{ fontSize: tamano, color: JUEGO.estrellaLlena }} />
                    : <StarBorderIcon key={indice} aria-hidden="true" sx={{ fontSize: tamano, color: JUEGO.estrellaVacia }} />
            )) }
        </Box>
    );
};
