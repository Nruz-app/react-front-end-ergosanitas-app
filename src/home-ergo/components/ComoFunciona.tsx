import { NavLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { ANCHO_MAXIMO, TEMA_HOME } from '../config/tema-home';
import { EncabezadoSeccion } from './EncabezadoSeccion';

/**
 * Los tres pasos para tomar un servicio.
 *
 * A diferencia de las fotos y los videos, estos textos no viven en un JSON: son tres
 * frases fijas que describen el flujo de la empresa, no material que se agregue o se
 * apague con el tiempo. La Spec 01 creó seis archivos de configuración y este contenido
 * no era ninguno de ellos.
 */
const PASOS = [
    {
        titulo      : 'Eliges el servicio',
        descripcion : 'Revisas el detalle de cada examen o atención y escoges el que necesitas.',
    },
    {
        titulo      : 'Agendamos la hora',
        descripcion : 'Coordinamos día y lugar contigo, sea tu casa, tu club o tu colegio.',
    },
    {
        titulo      : 'Te atendemos donde estés',
        descripcion : 'Llega nuestro equipo con el equipamiento y recibes tus resultados.',
    },
];

/**
 * Sección «Cómo funciona».
 *
 * Los pasos van numerados porque aquí el orden **es** información: son un proceso real y
 * el visitante necesita saber qué ocurre primero. En una grilla de servicios, donde el
 * orden es arbitrario, numerar sería decoración.
 */
export const ComoFunciona = () => {
    return (
        <Box component="section" sx={{ bgcolor: TEMA_HOME.hueso }}>
            <Container maxWidth={ false } sx={{ maxWidth: ANCHO_MAXIMO, py: { xs: 7, md: 10 } }}>
                <EncabezadoSeccion
                    etiqueta="Cómo funciona"
                    titulo="Tomar un servicio son tres pasos"
                />

                <Box
                    sx={{
                        display            : 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                        gap                : { xs: 4, md: 5 },
                    }}
                >
                    { PASOS.map( ( paso, i ) => (
                        <Box key={ paso.titulo } sx={{ borderTop: `2px solid ${ TEMA_HOME.azulErgo }`, pt: 3 }}>
                            <Typography
                                component="p"
                                aria-hidden="true"
                                sx={{
                                    fontWeight   : 800,
                                    fontSize     : '1.1rem',
                                    letterSpacing: '0.08em',
                                    color        : TEMA_HOME.azulErgo,
                                    mb           : 1.5,
                                }}
                            >
                                { String( i + 1 ).padStart( 2, '0' ) }
                            </Typography>

                            <Typography
                                component="h3"
                                sx={{ fontWeight: 700, fontSize: '1.25rem', color: TEMA_HOME.azulProfundo, mb: 1 }}
                            >
                                { paso.titulo }
                            </Typography>

                            <Typography sx={{ fontSize: '1rem', lineHeight: 1.65, opacity: 0.78 }}>
                                { paso.descripcion }
                            </Typography>
                        </Box>
                    ) ) }
                </Box>

                <Button
                    component={ NavLink }
                    to="/servicios"
                    variant="contained"
                    size="large"
                    sx={{
                        mt           : { xs: 5, md: 7 },
                        px           : 4,
                        py           : 1.5,
                        borderRadius : 999,
                        fontWeight   : 700,
                        textTransform: 'none',
                        bgcolor      : TEMA_HOME.azulErgo,
                        '&:hover'    : { bgcolor: '#1565c0' },
                    }}
                >
                    Empezar ahora
                </Button>
            </Container>
        </Box>
    );
};
