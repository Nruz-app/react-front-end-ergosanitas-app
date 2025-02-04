
import { Box, CircularProgress } from '@mui/material';

interface props {
    className? : string
}


export const TypingLoader = ({className}:props) => {
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
      <CircularProgress size={24} sx={{ margin: '0 4px' }} />
      <CircularProgress size={24} sx={{ margin: '0 4px' }} />
      <CircularProgress size={24} sx={{ margin: '0 4px' }} />
    </Box>
    
  )
}

