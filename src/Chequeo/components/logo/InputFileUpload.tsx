import { Stack, Typography } from '@mui/material';
import { ChangeEvent, FC } from 'react';

import UploadFileIcon from '@mui/icons-material/UploadFile';

interface InputFileUploadProps {
  onFileSelect: (file: File | null) => void;
}

const InputFileUpload: FC<InputFileUploadProps> = ({ onFileSelect }) => {

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(event.target.files[0]);
    } 
    else {
      onFileSelect(null);
    }
  }

  return (
    <Stack direction="column" alignItems="center" spacing={2}>
        <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
        />
        <Typography
            variant="body1"
            component="label"
            htmlFor="file-upload"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',  // Elimina el subrayado por defecto de los enlaces
                color: 'primary.main',  // Color primario del enlace
                fontSize: '1rem',  // Tamaño de fuente cómodo
                fontWeight: 500,  // Peso de la fuente para un toque elegante
                padding: '10px 20px',  // Espaciado adecuado para que se vea bonito
                borderRadius: 6,  // Bordes redondeados para suavizar el diseño
                backgroundColor: 'rgba(0, 0, 0, 0.08)', // Fondo suave
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Sombra ligera para resaltar el enlace
                transition: 'color 0.3s ease, transform 0.3s ease, background-color 0.3s ease',
                cursor: 'pointer',  // Cambia el cursor para indicar interacción
                '&:hover': {
                    color: '#1976d2',  // Color de texto cuando el mouse pasa por encima
                    transform: 'scale(1.05)',  // Agrandar ligeramente al hacer hover
                    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Fondo ligeramente más oscuro
                },
                '&:active': {
                    transform: 'scale(1)',  // Vuelve al tamaño original al hacer clic
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',  // Fondo más oscuro cuando está activo
                },
            }}
        >
            <UploadFileIcon sx={{ mr: 1 }} /> Logo
        </Typography>
    </Stack>
  );

}

export default InputFileUpload;