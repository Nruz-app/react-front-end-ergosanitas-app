

import { Box, Button, Grid, Paper, TextField } from '@mui/material'
import { useState } from 'react'
import { IBioimpedanciaForm, IFormErrors } from '../interface/bioimpedancia.interface';
import { formatearRut, validarRut } from '../utils/valida-rut';
import { BioimpedanciaService } from '../service/Bioimpedancia';
import Swal from "sweetalert2";


const initialForm: IBioimpedanciaForm =     {
    nombre: "",
    rut: "",
    file: null,
  }


export const FormBioimpedancia = () => {

    const [form, setForm] = useState<IBioimpedanciaForm>(initialForm);
    const [errors, setErrors] = useState<IFormErrors>({});
  

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     
        const { name, value } = event.target;
        setForm((prev) => ({...prev,[name]: value,}));
    }

    const handleGuardar = async () => {
        try {

            if (!form.file) {
                setErrors((prev) => ({
                    ...prev,
                    archivo: "Debe subir un archivo",
                }));
                return;
            }

            const { postUploadFile } = await BioimpedanciaService();
            const response = await postUploadFile(form.file,form);

            if (response?.success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Guardado correctamente!",
                    text: `Paciente: ${response.data.nombre}`,
                    confirmButtonColor: "#16a34a",
                });

                console.log("Respuesta servidor:", response);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response?.message || "No se pudo guardar",
                });
            }
        } 
        catch (error) {
            console.error("Error al guardar:", error);
        }
    }

    const handleRutBlur = () => {

        if (form.rut.trim() === "") {
            setErrors((prev) => ({
                ...prev,
                 rut: "El RUT es obligatorio",
            }));
            return;
        }

        if (!validarRut(form.rut)) {
            setErrors((prev) => ({
                ...prev,
                rut: "Ingrese un RUT válido",
            }));
            return;
        }

        // Si es válido, quitamos el error
        setErrors((prev) => ({
            ...prev,
            rut: "",
        }));

        setForm((prev) => ({
            ...prev,
            rut: formatearRut(prev.rut),
        }));
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    
        const file = event.target.files?.[0] || null;
        setForm((prev) => ({
            ...prev,
            file: file,
        }));
    }


    return (
     <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="RUT"
                    name="rut"
                    value={form.rut}
                    onChange={handleChange}
                    onBlur={handleRutBlur}
                    error={Boolean(errors.rut)}
                    helperText={errors.rut}
                />
            </Grid>
            <Grid item xs={12} md={6}>
            <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                justifyContent: "flex-start",
                }}
            >
                📎 {form.file ? form.file.name : "Subir archivo"}
                
                <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                />
            </Button>
            </Grid>
            <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Button
                    variant="contained"
                    onClick={handleGuardar}
                    >
                    Guardar
                    </Button>
                </Box>
            </Grid>
        </Grid>
    </Paper>
  )

}

