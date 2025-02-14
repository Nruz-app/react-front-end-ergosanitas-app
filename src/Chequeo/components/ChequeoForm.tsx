import { Box, Grid } from "@mui/material"

import { useChequeo } from '../hooks';

import { InputText,ButtonsForm,DatePickers, InputSelect } from '../../components/';
import chequeoJson from '../config/custom-form.json';
import { UseChequeoService } from '../services/useChequeoService';
//import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { IChequeo } from "../interface";
import { useContext } from "react";
import { LoginContext } from "../../common/context";


interface Props {
  chequeo?:IChequeo;
  handleUpdateStatus : (status : number, rut_paciente : string) => void;
}




export const ChequeoForm = ({chequeo,handleUpdateStatus}:Props) => {
  
 //const navigate = useNavigate();

 const { user }  = useContext( LoginContext );
 const { user_email,user_perfil }  = user;

 const { control,handleSubmit,setValue  } = useChequeo(chequeo);  

  const onSubmit = async () => {

    const {nombre,rut,edad,estatura,peso,hemoglucotest,pulso
      ,presionArterial,presion_sistolica,saturacionOxigeno,temperatura,enfermedadesCronicas,
      medicamentosDiarios,sistemaOsteoarticular,sistemaCardiovascular,enfermedadesAnteriores,
      Recuperacion,gradoIncidenciaPosterio,fechaNacimiento,sexo_paciente,imc_paciente} = control._formValues || {};

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
        sexo_paciente,
        imc_paciente
      };

    const {  postCreateChequeo } = await UseChequeoService() ;
    const response = await postCreateChequeo(chequeo);

      if(response) {
            
          Swal.fire(
            'Paciente Listo Para el Chequeo',
            `El Paciente ${nombre} Fue Creado con Exito!!!`,
            'success');

          control._reset();  
          //navigate('/chequeo');
          handleUpdateStatus(0,'');
      }    
  }

  const onUpdate = async () => {

    const {nombre,rut,edad,estatura,peso,hemoglucotest,pulso
      ,presionArterial,saturacionOxigeno,temperatura,presion_sistolica,enfermedadesCronicas,
      medicamentosDiarios,sistemaOsteoarticular,sistemaCardiovascular,enfermedadesAnteriores,
      Recuperacion,gradoIncidenciaPosterio,fechaNacimiento,sexo_paciente,imc_paciente} = control._formValues || {};

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
        sexo_paciente,
        imc_paciente
      };

    const {  postUpdateChequeo } = await UseChequeoService() ;
    const response = await postUpdateChequeo(chequeo,rut);

      if(response) {
            
          Swal.fire(
            'Paciente Chequeo Modificado',
            `El Paciente ${nombre} Fue Modificado con Exito!!!`,
            'success');

          control._reset();  
          //navigate('/chequeo?status=1');
          handleUpdateStatus(0,'');
      }    
  }
  

  return (
    <Box sx={ { flexGrow: 1, py: 4, mx: "auto", maxWidth: "80%" } }>
    <form onSubmit={handleSubmit(onSubmit) }> 
      <Grid container justifyContent="center" spacing={3}>
        {
            chequeoJson.sort((a, b) => a.order - b.order)
            .map(({ type, name, placeholder, label, defaultValue, helperText,disabledText,values }) => {

              let disabled=false;
               
              if(chequeo?.rut && name == 'rut') { disabled=true };

              if ( user_perfil == 'Testing' && disabledText === true) { 
                    disabled=true 
              };

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
                                disabled = { disabled }
                                setValue = { setValue }  
                            />
                        </Grid>
                    );
                }
                else if (type === 'DatePickers') {

                  return ( 
                      <Grid item xs={12} sm={6} key={name} >
                        <DatePickers
                          control={control}
                          name={name}
                          label={label}
                          defaultValue={defaultValue}
                          setValue = { setValue }
                        />
                      </Grid>
                  )
                }
                else if (type === 'selected') {
                        
                    return ( 
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
                title = "Reserva"
              />
            )
            :
            (
              <ButtonsForm 
                onSubmit = { onUpdate }
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
