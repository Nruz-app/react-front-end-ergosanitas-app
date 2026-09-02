import { NavLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { CANALES_DIRECTOS, REDES_SOCIALES } from '../config/canales-contacto';
import { ANCHO_MAXIMO, TEMA_HOME } from '../config/tema-home';
import { EncabezadoSeccion } from './EncabezadoSeccion';

/**
 * Cierre de la portada: contacto y el último llamado a `/servicios`.
 *
 * No lleva copyright ni datos legales. `src/App.tsx` monta un `<Footer />` global debajo
 * de toda página que ya los pone, y duplicarlos daría dos avisos de copyright seguidos.
 *
 * Los tres canales son enlaces reales —`tel:`, `wa.me` y `mailto:`— y no texto plano. Un
 * teléfono que no se puede pulsar desde el móvil es un teléfono al que no te llaman.
 *
 * Los seis enlaces no se arman aquí: salen de `config/canales-contacto.tsx`, que es la
 * fuente única del módulo. Esta sección, la franja de redes y el rail fijo pintan
 * exactamente los mismos datos, y cambiar el número de teléfono es editar el JSON.
 *
 * **Solo se muestra por debajo de 1200 px** (Spec 03). Desde ahí aparece `RailContacto`,
 * que pinta los mismos seis canales fijos al borde izquierdo, y tener las dos cosas en
 * pantalla es repetir el dato dos veces. El corte es exactamente el mismo `lg` que usa el
 * rail —en sentido contrario— para que no exista ningún ancho sin contacto a la vista.
 *
 * El componente declara su propia visibilidad en vez de que lo haga `HomeErgoPage`, igual
 * que hace `RailContacto` con la suya.
 */
export const SeccionContacto = () => {
    return (
        <Box
            component="section"
            sx={{
                bgcolor: TEMA_HOME.azulProfundo,
                color  : '#fff',
                display: { xs: 'block', lg: 'none' },
            }}
        >
            <Container maxWidth={ false } sx={{ maxWidth: ANCHO_MAXIMO, py: { xs: 7, md: 10 } }}>
                <EncabezadoSeccion
                    sobreOscuro
                    etiqueta="Contacto"
                    titulo="Agenda tu hora hoy"
                    bajada="Elige el servicio que necesitas y coordina la atención. Si prefieres preguntar primero, escríbenos por WhatsApp."
                />

                <Button
                    component={ NavLink }
                    to="/servicios"
                    variant="contained"
                    size="large"
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
                    Ver servicios y agendar
                </Button>

                <Box
                    sx={{
                        mt                 : { xs: 5, md: 7 },
                        display            : 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                        gap                : 2,
                    }}
                >
                    { CANALES_DIRECTOS.map( ( { id, etiqueta, valor, url, Icono, externo } ) => (
                        <Box
                            key={ id }
                            component="a"
                            href={ url }
                            { ...( externo && { target: '_blank', rel: 'noopener noreferrer' } ) }
                            sx={{
                                display       : 'flex',
                                alignItems    : 'center',
                                gap           : 2,
                                p             : 2.5,
                                borderRadius  : 3,
                                border        : '1px solid rgba(255,255,255,0.18)',
                                bgcolor       : 'rgba(255,255,255,0.04)',
                                color         : 'inherit',
                                textDecoration: 'none',
                                transition    : 'background-color .2s ease, border-color .2s ease',
                                '&:hover'     : { bgcolor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.45)' },
                                '&:focus-visible': { outline: '3px solid #fff', outlineOffset: 2 },
                            }}
                        >
                            <Icono sx={{ color: 'rgba(255,255,255,0.85)' }} />
                            <Box>
                                <Typography sx={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.65 }}>
                                    { etiqueta }
                                </Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '1.02rem' }}>
                                    { valor }
                                </Typography>
                            </Box>
                        </Box>
                    ) ) }
                </Box>

                <Box sx={{ mt: { xs: 4, md: 5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    { REDES_SOCIALES.map( ( { id, etiqueta, url, Icono } ) => (
                        <Box
                            key={ id }
                            component="a"
                            href={ url }
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={ `Ergo SaniTas en ${ etiqueta }` }
                            sx={{
                                width         : 46,
                                height        : 46,
                                display       : 'flex',
                                alignItems    : 'center',
                                justifyContent: 'center',
                                borderRadius  : '50%',
                                border        : '1px solid rgba(255,255,255,0.28)',
                                color         : '#fff',
                                transition    : 'background-color .2s ease',
                                '&:hover'     : { bgcolor: 'rgba(255,255,255,0.14)' },
                                '&:focus-visible': { outline: '3px solid #fff', outlineOffset: 2 },
                            }}
                        >
                            <Icono />
                        </Box>
                    ) ) }
                </Box>
            </Container>
        </Box>
    );
};
