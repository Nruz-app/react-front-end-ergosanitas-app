import { Stack, Typography } from '@mui/material';
import { ChangeEvent, FC } from 'react';

import UploadFileIcon from '@mui/icons-material/UploadFile';

interface InputFileUploadProps {
  onFileSelect: (file: File | null) => void;
}

const InputFileUpload: FC<InputFileUploadProps> = ({ onFileSelect } : InputFileUploadProps) => {

  const handleFileChangeLogo = (event: ChangeEvent<HTMLInputElement>) => {
     event.preventDefault(); 

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
            id="file-upload-logo"
            type="file"
            onChange={handleFileChangeLogo}
        />
        <Typography
            variant="body1"
            component="label"
            htmlFor="file-upload-logo"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'white',  // Texto blanco
                fontSize: '1rem',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#66bb6a', // Verde claro
                cursor: 'pointer',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
                '&:hover': {
                    backgroundColor: '#81c784', // Verde un poco más oscuro en hover
                    transform: 'scale(1.05)',
                },
                '&:active': {
                    backgroundColor: '#4caf50', // Verde más oscuro al hacer clic
                    transform: 'scale(1)',
                },
            }}
        >
            <UploadFileIcon sx={{ mr: 1 }} />
            Cargar Logo
        </Typography>
      </Stack>
  );

}

export default InputFileUpload;