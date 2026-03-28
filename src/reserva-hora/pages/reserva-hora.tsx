

import { Box, Typography } from '@mui/material';
import { LoginContext } from '../../common/context';
import { AgendaHoras } from '../components/agenda-horas';
import { useContext } from 'react';

export const ReservaHoraPages = () => {

    const { user }  = useContext( LoginContext );
    //const { user_perfil }  = user;
    

  return (
    <>
        <Box ml={ 15 } mt={ 8 } sx={{ flexGrow: 1 }} >
            <Typography
                variant="h4"
                align="center"
                sx={{
                    fontFamily: 'cursive',
                    fontWeight: 'bold',
                    letterSpacing: '0.1rem',
                    textTransform: 'uppercase',
                    color: 'primary.main',
                    mb: 3,
                    animation: 'fadeOutRight 1s ease-out' 
                }}
                >
                {`Reserva Hora ${user.user_name}`}
            </Typography>
        </Box>   
        <AgendaHoras />
    </>
    
  )
}

export default ReservaHoraPages;