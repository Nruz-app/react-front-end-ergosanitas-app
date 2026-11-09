import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { urlWhatsapp } from '../../config/canales-contacto';
import { TEMA_HOME } from '../../config/tema-home';

interface Props {
    /** Texto del botón, desde `botonDerivar` de `config/home-chat.json`. */
    texto : string;
}

/**
 * Botón de WhatsApp bajo una respuesta del asistente que derivó (Spec 05 de `home-ergo`).
 *
 * Se pinta solo cuando el back devuelve `derivar: true`: el asistente no supo responder y
 * mandó al visitante a hablar con una persona. Quien decide la derivación es el back; el
 * front no busca el teléfono en el texto.
 *
 * La URL sale de `urlWhatsapp` de `config/canales-contacto.tsx`, la única fuente de enlaces
 * de contacto del módulo: aquí no se arma ninguna URL ni se escribe el número.
 *
 * El margen izquierdo es el mismo de `SugerenciasChat`: alinea el botón con el texto de la
 * `BurbujaBot` (avatar de 32 px + separación) para que se lea como parte de ese turno.
 */
export const BotonDerivarWhatsapp = ( { texto }: Props ) => {
    return (
        <Box sx={{ pl: 5.25, mt: -0.75, mb: 1.75 }}>
            <Button
                href={ urlWhatsapp }
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                startIcon={ <WhatsAppIcon fontSize="small" /> }
                sx={{
                    textTransform : 'none',
                    borderRadius  : '18px',
                    fontWeight    : 600,
                    fontSize      : '0.8rem',
                    color         : TEMA_HOME.azulErgo,
                    borderColor   : TEMA_HOME.azulErgo,
                    bgcolor       : 'background.paper',
                    '&:hover'     : { bgcolor: TEMA_HOME.hueso, borderColor: TEMA_HOME.azulErgo },
                }}
            >
                { texto }
            </Button>
        </Box>
    );
};
