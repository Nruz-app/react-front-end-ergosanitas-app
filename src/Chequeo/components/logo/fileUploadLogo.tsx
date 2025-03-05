

import { useState } from 'react'
import InputFileUpload from './InputFileUpload'
import { Avatar, Box,  Card, CardContent } from '@mui/material';
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 1,
      }}
    >
      <Card
        sx={{
          textAlign: "center",
          borderRadius: 3,
          boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.15)",  // Sombra más suave
          display: 'flex',
          flexDirection: 'column',  // Organiza los elementos de arriba a abajo
          alignItems: 'center',  
          justifyContent: 'center',
          border: "1px solid #e0e0e0",    
        }}
      >
        {/* Avatar de logo del club */}
        <Avatar
          src={ logoUser }
          alt= { selectedFile? 'Cambia Logo del CLub': 'Ingresa Logo del CLub' }
          sx={{
            mt : 2,
            width: 120, 
            height: 120,
            bgcolor: "grey.300",
            border: "4px solid #1976d2",  
            mb: 3,  // Agrego margen inferior para separación con el contenido siguiente
          }}
        />   

      <CardContent>
        {/* Componente de Carga de Archivo */}
        <InputFileUpload onFileSelect={handleFileSelect} />
      </CardContent>
    </Card>
  </Box>
  
  )
}
