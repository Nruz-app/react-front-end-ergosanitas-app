/**
 * Tab «Distribución Segmentaria».
 *
 * Contenedor de la vista: elige el examen, arma la distribución y reparte lo ya resuelto
 * a la silueta y a las fichas laterales. No hace fetch — recibe todo por props, como los
 * otros tres tabs de la Spec 02.
 */

import { useMemo, useState } from 'react';
import { Box, Chip, Collapse, Divider, Grid, Paper, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

import {
    EstadoClinico,
    IBioimpedancia,
    IElectrocardiograma,
    IPacienteBase,
    MetricaSegmentaria,
    OrigenDistribucion,
    SegmentoId,
} from '../../interface';
import {
    ESCALAS,
    SEGMENTOS,
    clasificar,
    clasificarHallazgo,
    compararDistribuciones,
    normalizarSexo,
    calcularDistribucion,
    estadoDeMetrica,
    fraccionDeMetrica,
    origenDeMetrica,
    origenDeSegmento,
    peorEstado,
    residuoDeMetrica,
    totalDeMetrica,
    valorDeMetrica,
} from '../../utilities';
import { formatFechaCL } from '../../utilities/format';
import { EmptyState } from '../EmptyState';
import { CalloutSegmento } from '../segmentaria/CalloutSegmento';
import { ControlesSegmentaria } from '../segmentaria/ControlesSegmentaria';
import { DetalleSegmento } from '../segmentaria/DetalleSegmento';
import { PanelElectro } from '../segmentaria/PanelElectro';
import { SiluetaCorporal } from '../segmentaria/SiluetaCorporal';
import { GuiasCallout } from '../segmentaria/svg/GuiasCallout';
import { MarcadoresElectro } from '../segmentaria/svg/MarcadoresElectro';

interface Props {
    paciente            : IPacienteBase;
    bioimpedancias      : IBioimpedancia[];   // orden: fecha DESC
    electrocardiogramas : IElectrocardiograma[];
}

/**
 * Edad bajo la cual las escalas de este módulo no son aplicables.
 *
 * Todos los cortes de `umbrales.ts` son de población adulta. En pediatría la evaluación
 * se hace por percentiles según edad y sexo, así que bajo este umbral la vista tiene que
 * declarar que sus colores no son un juicio clínico válido.
 */
const EDAD_ADULTO = 18;

/**
 * Bajo este umbral el residuo no se muestra: con datos estimados los coeficientes suman
 * 1 y la resta da un cero con ruido de coma flotante, no un hallazgo.
 */
const RESIDUO_MINIMO_KG = 0.05;

/** Cómo se nombra la métrica activa dentro de los textos. */
const ETIQUETA_METRICA: Record<MetricaSegmentaria, string> = {
    grasa   : 'masa grasa',
    musculo : 'masa muscular',
};

/**
 * Qué declara la cabecera según de dónde salieron las cifras en pantalla.
 *
 * La advertencia no es decorativa: mientras los kilos por segmento fueron estimados, el
 * chip naranja era la condición que hacía aceptable la vista. Ahora que el equipo los
 * mide, seguir mostrándolo sería mentir en la dirección contraria.
 */
interface IAdvertencia {
    etiqueta : string | null;              // null = no se muestra chip
    color    : 'success' | 'warning';
    esMedido : boolean;                    // elige el icono del chip
    bajada   : string;
}

const ADVERTENCIA: Record<OrigenDistribucion, IAdvertencia> = {
    medido: {
        etiqueta : 'Valores medidos por el equipo',
        color    : 'success',
        esMedido : true,
        bajada   : 'Masa por segmento corporal medida por el equipo de bioimpedancia.',
    },
    estimado: {
        etiqueta : 'Valores estimados — no medidos por el equipo',
        color    : 'warning',
        esMedido : false,
        bajada   : 'Reparto de masa por segmento corporal a partir de los totales de la '
                 + 'bioimpedancia: este examen no trae medición por extremidad.',
    },
    mixto: {
        etiqueta : 'Valores medidos, con segmentos estimados',
        color    : 'warning',
        esMedido : false,
        bajada   : 'Masa por segmento medida por el equipo. Los segmentos que el examen no '
                 + 'trae se estiman desde los totales y quedan marcados como tales.',
    },
    sinDato: {
        etiqueta : null,
        color    : 'warning',
        esMedido : false,
        bajada   : 'El examen seleccionado no trae masa por segmento ni totales de los que '
                 + 'estimarla.',
    },
};

/**
 * Altura de cada ficha dentro del bloque de la silueta, en porcentaje.
 *
 * Corresponde al punto de salida de su línea guía sobre el alto del `viewBox` (640):
 * el tronco sale a y=190, los brazos a y=300 y las piernas a y=540.
 */
const ALTURA: Record<SegmentoId, string> = {
    tronco    : '29.7%',
    brazoDer  : '46.9%',
    brazoIzq  : '46.9%',
    piernaDer : '84.4%',
    piernaIzq : '84.4%',
};

/** Lado en el que se ubica cada ficha: el mismo en que se dibuja el segmento. */
const LADO: Record<SegmentoId, 'izquierda' | 'derecha'> = {
    tronco    : 'izquierda',
    brazoDer  : 'izquierda',
    piernaDer : 'izquierda',
    brazoIzq  : 'derecha',
    piernaIzq : 'derecha',
};

export const TabDistribucionSegmentaria = ({
    paciente,
    bioimpedancias,
    electrocardiogramas,
}: Props) => {

    // Examen mostrado. Por defecto el más reciente: el mapper ya ordena DESC.
    const [idBio, setIdBio] = useState<number | null>(bioimpedancias[0]?.id ?? null);
    const [metrica, setMetrica] = useState<MetricaSegmentaria>('grasa');
    const [idBase, setIdBase] = useState<number | null>(null);

    // Dos estados distintos: el hover es transitorio y el fijado sobrevive a que el
    // cursor se vaya. El fijado manda, para que mover el mouse hacia la tarjeta de
    // detalle no la haga desaparecer.
    const [hover, setHover] = useState<SegmentoId | null>(null);
    const [fijado, setFijado] = useState<SegmentoId | null>(null);

    const segmentoActivo = fijado ?? hover;

    /** Segundo click sobre el mismo segmento lo deselecciona. */
    const alHacerClick = (id: SegmentoId) => setFijado((previo) => (previo === id ? null : id));

    const bioActual = bioimpedancias.find((b) => b.id === idBio) ?? bioimpedancias[0] ?? null;

    // El panel del electro muestra SIEMPRE el más reciente, no el más cercano al examen
    // corporal elegido: es el estado cardiovascular actual del paciente.
    const ultimoElectro = electrocardiogramas[0] ?? null;

    const distribucion = useMemo(
        () => (bioActual ? calcularDistribucion(bioActual, paciente.sexo) : null),
        [bioActual, paciente.sexo],
    );

    // Examen base de la comparación. Si el usuario elige como actual el mismo que tenía
    // como base, la comparación se descarta: compararlo consigo mismo daría cinco ceros.
    const bioBase = bioimpedancias.find((b) => b.id === idBase && b.id !== idBio) ?? null;

    const comparacion = useMemo(() => {

        if (!distribucion || !bioBase) return null;

        return compararDistribuciones(
            distribucion,
            calcularDistribucion(bioBase, paciente.sexo),
        );

    }, [distribucion, bioBase, paciente.sexo]);

    // Los cinco segmentos comparten el estado global de la métrica: no existen cortes
    // de normalidad por extremidad y no se inventan (Spec 03).
    const estadoActual: EstadoClinico = distribucion
        ? estadoDeMetrica(distribucion, metrica)
        : 'sinDato';

    const origenActual: OrigenDistribucion = distribucion
        ? origenDeMetrica(distribucion, metrica)
        : 'sinDato';

    const advertencia = ADVERTENCIA[origenActual];

    const colores = useMemo(
        () => SEGMENTOS.reduce((acumulado, id) => {
            acumulado[id] = estadoActual;
            return acumulado;
        }, {} as Record<SegmentoId, EstadoClinico>),
        [estadoActual],
    );

    // Un solo marcador resume presión y frecuencia: se pinta con el peor de los tres.
    const estadoCardiaco = ultimoElectro
        ? peorEstado(
            clasificar(ultimoElectro.frecuenciaCardiaca, ESCALAS.frecuenciaCardiaca),
            clasificar(ultimoElectro.presionSistolica, ESCALAS.presionSistolica),
            clasificar(ultimoElectro.presionDiastolica, ESCALAS.presionDiastolica),
        )
        : 'sinDato';

    const estadoSaturacion = clasificar(
        ultimoElectro?.saturacionOxigeno ?? null,
        ESCALAS.saturacionOxigeno,
    );

    const estadoOsteoarticular = clasificarHallazgo(ultimoElectro?.sistemaOsteoarticular);

    // Escala con la que se evaluó la métrica activa. Su `referencia` va al pie: el
    // lector tiene que poder ver de dónde sale el corte que pintó la silueta.
    const esFemenino = normalizarSexo(paciente.sexo) === 'femenino';
    const escalaEnUso = metrica === 'grasa'
        ? (esFemenino ? ESCALAS.grasaFemenino : ESCALAS.grasaMasculino)
        : (esFemenino ? ESCALAS.smiFemenino : ESCALAS.smiMasculino);

    // Masa que los cinco segmentos no cubren: el equipo no asigna cabeza ni cuello a
    // ninguna región, así que la suma de las fichas no llega al total del examen.
    const residuo = distribucion ? residuoDeMetrica(distribucion, metrica) : null;
    const total = distribucion ? totalDeMetrica(distribucion, metrica) : null;
    const hayResiduo = residuo !== null && total !== null && Math.abs(residuo) >= RESIDUO_MINIMO_KG;

    /** Ficha de un segmento, con los datos ya resueltos para la métrica activa. */
    const ficha = (id: SegmentoId) => {

        const segmento = distribucion?.segmentos[id];

        return (
            <CalloutSegmento
                nombre={segmento?.nombre ?? id}
                valorKg={segmento ? valorDeMetrica(segmento, metrica) : null}
                fraccion={segmento ? fraccionDeMetrica(segmento, metrica) : 0}
                origen={segmento ? origenDeSegmento(segmento, metrica) : 'sinDato'}
                estado={estadoActual}
                alineacion={LADO[id]}
                activo={segmentoActivo === id}
                onHover={(dentro) => setHover(dentro ? id : null)}
                onClick={() => alHacerClick(id)}
                delta={comparacion
                    ? (metrica === 'grasa'
                        ? comparacion.deltas[id].grasaKg
                        : comparacion.deltas[id].musculoKg)
                    : undefined}
            />
        );
    };

    /**
     * Cabecera de la vista. Se comparte con el estado vacío: el encabezado debe verse
     * aunque no haya nada que dibujar.
     */
    const cabecera = (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Distribución segmentaria
                </Typography>
                {advertencia.etiqueta && (
                    <Chip
                        icon={advertencia.esMedido
                            ? <CheckCircleOutlineIcon />
                            : <InfoOutlinedIcon />}
                        label={advertencia.etiqueta}
                        size="small"
                        color={advertencia.color}
                        variant="outlined"
                    />
                )}
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                {advertencia.bajada}
            </Typography>
        </>
    );

    // Sin bioimpedancias no hay nada que mostrar: la silueta quedaría gris y las cinco
    // fichas en '—'. Se muestra el estado vacío antes que una vista que parece rota.
    if (bioimpedancias.length === 0) {
        return (
            <Box>
                {cabecera}
                <EmptyState
                    icon={<AccessibilityNewIcon fontSize="inherit" />}
                    mensaje="Sin bioimpedancias registradas"
                    detalle="La distribución segmentaria sale de la masa por segmento que mide el equipo de bioimpedancia. Cuando el paciente tenga al menos un examen, la silueta aparecerá aquí."
                />
            </Box>
        );
    }

    return (
        <Box>

            {cabecera}

            <ControlesSegmentaria
                metrica={metrica}
                onMetricaChange={setMetrica}
                bioimpedancias={bioimpedancias}
                idBio={idBio}
                onBioChange={setIdBio}
                idBase={idBase}
                onBaseChange={setIdBase}
            />

            <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    display: 'flex',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    height: '100%',
                }}
            >
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 340 }}>

                    <SiluetaCorporal
                        colores={colores}
                        segmentoActivo={segmentoActivo}
                        onHoverSegmento={setHover}
                        onClickSegmento={alHacerClick}
                    >
                        <GuiasCallout segmentoActivo={segmentoActivo} />
                        {/* Sin controles registrados no hay marcadores que dibujar. */}
                        {ultimoElectro && (
                            <MarcadoresElectro
                                estadoCardiaco={estadoCardiaco}
                                estadoSaturacion={estadoSaturacion}
                                estadoOsteoarticular={estadoOsteoarticular}
                            />
                        )}
                    </SiluetaCorporal>

                    {/* Fichas laterales, ancladas a la altura de su línea guía. Solo en
                        pantallas anchas: debajo de md no cabe una columna a cada lado y
                        se muestran apiladas bajo la silueta. */}
                    {SEGMENTOS.map((id) => (
                        <Box
                            key={id}
                            sx={{
                                display: { xs: 'none', md: 'block' },
                                position: 'absolute',
                                top: ALTURA[id],
                                transform: 'translateY(-50%)',
                                width: 165,
                                ...(LADO[id] === 'izquierda'
                                    ? { right: '100%', mr: 1.5 }
                                    : { left: '100%', ml: 1.5 }),
                            }}
                        >
                            {ficha(id)}
                        </Box>
                    ))}

                </Box>
            </Paper>
            </Grid>

            {/* Panel del electro: al costado en pantallas anchas, debajo en el resto. */}
            <Grid item xs={12} lg={4}>
                <PanelElectro electro={ultimoElectro} />
            </Grid>
            </Grid>

            {/* Detalle del segmento fijado. `Collapse` lo despliega sin saltos de layout. */}
            <Collapse in={Boolean(fijado)} unmountOnExit>
                {fijado && distribucion && (
                    <DetalleSegmento
                        segmento={distribucion.segmentos[fijado]}
                        estadoGrasa={distribucion.estadoGrasa}
                        estadoMusculo={distribucion.estadoMusculo}
                        metrica={metrica}
                        deltaGrasa={comparacion?.deltas[fijado].grasaKg}
                        deltaMusculo={comparacion?.deltas[fijado].musculoKg}
                        fechaBase={comparacion ? formatFechaCL(comparacion.fechaBase) : undefined}
                        onCerrar={() => setFijado(null)}
                    />
                )}
            </Collapse>

            {/* Versión apilada para pantallas angostas. */}
            <Grid container spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mt: 1 }}>
                {SEGMENTOS.map((id) => (
                    <Grid item xs={6} key={id}>
                        {ficha(id)}
                    </Grid>
                ))}
            </Grid>

            {/* Pie metodológico. No es letra chica decorativa: sin esto no se puede saber
                con qué corte se pintó la silueta ni de dónde salieron los kilos. */}
            <Divider sx={{ mt: 3, mb: 1.5 }} />

            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                <strong>Referencia {escalaEnUso.referencia}.</strong>
                {/* La advertencia pediátrica solo aplica donde el corte de adulto no vale.
                    Mostrarla en un paciente adulto la convertiría en ruido, y el ruido es
                    lo que hace que se deje de leer la letra chica que sí importa.
                    Sin fecha de nacimiento la edad es `null`: ahí se muestra igual, porque
                    no saber si el paciente es adulto no es lo mismo que saber que lo es. */}
                {(paciente.edad === null || paciente.edad < EDAD_ADULTO) && (
                    <>
                        {' '}Los cortes de normalidad de esta vista corresponden a población
                        adulta y <strong>no son válidos en pediatría</strong>, donde la
                        evaluación se hace por percentiles según edad y sexo.
                    </>
                )}
            </Typography>

            {origenActual !== 'sinDato' && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    {origenActual === 'medido' && (
                        <>Los kilos por segmento los <strong>mide el equipo</strong> de
                        bioimpedancia.</>
                    )}
                    {origenActual === 'estimado' && (
                        <>Los kilos por segmento son <strong>estimados</strong>: se reparten
                        los totales del examen con coeficientes antropométricos (de Leva,
                        1996), no los mide el equipo.</>
                    )}
                    {origenActual === 'mixto' && (
                        <>Los kilos por segmento los mide el equipo, salvo los marcados
                        «est.», que se <strong>estiman</strong> repartiendo el total con
                        coeficientes antropométricos (de Leva, 1996).</>
                    )}
                    {' '}El estado de cada segmento es el de la métrica completa, no un corte
                    por extremidad.
                </Typography>
            )}

            {/* El residuo se declara en vez de repartirse: inventar a quién pertenecen esos
                kilos sería exactamente el tipo de dato fabricado que esta vista evita. */}
            {hayResiduo && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    Los cinco segmentos suman {(total - residuo).toFixed(1)} kg de los{' '}
                    {total.toFixed(1)} kg de {ETIQUETA_METRICA[metrica]} del examen: el
                    equipo no asigna cabeza ni cuello a ninguna región, y esos{' '}
                    {residuo.toFixed(1)} kg quedan sin repartir.
                </Typography>
            )}

        </Box>
    );
};

export default TabDistribucionSegmentaria;
