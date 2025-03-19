import { Box, Button, Grid, Paper, Typography } from "@mui/material"
import { useContext, useState } from "react";
import { InputFileUpload } from '../../../Chequeo/components';
import { ExportToExcel } from '../../hooks/';

import PostAddIcon from '@mui/icons-material/PostAdd';
import BackupIcon from '@mui/icons-material/Backup';
import { LoginContext } from "../../../common/context";
import { UseChequeoService } from '../../services/useChequeoService';
import Swal from 'sweetalert2';
export const CargaMasiva = () => {

    const { user }  = useContext( LoginContext );
    const { user_email }  = user;
    const [btnStatus,setBtnStatus] = useState(false);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
    };

    const onExportToExcel = async (fileName : string) => {
     
        await ExportToExcel(fileName)
    }
    const onCargaMasiva = async () => {
     
        if (!selectedFile) {
            setBtnStatus(false);
            setSelectedFile(null);
            alert('Por favor, selecciona un archivo');
        }  

        setBtnStatus(true);

        const {  postCargaMasiva } = await UseChequeoService() ;
        
        const responseCargaMasica = await postCargaMasiva(selectedFile!,user_email);
        
        if(responseCargaMasica.status == 200){
         
            Swal.fire({
                title: '✅ ¡Carga Exitosa!',
                html: `Se han insertado <strong>${responseCargaMasica.cantidad}</strong> registros correctamente.`,
                icon: 'success',
                confirmButtonText: 'Aceptar',
                timer: 5000, // Cierra automáticamente después de 5 segundos
                timerProgressBar: true,
            });
        }
        setBtnStatus(false);
        setSelectedFile(null);
    }

  return (
    <Box sx={{
        alignItems: 'center',
        animation: 'fadeIn 1s ease-out', // Animación para que se vea más suave
        display: 'flex',
        justifyContent: 'center',
    }}>
        <Grid container justifyContent="center" alignItems="center" spacing={4}>
            <Grid item xs={12} md={10} lg={8}>
                <Box sx={{
                    textAlign: 'center',
                    mb: 4, // Aumento de margen inferior
                    position: 'relative',
                }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: 'inherit',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            color: 'primary.main',
                            textTransform: 'uppercase',
                            textShadow: '4px 4px 12px rgba(0, 0, 0, 0.2)', // Sombra más suave
                            animation: 'fadeIn 0.8s ease-out',
                        }}
                    >
                        Cargar Masiva de Chequeo
                    </Typography>
                </Box>

                <Paper
                    elevation={10}  // Sombra más pronunciada
                    sx={{
                        p: 6,  // Más espacio interior
                        borderRadius: 3, // Bordes redondeados
                        backgroundColor: 'background.default',
                        boxShadow: 3, // Sombra sutil
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 15, // Sombra más grande al hacer hover
                        },
                    }}
                >
                    <Grid container justifyContent="center" spacing={4}>
                        <Grid item xs={12} md={12}>
                            <Box
                                sx={{
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    transition: 'border-color 0.3s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                    },
                                }}
                            >
                                <InputFileUpload 
                                    onFileSelect={handleFileSelect} 
                                    typeAccept=".xlsx" 
                                />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 2 }}
                                >
                                    Formatos soportados: XLSX
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{mt:1, ml:4}}>        
                            <Grid item xs={12} md={6}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<PostAddIcon />}
                                    onClick={ () => onExportToExcel('Excel-Carga-Masiva') }
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: "bold",
                                        px: 3,
                                        '&:hover': {
                                            backgroundColor: '#4caf50', // Fondo verde al hacer hover
                                            color: '#fff', // Cambia el texto a blanco
                                            textDecoration: 'none', // Evitar subrayado al hacer hover
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Sombra sutil
                                            transform: 'translateY(-4px)', // Efecto de desplazamiento al pasar el mouse
                                        },
                                    }}
                                >
                                    Descargar Excel
                                </Button>
                            </Grid>    
                            <Grid item xs={12} md={6}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<BackupIcon />}
                                    onClick = { onCargaMasiva }
                                    disabled = { btnStatus }
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: "bold",
                                        px: 3,
                                        '&:hover': {
                                            backgroundColor: '#4caf50', // Fondo verde al hacer hover
                                            color: '#fff', // Cambia el texto a blanco
                                            textDecoration: 'none', // Evitar subrayado al hacer hover
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Sombra sutil
                                            transform: 'translateY(-4px)', // Efecto de desplazamiento al pasar el mouse
                                        },
                                    }}
                                >
                                    Cargar Chequeos
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    </Box>

  )
}
