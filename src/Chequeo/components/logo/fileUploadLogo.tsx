

import { useState } from 'react'
import InputFileUpload from './InputFileUpload'
import { Avatar, Box, Grid, Paper, Typography } from '@mui/material';
import { UseRegister } from '../../../Login/services/useRegister';

import Swal from 'sweetalert2';

interface Props {
    user_email : string;
    user_logo  : string;
}


export const FileUploadLogo = ({user_email,user_logo} : Props) => {

    const [logoUser,setLogoUser] = useState(user_logo);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = async (file: File | null) => {

        setSelectedFile(file);
        
        const {  loadLogoUser } = await UseRegister();

        const response =  await loadLogoUser(
          file!,user_email);

         if(response) {
        
            setLogoUser(response.user_logo);
            
            
            Swal.fire({
            title: 'Logo del Club',
            text: 'Se ha cargado correctamente',
            icon: 'success',
            confirmButtonText: 'Ok'
            });
        
        }    
        
    };

  return (
    <Box sx={{ p: 3 }} >
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          p: 4,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            display="flex"
            justifyContent="center"
          >
            <Box textAlign="center">
              <Avatar
                src={logoUser}
                alt={
                  selectedFile
                    ? 'Cambia Logo del Club'
                    : 'Ingresa Logo del Club'
                }
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'grey.300',
                  border: '4px solid #1976d2',
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {selectedFile ? 'Logo cargado' : 'Sin logo'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={8}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <InputFileUpload onFileSelect={handleFileSelect} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  
  )
}
