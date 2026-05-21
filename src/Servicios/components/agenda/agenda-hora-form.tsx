import { Box, Grid } from "@mui/material"
import { default as useAgendaHora } from '../../hooks/use-form-agenda-hora';
import { 
    InputText,
    InputSelect,
    DatePickersTime,
    ButtonsForm 
} from '../../../components/';
import agendaHoraJson from '../../config/custom-form-agenda.json';
import { ServiciosService } from '../../service/servicios.service';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { InputAutoCompleteComuna } from "../../../components/forms/auto-complete-comuna/auto-complete-comuna";
import { IAgendaHora } from "../../interface/agenda-hora.interfaz";
import './agenda.css';
import { ApiResponse } from "../../interface/api-response";


interface Props {
  servicios_name : string | undefined;
  setAgendaHoras: React.Dispatch<React.SetStateAction<IAgendaHora | null>>;
  handleNext: () => void;
}

export const AgendaHoraForm = ({ servicios_name, setAgendaHoras, handleNext }: Props) => {
  

  const navigate = useNavigate();
  const { control,handleSubmit,errors,setValue } = useAgendaHora(); 
 
    
  const onSubmit = async () => {

    let existeError = false;

    if(errors) {

      const { rut_paciente,nombre_paciente,edad_paciente,direccion_paciente,email_paciente
        ,celular_paciente,sexo_paciente,comuna_paciente,fecha_reserva_paciente } = errors;

      if(rut_paciente && nombre_paciente && edad_paciente && direccion_paciente && email_paciente
         && celular_paciente && sexo_paciente && comuna_paciente &&
         fecha_reserva_paciente) {
      
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
 
    const {  postAgendaHora } = await ServiciosService() ;
    
      const {rut_paciente,nombre_paciente,edad_paciente,direccion_paciente,email_paciente
        ,celular_paciente,sexo_paciente,comuna_paciente,fecha_reserva_paciente} = control._formValues;

        const response:ApiResponse<IAgendaHora> = await postAgendaHora({
          rut_paciente,
          nombre_paciente,
          edad_paciente: parseInt(edad_paciente),
          direccion_paciente,
          email_paciente,
          celular_paciente,
          sexo_paciente,
          servicios_name : servicios_name || '',
          comuna_paciente,
          pagado_paciente : 'NO-PAGADO',
          fecha_reserva_paciente
      });
      if (response.status=="OK") {
      const html = `
        <div style="text-align:center; padding:10px;">
          <div style="
            font-size:50px;
            margin-bottom:10px;
          ">
            ✅
          </div>
          <h3 style="
            color:#0f172a;
            font-weight:bold;
            margin-bottom:10px;
          ">
            ¿Desea proceder con el pago?
          </h3>
          <p style="
            color:#64748b;
            margin-top:10px;
            font-size:15px;
            line-height:1.5;
          ">
            Su hora fue reservada correctamente.
            <br/>
            También puede pagar directamente cuando
            nuestros profesionales lo visiten.
          </p>
        </div>
      `;

      Swal.fire({
        title: "Hora Reservada con Éxito",
        html,
        icon: "success",
        confirmButtonText: "Ir al Pago",
        cancelButtonText: "Pagar Después",
        showCancelButton: true,
        confirmButtonColor: "#0284c7",
        cancelButtonColor: "#94a3b8",
        background: "#ffffff",
        timerProgressBar: true,
        customClass: {
          popup: "swal-popup-custom",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          setAgendaHoras(response.data);
          handleNext();
        } else {
          navigate("/");
        }
      });
      // await postEmailReservaHora(rut_paciente);
    }
  }

  return (
    <Box sx={ { flexGrow: 1, maxWidth: "100%" } }>
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
                        <InputAutoCompleteComuna
                          control={control}
                          type={type}
                          name={name}
                          placeholder={placeholder}
                          label={label}
                          defaultValue={defaultValue}
                          helperText={helperText} 
                          values={ [] } 
                          
                        />
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
