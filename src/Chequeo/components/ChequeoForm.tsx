import { Box, Grid } from "@mui/material"

import { useChequeo } from '../hooks';

import { InputText,ButtonsForm,DatePickers, InputSelect } from '../../components/';
import chequeoJson from '../config/custom-form.json';
import { UseChequeoService } from '../services/useChequeoService';
//import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { IChequeo } from "../interface";
import { useContext, useState } from "react";
import { LoginContext } from "../../common/context";
import { SelectUser } from "./";


interface Props {
  chequeo?:IChequeo;
  handleUpdateStatus : (status : number, rut_paciente : string,id_paciente : number) => void;
}




export const ChequeoForm = ({chequeo,handleUpdateStatus}:Props) => {
  
 //const navigate = useNavigate();

 const { user }  = useContext( LoginContext );
 const { user_email,user_perfil }  = user;
 const user_email_perfil = user_email; 

 const { control,handleSubmit,setValue  } = useChequeo(chequeo);  

 const [btnStatus,setBtnStatus] = useState<boolean>(false);

  const onSubmit = async () => {

    setBtnStatus(true);
    const {nombre,rut,edad,estatura,peso,hemoglucotest,pulso
      ,presionArterial,presion_sistolica,saturacionOxigeno,temperatura,enfermedadesCronicas,
      medicamentosDiarios,sistemaOsteoarticular,sistemaCardiovascular,enfermedadesAnteriores,
      Recuperacion,gradoIncidenciaPosterio,fechaNacimiento,sexo_paciente,imc_paciente,
      division_paciente,medio_pago_paciente,user_email,status} = control._formValues || {};

      const chequeo: IChequeo = {
        nombre,
        rut,
        fechaNacimiento,
        edad,
        estatura,
        peso,
        hemoglucotest,
        pulso,
        presionArterial,
        presion_sistolica,
        saturacionOxigeno,
        temperatura,
        enfermedadesCronicas,
        medicamentosDiarios,
        sistemaOsteoarticular,
        sistemaCardiovascular,
        enfermedadesAnteriores,
        Recuperacion,
        gradoIncidenciaPosterio,
        user_email_perfil,
        user_email : user_email? user_email : user_email_perfil,
        sexo_paciente,
        imc_paciente,
        status : status,
        division_paciente,
        medio_pago_paciente
      };

    const {  postCreateChequeo } = await UseChequeoService() ;
    const response = await postCreateChequeo(chequeo);

      if(response) {
        
          Swal.fire({
              title: '✅ ¡Paciente Listo Para el Chequeo',
              html: `El Paciente <strong>${nombre}</strong> Fue Creado con Exito!!!.`,
              icon: 'success',
              confirmButtonText: 'Aceptar',
              timer: 3000, // Cierra automáticamente después de 5 segundos
              timerProgressBar: true,
          });  

          control._reset();  
          //navigate('/chequeo');
          handleUpdateStatus(0,'',0);
      }    
      setBtnStatus(false);
  }

  const onUpdate = async () => {

    setBtnStatus(true);
    const {id,nombre,rut,edad,estatura,peso,hemoglucotest,pulso
      ,presionArterial,saturacionOxigeno,temperatura,presion_sistolica,enfermedadesCronicas,
      medicamentosDiarios,sistemaOsteoarticular,sistemaCardiovascular,enfermedadesAnteriores,
      Recuperacion,gradoIncidenciaPosterio,fechaNacimiento,sexo_paciente,imc_paciente, division_paciente,
      medio_pago_paciente,user_email,status,fecha_atencion} = control._formValues || {};

      const chequeo: IChequeo = {
        nombre,
        rut,
        fechaNacimiento,
        edad,
        estatura,
        peso,
        hemoglucotest,
        pulso,
        presionArterial,
        presion_sistolica,
        saturacionOxigeno,
        temperatura,
        enfermedadesCronicas,
        medicamentosDiarios,
        sistemaOsteoarticular,
        sistemaCardiovascular,
        enfermedadesAnteriores,
        Recuperacion,
        gradoIncidenciaPosterio,
        user_email,
        user_email_perfil,
        sexo_paciente,
        imc_paciente,
        status,
        division_paciente,
        medio_pago_paciente,
        fecha_atencion
      };

    const {  postUpdateChequeo } = await UseChequeoService() ;

    const response = await postUpdateChequeo(chequeo,id,user_email_perfil);

      if(response) {
            
          Swal.fire({
              title: '✅ ¡Paciente Chequeo Modificado!',
              html: `El Paciente <strong>${nombre}</strong> Fue Modificado con Exito!!!.`,
              icon: 'success',
              confirmButtonText: 'Aceptar',
              timer: 3000,
              timerProgressBar: true,
          });  

          control._reset();  
          //navigate('/chequeo?status=1');
          handleUpdateStatus(0,'',0);
      }   
      setBtnStatus(false); 
  }
  

  return (
    <Box sx={ { flexGrow: 1, py: 4, mx: "auto", maxWidth: "80%" } }>
    <form onSubmit={handleSubmit(onSubmit) }> 
      <Grid container justifyContent="center" spacing={3}>
        {
            chequeoJson.sort((a, b) => a.order - b.order)
            .map(({ type, name, placeholder, label, defaultValue, helperText,disabledText,values }) => {

              let disabled=false;
  
              if ( user_perfil == 'Colegios' && disabledText === true) {
                disabled=true 
              }
              if (user_perfil != 'Administrador') {

                if(chequeo?.rut && name == 'rut') disabled=true; 
                if(name == 'user_email')  disabled=true;
                if(name == 'status')  disabled=true;
                if(name == 'fecha_atencion')  disabled=true;

              }
              
              
                if (type === 'text' || type === 'number' ) {
                  
                    return (
                        (disabled == false) &&
                        <Grid item xs={12} sm={6} key={name}>
                            <InputText
                                control={control}
                                type={type}
                                name={name}
                                placeholder={placeholder}
                                label={label}
                                defaultValue={defaultValue}
                                helperText={helperText}
                                disabled = { disabled }
                                setValue = { setValue }  
                            />
                        </Grid>
                    );
                }
                else if (type === 'DatePickers') {

                  return ( 
                    (disabled == false) &&
                      <Grid item xs={12} sm={6} key={name} >
                        <DatePickers
                          control={control}
                          name={name}
                          label={label}
                          defaultValue={defaultValue}
                          setValue = { setValue }
                          disabled = { disabled }
                        />
                      </Grid>
                  )
                }
                else if (type === 'selected') {
                        
                    return ( 
                      (disabled == false) &&
                      <Grid item xs={12} sm={6} key={name}>

                            <InputSelect
                                control={control}
                                type={type}
                                name={name}
                                placeholder={placeholder}
                                label={label}
                                defaultValue={defaultValue}
                                helperText={helperText} 
                                values = { values! }
                                disabled = { disabled }
                                setValue = { setValue }
                            />
                        </Grid>
                    )
                }
                else if (type === 'selected-user') {
                        
                  return ( 
                    (disabled == false) &&
                    <Grid item xs={12} sm={6} key={name}>

                          <SelectUser
                              control={control}
                              type={type}
                              name={name}
                              placeholder={placeholder}
                              label={label}
                              defaultValue={defaultValue}
                              helperText={helperText} 
                              values = { values! }
                              disabled = { disabled }
                              setValue = { setValue }
                          />
                      </Grid>
                  )
              }
              
                throw new Error(`El Type: ${type}, NO es Soportado`);
            })
          }
        
          <Grid item xs={12} sm={6} >
          {
            (!chequeo)? (
              <ButtonsForm 
                onSubmit = { onSubmit }
                btnStatus = { btnStatus }
                title = "Reserva"
              />
            )
            :
            (
              <ButtonsForm 
                onSubmit = { onUpdate }
                btnStatus = { btnStatus }
                title = "Editar"
              />
            )
          }
          </Grid>
        </Grid>
    </form>    
   </Box>
  )
}
