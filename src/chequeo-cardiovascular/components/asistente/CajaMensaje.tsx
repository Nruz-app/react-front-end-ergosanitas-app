import { FormEvent } from 'react';
import { Box, Button, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import { COLORES, DEGRADADOS, sxFocoVisible } from '../../config/tema';

interface Props {
    value              : string;
    onChange           : (value: string) => void;
    onSendMessage      : (message: string) => void;
    placeholder        : string;
    disableCorrections?: boolean;
    /** Bloquea el envío mientras hay una respuesta en curso o falta el `user_email`. */
    disabled?          : boolean;
}

/**
 * Caja de entrada del chat del Home del colegio (Spec 03).
 *
 * Clon de `src/ficha-clinica/components/asistente/CajaMensaje.tsx`, con los colores movidos a
 * `config/tema.ts` y el anillo de foco del módulo en el botón de enviar.
 */
export const CajaMensaje = ({
    value,
    onChange,
    onSendMessage,
    placeholder,
    disableCorrections = false,
    disabled = false,
}: Props) => {

    const handleSubmit = (evento: FormEvent<HTMLFormElement>) => {

        evento.preventDefault();

        if (disabled) return;

        if (value.trim().length === 0) return;

        onSendMessage(value);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display         : 'flex',
                minHeight       : '64px',
                alignItems      : 'flex-end',
                backgroundColor : COLORES.fondoTarjeta,
                borderRadius    : '16px',
                padding         : '0 12px',
                boxShadow       : 1,
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={4}
                    placeholder={placeholder}
                    value={value}
                    disabled={disabled}
                    onChange={(evento) => onChange(evento.target.value)}
                    inputProps={{
                        'aria-label' : 'Pregunta para el asistente',
                        autoComplete : disableCorrections ? 'on' : 'off',
                        autoCorrect  : disableCorrections ? 'on' : 'off',
                        spellCheck   : disableCorrections,
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius    : '24px',
                            backgroundColor : COLORES.fondoTarjeta,
                        },
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mb: 1 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={disabled}
                    endIcon={<SendIcon />}
                    sx={{
                        borderRadius  : '14px',
                        fontWeight    : 700,
                        textTransform : 'none',
                        px            : 3,
                        py            : 1,
                        background    : DEGRADADOS.boton,
                        boxShadow     : 3,
                        transition    : 'all 0.2s ease-in-out',
                        '&:hover'     : {
                            background : DEGRADADOS.botonHover,
                            transform  : 'translateY(-1px)',
                            boxShadow  : 5,
                        },
                        '&:active': {
                            transform : 'translateY(0px)',
                            boxShadow : 2,
                        },
                        ...sxFocoVisible,
                        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    }}
                >
                    Enviar
                </Button>
            </Box>
        </Box>
    );
};
