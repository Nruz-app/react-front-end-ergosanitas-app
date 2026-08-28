import { FormEvent } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';

import { TEMA_HOME } from '../../config/tema-home';

interface Props {
    value         : string;
    onChange      : ( value: string ) => void;
    onEnviar      : ( mensaje: string ) => void;
    placeholder   : string;
    /** Bloquea el envío mientras hay una respuesta en curso. */
    deshabilitado?: boolean;
}

/**
 * Caja de entrada del chat comercial.
 *
 * Dos cosas que el chat del asistente sí tiene y esta **no**:
 *
 * - **Micrófono.** Es un chat de ventas en una portada pública; el dictado por voz es del
 *   contexto clínico, donde alguien tiene las manos ocupadas.
 * - **Botón «Consultar por otro paciente».** Aquí no hay pacientes.
 *
 * El botón de envío es un icono y no un botón con la palabra «Enviar»: en un panel de
 * 360 px, un botón de texto se come el ancho que necesita el campo.
 */
export const CajaMensaje = ( { value, onChange, onEnviar, placeholder, deshabilitado = false }: Props ) => {

    const alEnviar = ( evento: FormEvent<HTMLFormElement> ) => {

        evento.preventDefault();

        if ( deshabilitado ) return;

        // Un mensaje en blanco no se envía: gastaría un turno y no dice nada.
        if ( value.trim().length === 0 ) return;

        onEnviar( value );
    };

    return (
        <Box
            component="form"
            onSubmit={ alEnviar }
            sx={{
                display     : 'flex',
                alignItems  : 'flex-end',
                gap         : 1,
                p           : 1.25,
                borderTop   : `1px solid ${ TEMA_HOME.borde }`,
                bgcolor     : '#fff',
            }}
        >
            <TextField
                fullWidth
                multiline
                size="small"
                minRows={ 1 }
                maxRows={ 4 }
                placeholder={ placeholder }
                value={ value }
                onChange={ ( evento ) => onChange( evento.target.value ) }
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '18px', fontSize: '0.92rem' } }}
            />

            <IconButton
                type="submit"
                aria-label="Enviar mensaje"
                disabled={ deshabilitado || value.trim().length === 0 }
                sx={{
                    flexShrink : 0,
                    bgcolor    : TEMA_HOME.azulErgo,
                    color      : '#fff',
                    '&:hover'  : { bgcolor: '#1565c0' },
                    '&.Mui-disabled': { bgcolor: TEMA_HOME.borde, color: '#fff' },
                }}
            >
                <SendIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};
