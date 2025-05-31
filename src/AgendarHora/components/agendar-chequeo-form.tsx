import { Box, Grid } from "@mui/material"
import { useAgendaHora } from '../hooks/';
import { InputText,InputSelect,InputAutoComplete,DatePickersTime,ButtonsForm} from '../../components/';
import agendaHoraJson from '../config/custom-form.json';

import Swal from 'sweetalert2';

import { UseChequeoService } from "../../Chequeo/services/useChequeoService";
import { IChequeo } from "../../Chequeo/interface";

export const AgendaChequeoForm = () => {
  
  const { control,handleSubmit,errors,setValue } = useAgendaHora(); 
 
  const onSubmit = async () => {

    let existeError = false;

    if(errors) {

      const { rut_paciente,nombre_paciente,edad_paciente,sexo_paciente,fechaNacimiento,user_email} = errors;

      if(rut_paciente && nombre_paciente && edad_paciente
         && sexo_paciente && fechaNacimiento && user_email) {
          existeError = true;  
      }
    }


    if(existeError) {

      Swal.fire({
        // Tipo de alerta (puede ser 'success', 'error', 'warning', 'info', 'question')
        icon: 'error',  
        title: 'Error Al Reservar Hora',
        text: 'Por Favor Ingrese todos los valores del formularios',
        timer: 5000, 
        timerProgressBar: true,
      });
      return;

    }

    const {rut_paciente,nombre_paciente,email_paciente,sexo_paciente,fechaNacimiento,user_email} = control._formValues;

    const dateNacimiento = new Date(fechaNacimiento);
    const today = new Date();

    let edad = today.getFullYear() - dateNacimiento.getFullYear();
    const mes = today.getMonth() - dateNacimiento.getMonth();

    // Si la fecha de hoy es antes del cumpleaños de este año, resta 1 de la edad
    if (mes < 0 || (mes === 0 && today.getDate() < dateNacimiento.getDate())) {
          edad--;
    }

    const chequeo: IChequeo = {
            nombre : nombre_paciente,
            rut : rut_paciente,
            fechaNacimiento,
            user_email,
            sexo_paciente,
            edad : edad.toString(),
            status : 'ingresado',
            email_paciente
        };

    const {  postCreateChequeo } = await UseChequeoService() ;
    const response = await postCreateChequeo(chequeo);

    if(response) {
 
        Swal.fire({
            title: '✅ ¡Paciente Listo Para el Chequeo',
            html: `El Paciente <strong>${nombre_paciente}</strong> Fue Creado con Exito!!!.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000, // Cierra automáticamente después de 5 segundos
            timerProgressBar: true,
        });  
        control._reset();

      }

  }

  return (
    <Box sx={ { flexGrow: 1, py: 4, mx: "auto", maxWidth: "80%" } }>
    <form onSubmit={handleSubmit(onSubmit) }> 
      <Grid container justifyContent="center" spacing={3}>
        {
            agendaHoraJson.sort((a, b) => a.order - b.order)
            .map(({ type, name, placeholder, label, defaultValue, helperText,values }) => {
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
                                setValue = { setValue }
                            />
                        </Grid>
                    );
                }
                else if (type === 'selected') {

                    return ( 
                        <Grid item xs={12} sm={6} key={name} >
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
                              disabled = { false }
                          />
                        </Grid>
                    )
                  
                }
                else if (type === 'AutoComplete') {

                  return ( 
                      <Grid item xs={12} sm={6} key={name} >
                        <InputAutoComplete
                        perfil = { 3 }
                          control={control}
                          type={type}
                          name={name}
                          placeholder={placeholder}
                          label={label}
                          defaultValue={defaultValue}
                          helperText={helperText} 
                          values={ [] }                        />
                      </Grid>
                  )
                }
                else if (type === 'DatePickersTime') {

                  return ( 
                      <Grid item xs={12} sm={6} key={name} >
                        <DatePickersTime
                          control={control}
                          name={name}
                          label={label}
                          defaultValue={defaultValue}
                        />
                      </Grid>
                  )
                }

                throw new Error(`El Type: ${type}, NO es Soportado`);
            })
        }
        
        <Grid item xs={12} sm={6} >

            <ButtonsForm 
              onSubmit = { onSubmit }
              title = "Reserva"
              btnStatus = { false }
            />

        </Grid>
      </Grid>
   </form>    
   </Box>
  )
}
