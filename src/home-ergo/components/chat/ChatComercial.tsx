import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { UseChatComercialService } from '../../services';
import { TEMA_HOME } from '../../config/tema-home';
import homeChat from '../../config/home-chat.json';
import { BotonChatFlotante } from './BotonChatFlotante';
import { BotonDerivarWhatsapp } from './BotonDerivarWhatsapp';
import { BurbujaBot } from './BurbujaBot';
import { BurbujaVisitante } from './BurbujaVisitante';
import { CajaMensaje } from './CajaMensaje';
import { LoaderEscribiendo } from './LoaderEscribiendo';
import { SugerenciasChat } from './SugerenciasChat';

import type { IConfigChatHome, IMensajeChatHome } from '../../interface';

/** Textos del chat (Spec 05). Tipados para que un JSON mal editado no compile. */
const textos: IConfigChatHome = homeChat;

/**
 * Turno tal como se pinta. `error` marca los avisos de fallo del propio front (429, red,
 * servidor): se ven en pantalla pero no se guardan, porque tras un F5 serían ruido. Es un
 * tipo local a propósito: `IMensajeChatHome` es lo que se persiste y no lleva esa marca.
 */
type IMensajeVista = IMensajeChatHome & { error?: true };

/**
 * Chat comercial flotante de la portada (Specs 01 y 05). El nombre del asistente sale del JSON.
 *
 * El historial vive en este componente y no en un contexto ni en un store: la
 * conversación no la necesita nadie más. Desde la Spec 05 se persiste en `localStorage`
 * (`home_chat_mensajes`, a través del servicio): al montar se lee lo guardado y tras cada
 * respuesta se guarda, con los datos del visitante enmascarados. Así un F5 conserva la
 * conversación, y el back, con el mismo `home_chat_session_id`, recuerda el mismo hilo.
 *
 * Todos los textos (cabecera, bienvenida, aviso, sugerencias, errores) vienen de
 * `config/home-chat.json`; aquí no se escribe ninguno.
 *
 * El panel arranca cerrado. Un chat que se abre solo encima del contenido es justamente
 * lo que la gente cierra sin leer.
 */
export const ChatComercial = () => {

    const [ abierto, setAbierto ]   = useState( false );
    const [ visitado, setVisitado ] = useState( false );
    const [ texto, setTexto ]       = useState( '' );
    const [ cargando, setCargando ] = useState( false );

    const { preguntar, leerMensajes, guardarMensajes } = useMemo( () => UseChatComercialService(), [] );

    // Inicializador perezoso: `localStorage` se lee una sola vez, al montar.
    const [ mensajes, setMensajes ] = useState<IMensajeVista[]>( () => leerMensajes() );

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

    /**
     * Envío común del formulario y de los chips de sugerencias.
     *
     * La lista nueva se calcula a partir de `mensajes` de este render y se guarda desde
     * esa misma lista, no desde un `setMensajes( previos => … )`: mientras `cargando` es
     * `true` no entra otro envío, así que no hay turnos intermedios que perder.
     */
    const enviar = async ( mensaje: string ) => {

        const limpio = mensaje.trim();
        if ( !limpio || cargando ) return;

        const conPregunta: IMensajeVista[] = [ ...mensajes, { text: limpio, isGpt: false } ];

        setMensajes( conPregunta );
        setTexto( '' );
        setCargando( true );

        try {
            const { texto: respuesta, derivar } = await preguntar( limpio );
            const conRespuesta: IMensajeVista[] = [ ...conPregunta, { text: respuesta, isGpt: true, derivar } ];

            setMensajes( conRespuesta );
            guardarMensajes( conRespuesta.filter( ( turno ) => !turno.error ) );

        } catch ( problema ) {
            // El servicio ya traduce el fallo a un texto de `home-chat.json`: se pinta tal
            // cual, como turno del asistente, y no se guarda.
            const aviso = problema instanceof Error ? problema.message : textos.errores.servidor;
            setMensajes( [ ...conPregunta, { text: aviso, isGpt: true, error: true } ] );

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
                    aria-label={ `Chat con ${ textos.titulo }` }
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
                            { textos.titulo }
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', opacity: 0.75 }}>
                            { textos.subtitulo }
                        </Typography>
                    </Box>

                    {/* Aviso fijo, fuera del contenedor con scroll: una burbuja se iría con la
                        conversación, y esto tiene que leerse siempre. */}
                    <Box
                        sx={{
                            display      : 'flex',
                            alignItems   : 'center',
                            gap          : 0.75,
                            px           : 2,
                            py           : 0.75,
                            flexShrink   : 0,
                            bgcolor      : 'background.paper',
                            borderBottom : `1px solid ${ TEMA_HOME.borde }`,
                        }}
                    >
                        <InfoOutlinedIcon aria-hidden sx={{ fontSize: '1rem', color: TEMA_HOME.azulErgo }} />
                        <Typography sx={{ fontSize: '0.75rem', color: TEMA_HOME.grafito, lineHeight: 1.3 }}>
                            { textos.aviso }
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, pt: 2 }}>
                        {/* La bienvenida se pinta fija y no vive en el historial: nadie la
                            escribió, así que no es un turno de la conversación. */}
                        <BurbujaBot text={ textos.bienvenida } />

                        {/* Solo con el historial vacío: después del primer mensaje estorban. */}
                        { mensajes.length === 0 && !cargando && (
                            <SugerenciasChat
                                sugerencias={ textos.sugerencias }
                                onElegir={ enviar }
                                deshabilitado={ cargando }
                            />
                        ) }

                        { mensajes.map( ( mensaje, i ) => (
                            mensaje.isGpt
                                ? (
                                    <Fragment key={ i }>
                                        <BurbujaBot text={ mensaje.text } />
                                        { mensaje.derivar === true && <BotonDerivarWhatsapp texto={ textos.botonDerivar } /> }
                                    </Fragment>
                                )
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
                            maxCaracteres={ textos.maxCaracteres }
                            placeholder={ textos.placeholder }
                        />
                    </Box>
                </Box>
            ) }
        </>
    );
};
