import { Grid } from "@mui/material"

import { FileUploadLogo,StatisticsGlobal,CalculadoraImc } from '../components';
import { useContext } from "react";
import { LoginContext } from "../../common/context";
import { PieChartIMC } from "../../Estadisticas/pages/PieChart";

export const HomePage = () => {

  const { user }  = useContext( LoginContext );
  const { user_email,user_logo }  = user;
    
  return (
    <Grid container spacing={2}>
      {/* Primera Fila */}
      <Grid item xs={12} sm={6} md={4}>
        <FileUploadLogo 
          user_email={user_email} 
          user_logo={user_logo ? user_logo : ''} 
        />
      </Grid>
  
      <Grid item xs={12} sm={6} md={8}>  {/* Esto hace que ocupe 1/3 en pantallas medianas (md) */}
        <StatisticsGlobal />
      </Grid>
      {/* Segunda Fila */}
      <Grid item xs={12} sm={6} md={6} >
          <PieChartIMC />
      </Grid>
      <Grid item xs={12} sm={6} md={6}>  
        <CalculadoraImc />
      </Grid>
      
    </Grid>

  )
}
