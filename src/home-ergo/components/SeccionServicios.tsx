import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import servicios from '../config/home-servicios.json';
import { ANCHO_MAXIMO, TEMA_HOME } from '../config/tema-home';
import { EncabezadoSeccion } from './EncabezadoSeccion';
import { TarjetaServicio } from './TarjetaServicio';

import type { IServicioHome } from '../interface';

/** Destino único de la conversión. `/servicios` ya tiene el flujo completo para contratar. */
const DESTINO = '/servicios';

const ACTIVOS = ( servicios as IServicioHome[] ).filter( ( s ) => s.activo );

/**
 * Grilla de servicios.
 *
 * La grilla usa `auto-fit` con un mínimo de 260 px en vez de un número fijo de columnas
 * por breakpoint. Son siete tarjetas —un número impar— y con columnas fijas la última
 * fila queda coja en casi todos los anchos; dejando que fluyan, el navegador reparte el
 * espacio y las tarjetas mantienen el mismo ancho entre sí.
 *
 * Aquí las tarjetas **no** van numeradas, al revés que los pasos de «Cómo funciona». El
 * orden de los servicios es arbitrario: numerarlos sugeriría una secuencia que no existe.
 */
export const SeccionServicios = () => {
    return (
        <Box component="section" sx={{ bgcolor: '#fff', borderBottom: `1px solid ${ TEMA_HOME.borde }` }}>
            <Container maxWidth={ false } sx={{ maxWidth: ANCHO_MAXIMO, py: { xs: 7, md: 10 } }}>
                <EncabezadoSeccion
                    etiqueta="Servicios"
                    titulo="Lo que hacemos"
                    bajada="Exámenes y atenciones que llegan a tu casa, a tu club o a tu colegio, con equipamiento portátil y profesionales de la salud."
                />

                <Box
                    sx={{
                        display            : 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap                : { xs: 2.5, md: 3 },
                    }}
                >
                    { ACTIVOS.map( ( servicio ) => (
                        <TarjetaServicio key={ servicio.id } servicio={ servicio } to={ DESTINO } />
                    ) ) }
                </Box>
            </Container>
        </Box>
    );
};
