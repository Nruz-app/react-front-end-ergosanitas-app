import { FormEvent, useId } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';

import { TEMA_HOME } from '../../config/tema-home';

interface Props {
    value         : string;
    onChange      : ( value: string ) => void;
    onEnviar      : ( mensaje: string ) => void;
    placeholder   : string;
    /** Tope del back (`prompt` `max:500`). El campo no deja escribir ni pegar más. */
    maxCaracteres : number;
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
 *
 * El contador `n/max` (Spec 05) avisa antes de chocar con el tope: desde el 90 % pasa al
 * color de advertencia del tema. Va asociado al campo por `aria-describedby` y no con
 * `aria-live`, que anunciaría cada tecla.
 */
export const CajaMensaje = ( { value, onChange, onEnviar, placeholder, maxCaracteres, deshabilitado = false }: Props ) => {

    const idContador = useId();

    /** Desde el 90 % del límite el contador se pinta en color de advertencia. */
    const cercaDelLimite = value.length >= maxCaracteres * 0.9;

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
                p           : 1.25,
                borderTop   : `1px solid ${ TEMA_HOME.borde }`,
                bgcolor     : '#fff',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    size="small"
                    minRows={ 1 }
                    maxRows={ 4 }
                    placeholder={ placeholder }
                    value={ value }
                    onChange={ ( evento ) => onChange( evento.target.value ) }
                    inputProps={{ maxLength: maxCaracteres, 'aria-describedby': idContador }}
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

            <Typography
                id={ idContador }
                variant="caption"
                sx={{
                    display    : 'block',
                    textAlign  : 'right',
                    pr         : 6,
                    mt         : 0.25,
                    fontSize   : '0.7rem',
                    color      : cercaDelLimite ? 'warning.dark' : 'text.secondary',
                    fontWeight : cercaDelLimite ? 700 : 400,
                }}
            >
                { value.length }/{ maxCaracteres }
            </Typography>
        </Box>
    );
};
