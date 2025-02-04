import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

export const Footer = () => {

  const [currentDateTime, setCurrentDateTime] = useState( new Date() );

  useEffect(() => {

    // Actualiza cada segundo
    const intervalId = setInterval(() => {

      setCurrentDateTime(new Date());
    
    }, 1000); 

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId); 
  }, []);

  return (
    <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1976d2',
      color: 'white',
      position: 'relative',
      bottom: 0,
      width: '100%',
      height: { xs: 'auto', md: '100px' }, // Ajuste dinámico de altura
      padding: { xs: '16px', md: '0' }, // Padding para dispositivos pequeños
      mt: 5,
    }}
  >
    <Typography
      variant="h6"
      sx={{
        marginBottom: '8px',
        fontSize: { xs: '1rem', md: '1.25rem' }, // Tamaño de fuente ajustable
        textAlign: 'center', // Centrar el texto para mejor visualización
      }}
    >
      © {currentDateTime.getFullYear()} Ergosanitas SPA. Todos los derechos reservados.
    </Typography>
    
    <Typography
      variant="subtitle1"
      sx={{
        fontStyle: 'italic',
        fontSize: { xs: '0.875rem', md: '1rem' }, // Ajuste de fuente en pantallas pequeñas
        textAlign: 'center',
      }}
    >
      Desarrollado por Nicolas Ruz Figueroa
    </Typography>
    
    <Typography
      variant="subtitle2"
      sx={{
        fontStyle: 'italic',
        fontSize: { xs: '0.75rem', md: '0.875rem' }, // Ajuste de fuente
        textAlign: 'center',
        mt: { xs: '8px', md: '0' }, // Espaciado adicional en pantallas pequeñas
      }}
    >
      Fecha y Hora Actual: {currentDateTime.toLocaleDateString()} {currentDateTime.toLocaleTimeString()}
    </Typography>
  </Box>
  );
};