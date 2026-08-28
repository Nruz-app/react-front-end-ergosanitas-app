import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import portada from '../config/home-hero.json';
import { ANCHO_MAXIMO, TEMA_HOME } from '../config/tema-home';

import type { IPortadaHome } from '../interface';

const { indicadores } = portada as IPortadaHome;

/**
 * Barra de confianza, justo debajo del hero.
 *
 * Lleva **dos** indicadores y no cuatro porque solo hay dos datos respaldables: los
 * seguidores de Instagram y el modelo de atención. Rellenar la fila con «10 años de
 * experiencia» sin saberlo sería inventar, y en una página de servicios médicos eso no
 * es un detalle de copy.
 *
 * Por eso `valor` es texto y no número: uno de los dos indicadores reales no es una
 * cifra, y la maqueta tiene que aguantarlo sin desarmarse.
 */
export const BarraIndicadores = () => {
    return (
        <Box
            component="section"
            sx={{
                bgcolor     : '#fff',
                borderBottom: `1px solid ${ TEMA_HOME.borde }`,
            }}
        >
            <Container maxWidth={ false } sx={{ maxWidth: ANCHO_MAXIMO, py: { xs: 4, md: 5 } }}>
                <Box
                    sx={{
                        display             : 'grid',
                        gridTemplateColumns : { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap                 : { xs: 3, sm: 0 },
                    }}
                >
                    { indicadores.map( ( indicador, i ) => (
                        <Box
                            key={ indicador.texto }
                            sx={{
                                px         : { sm: 4 },
                                // Filete divisorio solo entre columnas, nunca al inicio.
                                borderLeft : { xs: 'none', sm: i === 0 ? 'none' : `1px solid ${ TEMA_HOME.borde }` },
                            }}
                        >
                            <Typography
                                component="p"
                                sx={{
                                    fontWeight   : 800,
                                    letterSpacing: '-0.02em',
                                    lineHeight   : 1.1,
                                    fontSize     : { xs: '2rem', md: '2.6rem' },
                                    color        : TEMA_HOME.azulErgo,
                                }}
                            >
                                { indicador.valor }
                            </Typography>

                            <Typography sx={{ mt: 0.5, fontSize: '0.98rem', opacity: 0.72 }}>
                                { indicador.texto }
                            </Typography>
                        </Box>
                    ) ) }
                </Box>
            </Container>
        </Box>
    );
};
