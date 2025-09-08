import { useContext, useCallback, useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";

import { LoginContext } from "../../common/context";
import { CardEd, TableEm } from "../components";
import { UseIncidentesService } from "../../Incidentes/services/use-incidentes.service"; // Adjust the path as needed

import Groups3Icon from '@mui/icons-material/Groups3';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import { PieChartLiga,BarCategoria } from "../components/";

export const HomePage = () => {

  const { user }  = useContext( LoginContext );
  const [countIncidentes, setCountIncidentes] =  useState<number>(0);
  const [gravedadIncidentes, setGravedadIncidentes] =  useState<number>(0);
  const [ligaIncidentes, setLigaIncidentes] =  useState<number>(0);

   const fetchServicios = useCallback(async () => {
      try {
        const { getIncidentesCountUser,getIncidentesGravedadUser,getIncidentesLigaUser } = await UseIncidentesService();
        const responseIC = await getIncidentesCountUser(user.user_email);
        const responseIG = await getIncidentesGravedadUser(user.user_email);
        const responseIL = await getIncidentesLigaUser(user.user_email);

        setCountIncidentes(responseIC);
        setGravedadIncidentes(responseIG);
        setLigaIncidentes(responseIL);


      } catch (error) {
        console.error('Error cargando incidentes:', error);
      }
    }, [user.user_email]);
  
  
  useEffect(() => {
      fetchServicios();
  }, [fetchServicios]);

    return (
     <Grid container spacing={3}>
      <Grid item xs={12} sm={12} md={12} mt={2}>
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
                  Emergencias Deportivas
            </Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} mt={2}>
        <CardEd
          icon={<HeartBrokenIcon sx={{ fontSize: 40, color: 'red' }} />}
          value={ countIncidentes  }
          label="Total de Incidentes"
          color="#FFF3E0"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} mt={2}>
        <CardEd
          icon={<Groups3Icon sx={{ fontSize: 40, color: 'orange' }} />}
          value={ ligaIncidentes }
          label="Clubes Involucrados"
          color="#FFF8E1"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} mt={2}>
        <CardEd
          icon={<MedicalServicesIcon sx={{ fontSize: 40, color: 'green' }} />}
          value={ gravedadIncidentes }
          label="Lesiones Leves"
          color="#FBE9E7"
        />
      </Grid>
      
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} sm={6} md={6}>
          <PieChartLiga />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <BarCategoria />
        </Grid>
      </Grid>

      <Grid item xs={12} sm={12} md={12}>
        <TableEm user_email = { user.user_email } />
      </Grid>
    </Grid>
  )
   

}

export default HomePage;