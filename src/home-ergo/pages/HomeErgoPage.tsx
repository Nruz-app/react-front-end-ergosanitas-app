import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';

import {
    BarraIndicadores,
    CarruselPromociones,
    ChatComercial,
    ComoFunciona,
    FranjaRedes,
    GaleriaOperativos,
    Hero,
    RailContacto,
    SeccionContacto,
    SeccionServicios,
    SeccionVideos,
} from '../components';
import portada from '../config/home-hero.json';
import { TEMA_HOME } from '../config/tema-home';

import type { IPortadaHome } from '../interface';

/** Dominio de producción. Open Graph exige URLs absolutas: una ruta relativa no resuelve. */
const SITIO = 'https://ergosanitas.com';

/**
 * La vista previa al compartir el enlace reutiliza la fotografía del hero, tomada del
 * mismo JSON. Dos motivos: ninguna ruta de imagen queda escrita a mano en el código, y
 * una foto de un operativo real convence mucho más en un enlace de WhatsApp que un logo.
 */
const { hero } = portada as IPortadaHome;

const TITULO      = 'Ergo SaniTas — Salud domiciliaria y deportiva';
const DESCRIPCION = 'Chequeos cardiovasculares deportivos, electrocardiogramas a domicilio, bioimpedancia, Holter, exámenes de laboratorio y enfermería. Atendemos en tu casa, tu club o tu colegio.';

/**
 * Portada pública de ergosanitas.com (Spec 01 de `home-ergo`).
 *
 * Compone las diez secciones y monta el chat comercial flotante. No hace fetch de nada:
 * todo su contenido sale de los JSON de `config/`.
 *
 * El orden de las secciones es una decisión de la Spec 02 y no un accidente: los fondos
 * alternan —azul profundo, blanco, hueso, blanco, hueso, azul profundo, hueso, blanco,
 * hueso, azul profundo— para que ninguna sección quede pegada a otra del mismo color.
 *
 * `HelmetProvider` ya está montado en `src/App.tsx`, así que aquí basta con declarar el
 * `<Helmet>`.
 */
export const HomeErgoPage = () => {
    return (
        <Box
            component="main"
            sx={{
                bgcolor : TEMA_HOME.hueso,
                color   : TEMA_HOME.grafito,
                // La portada no debe introducir desborde horizontal propio. El que ya
                // existe viene del `width: 150%` del AppBar, que está fuera de alcance.
                overflowX: 'hidden',
            }}
        >
            <Helmet>
                <title>{ TITULO }</title>
                <meta name="description" content={ DESCRIPCION } />

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Ergo SaniTas SpA" />
                <meta property="og:title" content={ TITULO } />
                <meta property="og:description" content={ DESCRIPCION } />
                <meta property="og:url" content={ SITIO } />
                <meta property="og:image" content={ `${ SITIO }${ hero.imagen }` } />
            </Helmet>

            <Hero />
            <BarraIndicadores />

            {/* La oferta va arriba, no al final. Un visitante que lee tres secciones y se
                va tiene que haber visto ya lo que la empresa está vendiendo este mes. */}
            <CarruselPromociones variante="promociones" />

            <SeccionServicios />
            <ComoFunciona />
            <GaleriaOperativos />
            <SeccionVideos />

            {/* Los convenios son respaldo, no oferta: se leen mejor después de las fotos
                de operativos y los videos, que es donde el visitante ya sabe quiénes
                somos. */}
            <CarruselPromociones variante="alianzas" />

            {/* Puente hacia el contacto: los seis canales pasando de largo, para quien no
                pensaba llegar hasta el final. */}
            <FranjaRedes />

            <SeccionContacto />

            {/* Fuera del flujo de secciones: los dos se posicionan con `position: fixed` y
                acompañan al visitante durante toda la página. El chat vive abajo a la
                derecha y el rail al borde izquierdo, así que no se estorban. */}
            <RailContacto />
            <ChatComercial />
        </Box>
    );
};

export default HomeErgoPage;
