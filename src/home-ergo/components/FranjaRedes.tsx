import { useMemo } from 'react';

import Marquee from 'react-fast-marquee';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CANALES_COMPACTOS } from '../config/canales-contacto';
import { ETIQUETA_SECCION, TEMA_HOME } from '../config/tema-home';
import { PastillaContacto } from './PastillaContacto';

/**
 * Franja de redes y contacto que desfila de lado a lado.
 *
 * Es un clon rediseñado del `MarqueeHome` del Home viejo, no un import: `src/Home/` queda
 * intacto como vía de reversa, que es regla dura del módulo. De aquel quedan la idea y la
 * librería; el contenido sale ahora de `home-contacto.json` y las tarjetas son
 * `PastillaContacto`.
 *
 * Va justo antes de la sección de contacto y hace de puente hacia ella: el visitante que
 * llega hasta el final se encuentra los seis canales dos veces, en movimiento primero y
 * quietos después.
 *
 * `gradient` difumina los dos extremos contra el fondo de la franja. Sin él las píldoras
 * aparecen y desaparecen de golpe en el borde, que es el detalle que delata a un marquee
 * mal montado.
 */
export const FranjaRedes = () => {
    /**
     * El marquee es movimiento no solicitado y perpetuo: quien pide menos movimiento no
     * lo recibe. Se mide una sola vez al montar, igual que hace el carrusel con su
     * autoplay.
     */
    const reducirMovimiento = useMemo(
        () => typeof window !== 'undefined' && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches,
        []
    );

    return (
        <Box
            component="section"
            sx={{
                bgcolor     : TEMA_HOME.hueso,
                borderTop   : `1px solid ${ TEMA_HOME.borde }`,
                borderBottom: `1px solid ${ TEMA_HOME.borde }`,
                py          : { xs: 4, md: 5 },
                overflow    : 'hidden',
            }}
        >
            <Typography
                component="p"
                sx={{ ...ETIQUETA_SECCION, textAlign: 'center', color: TEMA_HOME.azulErgo, mb: 3 }}
            >
                Síguenos y escríbenos
            </Typography>

            { reducirMovimiento ? (
                /* Sin movimiento: las mismas seis píldoras, centradas y envolviendo. */
                <Box
                    sx={{
                        display       : 'flex',
                        flexWrap      : 'wrap',
                        justifyContent: 'center',
                        gap           : 1.5,
                        px            : 2,
                    }}
                >
                    { CANALES_COMPACTOS.map( ( canal ) => (
                        <PastillaContacto key={ canal.id } canal={ canal } variante="franja" />
                    ) ) }
                </Box>
            ) : (
                <Marquee
                    autoFill
                    pauseOnHover
                    gradient
                    gradientColor={ TEMA_HOME.hueso }
                    gradientWidth={ 80 }
                    speed={ 40 }
                >
                    { CANALES_COMPACTOS.map( ( canal ) => (
                        <PastillaContacto key={ canal.id } canal={ canal } variante="franja" />
                    ) ) }
                </Marquee>
            ) }
        </Box>
    );
};
