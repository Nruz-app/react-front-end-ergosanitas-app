import { Box, Typography } from '@mui/material';

import { COLORES, JUEGO } from '../../config/tema';
import type { IAtributoCarta, IJuegoAtributoCatalogo } from '../../interface';

interface Props {
    atributo : IAtributoCarta;
    /** La entrada del catálogo con su icono y su nombre. `undefined` si el slug es desconocido. */
    catalogo?: IJuegoAtributoCatalogo;
}

/**
 * Un atributo de la carta: icono, nombre, barra y valor.
 *
 * **Sin medir se pinta `—` y la barra vacía, nunca un `0`.** Un cero diría que el alumno sacó
 * cero en ese atributo; lo que dice el dato es que no hay ningún sub-indicador con el que
 * calcularlo. Es la misma regla que sigue todo el módulo.
 *
 * Si el `slug` no está en el catálogo —porque el backend añadió un atributo y el front aún no lo
 * conoce— se pinta igual, con el slug por nombre y sin icono: **nada se descarta en silencio**.
 */
export const BarraAtributo = ({ atributo, catalogo }: Props) => {

    // `null` es «sin sub-indicadores», no un cero. Solo el **ancho** de la barra necesita un
    // número, y ahí un 0 significa «barra vacía»; el texto sigue diciendo `—`.
    const valor  = atributo.medido ? atributo.valor : null;
    const medido = valor !== null;
    const relleno = valor ?? 0;
    const nombre = catalogo?.nombre ?? atributo.slug;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

            <Box
                component="span"
                aria-hidden="true"
                sx={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}
            >
                { catalogo?.icono ?? '•' }
            </Box>

            <Typography
                sx={{
                    fontSize   : 12,
                    color      : 'text.secondary',
                    width      : 78,
                    flexShrink : 0,
                    whiteSpace : 'nowrap',
                    overflow   : 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                { nombre }
            </Typography>

            <Box
                role="progressbar"
                aria-label={`${nombre}: ${medido ? `${valor} de 100` : 'sin medir'}`}
                aria-valuenow={valor ?? undefined}
                aria-valuemin={0}
                aria-valuemax={100}
                sx={{
                    flex            : 1,
                    height          : 7,
                    borderRadius    : 5,
                    backgroundColor : JUEGO.pista,
                    overflow        : 'hidden',
                }}
            >
                <Box
                    sx={{
                        width           : `${relleno}%`,
                        height          : '100%',
                        borderRadius    : 5,
                        backgroundColor : JUEGO.barraAtributo,
                    }}
                />
            </Box>

            <Typography
                sx={{
                    fontSize   : 12,
                    fontWeight : 700,
                    width      : 30,
                    flexShrink : 0,
                    textAlign  : 'right',
                    color      : medido ? COLORES.primarioOsc : JUEGO.sinMedir,
                }}
            >
                { medido ? valor : '—' }
            </Typography>

        </Box>
    );
};
