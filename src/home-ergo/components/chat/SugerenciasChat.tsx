import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import { TEMA_HOME } from '../../config/tema-home';

import type { ISugerenciaChatHome } from '../../interface';

interface Props {
    sugerencias    : ISugerenciaChatHome[];
    /** Recibe la pregunta completa, no la etiqueta: se envía como si la hubiera escrito el visitante. */
    onElegir       : ( pregunta: string ) => void;
    /** Bloquea los chips mientras hay una respuesta en curso. */
    deshabilitado? : boolean;
}

/**
 * Chips para empezar la conversación con el asistente (Spec 05 de `home-ergo`).
 *
 * Cada chip muestra una etiqueta corta y envía una pregunta completa: «Precios» se lee
 * rápido en 360 px, pero al asistente le sirve más «¿Cuáles son los precios…?». Los textos
 * vienen de `config/home-chat.json`; aquí no se escribe ninguno.
 *
 * Quien lo monta decide cuándo se ve (solo con el historial vacío): después del primer
 * mensaje los chips estorban en un panel tan angosto.
 *
 * El margen izquierdo alinea los chips con el texto de la `BurbujaBot` de bienvenida
 * (avatar de 32 px + separación), para que se lean como parte de ese turno.
 */
export const SugerenciasChat = ( { sugerencias, onElegir, deshabilitado = false }: Props ) => {

    if ( sugerencias.length === 0 ) return null;

    return (
        <Box
            role="group"
            aria-label="Sugerencias"
            sx={{
                display  : 'flex',
                flexWrap : 'wrap',
                gap      : 0.75,
                pl       : 5.25,
                mb       : 1.75,
            }}
        >
            { sugerencias.map( ( { etiqueta, pregunta } ) => (
                <Chip
                    key={ etiqueta }
                    label={ etiqueta }
                    clickable
                    variant="outlined"
                    size="small"
                    disabled={ deshabilitado }
                    onClick={ () => onElegir( pregunta ) }
                    sx={{
                        bgcolor     : 'background.paper',
                        color       : TEMA_HOME.azulErgo,
                        borderColor : TEMA_HOME.azulErgo,
                        fontSize    : '0.78rem',
                        fontWeight  : 600,
                        '&.MuiChip-clickable:hover' : { bgcolor: TEMA_HOME.hueso },
                    }}
                />
            ) ) }
        </Box>
    );
};
