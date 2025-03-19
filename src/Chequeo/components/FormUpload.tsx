import { useContext, useState } from "react";

import { ModalContext } from "../../common/context";

import { Box, Button,  Grid, Modal  } from "@mui/material";
import { type formData } from '../interface/';

import { InputFileUpload } from '../components/';

import { UseChequeoService } from '../services/useChequeoService';
import Swal from 'sweetalert2';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
};


interface Props {
    formData : formData
}


export const FormUpload = ({ formData }: Props) => {

    const { isDateModalOpen,onOpenModal }  = useContext( ModalContext );

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleClose = () => {
        onOpenModal(false);
        setSelectedFile(null);
   
    }

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
    };


    const onSubmit = async () => {

        if (selectedFile) {

            try {

                const {  postUploadFile } = await UseChequeoService() ;

                await postUploadFile(selectedFile,formData);
                
                setSelectedFile(null);
                onOpenModal(false);
                Swal.fire('Archivos Cargado Servidor','La Imagen Se ha subido con éxito','success')

            } 
            catch (error) {
                console.error('Error al subir el archivo:', error);
                alert('Error al subir el archivo');
                setSelectedFile(null);
                onOpenModal(false);
            }
        } 
        else {
            alert('Por favor, selecciona un archivo');
        }
    }

    return (
    <Modal
        keepMounted
        open={ isDateModalOpen }
        onClose={ handleClose }
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
    >
         <Box sx={style} >


            <Grid item xs={12} sm={6} md={6}>

                <InputFileUpload 
                    onFileSelect={handleFileSelect} 
                    typeAccept="image/*, .pdf" 
                />
            
            </Grid>   

            <Grid item sx={{ textAlign: 'center' }}>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={!selectedFile}
                    sx={{
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    bgcolor: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    color: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                        bgcolor: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                        transform: 'scale(1.05)',
                    },
                    }}
                >
                    Cargar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleClose}
                    sx={{
                    mt: 2,
                    ml: 2,
                    px: 4,
                    py: 1.5,
                    bgcolor: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                        bgcolor: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                        transform: 'scale(1.05)',
                    },
                    }}
                >
                    Cerrar
                </Button>
                </Grid>

         </Box>
    </Modal>
    )

}