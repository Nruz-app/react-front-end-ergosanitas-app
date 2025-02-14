import { Box, Button, Stack, Typography } from '@mui/material';
import { ChangeEvent, FC, useState } from 'react';

import UploadFileIcon from '@mui/icons-material/UploadFile';

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";


interface InputFileUploadProps {
  onFileSelect: (file: File | null) => void;
}


const InputFileUpload: FC<InputFileUploadProps> = ({ onFileSelect }) => {

  const [fileName, setFileName] = useState<string | null>(null);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(event.target.files[0]);
      setFileName(event.target.files[0].name);
    } 
    else {
      onFileSelect(null);
    }
  }

  return (
    <Stack direction="column" alignItems="center" spacing={2}>
      <input
        accept="image/*, .pdf"
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          color="primary"
          startIcon={<UploadFileIcon />}
          sx={{ textTransform: 'none', borderRadius: 8, padding: '8px 16px' }}
        >
          Subir archivo
        </Button>
      </label>
      {
        fileName && (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            gap={1} 
            bgcolor="#f5f5f5" 
            p={1.5} 
            borderRadius={2} 
            width="100%"
          >
            <InsertDriveFileIcon color="primary" />
            <Typography variant="body2" color="text.primary" fontWeight="500">
              Archivo seleccionado: <strong>{fileName}</strong>
            </Typography>
          </Box>)
      }
    </Stack>
  );

}

export default InputFileUpload;