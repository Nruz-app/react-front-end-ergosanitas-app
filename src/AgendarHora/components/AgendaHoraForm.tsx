import { Box, Grid } from "@mui/material"
import { useAgendaHora } from '../hooks/';
import { InputText,InputSelect,InputAutoComplete,DatePickersTime,ButtonsForm,InputSelectDynamic } from '../../components/';
import agendaHoraJson from '../config/custom-form.json';
import { UseAgendaHoraService } from '../services/useAgendaHoraService';

import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { IServicios,IServiciosValue } from "../interface";

import { AlertaPrecio } from './';

let rows_servicios:IServiciosValue[] = [];

const initial_alertPrecio = {
  servicio    : '',
  precio      : 0,
  status      : false
  
}



export const AgendaHoraForm = () => {
  

  const navigate = useNavigate();
  const { control,handleSubmit,errors,setValue } = useAgendaHora(); 
 
  const [valueServicios, valueServiciosSet] = useState(rows_servicios);
  const [ alertaPrecio,setAlertaPrecio]  = useState(initial_alertPrecio);
    
  const fetchServicios = useCallback(async (): Promise<void> => {
  
      const {  getServicios } = await UseAgendaHoraService() ;

      const response = await getServicios();

      rows_servicios = [];
      //response.map ( ({id,nombre}) => { rows_servicios.push({id,nombre} ); } );
      rows_servicios = [...response];
      valueServiciosSet(rows_servicios);


  },[valueServiciosSet]);


  useEffect(() => {
    fetchServicios();
  }, [valueServiciosSet]);


  const onSubmit = async () => {

    let existeError = false;

    if(errors) {

      const { rut_paciente,nombre_paciente,edad_paciente,direccion_paciente,email_paciente
        ,celular_paciente,sexo_paciente,servicios_name,comuna_paciente,fecha_reserva_paciente } = errors;

      if(rut_paciente && nombre_paciente && edad_paciente && direccion_paciente && email_paciente
         && celular_paciente && sexo_paciente && servicios_name && comuna_paciente &&
         fecha_reserva_paciente) {
      
          existeError = true;  
      }
    }

    if(alertaPrecio.status == false ) existeError = true; 

    if(existeError) {

      Swal.fire({
        // Tipo de alerta (puede ser 'success', 'error', 'warning', 'info', 'question')
        icon: 'error',  
        title: 'Error Al Reservar Hora',
        text: 'Por Favor Ingrese todos los valores del formularios',
        timer: 5000, // Cierra automáticamente después de 5 segundos
        timerProgressBar: true,
      });
      return;

    }
 
    const {  postAgendaHora,postWebPayRequest,postEmailReservaHora } = await UseAgendaHoraService() ;
    
      const {rut_paciente,nombre_paciente,edad_paciente,direccion_paciente,email_paciente
        ,celular_paciente,sexo_paciente,servicios_name,comuna_paciente,fecha_reserva_paciente} = control._formValues;

        const response = await postAgendaHora({
          rut_paciente,
          nombre_paciente,
          edad_paciente: parseInt(edad_paciente),
          direccion_paciente,
          email_paciente,
          celular_paciente,
          sexo_paciente,
          servicios_name,
          comuna_paciente,
          pagado_paciente : 'NO-PAGADO',
          fecha_reserva_paciente
      });

      if(response) {

        let html = '<h3 style="color: #333; font-weight: bold;">';
            html += '¿Desea proceder con el pago del servicio?</h3>';
            html += '<p style="color: #666; margin-top: 10px;">';
            html += 'Recuerde que también puede cancelarlo cuando nuestros profesionales lo visiten.';
            html += '</p>';
         
        Swal.fire({
          title: "Hora Reservada con Exito",
          html: html,
          confirmButtonText: "Pagar",
          showCancelButton: true,
          timer: 2000, // Cierra automáticamente después de 5 segundos
          timerProgressBar: true,
        }).then((result) => {
    
            if (result.isConfirmed) {
    
              postWebPayRequest({
                servicios_name : alertaPrecio.servicio,
                rut : rut_paciente,
                monto: alertaPrecio.precio,
              });


            }
            else {
              navigate('/');
            }
            /*else if (result.isDenied) {
              navigate('/'); 
            }*/
        });  

        //Envio Email 
        await postEmailReservaHora(rut_paciente);

      }

  }

  const handleDowload = async () => {

    const {  getServicio } = await UseAgendaHoraService();

    const {servicios_name} = control._formValues;

    const response:IServicios = await getServicio(servicios_name);

    
    setAlertaPrecio({
      servicio : servicios_name,
      precio : response.precio,
      status : true,
    });

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
                else if (type === 'selected-dinamic') {



                  return ( 
                      <Grid item xs={12} sm={6} key={name} >
                        <InputSelectDynamic
                            control={control}
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            label={label}
                            defaultValue={defaultValue}
                            helperText={helperText} 
                            values = { valueServicios }  //{ values! }
                            handleDowload = { handleDowload }
                        />
                      </Grid>
                  )
                
              }

                else if (type === 'AutoComplete') {

                  return ( 
                      <Grid item xs={12} sm={6} key={name} >
                        <InputAutoComplete
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
        {
          (alertaPrecio.status) && 
            <AlertaPrecio 
              titulo= {`Servicio ${ alertaPrecio.servicio }`}
              descripcion= 'El monto aproximado a cancelar sería de '
              precio= { alertaPrecio.precio }
            />
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
