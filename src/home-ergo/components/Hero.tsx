import { NavLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import portada from '../config/home-hero.json';
import { urlWhatsapp } from '../config/canales-contacto';
import { ANCHO_MAXIMO, ETIQUETA_SECCION, TEMA_HOME } from '../config/tema-home';
import { TrazoEcg } from './TrazoEcg';

import type { IPortadaHome } from '../interface';

const { hero } = portada as IPortadaHome;

/**
 * Bloque superior de la portada: fotografía de un operativo real, titular y los dos
 * llamados a la acción.
 *
 * La foto va en un `<img>` absoluto y no en `background-image` a propósito. Es el
 * elemento más grande de la pantalla y por tanto el que mide el LCP: como `<img>` acepta
 * `fetchPriority="high"`, que le dice al navegador que la baje antes que el resto.
 *
 * El velo es un degradado direccional y no una capa negra plana: deja ver a las personas
 * de la fotografía en el lado derecho, que es lo que da credibilidad, y oscurece solo la
 * banda izquierda donde va el texto.
 */
export const Hero = () => {
    return (
        <Box
            component="section"
            sx={{
                position  : 'relative',
                overflow  : 'hidden',
                bgcolor   : TEMA_HOME.azulProfundo,
                minHeight : { xs: 520, md: 620 },
                display   : 'flex',
                alignItems: 'center',
            }}
        >
            <Box
                component="img"
                src={ hero.imagen }
                alt=""
                decoding="async"
                // React 18.3 no reconoce `fetchPriority` en camelCase: avisaría por consola y
                // descartaría el atributo. En minúsculas lo deja pasar tal cual al DOM, que es
                // lo que lee el navegador para priorizar la descarga de la imagen del LCP.
                { ...{ fetchpriority: 'high' } }
                sx={{
                    position : 'absolute',
                    inset    : 0,
                    width    : '100%',
                    height   : '100%',
                    objectFit: 'cover',
                    // En móvil el encuadre se corre a la derecha: las personas de la foto
                    // quedan fuera de la banda de texto en vez de detrás de ella.
                    objectPosition: { xs: '72% center', md: 'center' },
                }}
            />

            <Box
                aria-hidden="true"
                sx={{
                    position  : 'absolute',
                    inset     : 0,
                    background: {
                        xs: `linear-gradient(180deg, ${ TEMA_HOME.azulProfundo }F2 0%, ${ TEMA_HOME.azulProfundo }CC 55%, ${ TEMA_HOME.azulProfundo }F2 100%)`,
                        md: `linear-gradient(100deg, ${ TEMA_HOME.azulProfundo }F7 0%, ${ TEMA_HOME.azulProfundo }E0 42%, ${ TEMA_HOME.azulProfundo }40 78%, transparent 100%)`,
                    },
                }}
            />

            <Container maxWidth={ false } sx={{ maxWidth: ANCHO_MAXIMO, position: 'relative', py: { xs: 8, md: 10 } }}>
                <Box sx={{ maxWidth: 680, color: '#fff' }}>
                    <Typography component="p" sx={{ ...ETIQUETA_SECCION, color: '#fff', opacity: 0.75, mb: 2 }}>
                        Ergo SaniTas SpA
                    </Typography>

                    <Typography
                        component="h1"
                        sx={{
                            fontWeight   : 800,
                            letterSpacing: '-0.03em',
                            lineHeight   : 1.03,
                            fontSize     : { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
                        }}
                    >
                        { hero.titulo }
                    </Typography>

                    <Typography
                        sx={{
                            mt        : 3,
                            maxWidth  : '52ch',
                            fontSize  : { xs: '1.05rem', md: '1.2rem' },
                            lineHeight: 1.6,
                            opacity   : 0.92,
                        }}
                    >
                        { hero.subtitulo }
                    </Typography>

                    <Box sx={{ mt: 5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Button
                            component={ NavLink }
                            to={ hero.ctaTo }
                            size="large"
                            variant="contained"
                            endIcon={ <ArrowForwardIcon /> }
                            sx={{
                                px           : 4,
                                py           : 1.5,
                                borderRadius : 999,
                                fontWeight   : 700,
                                fontSize     : '1rem',
                                textTransform: 'none',
                                bgcolor      : TEMA_HOME.azulErgo,
                                '&:hover'    : { bgcolor: '#1565c0' },
                            }}
                        >
                            { hero.ctaTexto }
                        </Button>

                        <Button
                            href={ urlWhatsapp }
                            target="_blank"
                            rel="noopener noreferrer"
                            size="large"
                            variant="outlined"
                            startIcon={ <WhatsAppIcon /> }
                            sx={{
                                px            : 4,
                                py            : 1.5,
                                borderRadius  : 999,
                                fontWeight    : 700,
                                fontSize      : '1rem',
                                textTransform : 'none',
                                color         : '#fff',
                                borderColor   : 'rgba(255,255,255,0.6)',
                                '&:hover'     : { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' },
                            }}
                        >
                            Escríbenos
                        </Button>
                    </Box>
                </Box>
            </Container>

            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
                <TrazoEcg animado alto={ 56 } />
            </Box>
        </Box>
    );
};
