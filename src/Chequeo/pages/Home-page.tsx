import { Grid } from "@mui/material"

import { FileUploadLogo,StatisticsGlobal, FormPerfil, ModalStatus } from '../components';
import { useContext } from "react";
import { LoginContext } from "../../common/context";
import { BarPresionPage, PieChartHemoglucotest, PieChartIMC, PieChartSaturacion } from "../../Estadisticas/pages/";

export const HomePage = () => {

  const { user }  = useContext( LoginContext );
  const { user_email,user_logo }  = user;
    
  return (
    <Grid container spacing={2}>
      {/* Primera Fila */}
      <Grid item xs={12} sm={12} md={6}>
        <FileUploadLogo 
          user_email={user_email} 
          user_logo={user_logo ? user_logo : ''} 
        />
        <FormPerfil
          user_email={user_email} />
      </Grid>
  
      <Grid item xs={12} sm={12} md={6}>  {/* Esto hace que ocupe 1/3 en pantallas medianas (md) */}
          <StatisticsGlobal />
      </Grid>

      {/* Segunda Fila */}
      <Grid item xs={12} sm={12} md={6} >
          <BarPresionPage />
      </Grid>
      <Grid item xs={12} sm={12} md={6} >
          <PieChartHemoglucotest />
      </Grid>
      {/* Tercera Fila */}
      <Grid item xs={12} sm={12} md={6} >
          <PieChartIMC />
      </Grid>
      <Grid item xs={12} sm={12} md={6} >
          <PieChartSaturacion />
      </Grid>
      
      {/* Modal Barra Presion */}
      <ModalStatus />    
    </Grid>
    
  )
}
