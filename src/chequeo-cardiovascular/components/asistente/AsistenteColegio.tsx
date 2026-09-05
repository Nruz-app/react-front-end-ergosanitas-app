import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { COLORES, DEGRADADOS, SOMBRAS, sxFocoVisible, UI } from '../../config/tema';
import { LoginContext } from '../../../common/context';
import { SUGERENCIAS_ASISTENTE } from '../../config/sugerencias-asistente';
import { UseAsistenteColegioService } from '../../services';
import { useReconocimientoVoz } from '../../hooks';
import type { IMensajeChat } from '../../interface';

import { BurbujaGpt } from './BurbujaGpt';
import { BurbujaUsuario } from './BurbujaUsuario';
import { CajaMensaje } from './CajaMensaje';
import { LoaderEscribiendo } from './LoaderEscribiendo';
import { SugerenciasChat } from './SugerenciasChat';

const BIENVENIDA = 'Soy el Asistente Ergo. Pregúntame lo que necesites sobre los deportistas '
    + 'de tu colegio: cuántos tienen la presión alta, quiénes están pendientes de revisión, '
    + 'cómo va el estado nutricional.';

const SIN_COLEGIO = 'No pude identificar tu colegio, así que no puedo consultar sus datos. '
    + 'Vuelve a iniciar sesión para usar el asistente.';

interface Props {
    /**
     * `true` mientras el tab Home está a la vista.
     *
     * No es cosmético: `TabPanel` oculta los paneles con `display: none` en vez de
     * desmontarlos —así la lista conserva sus filtros y su página—, de modo que el cleanup de
     * `useReconocimientoVoz` **no se dispara** al cambiar de tab. Sin esta señal el micrófono
     * seguiría grabando con el chat fuera de pantalla.
     */
    activo?: boolean;
}

/**
 * Chat del Home del colegio (Spec 03).
 *
 * Ocupa el sitio del botón «Detalle clínico», que abría un modal con cuatro párrafos fijos y no
 * leía ni un dato del colegio. Va **en línea y no detrás de un click**: una ayuda que hay que
 * descubrir pulsando un botón es la que nadie usa, que era el problema del botón que reemplaza.
 *
 * A diferencia del tab «Asistente Ergo» de la ficha clínica, **no consulta nada al montarse**.
 * Allí hay un RUT concreto que preguntar; aquí no hay pregunta obvia, y disparar una llamada por
 * cada entrada al tab 0 sería tráfico que nadie pidió. En su lugar saluda y ofrece ejemplos.
 *
 * Los cinco componentes que usa son clones locales de `src/ficha-clinica/`: la regla dura del
 * módulo prohíbe importar de otros módulos que no sean `src/common/`.
 */
