import { useContext, useState } from "react";
import { Box, Button, Grid, Link, Modal, Typography } from "@mui/material"
import { LoginContext, ModalContext } from "../../common/context";

import { useUser } from '../hooks';
import { UseRegister } from '../services/useRegister';
import Swal from 'sweetalert2';
import { InputText } from '../../components';

import userForm from '../config/custom-form.json';
import { IResponseUser, IUser } from "../interface";


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
  outline: 'none',
};

export const Register = () => {

  const { control,handleSubmit } = useUser();  
  
  const { ValidLogin }  = useContext( LoginContext );

  const { isDateModalOpen,onOpenModal }  = useContext( ModalContext );
  const [formMode, setFormMode] = useState<"login" | "register">("login");  

  const handleClose = () => {
    onOpenModal(false);
  }

  
  const onSubmit = async () => {

      
      let errorLogin = false;
      
      try {

        const {  authRegister,createUser,validaUser } = await UseRegister() ;
        const {userName,password,rut_paciente}  = control._formValues;
        onOpenModal(false);
        let responseUser:IResponseUser;

        const statusExiste = await validaUser(rut_paciente);
          
        if(formMode === "register" && statusExiste == 200) {

           responseUser = await createUser(userName,password,rut_paciente);
        }
        else {
          responseUser = await authRegister(userName,password);
    
        }

        if(responseUser.success){
      
            const user:IUser = responseUser.user;
            setFormMode("login");
            ValidLogin (true,user);
          
          }
          else {
            errorLogin = true;
            ValidLogin (false,{
              user_id        : 0,
              user_email     : '',
              user_name      : '',
              user_perfil    : '',
              user_logo      : ''
          });
        }

        if(errorLogin) {

        Swal.fire({
          title: '⚠️ Error de Ingreso',
          html: `<p style="font-size: 16px; color: #d32f2f;">
               Usuario <b>${userName}</b> incorrecto.
            </p>`,
          icon: 'error',
          iconColor: '#d32f2f',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#d32f2f',
          timer: 3000,
          timerProgressBar: true,
          showClass: {
              popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
          }
        });

      }
      }
      catch (error) {
        console.log('Error Login', error);
        errorLogin = true;

        Swal.fire({
            title: '🚫 Fallo en el ingreso',
            html: `
                <p style="font-size: 16px; color: #d32f2f; line-height: 1.5;">
                    Lo sentimos, el usuario o la contraseña son incorrectos.<br>
                    Por favor verifica tus credenciales e intenta nuevamente.
                </p>
            `,
            icon: 'error',
            iconColor: '#d32f2f',
            confirmButtonText: 'Intentar de nuevo',
            confirmButtonColor: '#d32f2f',
            timer: 4000,
            timerProgressBar: true,
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    }

    }
    
  

  return (
    <Modal
        keepMounted
        open={isDateModalOpen}
        onClose={handleClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box
          sx={{
            ...style,
            width: { xs: '90%', sm: '80%', md: '50%' },  // Ajusta el ancho dependiendo del tamaño de la pantalla
            maxWidth: '600px',  // Ancho máximo para evitar que el modal sea demasiado grande
            margin: 'auto',  // Centra el modal en la pantalla
            padding: { xs: 2, sm: 4 },  // Ajusta el padding en pantallas pequeñas
            borderRadius: 2,  // Suaviza los bordes
            boxShadow: 24,  // Añade sombra para mayor visibilidad
            overflow: 'auto',  // Permite el desplazamiento en pantallas pequeñas si es necesario
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontFamily: 'cursive',
              fontWeight: 'bold',
              letterSpacing: '0.1rem',
              textTransform: 'uppercase',
              color: 'primary.main',
              mb: 3,
              animation: 'jello 1s ease-out',
              fontSize: { xs: '1.2rem', sm: '1.5rem' }  // Ajusta el tamaño de la fuente para pantallas más pequeñas
            }}
          >
            Ingresa a Ergosanitas
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {
              userForm
                  .filter(field => field.formMode === formMode) // 1️⃣ filtra por el modo actual
                  .sort((a, b) => a.order - b.order) 
                  .map(({ type, name, placeholder, label, defaultValue, helperText }) => {
                  if (type === 'text' || type === 'password') {
                    return (
                      <Grid item xs={12} sm={formMode === "register" ? 12 : 6 } key={name}>
                        <InputText
                          control={control}
                          type={type}
                          name={name}
                          placeholder={placeholder}
                          label={label}
                          defaultValue={defaultValue}
                          helperText={helperText}
                          disabled={false}
                        />
                      </Grid>
                    );
                  }
                  throw new Error(`El Type: ${type}, NO es Soportado`);
                })}
            </Grid>


            {/* Enlace debajo de los campos */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link
                component="button" // hace que se comporte como botón
                variant="body2"    // tamaño y estilo del texto
                onClick={() => setFormMode(formMode === "register" ? "login" : "register")}
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline', color: 'primary.dark' },
                }}
              >
                {formMode === "register" 
                  ? "¿Ya tienes cuenta? Inicia sesión" 
                  : "¿No tienes cuenta? Regístrate"}
              </Link>
            </Box>

            <Grid
              container
              spacing={2}
              justifyContent="center"  // Centra los botones horizontalmente
              alignItems="center"  // Centra los botones verticalmente
              sx={{ mt: 2 }}  // Espaciado superior para los botones
            >
              <Grid item xs={12} sm={5}>
                <Button
                  onClick={onSubmit}
                  variant="contained"
                  sx={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05rem',
                    textTransform: 'uppercase',
                    borderRadius: '8px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#115293',
                    },
                  }}
                >
                  Ingresar
                </Button>
              </Grid>

              <Grid item xs={12} sm={5}>
                <Button
                  onClick={handleClose}
                  variant="contained"
                  sx={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05rem',
                    textTransform: 'uppercase',
                    borderRadius: '8px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#d32f2f',
                    },
                  }}
                >
                  Cancelar
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
  )
}

