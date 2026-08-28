import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TEMA_HOME } from '../config/tema-home';

import type { IVideoHome } from '../interface';

interface Props {
    video : IVideoHome;
}

/**
 * Una tarjeta de video.
 *
 * `preload="none"` es la línea más importante del componente. Los siete videos suman
 * 139 MB; sin ella el navegador empezaría a descargarlos al abrir la portada y el Home
 * sería inusable con datos móviles. Con `preload="none"` lo único que viaja es la
 * carátula, y el `.mp4` recién se pide cuando alguien pulsa play.
 *
 * El marco es 9:16 porque los siete videos son verticales: seis en 9:16 y uno en 4:5.
 * Son publicaciones de Instagram, no material grabado para una web.
 *
 * El ajuste es `contain` y no `cover`: recortar el único video 4:5 para forzarlo a 9:16
 * le quitaría casi un tercio del ancho. Prefiero una franja lateral a perder imagen.
 */
export const TarjetaVideo = ( { video }: Props ) => {
    return (
        <Box>
            <Box
                sx={{
                    position    : 'relative',
                    borderRadius: 3,
                    overflow    : 'hidden',
                    aspectRatio : '9 / 16',
                    bgcolor     : TEMA_HOME.azulProfundo,
                    border      : `1px solid ${ TEMA_HOME.borde }`,
                }}
            >
                <Box
                    component="video"
                    controls
                    preload="none"
                    playsInline
                    poster={ video.poster }
                    sx={{
                        width    : '100%',
                        height   : '100%',
                        objectFit: 'contain',
                        display  : 'block',
                        bgcolor  : TEMA_HOME.azulProfundo,
                    }}
                >
                    <source src={ video.src } type="video/mp4" />
                    Tu navegador no puede reproducir este video.
                </Box>
            </Box>

            <Typography
                component="h3"
                sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.98rem', lineHeight: 1.4, color: TEMA_HOME.azulProfundo }}
            >
                { video.titulo }
            </Typography>
        </Box>
    );
};
