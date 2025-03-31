import { Box, Button, Stack, Typography } from '@mui/material';
import { ChangeEvent, FC, useState } from 'react';

import UploadFileIcon from '@mui/icons-material/UploadFile';

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";


interface InputFileUploadProps {
  typeAccept : string;
  onFileSelectExcel: (file: File | null) => void;
}


const FileUploadExcel: FC<InputFileUploadProps> = ({ typeAccept,onFileSelectExcel } : InputFileUploadProps) => {

  const [fileNameExcel, setFileNameExcel] = useState<string | null>(null);


  const handleFileChangeExcel = (event: ChangeEvent<HTMLInputElement>) => {
    
    if (event.target.files && event.target.files.length > 0) {
        onFileSelectExcel(event.target.files[0]);
      setFileNameExcel(event.target.files[0].name);
    } 
    else {
        onFileSelectExcel(null);
    }
  }

  return (
    <Stack direction="column" alignItems="center" spacing={2}>
      <input
        accept= { typeAccept }
        style={{ display: 'none' }}
        id="file-upload-excel"
        type="file"
        onChange={handleFileChangeExcel}
      />
      <label htmlFor="file-upload-excel">
        <Button
          variant="contained"
          component="span"
          color="success"
          startIcon={<UploadFileIcon />}
          sx={{ textTransform: 'none', borderRadius: 8, padding: '8px 16px' }}
        >
          Subir archivo Excel
        </Button>
      </label>
      {
        fileNameExcel && (
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
              Excel seleccionado: <strong>{fileNameExcel}</strong>
            </Typography>
          </Box>)
      }
    </Stack>
  );

}

export default FileUploadExcel;