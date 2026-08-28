import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TEMA_HOME } from '../../config/tema-home';

interface Props {
    text : string;
}

/**
 * Turno de la persona que visita la portada.
 *
 * Se llama «visitante» y no «usuario» a propósito: quien escribe aquí no tiene sesión
 * iniciada ni es paciente de nadie. Es alguien que llegó al sitio y está preguntando por
 * un servicio, y el nombre del componente lo dice.
 *
 * Sin avatar: en un panel de 360 px cada elemento cuesta ancho, y la alineación a la
 * derecha ya deja claro quién habla.
 */
export const BurbujaVisitante = ( { text }: Props ) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.75 }}>
            <Box
                sx={{
                    px          : 1.75,
                    py          : 1.25,
                    bgcolor     : TEMA_HOME.azulErgo,
                    color       : '#fff',
                    borderRadius: '14px 4px 14px 14px',
                    maxWidth    : '82%',
                    wordBreak   : 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace  : 'pre-wrap',
                }}
            >
                <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
                    { text }
                </Typography>
            </Box>
        </Box>
    );
};
