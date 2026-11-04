import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { urlWhatsappPromo } from '../config/canales-contacto';
import { ANCHO_MAXIMO, TEMA_HOME } from '../config/tema-home';
import { EncabezadoSeccion } from './EncabezadoSeccion';
import { ImagenAmpliable } from './ImagenAmpliable';

import type { EstadoImagenesHome } from '../hooks';
import type { IPromocionHome } from '../interface';

interface Props {
    variante : 'promociones' | 'alianzas';
    /**
     * Imágenes ya repartidas por `useImagenesHome` (Spec 04): llegan de la API, no de un JSON.
     * El reparto por sección —comparando contra cada literal— vive en el hook.
     */
    imagenes : IPromocionHome[];
    estado   : EstadoImagenesHome;
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
        etiqueta : 'Promociones vigentes',
        titulo   : 'Lo que está en oferta',
        bajada   : 'Campañas del mes en chequeos, exámenes y controles. Pulsa la que te interese y te respondemos por WhatsApp.',
        enlazada : true,
        fondo    : TEMA_HOME.hueso,
    },
    alianzas: {
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
export const CarruselPromociones = ( { variante, imagenes, estado }: Props ) => {
    const { etiqueta, titulo, bajada, enlazada, fondo } = CONTENIDO[ variante ];

    // El autoplay es movimiento no solicitado: quien pide menos movimiento no lo recibe.
    const reducirMovimiento = useMemo(
        () => typeof window !== 'undefined' && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches,
        []
    );

    // Spec 04: si la API falló o no hay imágenes, la sección entera no se pinta —ni su
    // encabezado—. Una sección de ventas que dice «no se pudo cargar» resta más de lo que
    // informa. El motivo queda en consola, lo deja `useImagenesHome`.
    if ( estado === 'error' || ( estado === 'listo' && imagenes.length === 0 ) ) return null;

    return (
        <Box component="section" sx={{ bgcolor: fondo, borderTop: `1px solid ${ TEMA_HOME.borde }` }}>
            <Container maxWidth={ false } sx={{ maxWidth: ANCHO_MAXIMO, py: { xs: 7, md: 10 } }}>
                <EncabezadoSeccion
                    etiqueta={ etiqueta }
                    titulo={ titulo }
                    bajada={ bajada }
                />

                { estado === 'cargando' ? <EsqueletoCarrusel /> : (
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
                        { imagenes.map( ( promo ) => (
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
                                    {/* El envoltorio no cambia cómo se ve la gráfica en la
                                        tarjeta: solo escucha el puntero para ampliarla.
                                        Las decisiones de ajuste siguen aquí, que es donde
                                        se sabe que un flyer va con `contain`. */}
                                    <ImagenAmpliable src={ promo.src } alt={ promo.alt }>
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
                                    </ImagenAmpliable>
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
                ) }
            </Container>
        </Box>
    );
};

/**
 * Lo que se ve mientras llegan las imágenes (Spec 04).
 *
 * Repite las medidas reales de una tarjeta —marco 3:4, una línea de título y el `pb: 6` que
 * Swiper reserva para los puntos— y la misma cantidad de columnas por ancho, para que la
 * página no salte de alto cuando aparece el carrusel.
 */
const EsqueletoCarrusel = () => (
    <Box
        aria-hidden
        sx={{
            display            : 'grid',
            gridTemplateColumns: '1fr',
            gap                : '20px',
            pb                 : 6,
            // Los mismos cortes que los `breakpoints` del Swiper (600 / 960 / 1400), no los de
            // MUI (600 / 900 / 1200): si no coinciden, la página salta entre 900 y 960 px.
            '& > :nth-of-type(n+2)': { display: 'none' },
            '@media (min-width: 600px)' : { gridTemplateColumns: 'repeat(2, 1fr)', '& > :nth-of-type(2)': { display: 'block' } },
            '@media (min-width: 960px)' : { gridTemplateColumns: 'repeat(3, 1fr)', '& > :nth-of-type(3)': { display: 'block' } },
            '@media (min-width: 1400px)': { gridTemplateColumns: 'repeat(4, 1fr)', '& > :nth-of-type(4)': { display: 'block' } },
        }}
    >
        { [ 0, 1, 2, 3 ].map( ( n ) => (
            <Box key={ n }>
                <Skeleton variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '3 / 4', borderRadius: 3 }} />
                {/* `fontSize` y `lineHeight` del caption real: sin el `lineHeight`, el esqueleto
                    hereda el del cuerpo y la línea mide unos píxeles de más. */}
                <Skeleton variant="text" sx={{ mt: 1.5, width: '70%', fontSize: '0.95rem', lineHeight: 1.4 }} />
            </Box>
        ) ) }
    </Box>
);
