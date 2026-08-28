import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TEMA_HOME } from '../../config/tema-home';

interface Props {
    text : string;
}

/**
 * Turno del asistente en el chat comercial del Home (Spec 01 de `home-ergo`).
 *
 * Clon conceptual de `BurbujaGpt` de la ficha clínica, ajustado a un panel flotante de
 * unos 360 px: el avatar baja de 50 a 32 px y los márgenes se comprimen. Las medidas de
 * la ficha están pensadas para un tab a pantalla completa y aquí dejarían la burbuja sin
 * ancho útil.
 */
export const BurbujaBot = ( { text }: Props ) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.75 }}>
            <Avatar
                src="/logoTrans.png"
                alt=""
                sx={{
                    width      : 32,
                    height     : 32,
                    flexShrink : 0,
                    bgcolor    : '#fff',
                    border     : `1px solid ${ TEMA_HOME.borde }`,
                }}
            />

            <Box
                sx={{
                    px          : 1.75,
                    py          : 1.25,
                    bgcolor     : '#fff',
                    border      : `1px solid ${ TEMA_HOME.borde }`,
                    borderRadius: '4px 14px 14px 14px',
                    maxWidth    : '82%',
                    // Las respuestas pueden traer saltos de línea o una URL larga sin
                    // espacios: sin esto la burbuja desborda el panel.
                    wordBreak   : 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace  : 'pre-wrap',
                }}
            >
                <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.55, color: TEMA_HOME.grafito }}>
                    { text }
                </Typography>
            </Box>
        </Box>
    );
};
