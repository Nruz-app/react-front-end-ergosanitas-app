import { useContext } from 'react';
import { Grid } from '@mui/material';

import { LoginContext } from '../../../common/context';
import { FormCredenciales } from './FormCredenciales';
import { TarjetaLogo } from './TarjetaLogo';

/**
 * Tab «Mi cuenta»: logo del usuario y cambio de contraseña y Ergo Pass.
 *
 * Clon 1:1 de `perfil-usuario/` (D6 a). Es la pantalla que el usuario señaló como «casi vacía»
 * en la captura; su rediseño es la Spec 02, no esta.
 */
export const MiCuenta = () => {

    const { user } = useContext(LoginContext);
    const { user_email, user_logo } = user;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} lg="auto">
                <TarjetaLogo user_email={user_email} user_logo={user_logo ?? ''} />
            </Grid>
            <Grid item xs={12} lg="auto">
                <FormCredenciales user_email={user_email} />
            </Grid>
        </Grid>
    );
};
