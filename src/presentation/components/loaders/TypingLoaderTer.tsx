
import { Box } from '@mui/material';

interface props {
    className? : string
}


export const TypingLoaderTer = ({className}:props) => {
  return (
    
    <Box 
      className={className} 
      sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%', // Ajusta según sea necesario
      }}
    >
      <img
            src="/terminator.gif"
            alt="Cargando"
        />
    </Box>
    
  )
}

