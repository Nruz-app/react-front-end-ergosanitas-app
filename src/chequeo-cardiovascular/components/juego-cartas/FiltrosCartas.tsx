import { Box, Chip, Typography } from '@mui/material';

import { COLORES, sxFocoVisible } from '../../config/tema';
import type { IJuegoNivel } from '../../interface';

interface Props {
    titulo       : string;
    /** Las bandas de un eje, tal como llegan de `/juego-cartas/niveles`. */
    bandas       : IJuegoNivel[];
    /** El slug elegido. `''` es «Todos». */
    seleccionado : string;
    handleElegir : (slug: string) => void;
}

/**
 * Una fila de chips de filtro, construida **desde la configuración del backend**.
 *
 * Ni una banda escrita a mano: `GET /juego-cartas/niveles` existe precisamente «para que el
 * front no hardcodee nada», así que un `UPDATE` que renombre o desactive una banda se ve aquí
 * sin tocar código. Las bandas inactivas (`activo === 0`) no se ofrecen.
 *
 * El componente es genérico a propósito: la página lo monta dos veces, una por eje —progreso de
 * la ficha y nivel clínico—, porque son **datos independientes** y el colegio querrá recorrer
 * los dos. Combinarlos es la intersección.
 */
export const FiltrosCartas = ({ titulo, bandas, seleccionado, handleElegir }: Props) => {

    const activas = bandas.filter(({ activo }) => activo !== 0);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>

            <Typography
                component="span"
                sx={{ fontSize: 12, color: 'text.secondary', minWidth: 62 }}
            >
                { titulo }
            </Typography>

            <Chip
                label="Todos"
                onClick={() => handleElegir('')}
                aria-pressed={seleccionado === ''}
                variant={seleccionado === '' ? 'filled' : 'outlined'}
                size="small"
                sx={{
                    fontWeight : 600,
                    ...(seleccionado === '' && {
                        backgroundColor : COLORES.primario,
                        color           : COLORES.fondoTarjeta,
                        '&:hover'       : { backgroundColor: COLORES.primarioHover },
                    }),
                    ...sxFocoVisible,
                }}
            />

            { activas.map((banda) => {

                const elegida = seleccionado === banda.slug;

                return (
                    <Chip
                        key={banda.slug}
                        label={banda.nombre}
                        onClick={() => handleElegir(banda.slug)}
                        aria-pressed={elegida}
                        variant={elegida ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                            fontWeight : 600,
                            // Los colores son los de la banda, los mismos del badge de la carta:
                            // así el chip y la carta que filtra se leen como la misma cosa.
                            ...(elegida
                                ? { backgroundColor: banda.color_fondo, color: banda.color_texto }
                                : { color: banda.color_texto, borderColor: banda.color_fondo }),
                            ...sxFocoVisible,
                        }}
                    />
                );
            }) }

        </Box>
    );
};
