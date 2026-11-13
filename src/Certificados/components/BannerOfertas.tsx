import { FocusEvent, PointerEvent, useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, EffectCreative, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

// Única excepción a la regla de aislamiento del módulo, junto a `MarqueeHome` (P2 de la SPEC 02):
// el número y el mensaje de WhatsApp tienen una sola fuente, la de la portada.
import { urlWhatsappPromo } from '../../home-ergo/config/canales-contacto';
import { nombreDeOferta, prefiereMenosMovimiento } from '../utilities';
import configuracion from '../config/banner-ofertas.json';
import textos from '../config/textos-certificados.json';

import type { Swiper as SwiperClass } from 'swiper/types';
import type { IOfertaBanner } from '../interface';

interface Props {
    /** Ofertas `promocion` activas, en el orden del Administrador. Al menos una: sin ofertas, la página usa el spinner. */
    ofertas: IOfertaBanner[];
    /** Oferta con la que arranca; su imagen ya está en caché (la precargó `useOfertasBanner`). */
    indiceInicial: number;
}

// Parámetros fijos de Swiper fuera del componente: no dependen de nada del render, así que no se
// recrean en cada uno (`rendering-hoist-jsx`, aplicada a objetos).
const MODULOS = [Autoplay, Pagination, A11y, EffectCreative];

/**
 * Entrada: opacidad 0 → 1 y escala 1,04 → 1. Salida: opacidad 1 → 0 y escala 1 → 0,98.
 * Con `translate` en cero las diapositivas quedan apiladas: una imagen grande a la vez.
 */
const EFECTO = {
    prev: { translate: [0, 0, 0], opacity: 0, scale: 0.98 },
    next: { translate: [0, 0, 0], opacity: 0, scale: 1.04 },
};

/**
 * Sin `pauseOnMouseEnter`: el de Swiper reanuda el autoplay al salir el ratón aunque el foco siga
 * dentro del banner. La pausa por ratón y por foco la llevan los manejadores del componente (D5).
 */
const AUTOPLAY = {
    delay: configuracion.segundosPorImagen * 1000,
    disableOnInteraction: false,
};

/** Mensajes del lector de pantalla en español; los de Swiper vienen en inglés. */
const A11Y = {
    paginationBulletMessage: textos.banner.ariaPunto,
    slideLabelMessage: textos.banner.ariaDiapositiva,
};

/** Alto máximo del flyer; el ancho sale de la proporción 3:4. */
const ANCHO_MARCO = 'min(100%, calc(min(60vh, 440px) * 3 / 4))';

/**
 * Banner de ofertas que reemplaza al spinner mientras se busca un RUT (SPEC 02 de certificados).
 *
 * Una imagen grande a la vez, con transición de entrada y salida, barra de tiempo, puntos y CTA a
 * WhatsApp. Es publicidad dentro de una espera corta: no puede parecer un error ni un muro, así
 * que lo único que destaca es la imagen.
 *
 * - **Imágenes por delante (Q1).** Solo llevan `src` la diapositiva activa y la siguiente: las
 *   promociones pesan unos 2 MB y, como están apiladas, el navegador las pediría todas a la vez.
 * - **Caption y CTA fuera del Swiper.** Siguen a la oferta activa, así el teclado no recorre los
 *   enlaces de las diapositivas ocultas. La imagen también enlaza a WhatsApp, pero solo para el
 *   ratón (`tabIndex={-1}`).
 * - **Barra por `ref`.** `autoplayTimeLeft` se emite en cada frame: con `useState` volvería a
 *   renderizar el carrusel a 60 fps (D7, `rerender-use-ref-transient-values`).
 */
export const BannerOfertas = ({ ofertas, indiceInicial }: Props) => {

    const [reducirMovimiento] = useState(prefiereMenosMovimiento);
    const [activa, setActiva] = useState(indiceInicial);
    const [cargadas, setCargadas] = useState<Set<number>>(
        () => new Set([indiceInicial, (indiceInicial + 1) % ofertas.length]),
    );
    const [rotas, setRotas] = useState<Set<number>>(() => new Set());

    // El contenedor de los puntos va en estado (callback ref), no en `useRef`. Swiper se inicia en
    // un layout effect, y React engancha la ref de un hermano posterior después de ese efecto: con
    // `useRef`, en producción la paginación arrancaba sin `el`, y no había puntos hasta el primer
    // cambio de diapositiva ni teclado en ellos (A11y solo los engancha al iniciar). En desarrollo
    // no se veía porque el StrictMode vuelve a montar Swiper con la ref ya puesta.
    const [contenedorPuntos, setContenedorPuntos] = useState<HTMLDivElement | null>(null);

    const raiz = useRef<HTMLElement>(null);
    const barra = useRef<HTMLDivElement>(null);
    const swiper = useRef<SwiperClass | null>(null);
    const punteroDentro = useRef(false);
    const focoDentro = useRef(false);

    const varias = ofertas.length > 1;
    const conMovimiento = varias && !reducirMovimiento;
    // Con varias ofertas, el carrusel se monta cuando ya existe el contenedor de los puntos. Ese
    // segundo render es síncrono, antes de pintar: no se ve el marco vacío.
    const montarCarrusel = !varias || contenedorPuntos !== null;
    const ofertaActiva = ofertas[activa] ?? ofertas[0];
    const nombreActiva = nombreDeOferta(ofertaActiva);
    const urlActiva = urlWhatsappPromo(nombreActiva);

    // En móvil el buscador apila sus campos y el banner queda bajo el pliegue (Q2). `nearest` no
    // mueve nada si ya cabe entero; el foco se queda donde estaba. Se espera al carrusel: los
    // puntos suman alto, y medir antes de que existan dejaba el CTA cortado por abajo.
    useEffect(() => {
        if (!montarCarrusel) return;
        raiz.current?.scrollIntoView({ block: 'nearest', behavior: reducirMovimiento ? 'auto' : 'smooth' });
    }, [montarCarrusel, reducirMovimiento]);

    /** El autoplay se detiene mientras el ratón o el foco estén dentro del banner (WCAG 2.2.2). */
    const actualizarPausa = () => {

        const autoplay = swiper.current?.autoplay;

        if (!autoplay?.running) return;

        if (punteroDentro.current || focoDentro.current) autoplay.pause();
        else autoplay.resume();
    };

    const alEntrarPuntero = (evento: PointerEvent) => {
        if (evento.pointerType !== 'mouse') return;
        punteroDentro.current = true;
        actualizarPausa();
    };

    const alSalirPuntero = (evento: PointerEvent) => {
        if (evento.pointerType !== 'mouse') return;
        punteroDentro.current = false;
        actualizarPausa();
    };

    const alEntrarFoco = () => {
        focoDentro.current = true;
        actualizarPausa();
    };

    // Pasar el foco de un punto al CTA no cuenta como salir del banner.
    const alSalirFoco = (evento: FocusEvent) => {
        if (raiz.current?.contains(evento.relatedTarget as Node | null)) return;
        focoDentro.current = false;
        actualizarPausa();
    };

    const alCambiarDiapositiva = (instancia: SwiperClass) => {

        const indice = instancia.activeIndex;
        const siguiente = (indice + 1) % ofertas.length;

        setActiva(indice);

        // Con los puntos se puede saltar a cualquier oferta: se carga la que se ve y la siguiente.
        setCargadas((previas) => {
            if (previas.has(indice) && previas.has(siguiente)) return previas;
            return new Set([...previas, indice, siguiente]);
        });
    };

    const alFallarImagen = (indice: number) => {
        setRotas((previas) => new Set([...previas, indice]));
    };

    return (
        <Box
            ref={raiz}
            component="section"
            aria-label={textos.banner.ariaRegion}
            onPointerEnter={alEntrarPuntero}
            onPointerLeave={alSalirPuntero}
            onFocus={alEntrarFoco}
            onBlur={alSalirFoco}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 1 }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                    {textos.banner.etiqueta}
                </Typography>
            </Stack>

            <Box sx={{ width: ANCHO_MARCO }}>
                <Box
                    sx={{
                        width: '100%',
                        aspectRatio: '3 / 4',
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        boxShadow: 1,
                        overflow: 'hidden',
                    }}
                >
                    {montarCarrusel ? (
                        <Swiper
                            modules={MODULOS}
                            effect="creative"
                            creativeEffect={EFECTO}
                            speed={reducirMovimiento ? 0 : configuracion.duracionTransicionMs}
                            initialSlide={indiceInicial}
                            rewind={varias}
                            autoplay={conMovimiento ? AUTOPLAY : false}
                            // Los puntos van abajo, fuera del marco. Sin un `el` explícito, Swiper React
                            // pintaría los suyos encima del flyer.
                            pagination={varias ? { el: contenedorPuntos, clickable: true } : false}
                            a11y={A11Y}
                            onSwiper={(instancia) => { swiper.current = instancia; }}
                            onSlideChange={alCambiarDiapositiva}
                            onAutoplayTimeLeft={(_instancia, _restante, porcentaje) => {
                                if (barra.current) barra.current.style.transform = `scaleX(${1 - porcentaje})`;
                            }}
                            // Swiper reanuda solo al terminar cada transición (también la de un clic en un
                            // punto), sin mirar por qué estaba en pausa (`autoplay.mjs` L42–50). Si el ratón
                            // o el foco siguen dentro, se vuelve a pausar (D5).
                            onAutoplayResume={(instancia) => {
                                if (punteroDentro.current || focoDentro.current) instancia.autoplay.pause();
                            }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            {ofertas.map((oferta, indice) => (
                                <SwiperSlide key={oferta.id} aria-hidden={indice !== activa}>
                                    <Box
                                        component="a"
                                        href={urlWhatsappPromo(nombreDeOferta(oferta))}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        tabIndex={-1}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '100%',
                                            height: '100%',
                                        }}
                                    >
                                        {rotas.has(indice) ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                                                {oferta.alt}
                                            </Typography>
                                        ) : cargadas.has(indice) ? (
                                            <Box
                                                component="img"
                                                src={oferta.src}
                                                alt={oferta.alt}
                                                decoding="async"
                                                onError={() => alFallarImagen(indice)}
                                                sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        ) : null}
                                    </Box>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : null}
                </Box>

                {conMovimiento ? (
                    <Box sx={{ mt: 1, height: 3, borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover' }} aria-hidden>
                        <Box
                            ref={barra}
                            sx={{ height: '100%', bgcolor: 'primary.main', transformOrigin: 'left center', transform: 'scaleX(0)' }}
                        />
                    </Box>
                ) : null}

                {varias ? (
                    <Box
                        ref={setContenedorPuntos}
                        sx={(theme) => ({
                            '--swiper-pagination-color': theme.palette.primary.main,
                            // Swiper no le pone `.swiper-pagination` a un `el` externo: el centrado que
                            // trae esa clase se pone aquí (y su `position: absolute` no llega a aplicarse).
                            mt: 1,
                            textAlign: 'center',
                            '& .swiper-pagination-bullet:focus-visible': {
                                outline: `2px solid ${theme.palette.primary.main}`,
                                outlineOffset: 2,
                            },
                        })}
                    />
                ) : null}
            </Box>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems="center"
                justifyContent="center"
                sx={{ textAlign: 'center' }}
            >
                {ofertaActiva.caption ? (
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {ofertaActiva.caption}
                    </Typography>
                ) : null}

                <Button
                    variant="contained"
                    href={urlActiva}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<WhatsAppIcon />}
                    aria-label={textos.banner.ariaCta.replace('{oferta}', nombreActiva)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    {textos.banner.cta}
                </Button>
            </Stack>
        </Box>
    );
};
