import { Grid } from "@mui/material"

import { StatisticsGlobal,ModalStatus } from '../components';
import { BarPresionPage, PieChartHemoglucotest, PieChartIMC, PieChartSaturacion } from "../../Estadisticas/pages/";

export const HomePage = () => {
  
  return (
    <Grid container spacing={2}>
      {/* Primera Fila */}   
      <Grid item xs={12} sm={12} md={12}>  
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
