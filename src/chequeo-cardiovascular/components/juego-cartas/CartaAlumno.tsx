import { Box, ButtonBase, Typography } from '@mui/material';

import { COLORES, DEGRADADOS, JUEGO, SOMBRAS, sxFocoVisible, UI } from '../../config/tema';
import type { IJuegoAtributoCatalogo, IJuegoCarta } from '../../interface';
import { capitalizarPalabras, iniciales, resumenDeCarta } from '../../utilities';

import { BadgeJuego } from './BadgeJuego';
import { BarraAtributo } from './BarraAtributo';
import { BarraProgreso } from './BarraProgreso';
import { Estrellas } from './Estrellas';

interface Props {
    carta      : IJuegoCarta;
    /** El catálogo de `/niveles`: es lo que da icono y nombre a cada `slug` de atributo. */
    atributos  : IJuegoAtributoCatalogo[];
    handleAbrir: (rut: string) => void;
}

/**
 * La carta de un alumno.
 *
 * Sigue la estructura del HTML de referencia —avatar y nombre arriba, estrellas, badge de nivel,
 * barra de progreso y pie con el contador— con el sistema visual del módulo.
 *
 * 🔴 **La carta entera es el objetivo de clic**, no un enlace de texto en el pie. Es un
 * `ButtonBase`, así que llega por teclado, se activa con Enter y con espacio, y anuncia de una
 * vez nombre, nivel, puntaje y progreso. El «Ver desglose» del pie es la señal visual de eso,
 * no un segundo control.
 *
 * ⚠️ Un atributo puede valer 100 con **un solo sub-indicador** presente: es la contracara de
 * normalizar sobre lo que hay. El desglose del modal lo delata mostrando `atributos_medidos` y
 * los bloques de completitud.
 */
export const CartaAlumno = ({ carta, atributos, handleAbrir }: Props) => {

    const sinEvaluar = carta.puntaje === null;

    return (
        <ButtonBase
            onClick={() => handleAbrir(carta.rut)}
            aria-label={resumenDeCarta(carta)}
            sx={{
                display        : 'block',
                width          : '100%',
                // Igual que `sxTarjeta`: sin esto las cartas de una misma fila quedan a alturas
                // distintas en cuanto un nombre ocupa dos líneas.
                height         : '100%',
                textAlign      : 'left',
                p              : 2.25,
                borderRadius   : 3,
                border         : `1px solid ${COLORES.fondoSuave}`,
                backgroundColor: COLORES.fondoTarjeta,
                boxShadow      : SOMBRAS.carta,
                transition     : 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                    transform : 'translateY(-4px)',
                    boxShadow : SOMBRAS.cartaHover,
                },
                ...sxFocoVisible,
                '@media (prefers-reduced-motion: reduce)': {
                    transition : 'none',
                    '&:hover'  : { transform: 'none' },
                },
            }}
        >

            {/* Cabecera: quién es */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

                <Box
                    aria-hidden="true"
                    sx={{
                        width          : 54,
                        height         : 54,
                        flexShrink     : 0,
                        borderRadius   : '16px',
                        background     : DEGRADADOS.avatarCarta,
                        color          : COLORES.fondoTarjeta,
                        display        : 'flex',
                        alignItems     : 'center',
                        justifyContent : 'center',
                        fontSize       : 18,
                        fontWeight     : 700,
                        letterSpacing  : '0.02em',
                    }}
                >
                    { iniciales(carta.nombre) }
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        sx={{
                            fontWeight : 700,
                            fontSize   : 15,
                            color      : COLORES.primarioOsc,
                            wordBreak  : 'break-word',
                        }}
                    >
                        { capitalizarPalabras(carta.nombre) }
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.2 }}>
                        Ficha { carta.ficha } · { carta.rut }
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        { carta.edad ? `${carta.edad} años` : 'edad —' } · { carta.sexo || '—' }
                    </Typography>
                </Box>

                { carta.insignia && (
                    <Box
                        component="span"
                        sx={{
                            flexShrink      : 0,
                            px              : 1,
                            py              : 0.25,
                            borderRadius    : 5,
                            fontSize        : 10,
                            fontWeight      : 700,
                            backgroundColor : JUEGO.insigniaFondo,
                            color           : JUEGO.insigniaTexto,
                        }}
                    >
                        { carta.insignia }
                    </Box>
                ) }

            </Box>

            {/* Puntaje, estrellas y nivel */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.75, flexWrap: 'wrap' }}>

                <Estrellas cantidad={carta.estrellas} />

                <Typography
                    sx={{
                        fontSize   : 13,
                        fontWeight : 700,
                        color      : sinEvaluar ? JUEGO.sinMedir : COLORES.primarioOsc,
                    }}
                >
                    {/* Sin puntaje se pinta «—», nunca 0: el alumno no está en cero, está sin medir. */}
                    { sinEvaluar ? '—' : `${carta.puntaje}/100` }
                </Typography>

                <Box sx={{ ml: 'auto' }}>
                    <BadgeJuego badge={carta.nivel} />
                </Box>

            </Box>

            {/* Los cuatro atributos */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, mt: 1.75 }}>
                { carta.atributos.map((atributo) => (
                    <BarraAtributo
                        key={atributo.slug}
                        atributo={atributo}
                        catalogo={atributos.find(({ slug }) => slug === atributo.slug)}
                    />
                )) }
            </Box>

            {/* Completitud */}
            <Box sx={{ mt: 2 }}>
                <BarraProgreso progreso={carta.progreso} de={carta.nombre} />
            </Box>

            {/* Pie */}
            <Box
                sx={{
                    mt         : 1.75,
                    pt         : 1.25,
                    borderTop  : `1px solid ${UI.bordeSuave}`,
                    display    : 'flex',
                    alignItems : 'center',
                    gap        : 1,
                    fontSize   : 12,
                    color      : 'text.secondary',
                }}
            >
                <BadgeJuego badge={carta.estado} tamano="pequeno" />
                <Typography component="span" sx={{ fontSize: 12 }}>
                    { carta.total_chequeos } { carta.total_chequeos === 1 ? 'chequeo' : 'chequeos' }
                </Typography>
                <Typography
                    component="span"
                    sx={{ fontSize: 12, ml: 'auto', fontWeight: 600, color: COLORES.primario }}
                >
                    Ver desglose ›
                </Typography>
            </Box>

        </ButtonBase>
    );
};
