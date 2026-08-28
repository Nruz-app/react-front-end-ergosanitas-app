/**
 * Los seis canales de contacto de la empresa, derivados de `home-contacto.json`.
 *
 * Es la **fuente única** de cualquier enlace de contacto de la portada. Antes de este
 * archivo la URL de `wa.me` se armaba por separado en el Hero, en la sección de contacto
 * y en cada sitio que la necesitara: cambiar el número de teléfono obligaba a acordarse
 * de todos. Ahora se edita el JSON y se propaga sola.
 *
 * El JSON sigue siendo el dueño del dato. Aquí no hay ningún número, correo ni URL
 * escrito a mano: todo sale de `home-contacto.json`.
 *
 * Es el primer `.tsx` de `config/`, y por un motivo concreto: MUI no trae icono de
 * TikTok, así que hay que dibujarlo en línea y eso exige JSX. La alternativa —dejar el
 * icono en `components/` e importarlo desde aquí— crearía una dependencia de `config`
 * hacia `components`, que va justo al revés de como está ordenado el módulo.
 */

import SvgIcon from '@mui/material/SvgIcon';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import contacto from './home-contacto.json';

import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ICanalContacto, IContactoHome } from '../interface';

const {
    telefono,
    telefonoWhatsapp,
    mensajeWhatsapp,
    mensajeWhatsappPromo,
    email,
    instagram,
    facebook,
    tiktok,
} = contacto as IContactoHome;

/**
 * Icono de TikTok.
 *
 * MUI no lo trae. Se dibuja en línea para no sumar un archivo a `public/` ni una
 * dependencia al `package.json`. Acepta y reenvía las props de `SvgIcon`, así que se
 * comporta igual que cualquier otro icono de la librería: se le puede pasar `sx`,
 * `fontSize` o `color` sin que el componente que lo usa note la diferencia.
 */
export const IconoTiktok = ( props: SvgIconProps ) => (
    <SvgIcon viewBox="0 0 24 24" { ...props }>
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.82-2.48V9.7a5.7 5.7 0 1 0 4.91 5.65V8.9a7.35 7.35 0 0 0 4.29 1.38V7.2a4.28 4.28 0 0 1-3.23-1.38z" />
    </SvgIcon>
);

/** `tel:` no admite espacios: el número legible se limpia para el enlace. */
const urlTelefono = `tel:${ telefono.replace( /\s/g, '' ) }`;

/**
 * Constructor de enlaces de WhatsApp. **Es el único lugar del módulo donde se escribe
 * `wa.me`.**
 *
 * El mensaje va por `encodeURIComponent` porque lleva tildes, guiones largos y signos de
 * apertura, y una URL no los admite en crudo.
 */
const urlWhatsappCon = ( mensaje: string ): string =>
    `https://wa.me/${ telefonoWhatsapp }?text=${ encodeURIComponent( mensaje ) }`;

/**
 * URL de WhatsApp con el saludo genérico.
 *
 * Se exporta porque el botón «Escríbenos» del Hero la necesita suelta, fuera de la lista
 * de canales.
 */
export const urlWhatsapp = urlWhatsappCon( mensajeWhatsapp );

/**
 * URL de WhatsApp para una promoción concreta.
 *
 * Sustituye el marcador `{promocion}` de `mensajeWhatsappPromo` por el `caption` de la
 * tarjeta pulsada. Así el equipo recibe la consulta sabiendo ya qué oferta vio la
 * persona, en vez de un saludo genérico que obliga a preguntar de vuelta.
 */
export const urlWhatsappPromo = ( caption: string ): string =>
    urlWhatsappCon( mensajeWhatsappPromo.replace( '{promocion}', caption ) );

/**
 * Los seis canales, en el orden en que se muestran.
 *
 * Primero los tres canales directos y después las tres redes: es el orden que ya usa la
 * sección de contacto, y el que tiene sentido comercial —quien quiere comprar escribe,
 * quien quiere mirar sigue—. Dentro de los directos, el orden es teléfono, WhatsApp y
 * correo, que es el que la sección de contacto ya pintaba antes de que este archivo
 * existiera. Se respeta tal cual: el refactor no debía mover nada de sitio.
 *
 * `externo` decide si el enlace abre en una pestaña nueva. `tel:` y `mailto:` no lo
 * hacen: los entrega el sistema operativo a otra aplicación, y abrir una pestaña en
 * blanco antes de eso deja al visitante con una ventana huérfana.
 *
 * El `valor` de las redes es el nombre de la cuenta y no el usuario con arroba. Los tres
 * perfiles se llaman igual, y el de Facebook ni siquiera tiene un usuario legible en su
 * URL.
 */
export const CANALES_CONTACTO: ICanalContacto[] = [
    {
        id       : 'telefono',
        grupo    : 'canal',
        etiqueta : 'Teléfono',
        valor    : telefono,
        url      : urlTelefono,
        externo  : false,
        Icono    : PhoneIcon,
    },
    {
        id       : 'whatsapp',
        grupo    : 'canal',
        etiqueta : 'WhatsApp',
        valor    : 'Escríbenos por WhatsApp',
        url      : urlWhatsapp,
        externo  : true,
        Icono    : WhatsAppIcon,
    },
    {
        id       : 'correo',
        grupo    : 'canal',
        etiqueta : 'Correo',
        valor    : email,
        url      : `mailto:${ email }`,
        externo  : false,
        Icono    : EmailIcon,
    },
    {
        id       : 'instagram',
        grupo    : 'red',
        etiqueta : 'Instagram',
        valor    : 'Ergo SaniTas',
        url      : instagram,
        externo  : true,
        Icono    : InstagramIcon,
    },
    {
        id       : 'facebook',
        grupo    : 'red',
        etiqueta : 'Facebook',
        valor    : 'Ergo SaniTas',
        url      : facebook,
        externo  : true,
        Icono    : FacebookIcon,
    },
    {
        id       : 'tiktok',
        grupo    : 'red',
        etiqueta : 'TikTok',
        valor    : 'Ergo SaniTas',
        url      : tiktok,
        externo  : true,
        Icono    : IconoTiktok,
    },
];

/**
 * Los mismos seis canales, con el texto ajustado para la franja y el rail.
 *
 * Cambia una sola cosa: el valor de WhatsApp deja de ser «Escríbenos por WhatsApp» y pasa
 * a ser el número. En la sección de contacto ese texto funciona, porque la etiqueta va
 * arriba y en gris pequeño; en la píldora de la franja quedaría «WHATSAPP / Escríbenos
 * por WhatsApp», que dice dos veces lo mismo y desperdicia la única línea útil.
 *
 * Se resuelve aquí y no dentro del componente para que la píldora siga siendo tonta: no
 * tiene por qué saber qué canal está pintando.
 */
export const CANALES_COMPACTOS: ICanalContacto[] = CANALES_CONTACTO.map( ( canal ) =>
    canal.id === 'whatsapp' ? { ...canal, valor: telefono } : canal
);

/** Los tres canales directos: WhatsApp, teléfono y correo. */
export const CANALES_DIRECTOS = CANALES_CONTACTO.filter( ( canal ) => canal.grupo === 'canal' );

/** Las tres redes sociales: Instagram, Facebook y TikTok. */
export const REDES_SOCIALES = CANALES_CONTACTO.filter( ( canal ) => canal.grupo === 'red' );
