import { useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { UseChatComercialService } from '../../services';
import { TEMA_HOME } from '../../config/tema-home';
import { BotonChatFlotante } from './BotonChatFlotante';
import { BurbujaBot } from './BurbujaBot';
import { BurbujaVisitante } from './BurbujaVisitante';
import { CajaMensaje } from './CajaMensaje';
import { LoaderEscribiendo } from './LoaderEscribiendo';

import type { IMensajeChatHome } from '../../interface';

/**
 * Saludo de apertura. No pide RUT ni identifica a nadie: quien llega a la portada es un
 * visitante anónimo preguntando por un servicio, no un profesional abriendo una ficha.
 */
const BIENVENIDA = 'Hola. Soy el asistente de Ergo SaniTas. Cuéntame qué servicio necesitas y te oriento.';

/**
 * Chat comercial flotante de la portada.
 *
 * El historial vive en este componente y no en un contexto ni en un store: la
 * conversación no la necesita nadie más y no se persiste entre recargas. Con el servicio
 * en modo eco, guardar respuestas que repiten la pregunta no aportaría nada.
 *
 * El panel arranca cerrado. Un chat que se abre solo encima del contenido es justamente
 * lo que la gente cierra sin leer.
 */
export const ChatComercial = () => {

    const [ abierto, setAbierto ]   = useState( false );
    const [ visitado, setVisitado ] = useState( false );
    const [ mensajes, setMensajes ] = useState<IMensajeChatHome[]>( [] );
    const [ texto, setTexto ]       = useState( '' );
    const [ cargando, setCargando ] = useState( false );

    const { preguntar } = useMemo( () => UseChatComercialService(), [] );

    const finDeLista = useRef<HTMLDivElement>( null );
    const campo      = useRef<HTMLDivElement>( null );

    // Cada turno nuevo baja la vista al final: si no, la respuesta aparece fuera de
    // pantalla y parece que no pasó nada.
    useEffect( () => {
        finDeLista.current?.scrollIntoView( { behavior: 'smooth', block: 'end' } );
    }, [ mensajes, cargando ] );

    // Al abrir, el foco va al campo de texto: quien abre un chat es porque va a escribir.
    useEffect( () => {
        if ( !abierto ) return;
        const foco = setTimeout( () => campo.current?.querySelector( 'textarea' )?.focus(), 120 );
        return () => clearTimeout( foco );
    }, [ abierto ] );

    // Escape cierra el panel, como cualquier capa que se superpone al contenido.
    useEffect( () => {
        if ( !abierto ) return;
        const alPulsar = ( evento: KeyboardEvent ) => {
            if ( evento.key === 'Escape' ) setAbierto( false );
        };
        window.addEventListener( 'keydown', alPulsar );
        return () => window.removeEventListener( 'keydown', alPulsar );
    }, [ abierto ] );

    const alternar = () => {
        setAbierto( ( previo ) => !previo );
        setVisitado( true );
    };

    const enviar = async ( mensaje: string ) => {

        const limpio = mensaje.trim();
        if ( !limpio || cargando ) return;

        setMensajes( ( previos ) => [ ...previos, { text: limpio, isGpt: false } ] );
        setTexto( '' );
        setCargando( true );

        try {
            const respuesta = await preguntar( limpio );
            setMensajes( ( previos ) => [ ...previos, { text: respuesta, isGpt: true } ] );

        } catch ( problema ) {
            // El error se pinta como un turno del asistente: ocupa el mismo hueco que
            // ocuparía la respuesta y no deja al visitante mirando un vacío.
            const detalle = problema instanceof Error ? problema.message : 'No hay respuesta del servidor.';
            setMensajes( ( previos ) => [
                ...previos,
                { text: `No pude responder en este momento. ${ detalle } Puedes escribirnos por WhatsApp mientras tanto.`, isGpt: true },
            ] );

        } finally {
            setCargando( false );
        }
    };

    return (
        <>
            <BotonChatFlotante abierto={ abierto } onToggle={ alternar } sinLeer={ !visitado } />

            { abierto && (
                <Box
                    role="dialog"
                    aria-label="Chat con Ergo SaniTas"
                    sx={{
                        position     : 'fixed',
                        zIndex       : 1299,
                        right        : { xs: 16, md: 24 },
                        bottom       : { xs: 88, md: 96 },
                        width        : { xs: 'calc(100vw - 32px)', sm: 360 },
                        maxWidth     : 360,
                        height       : { xs: 'min(70vh, 520px)', md: 520 },
                        display      : 'flex',
                        flexDirection: 'column',
                        borderRadius : 3,
                        overflow     : 'hidden',
                        bgcolor      : TEMA_HOME.hueso,
                        border       : `1px solid ${ TEMA_HOME.borde }`,
                        boxShadow    : '0 18px 48px rgba(11,44,77,0.28)',
                        '@keyframes aparecerChat': {
                            from : { opacity: 0, transform: 'translateY(12px)' },
                            to   : { opacity: 1, transform: 'translateY(0)' },
                        },
                        animation: 'aparecerChat .22s ease-out',
                        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                    }}
                >
                    <Box sx={{ px: 2, py: 1.75, bgcolor: TEMA_HOME.azulProfundo, color: '#fff' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                            Ergo SaniTas
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', opacity: 0.75 }}>
                            Consulta por nuestros servicios
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, pt: 2 }}>
                        {/* La bienvenida se pinta fija y no vive en el historial: nadie la
                            escribió, así que no es un turno de la conversación. */}
                        <BurbujaBot text={ BIENVENIDA } />

                        { mensajes.map( ( mensaje, i ) => (
                            mensaje.isGpt
                                ? <BurbujaBot key={ i } text={ mensaje.text } />
                                : <BurbujaVisitante key={ i } text={ mensaje.text } />
                        ) ) }

                        { cargando && <LoaderEscribiendo /> }

                        <div ref={ finDeLista } />
                    </Box>

                    <Box ref={ campo }>
                        <CajaMensaje
                            value={ texto }
                            onChange={ setTexto }
                            onEnviar={ enviar }
                            deshabilitado={ cargando }
                            placeholder="Escribe tu consulta…"
                        />
                    </Box>
                </Box>
            ) }
        </>
    );
};
