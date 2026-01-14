import { Grid } from "@mui/material"

import { FileUploadLogo, FormPerfil } from '../';
import { useContext } from "react";
import { LoginContext } from "../../../common/context";

export const PerfilUsuario = () => {

  const { user }  = useContext( LoginContext );
  const { user_email,user_logo }  = user;
    
  return (
    <Grid container spacing={2}>
      {/* Primera Fila */}
      {/* <Grid item xs={12} sm={12} md={12}> */}
        <FileUploadLogo 
          user_email={user_email} 
          user_logo={user_logo ? user_logo : ''} 
        />
        <FormPerfil
          user_email={user_email} />
     {/* </Grid> */}

    </Grid>
    
  )
}
