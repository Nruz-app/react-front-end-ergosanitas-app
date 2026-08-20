import { FormEvent } from 'react';
import { Box, Button, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

/**
 * Caja de entrada del chat «Asistente Ergo» (Spec 04).
 *
 * Clon de `src/presentation/components/chat-input-boxes/TextMessageBox.tsx` **sin** la
 * prop `onResetPatient` ni su botón naranja «Consultar por otro paciente»: la ficha
 * clínica es de un solo paciente por regla dura del módulo, y ese botón podría dejar el
 * chat hablando de alguien que no es el de la pantalla.
 */

interface Props {
    value              : string;
    onChange           : (value: string) => void;
    onSendMessage      : (message: string) => void;
    placeholder        : string;
    disableCorrections?: boolean;
    /** Bloquea el envío mientras hay una respuesta en curso. */
    disabled?          : boolean;
}

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
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                minHeight: '64px',
                alignItems: 'flex-end',
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '0 12px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
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
                    onChange={(evento) => onChange(evento.target.value)}
                    inputProps={{
                        autoComplete: disableCorrections ? 'on' : 'off',
                        autoCorrect: disableCorrections ? 'on' : 'off',
                        spellCheck: disableCorrections,
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '24px',
                            backgroundColor: '#fff',
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
                        borderRadius: '14px',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        background: 'linear-gradient(135deg, #1976d2, #115293)',
                        boxShadow: 3,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #1565c0, #0d3c7a)',
                            transform: 'translateY(-1px)',
                            boxShadow: 5,
                        },
                        '&:active': {
                            transform: 'translateY(0px)',
                            boxShadow: 2,
                        },
                    }}
                >
                    Enviar
                </Button>
            </Box>
        </form>
    );
};
