import { Grid } from "@mui/material"

import { FileUploadLogo,StatisticsGlobal,CalculadoraImc, FormPerfil } from '../components';
import { useContext } from "react";
import { LoginContext } from "../../common/context";
import { BarPresionPage, PieChartIMC } from "../../Estadisticas/pages/";

export const HomePage = () => {

  const { user }  = useContext( LoginContext );
  const { user_email,user_logo }  = user;
    
  return (
    <Grid container spacing={3}>
      {/* Primera Fila */}
      <Grid item xs={12} sm={6} md={6}>
        <FileUploadLogo 
          user_email={user_email} 
          user_logo={user_logo ? user_logo : ''} 
        />
        <FormPerfil
          user_email={user_email} />
      </Grid>
  
      <Grid item xs={12} sm={6} md={6}>  {/* Esto hace que ocupe 1/3 en pantallas medianas (md) */}
          <StatisticsGlobal />
      </Grid>

      {/* Segunda Fila */}
      <Grid item xs={12} sm={6} md={6} >
          <PieChartIMC />
      </Grid>
      <Grid item xs={12} sm={6} md={6} >
          <CalculadoraImc />
      </Grid>
      
      {/* Modal Barra Presion */}
      <BarPresionPage />    
    </Grid>
    
  )
}
