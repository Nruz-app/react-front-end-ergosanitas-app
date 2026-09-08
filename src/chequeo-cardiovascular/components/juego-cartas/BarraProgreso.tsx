import { Box, Typography } from '@mui/material';

import { COLORES, DEGRADADOS, JUEGO } from '../../config/tema';

interface Props {
    /** Múltiplo de 20, entre 20 y 100. Es el eje de completitud, no el de salud. */
    progreso : number;
    /** Nombre del alumno, para que el lector de pantalla sepa de quién es esta barra. */
    de?      : string;
}

/**
 * La barra de completitud de la ficha: cuántos de los cinco bloques están cargados.
 *
 * **No es el puntaje clínico.** Son dos ejes independientes, y el HTML de referencia ya los
 * mostraba separados: un alumno puede estar sano con la ficha a medias, y al revés.
 */
export const BarraProgreso = ({ progreso, de }: Props) => (

    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                Progreso de la ficha
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORES.primarioOsc }}>
                { progreso }%
            </Typography>
        </Box>

        <Box
            role="progressbar"
            aria-label={de ? `Progreso de la ficha de ${de}` : 'Progreso de la ficha'}
            aria-valuenow={progreso}
            aria-valuemin={0}
            aria-valuemax={100}
            sx={{
                width           : '100%',
                height          : 9,
                borderRadius    : 5,
                backgroundColor : JUEGO.pista,
                overflow        : 'hidden',
            }}
        >
            <Box
                sx={{
                    width        : `${progreso}%`,
                    height       : '100%',
                    borderRadius : 5,
                    background   : DEGRADADOS.barraProgreso,
                }}
            />
        </Box>
    </Box>
);
