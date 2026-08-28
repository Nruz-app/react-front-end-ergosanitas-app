import Box from '@mui/material/Box';

import { CANALES_COMPACTOS } from '../config/canales-contacto';
import { TEMA_HOME } from '../config/tema-home';
import { PastillaContacto } from './PastillaContacto';

/**
 * Altura de apilamiento del rail.
 *
 * Los tres valores en juego, de arriba abajo: el botón flotante del chat comercial está
 * en 1300, su panel en 1299 y el `AppBar` de MUI en 1100 por defecto. El rail va por
 * debajo de los tres a propósito: es el elemento menos urgente de la pantalla, y taparle
 * el panel al chat sería cambiar el chat, que esta spec decidió no tocar.
 */
const ALTURA_RAIL = 1090;

/**
 * Rail vertical de contacto, fijo al borde izquierdo.
 *
 * Es la mitad que hace que «siempre visible» sea literal: la franja solo se ve cuando el
 * scroll pasa por ella, el rail acompaña la página entera.
 *
 * **Solo existe desde 1200 px.** Por debajo no se renderiza, y no es un capricho: el
 * contenido de la portada se centra hasta 1400 px, así que en ventanas más estrechas
 * ocupa todo el ancho y no queda margen lateral libre donde el rail pueda vivir sin tapar
 * nada. En móvil, además, el pulgar ya tiene el botón del chat, y dos elementos flotantes
 * compitiendo por el mismo gesto es uno de más.
 */
export const RailContacto = () => {
    return (
        <Box
            component="nav"
            aria-label="Contacto y redes sociales"
            sx={{
                position : 'fixed',
                left     : 16,
                top      : '50%',
                transform: 'translateY(-50%)',
                zIndex   : ALTURA_RAIL,
                // Bajo 1200 px no se renderiza: no hay margen lateral donde quepa.
                display  : { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                gap      : 1,
                p        : 1,
                borderRadius: 999,
                bgcolor  : 'rgba(255,255,255,0.72)',
                border   : `1px solid ${ TEMA_HOME.borde }`,
                boxShadow: '0 10px 30px rgba(11,44,77,0.10)',
                // El fondo translúcido deja intuir la sección que pasa por detrás en vez
                // de recortar un bloque blanco sobre las secciones azules.
                backdropFilter: 'blur(6px)',
            }}
        >
            { CANALES_COMPACTOS.map( ( canal ) => (
                <PastillaContacto key={ canal.id } canal={ canal } variante="rail" />
            ) ) }
        </Box>
    );
};
