import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import promociones from '../config/home-promociones.json';
import { urlWhatsappPromo } from '../config/canales-contacto';
import { ANCHO_MAXIMO, TEMA_HOME } from '../config/tema-home';
import { EncabezadoSeccion } from './EncabezadoSeccion';

import type { IPromocionHome } from '../interface';

const TODAS = promociones as IPromocionHome[];

/**
 * El reparto se hace comparando contra `true` y `false` de forma explícita, y no con la
 * verdad o falsedad del valor.
 *
 * El motivo es concreto: el JSON se tipa con una aserción, y una aserción no obliga a que
 * el campo exista. Si mañana alguien agrega una promoción y olvida `destacado`, con un
 * `!p.destacado` la entrada aparecería silenciosamente entre las alianzas. Comparando
 * contra `false` no aparece en ninguno de los dos bloques, que es un error visible en vez
 * de uno escondido.
 */
const DESTACADAS = TODAS.filter( ( promo ) => promo.activo && promo.destacado === true );
const ALIANZAS   = TODAS.filter( ( promo ) => promo.activo && promo.destacado === false );

interface Props {
    variante : 'promociones' | 'alianzas';
}

/**
 * Todo lo que distingue a las dos variantes, junto y en un solo sitio.
 *
 * `enlazada` es la diferencia de fondo: una promoción se compra y por eso su tarjeta
 * abre WhatsApp; un convenio no se compra, así que su tarjeta es una imagen y nada más.
 *
 * Los fondos alternan con las secciones vecinas. Promociones va entre la barra de
 * indicadores y los servicios, ambas blancas, de ahí el hueso. Alianzas va después de
 * los videos, que son hueso, de ahí el blanco.
 */
const CONTENIDO = {
    promociones: {
        items    : DESTACADAS,
        etiqueta : 'Promociones vigentes',
        titulo   : 'Lo que está en oferta',
        bajada   : 'Campañas del mes en chequeos, exámenes y controles. Pulsa la que te interese y te respondemos por WhatsApp.',
        enlazada : true,
        fondo    : TEMA_HOME.hueso,
    },
    alianzas: {
        items    : ALIANZAS,
        etiqueta : 'Alianzas y convenios',
        titulo   : 'Con quiénes trabajamos',
        bajada   : 'Convenios con clubes, medios e instituciones que respaldan nuestros operativos.',
        enlazada : false,
        fondo    : '#fff',
    },
} as const;

/**
 * Carrusel de gráficas, en dos variantes: promociones y alianzas.
 *
 * Es un solo componente montado dos veces y no dos archivos. Duplicarlo daría dos copias
 * que divergen en el primer arreglo de estilo, y todo lo que cambia entre ambas cabe en
 * el mapa `CONTENIDO` de arriba.
 *
 * Las gráficas son flyers de campaña con el texto quemado en la imagen. Eso manda sobre
 * el ajuste: van con `object-fit: contain` y no con `cover`, porque recortar un flyer
 * borra justo la oferta que el flyer viene a anunciar. El precio son franjas laterales
 * cuando la gráfica es más estrecha que su marco, y es un precio barato comparado con
 * publicar un precio cortado por la mitad.
 *
 * El marco es 3:4, que cubre el rango real del material: medido, va de 1024×1820 hasta
 * 1254×1254.
 */
export const CarruselPromociones = ( { variante }: Props ) => {
    const { items, etiqueta, titulo, bajada, enlazada, fondo } = CONTENIDO[ variante ];

    // El autoplay es movimiento no solicitado: quien pide menos movimiento no lo recibe.
    const reducirMovimiento = useMemo(
        () => typeof window !== 'undefined' && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches,
        []
    );

    return (
        <Box component="section" sx={{ bgcolor: fondo, borderTop: `1px solid ${ TEMA_HOME.borde }` }}>
            <Container maxWidth={ false } sx={{ maxWidth: ANCHO_MAXIMO, py: { xs: 7, md: 10 } }}>
                <EncabezadoSeccion
                    etiqueta={ etiqueta }
                    titulo={ titulo }
                    bajada={ bajada }
                />

                <Box
                    sx={{
                        // Swiper pinta flechas y puntos con su color de tema. Se alinean al
                        // azul de marca desde aquí en vez de sobrescribir sus clases.
                        '--swiper-theme-color'     : TEMA_HOME.azulErgo,
                        '--swiper-navigation-size' : '28px',
                        '.swiper'                  : { pb: 6 },
                        '.swiper-pagination-bullet': { opacity: 0.35 },
                        '.swiper-pagination-bullet-active': { opacity: 1 },
                    }}
                >
                    <Swiper
                        modules={ [ Autoplay, Navigation, Pagination, A11y ] }
                        spaceBetween={ 20 }
                        navigation
                        pagination={ { clickable: true } }
                        autoplay={ reducirMovimiento ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } }
                        breakpoints={ {
                            0   : { slidesPerView: 1 },
                            600 : { slidesPerView: 2 },
                            960 : { slidesPerView: 3 },
                            1400: { slidesPerView: 4 },
                        } }
                    >
                        { items.map( ( promo ) => (
                            <SwiperSlide key={ promo.id }>
                                <Box
                                    // Una promoción es un enlace real a WhatsApp; una alianza es
                                    // una imagen y nada más. `component` decide cuál de las dos
                                    // cosas se renderiza, y las props de enlace solo se agregan
                                    // cuando hay enlace.
                                    component={ enlazada ? 'a' : 'div' }
                                    { ...( enlazada && {
                                        href      : urlWhatsappPromo( promo.caption ),
                                        target    : '_blank',
                                        rel       : 'noopener noreferrer',
                                        'aria-label': `Consultar por WhatsApp sobre ${ promo.caption }`,
                                    } ) }
                                    sx={{
                                        display     : 'block',
                                        borderRadius: 3,
                                        overflow    : 'hidden',
                                        border      : `1px solid ${ TEMA_HOME.borde }`,
                                        bgcolor     : TEMA_HOME.hueso,
                                        ...( enlazada && {
                                            cursor    : 'pointer',
                                            transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                                            '&:hover' : {
                                                transform  : 'translateY(-4px)',
                                                boxShadow  : '0 12px 28px rgba(11,44,77,0.16)',
                                                borderColor: TEMA_HOME.azulErgo,
                                            },
                                            '&:focus-visible': {
                                                outline      : `3px solid ${ TEMA_HOME.azulErgo }`,
                                                outlineOffset: 2,
                                            },
                                        } ),
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={ promo.src }
                                        alt={ promo.alt }
                                        loading="lazy"
                                        decoding="async"
                                        sx={{
                                            width      : '100%',
                                            aspectRatio: '3 / 4',
                                            objectFit  : 'contain',
                                            display    : 'block',
                                            bgcolor    : TEMA_HOME.hueso,
                                        }}
                                    />
                                </Box>

                                <Typography
                                    sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4, color: TEMA_HOME.azulProfundo }}
                                >
                                    { promo.caption }
                                </Typography>
                            </SwiperSlide>
                        ) ) }
                    </Swiper>
                </Box>
            </Container>
        </Box>
    );
};
