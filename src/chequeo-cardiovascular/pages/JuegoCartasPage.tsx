import { ReactNode, useMemo, useRef, useState } from 'react';
import { Box, Button, Grid, Skeleton, Typography } from '@mui/material';

import { COLORES, sxTarjeta, UI } from '../config/tema';
import {
    BuscadorCartas, CartaAlumno, FiltrosCartas, ModalCarta,
} from '../components';
import { useJuegoCartas } from '../hooks';
import type { IJuegoCarta } from '../interface';
import { UseJuegoCartasService } from '../services';
import { filtrarCartas } from '../utilities';

/** Cartas que se pintan de una vez. El resto llega con «Ver más». */
const PAGINA = 24;

/** Un mensaje centrado para los estados en los que no hay grilla que pintar. */
const Aviso = ({ titulo, detalle, accion }: {
    titulo : string; detalle: string; accion?: ReactNode;
}) => (

    <Box sx={{ ...sxTarjeta, p: 5, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: COLORES.primarioOsc, mb: 0.75 }}>
            { titulo }
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: accion ? 2 : 0 }}>
            { detalle }
        </Typography>
        { accion }
    </Box>
);

interface Props {
    /**
     * `true` mientras este tab está a la vista.
     *
     * `TabPanel` oculta los paneles con `display: none` en vez de desmontarlos —así la lista
     * conserva sus filtros—, de modo que sin esta señal la grilla pediría las cartas del club y
     * montaría 24 tarjetas nada más entrar el colegio al módulo, aunque nunca abriera esta
     * pestaña. Es la misma señal que recibe `AsistentePage`.
     */
    activo?: boolean;
}

/**
 * Tab «Nivel de alumnos»: cada deportista del colegio como una carta.
 *
 * Es la lectura que faltaba. El Home dice cómo se reparte la población y la lista muestra la
 * ficha administrativa fila a fila; ninguna responde «¿cómo va *este* alumno y qué le falta?».
 * La carta lo dice en **dos ejes independientes**: el nivel clínico (`SIN EVALUAR`, `BAJO`,
 * `MEDIO`, `ALTO`) y la completitud de la ficha (`Inicial`, `Evaluado`, `Completo`). No
 * correlacionan a propósito: un alumno puede estar sano con la ficha a medias, y al revés.
 *
 * **Nada se calcula aquí.** El puntaje, las bandas, las estrellas y el progreso los resuelve
 * `SP_juego_cartas_club` contra la tabla `juego_niveles`, que se retunea con un `UPDATE`.
 * Recalcular en el front crearía una segunda verdad que divergiría al primer ajuste.
 *
 * El orden tampoco: llega por puntaje descendente, con las `sin_evaluar` al final. Lo que sí
 * pasa aquí es el **filtrado, en memoria**: el club más grande son 147 cartas en una sola
 * respuesta, así que ir al servidor por cada tecla sería tráfico regalado.
 */
