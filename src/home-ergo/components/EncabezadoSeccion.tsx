import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { ETIQUETA_SECCION, TEMA_HOME, TITULAR_SECCION } from '../config/tema-home';

interface Props {
    /** Microetiqueta en mayúsculas. Dice de qué trata el bloque en dos o tres palabras. */
    etiqueta  : string;
    /** Titular de la sección. */
    titulo    : string;
    /** Bajada opcional. Se omite cuando el titular ya se explica solo. */
    bajada?   : string;
    /** Centra el bloque. Por defecto va alineado a la izquierda, como el hero. */
    centrado? : boolean;
    /** Invierte los colores para las secciones de fondo oscuro. */
    sobreOscuro? : boolean;
}

/**
 * Encabezado compartido por las secciones de la portada.
 *
 * Existe para que las seis secciones tengan exactamente el mismo ritmo tipográfico: la
 * etiqueta de 12 px muy espaciada contra el titular pesado y compacto. Repetir ese par a
 * mano en cada componente terminaría con seis variantes ligeramente distintas.
 */
export const EncabezadoSeccion = ( { etiqueta, titulo, bajada, centrado = false, sobreOscuro = false }: Props ) => {
    // Sobre azul profundo, el azul de marca no tiene contraste suficiente para un texto
    // de 12 px: la etiqueta pasa a blanco translúcido y el titular a blanco pleno.
    const colorEtiqueta = sobreOscuro ? 'rgba(255,255,255,0.72)' : TEMA_HOME.azulErgo;
    const colorTitulo   = sobreOscuro ? '#fff' : TEMA_HOME.azulProfundo;

    return (
        <Box sx={{ maxWidth: 760, mb: { xs: 4, md: 6 }, ...( centrado && { mx: 'auto', textAlign: 'center' } ) }}>
            <Typography component="p" sx={{ ...ETIQUETA_SECCION, color: colorEtiqueta, mb: 1.5 }}>
                { etiqueta }
            </Typography>

            <Typography
                component="h2"
                sx={{ ...TITULAR_SECCION, fontSize: { xs: '1.9rem', md: '2.6rem' }, color: colorTitulo }}
            >
                { titulo }
            </Typography>

            { bajada && (
                <Typography sx={{ mt: 2, fontSize: '1.05rem', lineHeight: 1.65, opacity: 0.78, maxWidth: '60ch', ...( centrado && { mx: 'auto' } ) }}>
                    { bajada }
                </Typography>
            ) }
        </Box>
    );
};
