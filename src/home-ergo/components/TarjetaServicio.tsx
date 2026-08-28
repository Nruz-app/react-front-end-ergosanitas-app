import { NavLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { resolverIcono } from '../config/iconos';
import { TEMA_HOME } from '../config/tema-home';

import type { IServicioHome } from '../interface';

interface Props {
    servicio : IServicioHome;
    /** Destino del enlace. Hoy todas las tarjetas apuntan a `/servicios`. */
    to       : string;
}

/**
 * Una tarjeta de servicio.
 *
 * La tarjeta entera es el enlace, no solo la flecha del pie. Un objetivo de clic del
 * tamaño de la tarjeta es lo que espera cualquiera que llegue desde el teléfono, y evita
 * el patrón de tener que apuntar a un texto de 80 px.
 *
 * El icono se resuelve por nombre desde el JSON: si el nombre no está en el mapa, cae al
 * icono por defecto en vez de romper la grilla completa.
 */
export const TarjetaServicio = ( { servicio, to }: Props ) => {
    const Icono = resolverIcono( servicio.icono );

    return (
        <Box
            component={ NavLink }
            to={ to }
            sx={{
                display        : 'flex',
                flexDirection  : 'column',
                height         : '100%',
                p              : { xs: 3, md: 3.5 },
                borderRadius   : 3,
                bgcolor        : '#fff',
                border         : `1px solid ${ TEMA_HOME.borde }`,
                textDecoration : 'none',
                color          : 'inherit',
                transition     : 'border-color .2s ease, transform .2s ease, box-shadow .2s ease',
                '&:hover'      : {
                    borderColor: TEMA_HOME.azulErgo,
                    transform  : 'translateY(-4px)',
                    boxShadow  : '0 12px 28px rgba(11,44,77,0.10)',
                },
                '&:focus-visible': {
                    outline       : `3px solid ${ TEMA_HOME.azulErgo }`,
                    outlineOffset : 2,
                },
                // Quien pide menos movimiento conserva el cambio de color, pierde el desplazamiento.
                '@media (prefers-reduced-motion: reduce)': {
                    transition: 'border-color .2s ease',
                    '&:hover' : { transform: 'none' },
                },
            }}
        >
            <Box
                aria-hidden="true"
                sx={{
                    width         : 52,
                    height        : 52,
                    borderRadius  : 2,
                    display       : 'flex',
                    alignItems    : 'center',
                    justifyContent: 'center',
                    bgcolor       : 'rgba(25,118,210,0.09)',
                    color         : TEMA_HOME.azulErgo,
                    mb            : 2.5,
                }}
            >
                <Icono fontSize="medium" />
            </Box>

            <Typography
                component="h3"
                sx={{ fontWeight: 700, fontSize: '1.15rem', lineHeight: 1.3, color: TEMA_HOME.azulProfundo, mb: 1.25 }}
            >
                { servicio.nombre }
            </Typography>

            <Typography sx={{ fontSize: '0.97rem', lineHeight: 1.6, opacity: 0.76, flexGrow: 1 }}>
                { servicio.descripcion }
            </Typography>

            <Box
                sx={{
                    mt        : 2.5,
                    display   : 'flex',
                    alignItems: 'center',
                    gap       : 0.75,
                    fontWeight: 700,
                    fontSize  : '0.92rem',
                    color     : TEMA_HOME.azulErgo,
                }}
            >
                Ver servicio
                <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
        </Box>
    );
};
