import Badge from '@mui/material/Badge';
import Fab from '@mui/material/Fab';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';

import { TEMA_HOME } from '../../config/tema-home';

interface Props {
    abierto  : boolean;
    onToggle : () => void;
    /** Marca el botón con un punto mientras nadie ha abierto el chat todavía. */
    sinLeer  : boolean;
}

/**
 * Botón flotante que abre y cierra el chat comercial.
 *
 * Va fijo abajo a la derecha y sobrevive al scroll: es el único punto de contacto que
 * acompaña al visitante durante toda la página.
 *
 * El icono cambia a una equis cuando el panel está abierto. Un botón que abre y cierra
 * tiene que decir cuál de las dos cosas va a hacer si lo pulsas ahora.
 */
export const BotonChatFlotante = ( { abierto, onToggle, sinLeer }: Props ) => {
    return (
        <Badge
            color="error"
            variant="dot"
            invisible={ abierto || !sinLeer }
            sx={{
                position: 'fixed',
                right   : { xs: 16, md: 24 },
                bottom  : { xs: 16, md: 24 },
                zIndex  : 1300,
            }}
        >
            <Fab
                onClick={ onToggle }
                aria-label={ abierto ? 'Cerrar el chat' : 'Abrir el chat para consultar por un servicio' }
                aria-expanded={ abierto }
                sx={{
                    bgcolor  : TEMA_HOME.azulErgo,
                    color    : '#fff',
                    '&:hover': { bgcolor: '#1565c0' },
                }}
            >
                { abierto ? <CloseIcon /> : <ChatBubbleIcon /> }
            </Fab>
        </Badge>
    );
};
