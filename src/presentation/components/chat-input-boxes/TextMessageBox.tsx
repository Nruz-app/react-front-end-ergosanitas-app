import { Box, Button, TextField } from '@mui/material';
import {FormEvent} from 'react'
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import Tooltip from '@mui/material/Tooltip';
interface props {
    //funcion que se ejecuta cuando se envia un mensaje 
    onSendMessage       :  (message : string) => void;
    placeholder         : string;
    disableCorrections? : boolean;
    value: string;
    onChange: (value: string) => void;
    onResetPatient?: () => void;
    onMicToggle?: () => void;
    isListening?: boolean;
}

export const TextMessageBox = ({onSendMessage,placeholder,disableCorrections = false,
    value,onChange,onResetPatient}: props) => {

    const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (value.trim().length === 0) return;

        onSendMessage(value);
    }

    return (
        <form
            onSubmit={handleSendMessage}
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
                    autoFocus
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    inputProps={{
                        autoComplete: disableCorrections ? 'on' : 'off',
                        autoCorrect: disableCorrections ? 'on' : 'off',
                        spellCheck: disableCorrections,
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '24px',
                            backgroundColor: '#fff',
                        }
                    }}
                />
            </Box>

            {/* ACCIONES */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1, mb: 1 }}>
                {/* ENVIAR */}
                <Button
                    type="submit"
                    variant="contained"
                    endIcon={<i className="fa-regular fa-paper-plane" />}
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
                        }
                    }}
                >
                    Enviar
                </Button>
                {/* CAMBIAR PACIENTE */}
                {
                onResetPatient && (
                    <Tooltip
                        title="Consultar Por Otro Paciente..."
                        arrow
                        placement="top"
                    >
                        <Button
                            onClick={onResetPatient}
                            variant="contained"
                            color="warning"
                            startIcon={<PersonSearchIcon />}
                            sx={{
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                                boxShadow: 2,
                            }}
                        />
                    </Tooltip>
                )}
            </Box>
        </form>
    );
}