import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import videos from '../config/home-videos.json';
import { ANCHO_MAXIMO, TEMA_HOME } from '../config/tema-home';
import { EncabezadoSeccion } from './EncabezadoSeccion';
import { TarjetaVideo } from './TarjetaVideo';

import type { IVideoHome } from '../interface';

const ACTIVOS = ( videos as IVideoHome[] ).filter( ( v ) => v.activo );

/**
 * Sección de videos.
 *
 * Las tarjetas son verticales, así que la grilla arranca en 200 px de ancho: a 9:16 eso
 * ya son 355 px de alto, y columnas más anchas convertirían la sección en una muralla.
 */
export const SeccionVideos = () => {
    return (
        <Box component="section" sx={{ bgcolor: TEMA_HOME.hueso }}>
            <Container maxWidth={ false } sx={{ maxWidth: ANCHO_MAXIMO, py: { xs: 7, md: 10 } }}>
                <EncabezadoSeccion
                    etiqueta="Videos"
                    titulo="Míranos trabajando"
                    bajada="Operativos, chequeos y campañas. Pulsa para reproducir."
                />

                <Box
                    sx={{
                        display            : 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap                : { xs: 2.5, md: 3 },
                    }}
                >
                    { ACTIVOS.map( ( video ) => (
                        <TarjetaVideo key={ video.id } video={ video } />
                    ) ) }
                </Box>
            </Container>
        </Box>
    );
};
