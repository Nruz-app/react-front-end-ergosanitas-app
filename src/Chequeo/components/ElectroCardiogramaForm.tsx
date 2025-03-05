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
  let extension = 'jpg'  

  if (url_pdf) {
    const path = url_pdf.split('.');
    extension = path[path.length - 1]; // Accede al último elemento del array 
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
    <Box sx={ { flexGrow: 1, py: 4,  maxWidth: "95%" } }>
        <Grid container spacing={4} alignItems="center"> 
        
        {/* Imagen a la izquierda */}
        <Grid item xs={12} md={8} sx={{ textAlign: "center" }}>
        {
            (extension =='pdf') ? (
                <iframe 
                    src={url_pdf} 
                    style={{
                        width: '100%',
                        height: '500px', 
                        border: 'none', 
                        borderRadius: '10px', 
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        display: 'block', // Esto asegura que el iframe se comporte como un bloque
                        marginLeft: '0', // Alinea el iframe a la izquierda
                        marginRight: 'auto', // Elimina margen a la derecha
                    }} 
                    title="Vista previa del PDF"
                />)
            : (
                <img 
                    src={url_pdf} 
                    alt="Vista previa" 
                    style={{ 
                        maxWidth: "100%", 
                        height: "auto", 
                        borderRadius: "15px", // Borde más redondeado para un look más suave
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Sombra más sutil y difusa
                        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out", // Transición para un efecto suave al pasar el mouse
                        cursor: "pointer", // Cambia el cursor para indicar que la imagen es interactiva
                        margin: "20px 0", // Añade un poco de espacio alrededor de la imagen
                    }} 
                />
   
            )
        }  
        </Grid>

        {/* Formulario a la derecha */}
        <Grid item xs={12} md={4}>
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
            <Grid container justifyContent="center">
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
