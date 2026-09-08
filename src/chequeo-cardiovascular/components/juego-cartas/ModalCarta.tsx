import {
    Box, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import { COLORES, JUEGO, sxFocoVisible, UI } from '../../config/tema';
import type { ICompletitudCarta, IJuegoAtributoCatalogo, IJuegoCarta } from '../../interface';
import { capitalizarPalabras, fechaDeCarta } from '../../utilities';

import { BadgeJuego } from './BadgeJuego';
import { BarraAtributo } from './BarraAtributo';
import { BarraProgreso } from './BarraProgreso';
import { Estrellas } from './Estrellas';

/** Los cinco bloques del eje de completitud, en el orden en que se cargan en la vida real. */
const BLOQUES: { clave: keyof ICompletitudCarta; nombre: string }[] = [
    { clave: 'chequeo',        nombre: 'Chequeo cardiovascular' },
    { clave: 'signos_vitales', nombre: 'Signos vitales completos' },
    { clave: 'ecg',            nombre: 'Electrocardiograma' },
    { clave: 'bioimpedancia',  nombre: 'Bioimpedancia' },
    { clave: 'certificado',    nombre: 'Certificado' },
];

interface Props {
    abierto     : boolean;
    /** `null` mientras carga; la carta cuando llegó. */
    carta       : IJuegoCarta | null;
    cargando    : boolean;
    error       : string;
    atributos   : IJuegoAtributoCatalogo[];
    handleCerrar: () => void;
}

/** Una etiqueta con su valor, para la ficha de cabecera. */
const Dato = ({ label, valor }: { label: string; valor: string }) => (

    <Box sx={{ minWidth: 92 }}>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            { label }
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: COLORES.primarioOsc }}>
            { valor }
        </Typography>
    </Box>
);

/**
 * El desglose de una carta: por qué el alumno tiene ese nivel y qué le falta a su ficha.
 *
 * Es la respuesta a la pregunta que la carta deja abierta. Sin él, un atributo al 100 % que
 * descansa en un solo campo de texto se lee igual que uno con los cuatro sub-indicadores
 * medidos; aquí se ven `atributos_medidos` y los cinco bloques de completitud.
 *
 * Usa el `Dialog` de MUI —que ya atrapa el foco y cierra con `Esc`— y **no el `ModalProvider`
 * del módulo**: aquel comparte un único `isDateModalOpen` con el detalle del deportista, y dos
 * modales sobre el mismo booleano se abrirían juntos.
 */
export const ModalCarta = ({
    abierto, carta, cargando, error, atributos, handleCerrar,
}: Props) => (

    <Dialog
        open={abierto}
        onClose={handleCerrar}
        maxWidth="sm"
        fullWidth
        aria-labelledby="titulo-desglose-carta"
        PaperProps={{ sx: { borderRadius: 3 } }}
    >
        <DialogTitle
            id="titulo-desglose-carta"
            sx={{ pr: 6, fontWeight: 700, fontSize: 18, color: COLORES.primarioOsc }}
        >
            { carta ? capitalizarPalabras(carta.nombre) : 'Desglose del alumno' }

            <IconButton
                onClick={handleCerrar}
                aria-label="Cerrar el desglose"
                sx={{ position: 'absolute', right: 12, top: 12, ...sxFocoVisible }}
            >
                <CloseIcon />
            </IconButton>
        </DialogTitle>

        <DialogContent dividers>

            { cargando && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={32} aria-label="Cargando el desglose" />
                </Box>
            ) }

            { !cargando && error && (
                <Typography sx={{ py: 4, textAlign: 'center', color: UI.atencion, fontSize: 14 }}>
                    { error }
                </Typography>
            ) }

            { !cargando && !error && carta && (
                <>
                    {/* Identificación */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <Dato label="Ficha" valor={carta.ficha} />
                        <Dato label="RUT" valor={carta.rut} />
                        <Dato label="Edad" valor={carta.edad ? `${carta.edad} años` : '—'} />
                        <Dato label="Sexo" valor={carta.sexo || '—'} />
                        <Dato label="Último chequeo" valor={fechaDeCarta(carta.fecha_atencion)} />
                    </Box>

                    {/* Resultado */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                        <Estrellas cantidad={carta.estrellas} tamano={24} />
                        <Typography
                            sx={{
                                fontSize   : 20,
                                fontWeight : 700,
                                color      : carta.puntaje === null ? JUEGO.sinMedir : COLORES.primarioOsc,
                            }}
                        >
                            { carta.puntaje === null ? '—' : `${carta.puntaje}/100` }
                        </Typography>
                        <BadgeJuego badge={carta.nivel} />
                        { carta.insignia && (
                            <Box
                                component="span"
                                sx={{
                                    px              : 1,
                                    py              : 0.25,
                                    borderRadius    : 5,
                                    fontSize        : 11,
                                    fontWeight      : 700,
                                    backgroundColor : JUEGO.insigniaFondo,
                                    color           : JUEGO.insigniaTexto,
                                }}
                            >
                                { carta.insignia }
                            </Box>
                        ) }
                    </Box>

                    <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2.5 }}>
                        { carta.atributos_medidos } de { carta.atributos.length } atributos medidos
                        { carta.bonus > 0 && ` · bonus de bioimpedancia +${carta.bonus}` }
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {/* Atributos */}
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: COLORES.primarioOsc, mb: 1.25 }}>
                        Atributos
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1, mb: 2.5 }}>
                        { carta.atributos.map((atributo) => (
                            <BarraAtributo
                                key={atributo.slug}
                                atributo={atributo}
                                catalogo={atributos.find(({ slug }) => slug === atributo.slug)}
                            />
                        )) }
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Completitud */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, color: COLORES.primarioOsc }}>
                            Ficha
                        </Typography>
                        <BadgeJuego badge={carta.estado} tamano="pequeno" />
                    </Box>

                    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 2 }}>
                        { BLOQUES.map(({ clave, nombre }) => {

                            const hecho = carta.completitud[clave];

                            return (
                                <Box
                                    component="li"
                                    key={clave}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4 }}
                                >
                                    {/* El icono va acompañado de texto: quien no distinga el
                                        color sigue leyendo «pendiente» en la propia frase. */}
                                    { hecho
                                        ? <CheckCircleIcon aria-hidden="true" sx={{ fontSize: 18, color: JUEGO.bloqueHecho }} />
                                        : <RadioButtonUncheckedIcon aria-hidden="true" sx={{ fontSize: 18, color: JUEGO.bloquePendiente }} /> }
                                    <Typography sx={{ fontSize: 13, color: hecho ? 'text.primary' : 'text.secondary' }}>
                                        { nombre }{ hecho ? '' : ' — pendiente' }
                                    </Typography>
                                </Box>
                            );
                        }) }
                    </Box>

                    <BarraProgreso progreso={carta.progreso} de={carta.nombre} />

                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 2.5 }}>
                        El nivel es una estimación de seguimiento calculada sobre los datos
                        cargados. <strong>No es un diagnóstico médico.</strong>
                    </Typography>
                </>
            ) }

        </DialogContent>
    </Dialog>
);
