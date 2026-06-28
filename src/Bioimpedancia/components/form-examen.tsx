

import { Box, Button, Grid, Paper, TextField } from '@mui/material'
import { useState } from 'react'
import { IBioimpedanciaForm, IFormErrors } from '../interface/bioimpedancia.interface';
import { formatearRut, validarRut } from '../utils/valida-rut';
import { BioimpedanciaService } from '../service/Bioimpedancia';
import Swal from "sweetalert2";


const initialForm: IBioimpedanciaForm =     {
    rut: "",
    file: null,
  }


export const FormExamen = () => {

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

            //
            Swal.fire({
                title: "Analizando bioimpedancia...",
                html: "Esto puede tardar unos segundos.<br><br>Estamos procesando la imagen con IA.",
                imageUrl: "/terminator.gif",
                imageWidth: 220,
                imageHeight: 220,
                imageAlt: "Procesando",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const { postUploadFile } = await BioimpedanciaService();
            const response = await postUploadFile(form.file,form);

            if (response?.success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Guardado correctamente!",
                    text: `Paciente: ${response.data.nombre}`,
                    confirmButtonColor: "#16a34a",
                });

                setForm(initialForm);
                setErrors({});
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
            Swal.close();

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un error inesperado.",
            });
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
                    Guardar Examen
                    </Button>
                </Box>
            </Grid>
        </Grid>
    </Paper>
  )

}

