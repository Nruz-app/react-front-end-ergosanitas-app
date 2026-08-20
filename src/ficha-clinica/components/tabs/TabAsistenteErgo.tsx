import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RefreshIcon from '@mui/icons-material/Refresh';

import { IMensajeChat, IPacienteBase } from '../../interface';
import { UseAsistenteService } from '../../services';
import { useReconocimientoVoz } from '../../hooks';
import { BurbujaGpt, BurbujaUsuario, CajaMensaje, LoaderEscribiendo } from '../asistente';

/**
 * Tab «Asistente Ergo» (Spec 04).
 *
 * Réplica del chat de `src/AsistenteVirtual/` con un solo cambio de comportamiento: en
 * vez de saludar y esperar a que alguien teclee el RUT, lo envía solo al montarse. El
 * dato ya está en pantalla — pedirlo otra vez es hacer que el usuario copie lo que la
 * ficha le está mostrando en el encabezado.
 *
 * Sigue el patrón de los otros cuatro tabs: recibe todo por props y no hace fetch de la
 * ficha. La única petición que dispara es la del asistente.
 */

interface Props {
    paciente: IPacienteBase;
}

export const TabAsistenteErgo = ({ paciente }: Props) => {

    // `rut` se tipa `string` en la Capa 2, pero puede llegar vacío. Sin él no hay
    // consulta automática que hacer.
    const rut = paciente.rut?.trim() ?? '';

    const [mensajes, setMensajes] = useState<IMensajeChat[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');

    const finDelChatRef = useRef<HTMLDivElement | null>(null);

    /**
     * Guarda de ejecución única de la consulta inicial.
     *
     * `StrictMode` está activo (`src/main.tsx:7`), así que en desarrollo React monta cada
     * componente dos veces. Sin esta guarda el RUT saldría duplicado al backend en cada
     * apertura del tab.
     */
    const consultaInicialHecha = useRef<boolean>(false);

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

    // El dictado escribe en el mismo input que el teclado: lo que se dicta se puede
    // corregir a mano antes de enviarlo.
    useEffect(() => {
        setInput(textoFinal + textoTemporal);
    }, [textoFinal, textoTemporal]);

    /**
     * Envía un prompt al asistente y agrega su respuesta al hilo.
     *
     * `mostrarPregunta` decide si el prompt se pinta como burbuja del usuario. La consulta
     * inicial va en `false`: nadie escribió ese RUT, así que mostrarlo como mensaje propio
     * simularía una acción que la persona no hizo.
     */
    const preguntarAlAsistente = useCallback(async (
        prompt: string,
        mostrarPregunta: boolean,
    ): Promise<void> => {

        // Si venía dictando, el envío cierra el micrófono: dejarlo abierto haría que la
        // respuesta del asistente se mezclara con lo siguiente que se diga.
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
            const { preguntar } = UseAsistenteService();
            const respuesta = await preguntar(prompt);

            setMensajes((previos) => [...previos, { text: respuesta, isGpt: true }]);

        } catch (problema) {
            // El error se muestra como una burbuja más, en el hueco donde se esperaba la
            // respuesta. `error` en `true` es lo que saca el botón de reintentar.
            setError(true);
            setMensajes((previos) => [...previos, {
                text: problema instanceof Error
                    ? problema.message
                    : 'No hay respuesta del servidor.',
                isGpt: true,
            }]);

        } finally {
            setCargando(false);
        }
    }, [detener, limpiar]);

    // Consulta inicial: el RUT a secas, sin frase envolvente. Es exactamente el input que
    // el asistente pide hoy, así que el backend lo procesa sin cambios.
    useEffect(() => {

        if (consultaInicialHecha.current) return;
        if (!rut) return;

        consultaInicialHecha.current = true;
        preguntarAlAsistente(rut, false);

    }, [rut, preguntarAlAsistente]);

    // `block: 'nearest'` mantiene el scroll dentro del panel del chat. Sin eso el
    // `scrollIntoView` arrastra la página entera y saca de vista la cabecera de la ficha.
    useEffect(() => {
        finDelChatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [mensajes, cargando]);

    const handleEnviar = (mensaje: string): void => {
        preguntarAlAsistente(mensaje, true);
    };

    const handleReintentar = (): void => {
        // La burbuja de error se descarta: si el reintento funciona, dejarla ahí haría
        // parecer que el asistente respondió dos cosas distintas a la misma pregunta.
        setMensajes((previos) => previos.slice(0, -1));
        preguntarAlAsistente(ultimoPrompt.current, false);
    };

    const bienvenida = rut
        ? `Soy el Asistente Ergo. Estoy revisando la ficha de ${paciente.nombre ?? rut}. `
          + 'Pregúntame lo que necesites sobre este paciente.'
        : 'Soy el Asistente Ergo. Indica el RUT o el nombre del paciente que quieres '
          + 'consultar.';

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                Asistente Ergo
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Consulta asistida sobre la ficha de este paciente.
            </Typography>

            {/* Hilo de la conversación */}
            <Box
                sx={{
                    height: { xs: 380, md: 440 },
                    overflowY: 'auto',
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: '#fff',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: 1,
                }}
            >
                <Grid container spacing={1}>

                    {/* Fija, fuera del historial: no es un turno de la conversación. */}
                    <Grid item xs={12}>
                        <BurbujaGpt text={bienvenida} />
                    </Grid>

                    {mensajes.map((mensaje, indice) => (
                        <Grid item xs={12} key={indice}>
                            {mensaje.isGpt
                                ? <BurbujaGpt text={mensaje.text} />
                                : <BurbujaUsuario text={mensaje.text} />}
                        </Grid>
                    ))}

                    {cargando && (
                        <Grid item xs={12}>
                            <LoaderEscribiendo />
                        </Grid>
                    )}

                    {error && !cargando && (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleReintentar}
                                >
                                    Reintentar
                                </Button>
                            </Box>
                        </Grid>
                    )}

                    <Box ref={finDelChatRef} />
                </Grid>
            </Box>

            {/* Micrófono e input */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                <Tooltip
                    title={escuchando ? 'Detener el dictado' : 'Dictar por voz'}
                    arrow
                    placement="top"
                >
                    <span>
                        <IconButton
                            color={escuchando ? 'error' : 'primary'}
                            onClick={() => (escuchando ? detener() : iniciar())}
                        >
                            {escuchando ? <MicOffIcon /> : <MicIcon />}
                        </IconButton>
                    </span>
                </Tooltip>

                <Box sx={{ flex: 1 }}>
                    <CajaMensaje
                        value={input}
                        onChange={setInput}
                        onSendMessage={handleEnviar}
                        placeholder="Escribe o habla aquí…"
                        disabled={cargando}
                    />
                </Box>
            </Box>
        </Box>
    );
};
