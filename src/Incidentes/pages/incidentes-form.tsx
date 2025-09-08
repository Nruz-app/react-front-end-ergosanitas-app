import { default as useFormIncidentes } from '../hook/use-form-incidentes';
import { Box, Grid, Typography } from "@mui/material"
import incidentesFormJson from '../config/incidentes-form.json';
import Swal from 'sweetalert2';


import { 
    InputText,
    InputSelect,
    InputAutoComplete,
    DatePickersTime,
    ButtonsForm
} from '../../components/';
import { UseIncidentesService } from '../services/use-incidentes.service';
import { useContext } from 'react';
import { LoginContext } from "../../common/context";


export const IncidentesForm = () => {

    const { user }  = useContext( LoginContext );
    const { control,handleSubmit,setValue } = useFormIncidentes();


    const onSubmit = async () => {

        const {  postIncidentesCreate } = await UseIncidentesService() ;

        const {nombres,edad,deporte,tipo_lesion,ubicacion,parte_cuerpo,descripcion,
        primeros_auxilios,gravedad,estado,club_deportivo,liga,categoria} = control._formValues;

        const response = await postIncidentesCreate({
            nombres,
            edad,
            deporte,
            tipo_lesion,
            ubicacion,
            parte_cuerpo,
            descripcion,
            primeros_auxilios,
            gravedad,
            estado,
            club_deportivo,
            liga,
            user_email : user.user_email,
            categoria
        });
        if(response.status == "success"){
            Swal.fire({
                title: '✅ ¡Paciente Listo Para el Chequeo',
                html: `La Incidencia Fue Creado con Exito!!!.`,
                icon: 'success',
                confirmButtonText: 'Aceptar',
                timer: 3000, // Cierra automáticamente después de 5 segundos
                timerProgressBar: true,
            });  
            control._reset();
            return;
        }
    }

    return (
    <Box sx={ { flexGrow: 1, py: 4, mx: "auto", maxWidth: "80%" } }>
        <Typography
            variant="h4"
            align="center"
            sx={{
                fontFamily: 'cursive',
                fontWeight: 'bold',
                letterSpacing: '0.1rem',
                textTransform: 'uppercase',
                color: 'primary.main',
                mb: 3,
                animation: 'fadeInDownBig 1s ease-out' 
            }}
            >
            Registrar Nuevo Incidente
        </Typography>
        <form onSubmit={handleSubmit(onSubmit) }> 
            <Grid container justifyContent="center" spacing={3}>
            {
                incidentesFormJson.sort((a, b) => a.order - b.order)
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
                            control={control}
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            label={label}
                            defaultValue={defaultValue}
                            helperText={helperText} 
                            values={ [] }   
                            perfil = { 4 } 
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
            {
                <Grid item xs={12} sm={6} >
                
                    <ButtonsForm 
                        onSubmit = { onSubmit }
                        title = "Ingresar Incidente"
                        btnStatus = { false }
                    />
        
                </Grid>
            }    
            </Grid>
        </form>
        </Box>
    )

}