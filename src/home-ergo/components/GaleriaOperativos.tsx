import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import galeria from '../config/home-galeria.json';
import { ANCHO_MAXIMO, TEMA_HOME } from '../config/tema-home';
import { EncabezadoSeccion } from './EncabezadoSeccion';

import type { IImagenHome } from '../interface';

const ACTIVAS = ( galeria as IImagenHome[] ).filter( ( img ) => img.activo );

/**
 * Galería de operativos en terreno.
 *
 * Son las únicas fotografías reales del material: cuatro, contra veintiuna gráficas de
 * campaña. Por eso van sobre fondo azul profundo y no sobre el fondo claro del resto de
 * la página — es la sección que sostiene la credibilidad de todo lo demás, y en oscuro
 * las fotos ganan el peso que les corresponde.
 *
 * Las celdas son **cuadradas**, y ese número sale de medir los archivos, no de una
 * intuición: dos de las cuatro fotos son 1200×1600 (vertical 3:4), una es 720×625 y otra
 * 640×640. Un marco apaisado 4:3 le habría cortado casi la mitad del alto a las
 * verticales. En cuadrado, las dos verticales pierden un recorte parejo arriba y abajo,
 * la cuadrada entra intacta y la casi cuadrada apenas se ajusta.
 *
 * `objectPosition` carga el encuadre hacia arriba porque en una foto de gente trabajando
 * lo que importa está en el tercio superior; centrado, el recorte se comería las caras.
 */
export const GaleriaOperativos = () => {
    return (
        <Box component="section" sx={{ bgcolor: TEMA_HOME.azulProfundo }}>
            <Container 
                maxWidth={ false } 
                sx={{ maxWidth: ANCHO_MAXIMO, py: { xs: 7, md: 10 }, color:'white' }}>
                <EncabezadoSeccion
                    sobreOscuro
                    etiqueta="En terreno"
                    titulo="Operativos donde ocurre el deporte"
                    bajada="Clubes, colegios y eventos. Llevamos el equipamiento y el equipo hasta la cancha."
                />

                <Box
                    sx={{
                        display            : 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap                : { xs: 2, md: 2.5 },
                    }}
                >
                    { ACTIVAS.map( ( imagen ) => (
                        <Box
                            key={ imagen.id }
                            sx={{
                                position    : 'relative',
                                overflow    : 'hidden',
                                borderRadius: 3,
                                aspectRatio : '1 / 1',
                                bgcolor     : 'rgba(255,255,255,0.06)',
                                '&:hover img': { transform: 'scale(1.05)' },
                                '@media (prefers-reduced-motion: reduce)': {
                                    '&:hover img': { transform: 'none' },
                                },
                            }}
                        >
                            <Box
                                component="img"
                                src={ imagen.src }
                                alt={ imagen.alt }
                                loading="lazy"
                                decoding="async"
                                sx={{
                                    width         : '100%',
                                    height        : '100%',
                                    objectFit     : 'cover',
                                    objectPosition: 'center 35%',
                                    display       : 'block',
                                    transition    : 'transform .45s ease',
                                }}
                            />

                            <Box
                                sx={{
                                    position  : 'absolute',
                                    left      : 0,
                                    right     : 0,
                                    bottom    : 0,
                                    p         : 2,
                                    background: 'linear-gradient(to top, rgba(11,44,77,0.92) 0%, rgba(11,44,77,0.55) 55%, transparent 100%)',
                                }}
                            >
                                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 }}>
                                    { imagen.caption }
                                </Typography>
                            </Box>
                        </Box>
                    ) ) }
                </Box>
            </Container>
        </Box>
    );
};
