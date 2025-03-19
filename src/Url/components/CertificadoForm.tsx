import { Box, Button, Grid, Stack } from "@mui/material"
import { InputText } from '../../components/';
import certificadoJson from '../config/custom-form.json';

import { UseCertificadoService } from '../services/UseCertificadoService';

import Swal from 'sweetalert2';
import useCertificado from "../hook/useCertificado";

import { useNavigate, useParams } from "react-router-dom";

import { InputFileUpload } from '../../Chequeo/components';
import { useState } from "react";

import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const CertificadoForm = () => {
  
  const navigate = useNavigate();
  const { rut_paciente,id_paciente } = useParams();

  const { control,handleSubmit } = useCertificado(); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);  


  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };
 
  const onSubmit = async () => {

        if (!selectedFile) return false;

        const { rut_paciente,nombre_paciente } = control._formValues;

       const {  postCerticadoSave } = await UseCertificadoService() ;


       const response =  await postCerticadoSave(
              selectedFile!,
              {rut_paciente,id_paciente,nombre_paciente});

       if(response) {

          Swal.fire({
            title: 'Certificado',
            text: 'Se ha grabado el certificado',
            icon: 'success',
            confirmButtonText: 'Ok'
          });

          control._reset(); 
       }       
       navigate(-1)
  }

  const handleGotBack = () => {
    navigate(-1)
  }

  return (
    <Box sx={ { flexGrow: 1, py: 4, mx: "auto", maxWidth: "80%" } }>
    <form onSubmit={handleSubmit(onSubmit) }> 
      <Grid container justifyContent="center" spacing={3}>
        {
            certificadoJson.sort((a, b) => a.order - b.order)
            .map(({ type, name, placeholder, label, defaultValue, helperText }) => {
                if (type === 'text' || type === 'number') {

                    if(name =="rut_paciente") {
                      defaultValue = rut_paciente!;
                    }

                    return (
                        <Grid item xs={12} sm={6} key={name}>
                            <InputText
                                control={control}
                                type={type}
                                name={name}
                                placeholder={placeholder}
                                label={label}
                                defaultValue={defaultValue}
                                helperText={helperText}
                                disabled = {false}
                            />
                        </Grid>
                    );
                }
                

                throw new Error(`El Type: ${type}, NO es Soportado`);
            })
        }
         <Grid item xs={12} sm={6} md={6}>

            <InputFileUpload 
                onFileSelect={handleFileSelect} 
                typeAccept="image/*, .pdf"
            />

            </Grid>   

            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} justifyContent="center">
                {/* Botón Volver */}
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleGotBack}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                    px: 3,
                  }}
                >
                  Volver
                </Button>

                {/* Botón Grabar */}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={onSubmit}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                    px: 3,
                    backgroundColor: "#1976d2",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                  }}
                >
                  Grabar
                </Button>
              </Stack>
            </Grid>
      </Grid>
   </form>    
   </Box>
  )
}