export const JuegoCartasPage = ({ activo = true }: Props) => {

    const { cartas, configuracion, cargando, error, sinEmail, recargar } = useJuegoCartas(activo);

    const [texto, setTexto] = useState('');
    const [slugNivel, setSlugNivel] = useState('');
    const [slugEstado, setSlugEstado] = useState('');
    const [visibles, setVisibles] = useState(PAGINA);

    const [rutAbierto, setRutAbierto] = useState('');
    const [detalle, setDetalle] = useState<IJuegoCarta | null>(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState('');

    /**
     * El último RUT pedido, para descartar respuestas que llegan tarde.
     *
     * Sin esto, pulsar una carta lenta y luego otra rápida deja en el modal el desglose de la
     * primera en cuanto termina: se estaría mostrando la evaluación de **otro menor** bajo el
     * nombre del que se pulsó. Un `useState` no sirve aquí porque el `handleAbrir` en vuelo ve
     * el valor con el que se creó.
     */
    const ultimoRut = useRef('');

    // Sin memo, los 118 filtros se recalcularían en cada render, incluido el de abrir el modal.
    const filtradas = useMemo(
        () => filtrarCartas(cartas, texto, slugNivel, slugEstado),
        [cartas, texto, slugNivel, slugEstado],
    );

    /**
     * Cualquier cambio de filtro vuelve a la primera tanda.
     *
     * Es el mismo problema que resuelve el `setPage(0)` de `ChequeoTable`: filtrar con 96 cartas
     * ya desplegadas dejaría un «Ver más» que no despliega nada, sin explicación.
     */
    const filtrar = (aplicar: () => void) => {
        aplicar();
        setVisibles(PAGINA);
    };

    const limpiarFiltros = () => filtrar(() => {
        setTexto('');
        setSlugNivel('');
        setSlugEstado('');
    });

    const handleAbrir = async (rut: string) => {

        ultimoRut.current = rut;

        setRutAbierto(rut);
        setDetalle(null);
        setErrorDetalle('');
        setCargandoDetalle(true);

        try {
            const { getCartaDetalle } = UseJuegoCartasService();
            const carta = await getCartaDetalle(rut);

            if (ultimoRut.current !== rut) return;

            // El backend responde 200 con `data: null` cuando el RUT no tiene chequeos. Es un
            // caso normal, no un fallo, y merece su propia frase.
            if (!carta) setErrorDetalle('Este alumno no tiene chequeos registrados.');
            else setDetalle(carta);
        }
        catch (problema) {
            if (ultimoRut.current !== rut) return;

            console.error('Error al cargar el desglose de la carta:', problema);
            setErrorDetalle('No se pudo cargar el desglose de este alumno.');
        }
        finally {
            if (ultimoRut.current === rut) setCargandoDetalle(false);
        }
    };

    const cerrarModal = () => {
        ultimoRut.current = '';
        setRutAbierto('');
        setDetalle(null);
        setErrorDetalle('');
    };

    return (
        <Box>

            <Typography
                component="h2"
                sx={{ fontWeight: 700, fontSize: { xs: 18, md: 20 }, color: COLORES.primarioOsc, mb: 0.5 }}
            >
                Nivel de alumnos
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
                Cada deportista con su nivel, sus atributos y cuánto le falta a su ficha.
            </Typography>

            { sinEmail && (
                <Aviso
                    titulo="No se pudo identificar el colegio"
                    detalle="La sesión no trae el correo de la institución, que es lo que acota estos datos. Vuelve a iniciar sesión para ver a tus alumnos."
                />
            ) }

            { !sinEmail && (
                <>
                    {/* Buscador y filtros */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>

                        <BuscadorCartas
                            texto={texto}
                            handleTexto={(valor) => filtrar(() => setTexto(valor))}
                        />

                        { configuracion && (
                            <>
                                <FiltrosCartas
                                    titulo="Progreso"
                                    bandas={configuracion.completitud}
                                    seleccionado={slugEstado}
                                    handleElegir={(slug) => filtrar(() => setSlugEstado(slug))}
                                />
                                <FiltrosCartas
                                    titulo="Nivel"
                                    bandas={configuracion.clinico}
                                    seleccionado={slugNivel}
                                    handleElegir={(slug) => filtrar(() => setSlugNivel(slug))}
                                />
                            </>
                        ) }

                    </Box>

                    {/* Esqueletos con la forma de la carta: un spinner suelto no dice cuánto viene. */}
                    { cargando && (
                        <Grid container spacing={2.5}>
                            { Array.from({ length: 6 }, (_, indice) => (
                                <Grid item xs={12} sm={6} md={4} key={indice}>
                                    <Skeleton variant="rounded" height={330} sx={{ borderRadius: 3 }} />
                                </Grid>
                            )) }
                        </Grid>
                    ) }

                    {/*
                        Un servicio caído y un colegio sin alumnos evaluados dicen cosas
                        distintas, igual que en las tarjetas del Home. El SP del juego puede no
                        estar desplegado: confundirlo con «sin datos» escondería justo eso.
                    */}
                    { !cargando && error && (
                        <Aviso
                            titulo="El nivel de los alumnos no está disponible"
                            detalle="El servicio que calcula las cartas no respondió. Vuelve a intentarlo en unos minutos."
                            accion={(
                                <Button variant="outlined" onClick={recargar}>
                                    Reintentar
                                </Button>
                            )}
                        />
                    ) }

                    { !cargando && !error && cartas.length === 0 && (
                        <Aviso
                            titulo="Todavía no hay alumnos evaluados"
                            detalle="Cuando registres chequeos en este colegio, cada deportista aparecerá aquí como una carta."
                        />
                    ) }

                    { !cargando && !error && cartas.length > 0 && filtradas.length === 0 && (
                        <Aviso
                            titulo="Ningún alumno coincide con el filtro"
                            detalle="Prueba con otro nivel, otro progreso, o limpia la búsqueda."
                            accion={(
                                <Button variant="outlined" onClick={limpiarFiltros}>
                                    Limpiar filtros
                                </Button>
                            )}
                        />
                    ) }

                    { !cargando && !error && filtradas.length > 0 && (
                        <>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
                                { filtradas.length } de { cartas.length } alumnos
                            </Typography>

                            {/* 3 / 2 / 1 columnas, los mismos cortes del HTML de referencia. */}
                            <Grid container spacing={2.5}>
                                { filtradas.slice(0, visibles).map((carta) => (
                                    <Grid item xs={12} sm={6} md={4} key={carta.rut}>
                                        <CartaAlumno
                                            carta={carta}
                                            atributos={configuracion?.atributos ?? []}
                                            handleAbrir={handleAbrir}
                                        />
                                    </Grid>
                                )) }
                            </Grid>

                            { visibles < filtradas.length && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setVisibles((previo) => previo + PAGINA)}
                                    >
                                        Ver más ({ filtradas.length - visibles } restantes)
                                    </Button>
                                </Box>
                            ) }

                            {/*
                                La nota es permanente, no un tooltip. Las bandas se calibraron
                                sobre la distribución real de la base para que el badge
                                discriminara algo, no sobre criterio clínico: presentar esto como
                                un diagnóstico sería afirmar más de lo que el dato sostiene.
                            */}
                            <Typography
                                sx={{
                                    mt         : 4,
                                    pt         : 2,
                                    borderTop  : `1px solid ${UI.bordeSuave}`,
                                    fontSize   : 11,
                                    color      : 'text.secondary',
                                    textAlign  : 'center',
                                }}
                            >
                                El nivel y las estrellas son una estimación de seguimiento calculada
                                sobre los datos cargados de cada alumno. <strong>No son un
                                diagnóstico médico</strong> y no sustituyen la evaluación clínica.
                            </Typography>
                        </>
                    ) }

                    <ModalCarta
                        abierto={rutAbierto !== ''}
                        carta={detalle}
                        cargando={cargandoDetalle}
                        error={errorDetalle}
                        atributos={configuracion?.atributos ?? []}
                        handleCerrar={cerrarModal}
                    />
                </>
            ) }

        </Box>
    );
};
