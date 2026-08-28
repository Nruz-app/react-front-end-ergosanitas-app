import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { ETIQUETA_SECCION, TEMA_HOME } from '../config/tema-home';

import type { ICanalContacto } from '../interface';

interface Props {
    canal    : ICanalContacto;
    variante : 'franja' | 'rail';
}

/**
 * Un canal de contacto pintado como enlace pulsable.
 *
 * Es la unidad que comparten la franja de redes y el rail fijo, en dos variantes de la
 * misma cosa: `franja` muestra icono, etiqueta y valor; `rail` muestra solo el icono,
 * porque en una columna de 56 px de ancho no cabe texto.
 *
 * Sustituye al `MarqueeBox` del Home viejo, que resolvía lo mismo con una cadena de cinco
 * `if` —uno por red social— y treinta líneas de estilos repetidos dentro de cada rama.
 * Agregar un canal allí era copiar un bloque entero; aquí es agregar un objeto a
 * `CANALES_CONTACTO`.
 *
 * El icono llega ya resuelto dentro del canal: este componente no sabe qué red social
 * está pintando y no tiene por qué saberlo.
 */
export const PastillaContacto = ( { canal, variante }: Props ) => {
    const { etiqueta, valor, url, externo, Icono } = canal;

    /**
     * `tel:` y `mailto:` no abren pestaña: los entrega el sistema operativo a otra
     * aplicación, y una pestaña en blanco antes de eso deja una ventana huérfana.
     */
    const propsEnlace = {
        href : url,
        ...( externo && { target: '_blank', rel: 'noopener noreferrer' } ),
    };

    if ( variante === 'rail' ) {
        return (
            <Box
                component="a"
                { ...propsEnlace }
                aria-label={ `${ etiqueta }: ${ valor }` }
                title={ `${ etiqueta } — ${ valor }` }
                sx={{
                    width         : 44,
                    height        : 44,
                    display       : 'flex',
                    alignItems    : 'center',
                    justifyContent: 'center',
                    borderRadius  : '50%',
                    color         : TEMA_HOME.azulProfundo,
                    bgcolor       : '#fff',
                    border        : `1px solid ${ TEMA_HOME.borde }`,
                    transition    : 'background-color .2s ease, color .2s ease, transform .2s ease',
                    '&:hover'     : {
                        bgcolor  : TEMA_HOME.azulErgo,
                        color    : '#fff',
                        transform: 'translateX(2px)',
                    },
                    '&:focus-visible': {
                        outline      : `3px solid ${ TEMA_HOME.azulErgo }`,
                        outlineOffset: 2,
                    },
                }}
            >
                <Icono sx={{ fontSize: 22 }} />
            </Box>
        );
    }

    return (
        <Box
            component="a"
            { ...propsEnlace }
            aria-label={ `${ etiqueta }: ${ valor }` }
            sx={{
                display       : 'flex',
                alignItems    : 'center',
                gap           : 1.75,
                mx            : 1.25,
                pl            : 1.25,
                pr            : 3,
                py            : 1.25,
                borderRadius  : 999,
                bgcolor       : '#fff',
                border        : `1px solid ${ TEMA_HOME.borde }`,
                color         : 'inherit',
                textDecoration: 'none',
                whiteSpace    : 'nowrap',
                transition    : 'border-color .2s ease, box-shadow .2s ease',
                '&:hover'     : {
                    borderColor: TEMA_HOME.azulErgo,
                    boxShadow  : '0 8px 20px rgba(11,44,77,0.10)',
                },
                '&:focus-visible': {
                    outline      : `3px solid ${ TEMA_HOME.azulErgo }`,
                    outlineOffset: 2,
                },
            }}
        >
            <Box
                aria-hidden="true"
                sx={{
                    width         : 40,
                    height        : 40,
                    flexShrink    : 0,
                    display       : 'flex',
                    alignItems    : 'center',
                    justifyContent: 'center',
                    borderRadius  : '50%',
                    bgcolor       : TEMA_HOME.azulProfundo,
                    color         : '#fff',
                }}
            >
                <Icono sx={{ fontSize: 21 }} />
            </Box>

            <Box>
                <Typography component="span" sx={{ ...ETIQUETA_SECCION, display: 'block', color: TEMA_HOME.azulErgo, fontSize: 10 }}>
                    { etiqueta }
                </Typography>
                <Typography component="span" sx={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: TEMA_HOME.azulProfundo }}>
                    { valor }
                </Typography>
            </Box>
        </Box>
    );
};
