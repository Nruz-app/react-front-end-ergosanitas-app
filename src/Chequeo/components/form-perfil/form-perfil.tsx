import { Box,  Grid, IconButton, Paper,Tooltip } from "@mui/material"
import Swal from 'sweetalert2';
import EditIcon from '@mui/icons-material/Edit';
import { InputPassword } from "./input-password";
import { useState } from "react";
import { UserService } from "../../../User";

interface Props {
  user_email : string;
}


export const FormPerfil = ({user_email} : Props) => {

  const [newPassword, setNewPassword] = useState<string>('');
  const [ergoPass, setErgoPass] = useState<string>('');


  const handleUpdatePassword = async () => {

    const { PostUserPassword, } = await UserService();

    const confirmUpdate = await Swal.fire({
      title: '❓ ¿Modificar Contraseña?',
      html: `¿Está seguro de Modficar la Contraseña</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmUpdate.isConfirmed) {
      
      const response = await PostUserPassword(newPassword,user_email);
    
      if(response.success) {
          Swal.fire({
            title: '✅ ¡Modificar Contraseña!',
            html: `La Contraseña Se ha Modificado con éxito.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true,
          });
      }

    }
  }

  const handleUpdateErgoPass = async () => {

    const { PostUserErgoPass, } = await UserService();

    const confirmUpdate = await Swal.fire({
      title: '❓ ¿Modificar Ergo Pass?',
      html: `¿Está seguro de Modficar el Ergo Pass  </strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmUpdate.isConfirmed) {
      
      const response = await PostUserErgoPass(ergoPass,user_email);
    
      if(response.success) {
          Swal.fire({
            title: '✅ ¡Modificar Ergo Pass!',
            html: `El Ergo Pass se ha modificado con éxito.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true,
          });
      }

    }
  }

  return (
    <Box sx={{  justifyContent: "center", alignItems: "center", p: 3, }}>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          p: 2,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={8}>
            <InputPassword
              newPassword={ newPassword }
              setNewPassword={ setNewPassword } 
              label="Modificar Contraseña"
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <Box display="flex" justifyContent="center">
            <Tooltip title="Modificar Contraseña" arrow>
                <IconButton
                    onClick={handleUpdatePassword}
                    aria-label="editar"
                    sx={{
                    color: '#66bb6a',
                    '&:hover': {
                        backgroundColor: '#81c784', 
                        transform: 'scale(1.05)',
                        color: '#FFFFFF',
                    },
                    '&:active': {
                      backgroundColor: '#4caf50', 
                      transform: 'scale(1)',
                    },
                    transition: '0.3s',
                    }}
                >
                    <EditIcon fontSize="large" />
                </IconButton>
                </Tooltip>

              
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" mt={4}>
          <Grid item xs={12} sm={8} md={8}>
            <InputPassword
              newPassword={ ergoPass }
              setNewPassword={ setErgoPass } 
              label="Modificar Ergo Pass"
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <Box display="flex" justifyContent="center">
            <Tooltip title="Modificar Ergo Pass" arrow>
                <IconButton
                    onClick={handleUpdateErgoPass}
                    aria-label="editar"
                    sx={{
                    color: '#66bb6a',
                    '&:hover': {
                        backgroundColor: '#81c784', 
                        transform: 'scale(1.05)',
                        color: '#FFFFFF',
                    },
                    '&:active': {
                      backgroundColor: '#4caf50', 
                      transform: 'scale(1)',
                    },
                    transition: '0.3s',
                    }}
                >
                    <EditIcon fontSize="large" />
                </IconButton>
                </Tooltip>

              
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
