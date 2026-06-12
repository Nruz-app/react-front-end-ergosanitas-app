import { Box, Button, TextField } from '@mui/material';
import {FormEvent,useState} from 'react'

interface props {
    //funcion que se ejecuta cuando se envia un mensaje 
    onSendMessage       :  (message : string) => void;
    placeholder         : string;
    disableCorrections? : boolean;
}

export const TextMessageBox = ({onSendMessage,placeholder,disableCorrections=false}:props) => {



    const [message,setMessage] = useState ('');

    //FormEvent<HTMLFormElement) : Es un evento que se dispara cuando se envia un formulario
    const handleSendMessage = (event : FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (message.trim().length === 0) return;

        onSendMessage(message);

        setMessage('');
        
    }


  return (
    
   <form
        onSubmit={handleSendMessage}
        style={{
            display: 'flex',
            minHeight: '64px',
            alignItems: 'flex-end',
            backgroundColor: '#fff', // Color de fondo más limpio
            borderRadius: '16px',
            padding: '0 16px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Sombra suave
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
                name="message"
                placeholder={placeholder}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                inputProps={{
                    autoComplete: disableCorrections ? 'on' : 'off',
                    autoCorrect: disableCorrections ? 'on' : 'off',
                    spellCheck: disableCorrections,
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '24px',
                        backgroundColor: '#fff',

                        '& fieldset': {
                            borderRadius: '24px',
                            borderColor: '#e0e0e0',
                        },

                        '&:hover fieldset': {
                            borderColor: '#c7c7c7',
                        },

                        '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                        }
                    }
                }}
            />
        </Box>
        <Box sx={{ marginLeft: 2,marginBottom: 1 }}>
            <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                sx={{ 
                    borderRadius: '16px',
                    paddingX: 2, // Mejora el espaciado del botón
                    fontWeight: 'bold', // Estilo de texto más destacado
                }}
            >
                <span style={{ marginRight: 8 }}>Enviar</span>
                <i className="fa-regular fa-paper-plane"></i>
            </Button>
        </Box>
    </form>
    
  )
}
