import { useState, useEffect, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { LoginContext } from '../../common/context';

export const Footer = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const { valid } = useContext(LoginContext);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: valid ? 'success.main' : '#0B2C4D',
        color: '#FFFFFF',

        width: '100%',
        boxSizing: 'border-box',

        position: 'relative',
        bottom: 0,

        height: { xs: 'auto', md: '100px' },
        padding: { xs: '16px', md: 0 },

        margin: 0,
        border: 0,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: '8px',
          fontSize: { xs: '1rem', md: '1.25rem' },
          textAlign: 'center',
        }}
      >
        © {currentDateTime.getFullYear()} Ergosanitas SPA. Todos los derechos
        reservados.
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          fontStyle: 'italic',
          fontSize: { xs: '0.875rem', md: '1rem' },
          textAlign: 'center',
        }}
      >
        Desarrollado por Nicolas Ruz Figueroa
      </Typography>

      <Typography
        variant="subtitle2"
        sx={{
          fontStyle: 'italic',
          fontSize: { xs: '0.75rem', md: '0.875rem' },
          textAlign: 'center',
          mt: { xs: '8px', md: 0 },
        }}
      >
        Fecha y Hora Actual:{' '}
        {currentDateTime.toLocaleDateString()}{' '}
        {currentDateTime.toLocaleTimeString()}
      </Typography>
    </Box>
  );
};