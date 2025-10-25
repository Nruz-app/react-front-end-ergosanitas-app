
import { useCallback, useContext, useEffect, useState } from "react";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";

import { 
  BarCategoria, 
  CardEd, 
  PieChartLiga,
  BarLesiones,
  PieChartParteCuerpo,
  BarLesionesFecha,
  TableEm
} from "../components";
import { LoginContext } from "../../common/context";
import { UseIncidentesService } from "../../Incidentes/services/use-incidentes.service"; 

import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import AssistWalkerIcon from '@mui/icons-material/AssistWalker';
import Groups3Icon from '@mui/icons-material/Groups3';
import BodyMap from "../components/body/body-part-coordinates";
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export default function HomePage() {

  const { user }  = useContext( LoginContext );
  
  const [loading, setLoading] = useState(true);
  const [countIncidentes, setCountIncidentes] =  useState<number>(0);
  const [lesionFrecuente, setLesionFrecuente] =  useState<{tipo_lesion:string,cantidad:number}>( {tipo_lesion:"",cantidad:0} );
  const [ligaCasos, setLigaCasos] =  useState<{liga:string,cantidad:number}>( {liga:"",cantidad:0} );
  const [gravedadIncidentes, setGravedadIncidentes] =  useState<number>(0);


  const fetchServicios = useCallback(async () => {
      try {
        setLoading(true);
        const { 
          getIncidentesCountUser,
          getIncidentesLesionFrecuente,
          getIncidentesLigaCasos,
          getIncidentesGravedadUser
       } = await UseIncidentesService();
        const responseIC = await getIncidentesCountUser(user.user_email);
        const responseIL = await getIncidentesLesionFrecuente(user.user_email);
        const responseLC = await getIncidentesLigaCasos(user.user_email);
        const responseIG = await getIncidentesGravedadUser(user.user_email);

        setCountIncidentes(responseIC);
        setLesionFrecuente(responseIL);
        setLigaCasos(responseLC);
        setGravedadIncidentes(responseIG);

      } catch (error) {
        console.error('Error cargando incidentes:', error);
      }
      finally {
        setLoading(false);
      }
    }, [user.user_email]);
  
  
  useEffect(() => {
      fetchServicios();
  }, [fetchServicios]);


   if (loading) {
    return (
      <Box
        textAlign="center"
        py={5}
        sx={{
          bgcolor: "#f9f9f9",
          borderRadius: 3,
          boxShadow: 3,
          maxWidth: 500,
          mx: "auto",
          px: 3,
          mt: 5,
        }}
      >
        <CircularProgress color="primary" />
        <Typography
          variant="subtitle1"
          mt={2}
          sx={{
            color: "#333",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          Se está calculando la estadística.<br />
          Este proceso puede tardar algunos minutos. Gracias por su paciencia.
        </Typography>
      </Box>
    );
  }



  return (
    <Grid container>
      
      {/* Tu contenido principal debajo del header */}
      <Grid container spacing={3} mt={2} >
        {/* Total de Incidentes */}
        <Grid item xs={3} sm={3} md={3}>
          <CardEd
            icon={<HeartBrokenIcon sx={{ color: '#E53935' }} />}
            value={countIncidentes}
            label="Total de Incidentes"
            color="#FFF3E0"
          />
        </Grid>

        {/* Lesión Más Frecuente */}
        <Grid item xs={3} sm={3} md={3}>
          <CardEd
            icon={<AssistWalkerIcon sx={{ color: '#F4511E' }} />}
            value={`${lesionFrecuente.cantidad} (${lesionFrecuente.tipo_lesion})`}
            label="Lesión Más Frecuente"
            color="#FFF3E0"
          />
        </Grid>

        {/* Liga con Más Casos */}
        <Grid item xs={3} sm={3} md={3}>
          <CardEd
            icon={<Groups3Icon sx={{ color: '#8E24AA' }} />}
            value={`${ligaCasos.cantidad} (${ligaCasos.liga})`}
            label="Liga con Más Casos"
            color="#FFF3E0"
          />
        </Grid>

        {/* Liga con Más Casos */}
        <Grid item xs={3} sm={3} md={3}>
          <CardEd
            icon={<MedicalServicesIcon sx={{ fontSize: 40, color: 'green' }} />}
            value={ gravedadIncidentes }
            label="Lesiones Leves"
            color="#FBE9E7"
          />
        </Grid>

      </Grid>

      <Grid container spacing={2} mt={2} >
        <Grid item xs={12} sm={6} md={6}>
          <BarLesiones />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <PieChartParteCuerpo />
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={2} >
        <Grid item xs={12} sm={6} md={6}>
          <BarCategoria />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <PieChartLiga />
        </Grid>
      </Grid>

      

      <Grid container spacing={2} mt={2} >
        <Grid item xs={12} sm={6} md={6}>
          <BodyMap />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <BarLesionesFecha />
        </Grid>
        
      </Grid>

      <Grid item xs={12} sm={12} md={12} >
        <TableEm user_email = { user.user_email } />
      </Grid>
      
    </Grid>
  );
}
