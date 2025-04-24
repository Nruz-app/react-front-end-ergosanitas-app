import Swal from 'sweetalert2';
import { Box, Grid } from '@mui/material';
import formUserJson from '../config/custom-form.json';
import { InputSelect, InputText } from './';
import { ButtonsForm } from '../../components';

import  { UserService, UseUserForm }  from '../';

export const FormUser = () => {

    const { control,handleSubmit,setValue  } = UseUserForm();

    const onSubmit = async () => {
        const {nombre_user,email_user,password_user,perfil_user} = control._formValues;
        const {  PostUserSave } = await UserService() ;
        
        const response = await PostUserSave(
            {nombre_user,email_user,password_user,perfil_user});

        if(response.success) {

             Swal.fire({
                title: "Nuevo Usuario",
                text: 'Se ha Creado el Usuario con Exito!!!',
                timer: 2000, 
                timerProgressBar: true,
            });  
        }
        return true;
    }

    return (
    <Box sx={ { flexGrow: 1, py: 4, mx: "auto", maxWidth: "80%" } }>
        <form onSubmit={handleSubmit(onSubmit) } > 
            <Grid container justifyContent="center" spacing={3}>
            {
                formUserJson.sort((a, b) => a.order - b.order)
                .map(({ type, name, placeholder, label, defaultValue, helperText,values }) => {
    
                    
                    if (type === 'text' || type === 'password' ) {
                        
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
                                    setValue={setValue} 
                                    disabled={false}                                
                                />
                            </Grid>
                        );
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
                                    setValue={setValue} 
                                    disabled={false}                                
                                />
                            </Grid>
                        );
                    }
                    throw new Error(`El Type: ${type}, NO es Soportado`);
                })
            }
            <Grid item xs={12} sm={6} >
            
                <ButtonsForm 
                    onSubmit = { onSubmit }
                    title = "Ingresar"
                    btnStatus = { false }
                />
    
                </Grid>
            </Grid>
        </form>    
    </Box>    
    )

}