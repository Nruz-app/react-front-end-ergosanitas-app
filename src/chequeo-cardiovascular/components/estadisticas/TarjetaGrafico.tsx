import { ReactNode } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

import { COLORES, sxSubtituloTarjeta, sxTarjeta, sxTituloTarjeta } from '../../config/tema';
import type { EstadoTarjeta } from '../../interface';

interface Props {
    titulo    : string;
    subtitulo : string;
    estado    : EstadoTarjeta;
    /**
     * Alto del área de contenido. `'auto'` deja que el contenido mande, que es lo que necesita
     * una lista: un alto fijo le pondría una barra de scroll dentro de otra.
     */
    alto?     : number | 'auto';
    /**
     * Sustituye el mensaje de «sin datos». La lista de alterados lo usa porque cero alterados
     * es una buena noticia, no una carencia de datos, y decir «todavía no hay datos
     * suficientes» sonaría a que falta información.
     */
    mensajeVacio? : string;
    children  : ReactNode;
    /** Leyenda propia, bajo el gráfico. Las donas la usan para poder llevar el total al centro. */
    leyenda?  : ReactNode;
    /** La `TablaAccesible` de este gráfico. Se monta también en los estados vacíos. */
    tabla?    : ReactNode;
}

const MENSAJES: Record<EstadoTarjeta, string> = {
    'cargando'      : 'Cargando…',
    'sin-datos'     : 'Todavía no hay datos suficientes.',
    'no-disponible' : 'Este indicador no está disponible en este momento.',
    'ok'            : '',
};

/**
 * El envoltorio común de las tarjetas del Home.
 *
 * Antes de la Spec 02 este bloque —título, subtítulo, alto fijo y los estados de carga y vacío—
 * estaba copiado en `GraficoTorta` y en `BarPresion`, y con cada gráfico nuevo habría sido una
 * copia más, que se desalinean a la primera modificación.
 *
 * Los estados `sin-datos` y `no-disponible` dicen cosas distintas a propósito: el colegio tiene
 * que poder distinguir «todavía no medimos esto» de «el servicio se cayó». Hoy la diferencia es
 * real: `estadistica-saturacion` devuelve 500.
 */
export const TarjetaGrafico = (
    { titulo, subtitulo, estado, alto = 260, mensajeVacio, children, leyenda, tabla }: Props,
) => {

    return (
        <Card elevation={0} sx={sxTarjeta}>
            <CardContent>
                <Typography component="h3" sx={sxTituloTarjeta}>
                    { titulo }
                </Typography>
                {/*
                    El subtítulo describe los datos, así que mientras se cargan o cuando el
                    servicio no responde no hay nada que describir. El `minHeight` reserva su
                    línea para que la tarjeta no salte al llegar la serie. Sin esta guarda, la de saturación
                    —cuyo endpoint devuelve 500— anunciaría «Sin exámenes registrados», que es
                    justo el dato inventado que esta spec quería evitar.
                */}
                <Typography sx={{ ...sxSubtituloTarjeta, minHeight: 18 }}>
                    { estado === 'cargando' || estado === 'no-disponible' ? '' : subtitulo }
                </Typography>

                <Box
                    sx={{
                        height         : alto === 'auto' ? 'auto' : alto,
                        minHeight      : alto === 'auto' ? 80 : undefined,
                        position       : 'relative',
                        display        : 'flex',
                        alignItems     : 'center',
                        justifyContent : 'center',
                    }}
                >
                    { estado === 'ok'
                        ? children
                        : (
                            <Typography
                                sx={{
                                    fontSize  : 13,
                                    textAlign : 'center',
                                    px        : 2,
                                    color     : estado === 'no-disponible'
                                        ? COLORES.limiteAlto
                                        : 'text.secondary',
                                }}
                            >
                                { estado === 'sin-datos' && mensajeVacio
                                    ? mensajeVacio
                                    : MENSAJES[estado] }
                            </Typography>
                        )}
                </Box>

                { estado === 'ok' && leyenda }
                { tabla }
            </CardContent>
        </Card>
    );
};
