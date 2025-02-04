import { Button, Stack } from '@mui/material';
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
    </Stack>
  );

}

export default InputFileUpload;