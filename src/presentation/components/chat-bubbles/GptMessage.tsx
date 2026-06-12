import { Avatar, Box, Typography } from '@mui/material';

interface Props {
    text : string;
}

export const GptMessage = ({text}:Props) => {
  return (
    <Box 
      sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          padding: 2, 
          borderRadius: '16px', 
          backgroundColor: 'transparent' // Color de fondo transparente
      }}
    >
      <Avatar
        src="/logoTrans.png"
        alt="Ergosanitas Virtual"
        sx={{
          width: 50,
          height: 50,
          bgcolor: 'white',
          border: '2px solid',
          borderColor: 'primary.main'
        }}
      />
      <Box 
        sx={{ 
            marginLeft: 2, 
            padding: '16px', 
            backgroundColor: 'rgba(0, 0, 0, 0.25)', 
            borderRadius: '16px', 
            boxShadow: 2, 
            position: 'relative' 
        }}
      >
        <Typography variant="body1" color="text.primary">
            {text}
        </Typography>
            </Box>
      </Box>
  )
}