export const AsistenteColegio = ({ activo = true }: Props) => {

    const { user } = useContext(LoginContext);
    const user_email = user.user_email?.trim() ?? '';

    // Sin la clave de multi-tenencia el backend no sabe de qué colegio hablar. Enviar igual
    // devolvería un error técnico donde debería haber una explicación.
    const sinColegio = user_email === '';

    const [mensajes, setMensajes] = useState<IMensajeChat[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');

    const finDelChatRef = useRef<HTMLDivElement | null>(null);

    /** Último prompt enviado, para que «Reintentar» reenvíe lo que falló y no otra cosa. */
    const ultimoPrompt = useRef<string>('');

    const {
        textoFinal,
        textoTemporal,
        escuchando,
        iniciar,
        detener,
        limpiar,
    } = useReconocimientoVoz();

    // El dictado escribe en el mismo input que el teclado: lo que se dicta se puede corregir a
    // mano antes de enviarlo.
    useEffect(() => {
        setInput(textoFinal + textoTemporal);
    }, [textoFinal, textoTemporal]);

    // Salir del Home cierra el micrófono. Se detiene pero **no se limpia**: lo ya dictado sigue
    // en el input para poder volver y enviarlo, que es lo que espera quien cambia de tab a
    // mirar la lista y regresa.
    useEffect(() => {
        if (!activo) detener();
    }, [activo, detener]);

    /**
     * Envía una pregunta y agrega la respuesta al hilo.
     *
     * `mostrarPregunta` decide si el prompt se pinta como burbuja del usuario. Va en `false` solo
     * al reintentar: la pregunta ya está en el hilo desde el primer envío, y repetirla haría
     * parecer que se preguntó dos veces.
     */
    const preguntarAlAsistente = useCallback(async (
        prompt: string,
        mostrarPregunta: boolean,
    ): Promise<void> => {

        if (sinColegio) return;

        // Si venía dictando, el envío cierra el micrófono: dejarlo abierto mezclaría la
        // respuesta del asistente con lo siguiente que se diga.
        detener();
        limpiar();

        setError(false);
        setCargando(true);
        setInput('');

        ultimoPrompt.current = prompt;

        if (mostrarPregunta) {
            setMensajes((previos) => [...previos, { text: prompt, isGpt: false }]);
        }

        try {
            const { preguntar } = UseAsistenteColegioService();
            const respuesta = await preguntar(user_email, prompt);

            setMensajes((previos) => [...previos, { text: respuesta, isGpt: true }]);
        }
        catch (problema) {
            // El error se muestra como una burbuja más, en el hueco donde se esperaba la
            // respuesta. `error` en `true` es lo que saca el botón de reintentar.
            setError(true);
            setMensajes((previos) => [...previos, {
                text: problema instanceof Error
                    ? problema.message
                    : 'No hay respuesta del servidor.',
                isGpt: true,
            }]);
        }
        finally {
            setCargando(false);
        }
    }, [sinColegio, user_email, detener, limpiar]);

    // `block: 'nearest'` mantiene el scroll dentro del panel. Sin eso el `scrollIntoView`
    // arrastra el Home entero y saca de vista los contadores de arriba.
    useEffect(() => {
        finDelChatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [mensajes, cargando]);

    const handleEnviar = (mensaje: string): void => {
        preguntarAlAsistente(mensaje, true);
    };

    const handleReintentar = (): void => {
        // La burbuja de error se descarta: si el reintento funciona, dejarla ahí haría parecer
        // que el asistente respondió dos cosas distintas a la misma pregunta.
        setMensajes((previos) => previos.slice(0, -1));
        preguntarAlAsistente(ultimoPrompt.current, false);
    };

    /**
     * Abandona el hilo y empieza uno limpio.
     *
     * No llama a ningún endpoint de reset porque no consta que `sam-assistant-club` lo exponga;
     * renovar la clave local logra el efecto visible sin depender de eso.
     */
    const handleNuevaConversacion = (): void => {

        const { reiniciarSesion } = UseAsistenteColegioService();
        reiniciarSesion();

        detener();
        limpiar();
        setMensajes([]);
        setError(false);
        setInput('');
    };

    const bloqueado = sinColegio || cargando;

    return (
        <Box
            sx={{
                borderRadius : 3,
                overflow     : 'hidden',
                border       : `1px solid ${COLORES.divisor}`,
                boxShadow    : SOMBRAS.chat,
                backgroundColor : COLORES.fondoTarjeta,
            }}
        >
            {/*
                Cabecera. Es lo que convierte tres cajas sueltas en una sola pieza: antes el
                botón de reinicio flotaba arriba a la derecha sin nada que lo sujetara, y el
                panel empezaba en blanco sin decir de qué iba.
            */}
            <Box
                sx={{
                    display        : 'flex',
                    alignItems     : 'center',
                    gap            : 1.5,
                    px             : { xs: 2, md: 2.5 },
                    py             : 1.75,
                    background     : DEGRADADOS.cabeceraChat,
                }}
            >
                <Avatar
                    src="/logoTrans.png"
                    alt=""
                    sx={{
                        width       : 40,
                        height      : 40,
                        flexShrink  : 0,
                        bgcolor     : COLORES.fondoTarjeta,
                        border      : '2px solid',
                        borderColor : UI.sobreCabeceraBorde,
                    }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontSize   : 15,
                            fontWeight : 700,
                            color      : COLORES.fondoTarjeta,
                            lineHeight : 1.25,
                        }}
                    >
                        Asistente Ergo
                    </Typography>
                    <Typography
                        sx={{
                            fontSize : 12,
                            color    : UI.sobreCabecera,
                            // El estado se escribe, no se codifica solo en un punto de color.
                            whiteSpace   : 'nowrap',
                            overflow     : 'hidden',
                            textOverflow : 'ellipsis',
                        }}
                    >
                        { sinColegio
                            ? 'No disponible'
                            : cargando ? 'Escribiendo…' : 'Listo para responder' }
                    </Typography>
                </Box>

                <Button
                    onClick={handleNuevaConversacion}
                    disabled={sinColegio || mensajes.length === 0}
                    startIcon={<RestartAltIcon />}
                    size="small"
                    sx={{
                        flexShrink      : 0,
                        textTransform   : 'none',
                        fontWeight      : 600,
                        fontSize        : 13,
                        borderRadius    : 2,
                        color           : COLORES.fondoTarjeta,
                        backgroundColor : UI.sobreCabeceraSuave,
                        border          : `1px solid ${UI.sobreCabeceraBorde}`,
                        px              : 1.5,
                        '&:hover'       : { backgroundColor: UI.sobreCabeceraHover },
                        '&.Mui-disabled': {
                            color       : UI.sobreCabecera,
                            opacity     : 0.45,
                            borderColor : UI.sobreCabeceraSuave,
                        },
                        // El texto se esconde en móvil: el icono ya lo dice y el `aria-label`
                        // mantiene el nombre completo para el lector de pantalla.
                        '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 } },
                        ...sxFocoVisible,
                    }}
                    aria-label="Nueva conversación"
                >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        Nueva conversación
                    </Box>
                </Button>
            </Box>

            {/*
                Hilo de la conversación.

                `role="log"` con `aria-live="polite"` para que el lector de pantalla anuncie cada
                respuesta nueva sin interrumpir lo que esté leyendo; y `tabIndex` porque la zona
                tiene scroll propio y sin él queda fuera del alcance del teclado, igual que en
                `ListaAlterados`.
            */}
            <Box
                role="log"
                aria-live="polite"
                aria-label="Conversación con el Asistente Ergo"
                tabIndex={0}
                sx={{
                    height     : { xs: 380, md: 440 },
                    overflowY  : 'auto',
                    background : DEGRADADOS.lienzoChat,
                    px         : { xs: 0.5, md: 1 },
                    py         : 1,
                    ...sxFocoVisible,
                }}
            >
                <Grid container spacing={0.5}>

                    {/* Fija, fuera del historial: no es un turno de la conversación. */}
                    <Grid item xs={12}>
                        <BurbujaGpt text={sinColegio ? SIN_COLEGIO : BIENVENIDA} />
                    </Grid>

                    {/* Los ejemplos estorban en cuanto la conversación empezó. */}
                    { mensajes.length === 0 && (
                        <Grid item xs={12}>
                            <SugerenciasChat
                                sugerencias={SUGERENCIAS_ASISTENTE}
                                onElegir={setInput}
                                disabled={bloqueado}
                            />
                        </Grid>
                    ) }

                    { mensajes.map((mensaje, indice) => (
                        <Grid item xs={12} key={indice}>
                            { mensaje.isGpt
                                ? <BurbujaGpt text={mensaje.text} />
                                : <BurbujaUsuario text={mensaje.text} /> }
                        </Grid>
                    )) }

                    { cargando && (
                        <Grid item xs={12}>
                            <LoaderEscribiendo />
                        </Grid>
                    ) }

                    { error && !cargando && (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
                                <Button
                                    startIcon={<RefreshIcon />}
                                    onClick={handleReintentar}
                                    sx={{
                                        textTransform   : 'none',
                                        fontWeight      : 600,
                                        borderRadius    : 5,
                                        px              : 2.5,
                                        color           : COLORES.primarioOsc,
                                        backgroundColor : UI.burbujaGpt,
                                        border          : `1px solid ${COLORES.divisor}`,
                                        boxShadow       : SOMBRAS.burbuja,
                                        '&:hover'       : {
                                            backgroundColor : COLORES.fondoSuave,
                                            borderColor     : COLORES.primarioClaro,
                                        },
                                        ...sxFocoVisible,
                                    }}
                                >
                                    Reintentar
                                </Button>
                            </Box>
                        </Grid>
                    ) }
                </Grid>

                {/* Centinela del scroll. Va fuera del `Grid container`: un hijo que no es
                    `Grid item` hereda los márgenes negativos del espaciado y descuadra la fila. */}
                <Box ref={finDelChatRef} />
            </Box>

            {/* Pie: micrófono e input, dentro de la misma pieza y separados por el borde. */}
            <Box
                sx={{
                    display         : 'flex',
                    gap             : 1,
                    alignItems      : 'center',
                    px              : { xs: 1.5, md: 2 },
                    py              : 1.5,
                    borderTop       : `1px solid ${COLORES.divisor}`,
                    backgroundColor : COLORES.fondoTarjeta,
                }}
            >
                <Tooltip
                    title={escuchando ? 'Detener el dictado' : 'Dictar por voz'}
                    arrow
                    placement="top"
                >
                    {/* El `span` es necesario: un `IconButton` deshabilitado no emite los
                        eventos que el Tooltip necesita para mostrarse. */}
                    <span>
                        <IconButton
                            color={escuchando ? 'error' : 'primary'}
                            disabled={bloqueado}
                            aria-label={escuchando ? 'Detener el dictado' : 'Dictar por voz'}
                            onClick={() => (escuchando ? detener() : iniciar())}
                            sx={{
                                border          : `1px solid ${COLORES.divisor}`,
                                backgroundColor : COLORES.fondoSuave,
                                width           : 44,
                                height          : 44,
                                '&:hover'       : { backgroundColor: COLORES.divisor },
                                ...sxFocoVisible,
                            }}
                        >
                            { escuchando ? <MicOffIcon /> : <MicIcon /> }
                        </IconButton>
                    </span>
                </Tooltip>

                <Box sx={{ flex: 1 }}>
                    <CajaMensaje
                        value={input}
                        onChange={setInput}
                        onSendMessage={handleEnviar}
                        placeholder={sinColegio ? 'Asistente no disponible' : 'Escribe o habla aquí…'}
                        disabled={bloqueado}
                    />
                </Box>
            </Box>
        </Box>
    );
};
