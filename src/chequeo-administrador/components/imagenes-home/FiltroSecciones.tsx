import { Box, Chip } from '@mui/material';

import { COLOR_SECCION, ETIQUETA_SECCION, SECCIONES_IMAGEN } from '../../config/imagenes-home';
import { COLORES, sxFocoVisible } from '../../config/tema';
import type { SeccionImagenHome } from '../../interface';

interface Props {
    /** La sección elegida. `''` es «Todas». */
    seleccionada : SeccionImagenHome | '';
    /** Cuántas imágenes hay en cada sección, activas e inactivas. */
    conteos      : Record<SeccionImagenHome, number>;
    handleElegir : (seccion: SeccionImagenHome | '') => void;
}

/**
 * Chips de filtro «Todas · Promociones · Alianzas · Galería», con el conteo de cada una (Spec 02).
 *
 * Es la forma de `FiltrosCartas` del juego de cartas de Colegios, clonada (regla dura 1). Las
 * secciones salen de `config/imagenes-home.ts`, no de un literal en el `.tsx`. Cada chip elegido
 * toma el color de su sección, el mismo del chip de la carta, para que se lean como la misma cosa.
 */
export const FiltroSecciones = ({ seleccionada, conteos, handleElegir }: Props) => {

    const total = SECCIONES_IMAGEN.reduce((suma, seccion) => suma + conteos[seccion], 0);

    return (
        <Box
            role="group"
            aria-label="Filtrar por sección"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
        >
            <Chip
                label={`Todas · ${total}`}
                onClick={() => handleElegir('')}
                aria-pressed={seleccionada === ''}
                variant={seleccionada === '' ? 'filled' : 'outlined'}
                sx={{
                    fontWeight : 600,
                    ...(seleccionada === '' && {
                        backgroundColor : COLORES.primario,
                        color           : COLORES.fondoTarjeta,
                        '&:hover'       : { backgroundColor: COLORES.primarioHover },
                    }),
                    ...sxFocoVisible,
                }}
            />

            { SECCIONES_IMAGEN.map((seccion) => {

                const elegida = seleccionada === seccion;
                const color = COLOR_SECCION[seccion];

                return (
                    <Chip
                        key={seccion}
                        label={`${ETIQUETA_SECCION[seccion]} · ${conteos[seccion]}`}
                        onClick={() => handleElegir(seccion)}
                        aria-pressed={elegida}
                        variant={elegida ? 'filled' : 'outlined'}
                        sx={{
                            fontWeight : 600,
                            ...(elegida
                                ? { backgroundColor: color, color: COLORES.fondoTarjeta, '&:hover': { backgroundColor: color } }
                                : { color, borderColor: color }),
                            ...sxFocoVisible,
                        }}
                    />
                );
            }) }
        </Box>
    );
};
