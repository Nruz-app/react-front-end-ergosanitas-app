import { Box, Grid } from "@mui/material"
import { InputText,ButtonsForm } from '../../components/';
import certificadoJson from '../config/custom-form.json';

import { UseCertificadoService } from '../services/UseCertificadoService';

import Swal from 'sweetalert2';
import useCertificado from "../hook/useCertificado";


import { InputFileUpload } from '../../Chequeo/components';
import { useState } from "react";


export const CertificadoForm = () => {
  
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
              {rut_paciente,nombre_paciente});

       if(response) {

          Swal.fire({
            title: 'Certificado',
            text: 'Se ha grabado el certificado',
            icon: 'success',
            confirmButtonText: 'Ok'
          });

          control._reset(); 
       }       

  }

  return (
    <Box sx={ { flexGrow: 1, py: 4, mx: "auto", maxWidth: "80%" } }>
    <form onSubmit={handleSubmit(onSubmit) }> 
      <Grid container justifyContent="center" spacing={3}>
        {
            certificadoJson.sort((a, b) => a.order - b.order)
            .map(({ type, name, placeholder, label, defaultValue, helperText }) => {
                if (type === 'text' || type === 'number') {
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
            />

            </Grid>   

        <Grid item xs={12} sm={6} >

            <ButtonsForm 
              onSubmit = { onSubmit }
              title = "Grabar"
            />

        </Grid>
      </Grid>
   </form>    
   </Box>
  )
}
