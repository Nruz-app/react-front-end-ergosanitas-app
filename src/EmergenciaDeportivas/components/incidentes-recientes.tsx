import { Box, Card,  CardContent, Grid, Typography } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import HealingIcon from '@mui/icons-material/Healing';
import { IIncidentes } from "../../Incidentes/interface/incidentes.interface";

interface Props {
  incidentes : IIncidentes
}



export const IncidentesRecientes = ({ incidentes }: Props) => {

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Card
        sx={{
          width: '80%',
          p: 2,
          borderRadius: 4,
          boxShadow: 6,
          backgroundColor: '#f9f9f9',
        }}
      >
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: 'center' }}
          >
            Fractura de tibia durante partido - {}{new Date(incidentes.created_at!).toLocaleDateString()}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            
            <Grid item xs={12} sm={3}>
              <Box display="flex" alignItems="center">
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">{incidentes.nombres}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Box display="flex" alignItems="center">
                <SportsSoccerIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body1">{incidentes.deporte}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Box display="flex" alignItems="center">
                <HealingIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body1">{incidentes.tipo_lesion}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Box display="flex" alignItems="center">
                <VolunteerActivismIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body1">Gravedad - {incidentes.gravedad}</Typography>
              </Box>
            </Grid>

          </Grid>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }} gutterBottom>
                Descripción:
            </Typography>
            {incidentes.descripcion}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }} gutterBottom>
              Primeros Auxilios:
            </Typography>
            {incidentes.primeros_auxilios}
            </Grid>

          </Grid>
        </CardContent>

      </Card>
    </Box>
  );
}
