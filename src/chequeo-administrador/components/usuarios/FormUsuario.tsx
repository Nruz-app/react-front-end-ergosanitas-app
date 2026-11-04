import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import Swal from 'sweetalert2';

import { useUsuarioForm } from '../../hooks';
import type { INuevoUsuario } from '../../interface';
import { UseUsuarioService } from '../../services';
import { camposUsuario } from '../../utilities';
import { ButtonsForm, InputSelect, InputText } from '../forms';

/**
 * Tab «Crear usuario»: alta de un usuario con nombre, email, contraseña y perfil.
 *
 * Clon de `src/User/components/form-user.tsx`. Cambios:
 *
 * - **El botón pasa por `handleSubmit`** (D4): el original llamaba a `onSubmit` directo, así que
 *   `required` y `email` del JSON no se comprobaban nunca.
 * - Un fallo del backend se avisa; el original solo avisaba del éxito.
 * - El título deja la errata «Ingre Un Nuevo Perfil» (§6.2).
 *
 * ⚠️ El perfil arranca en **Administrador** (`"1"`) y la lista no ofrece `Medicos` ni
 * `Paciente` (D5 a: paridad en la 01). Un alta descuidada crea un Administrador; los rótulos
 * dicen siempre «Club Deportivo». Ambos van en su propia spec.
 */
export const FormUsuario = () => {

    const { control, handleSubmit, getValues, reset, defaults } = useUsuarioForm();

    const [btnStatus, setBtnStatus] = useState(false);

    const onSubmit = async () => {

        setBtnStatus(true);

        const { nombre_user, email_user, password_user, perfil_user } = getValues();
        const nuevo: INuevoUsuario = { nombre_user, email_user, password_user, perfil_user };

        try {
            const { PostUserSave } = await UseUsuarioService();
            const response = await PostUserSave(nuevo);

            if (response.success) {
                Swal.fire({
                    title            : 'Nuevo Usuario',
                    text             : 'Se ha Creado el Usuario con Exito!!!',
                    timer            : 2000,
                    timerProgressBar : true,
                });
                reset(defaults);
            }
            else {
                Swal.fire({ title: 'No se creó el usuario', text: response.message, icon: 'warning' });
            }
        }
        catch (problema) {
            console.error('Error al crear el usuario:', problema);
            Swal.fire({
                title : '❌ No se pudo crear el usuario',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
        finally {
            setBtnStatus(false);
        }
    };

    const enviar = handleSubmit(onSubmit);

    return (
        <Box sx={{ flexGrow: 1, py: 4, mx: 'auto', maxWidth: { xs: '100%', md: '80%' } }}>
            <Typography
                component="h2"
                variant="h4"
                align="center"
                sx={{
                    fontWeight    : 'bold',
                    letterSpacing : '0.1rem',
                    textTransform : 'uppercase',
                    color         : 'primary.main',
                    fontSize      : { xs: 20, md: 30 },
                    mb            : 3,
                }}
            >
                Ingrese un nuevo perfil
            </Typography>

            <form onSubmit={enviar} noValidate>
                <Grid container justifyContent="center" spacing={3}>
                    {camposUsuario.map(({ type, name, placeholder, label, helperText, values }) => {

                        const nombre = name as keyof INuevoUsuario;

                        if (type === 'text' || type === 'password') {
                            return (
                                <Grid item xs={12} sm={6} key={name}>
                                    <InputText
                                        control={control}
                                        type={type}
                                        name={nombre}
                                        placeholder={placeholder}
                                        label={label}
                                        helperText={helperText}
                                        disabled={false}
                                    />
                                </Grid>
                            );
                        }

                        if (type === 'selected') {
                            return (
                                <Grid item xs={12} sm={6} key={name}>
                                    <InputSelect
                                        control={control}
                                        name={nombre}
                                        placeholder={placeholder}
                                        label={label}
                                        helperText={helperText}
                                        values={values ?? []}
                                        disabled={false}
                                    />
                                </Grid>
                            );
                        }

                        throw new Error(`El type "${type}" no está soportado en «Crear usuario».`);
                    })}

                    <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
                        <ButtonsForm onSubmit={enviar} title="Ingresar" btnStatus={btnStatus} />
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};
