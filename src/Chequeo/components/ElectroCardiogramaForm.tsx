import { Box, Grid } from "@mui/material"

import electroCardiogramaJson from '../config/electro-form.json';
import { ButtonsForm, InputSelect, InputText } from "../../components";
import useElectroCardiograma from "../hooks/useElectroCardiograma";

import Swal from 'sweetalert2';
import { useElectroCardiogranaService } from "../services/useElectroCardiogranaService";

interface Props {
  rut_paciente : string;
  url_pdf?     : string; 
  handleUpdateStatus : (status : number, rut_paciente : string) => void;
}


export const ElectroCardiogramaForm = ({rut_paciente,url_pdf,handleUpdateStatus}:Props) => {

  const { control,handleSubmit,setValue,errors } = useElectroCardiograma(); 
 
  const onGoBack = async () => {
    handleUpdateStatus(0,'');
  }

  const onSubmit = async () => {

    let existeError = false;

    if(errors) {

        const { estado_paciente,
            frecuencia_cardiaca_paciente,
            derivacion_paciente,
            observacion_paciente,
            imc_paciente } = errors;
  
        if(estado_paciente && frecuencia_cardiaca_paciente 
            && derivacion_paciente && observacion_paciente && imc_paciente ){
            existeError = true;  
        }
    }
    if(existeError) {
    
          Swal.fire({
            // Tipo de alerta (puede ser 'success', 'error', 'warning', 'info', 'question')
            icon: 'error',  
            title: 'Error Al Ingresar Electrocardiograma',
            text: 'Por Favor Ingrese todos los valores del formularios'
          });
          return;
    
    }


    const {  postCreateElectroCardiograma } = await useElectroCardiogranaService() ;

    const { estado_paciente,
        frecuencia_cardiaca_paciente,
        derivacion_paciente,
        observacion_paciente,
        imc_paciente } = control._formValues || {};

    const response = await postCreateElectroCardiograma({
        rut_paciente,
        estado_paciente,
        frecuencia_cardiaca_paciente,
        derivacion_paciente,
        observacion_paciente,
        imc_paciente
    });

    if(response) {
               
             Swal.fire(
               'Paciente Listo Para el Chequeo',
               `El Paciente ${rut_paciente} Fue Creado con Exito!!!`,
               'success');
   
             control._reset();  
             //navigate('/chequeo');
             handleUpdateStatus(0,'');
    }    
  }


  return (
    <Box sx={ { flexGrow: 1, py: 4, mx: "auto", maxWidth: "95%" } }>
        <Grid container spacing={4} alignItems="center"> 
        
        {/* Imagen a la izquierda */}
        <Grid item xs={12} md={6} sx={{ textAlign: "center" }}>
          <img 
            src={url_pdf} 
            alt="Descripción de la imagen" 
            style={{ maxWidth: "100%", height: "auto", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
          />
        </Grid>

        {/* Formulario a la derecha */}
        <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit(onSubmit) }> 
            <Grid container justifyContent="center" spacing={3}>
                {
                    electroCardiogramaJson.sort((a, b) => a.order - b.order)
                    .map(({ type, name, placeholder, label, defaultValue, helperText,values,multiline }) => {

                        if (type === 'text' || type === 'number') {


                            return (
                                <Grid item xs={12} sm={12} key={name}>
                                    <InputText
                                        control={control}
                                        type={type}
                                        name={name}
                                        placeholder={placeholder}
                                        label={label}
                                        defaultValue={defaultValue}
                                        helperText={helperText}
                                        disabled = {false}
                                        multiline = { multiline }
                                    />
                                </Grid>
                            );
                        }
                        else if (type === 'selected') {
        
                            return ( 
                                <Grid item xs={12} sm={12} key={name} >
                                    <InputSelect
                                        control={control}
                                        type={type}
                                        name={name}
                                        placeholder={placeholder}
                                        label={label}
                                        defaultValue={defaultValue}
                                        helperText={helperText} 
                                        values = { values! }
                                        setValue = { setValue }
                                    />
                                </Grid>
                            )
                        }
                        throw new Error(`El Type: ${type}, NO es Soportado`);
                    })
                }
            </Grid>
            <Grid container justifyContent="center" spacing={3}>
                <Grid item xs={12} sm={6} >
                    <ButtonsForm 
                        onSubmit = { onGoBack }
                        title = "Volver"
                    />
                </Grid>
                <Grid item xs={12} sm={6}  >
                    <ButtonsForm 
                        onSubmit = { onSubmit }
                        title = "Ingresar"
                    />
                </Grid>

            </Grid>
            </form>
        </Grid>
        </Grid>
    </Box>
  )
}
