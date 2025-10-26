import { Box  } from '@mui/material';
import corazonImage from '../../assets/corazon.gif';

export const AppPacientePages = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        gap: 2, // espacio entre texto y la imagen
      }}
    >
      <Box
        component="img"
        src={corazonImage}
        alt="Corazón animado"
        sx={{ width: 200, height: 200 }}
      />
    </Box>
  );
};

export default AppPacientePages;
