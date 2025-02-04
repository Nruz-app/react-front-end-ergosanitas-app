
import { Box,  Card, CardContent, Grid, Typography } from "@mui/material"

import ThermostatIcon from '@mui/icons-material/Thermostat';

export const EstadisticasPage = () => {
  return (
    <Box
    sx={{
      width: '40%',
      position: 'relative',
      overflow: { xs: 'auto', sm: 'initial' },
      display: 'flex',
      justifyContent: 'center',
      padding: 2,
    }}
  >
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #00bcd4 30%, #0288d1 90%)',
        color: 'white',
        borderRadius: 3,
        padding: 2,
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: 'scale(1)',
        animation: 'fadeIn 0.6s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)',
        },
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
      }}
    >
      <ThermostatIcon sx={{ fontSize: 40, color: 'white', marginRight: 2 }} />
      <CardContent sx={{ flex: '1 0 auto' }}>
        <Typography sx={{ fontSize: '1.8rem', fontWeight: 'bold', mb: 1 }}>
          Temperatura
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, marginTop: 1 }}>
          <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={6} sm={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Última
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6}>
              <Typography variant="subtitle1">36,5</Typography>
            </Grid>

            <Grid item xs={6} sm={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Máxima
              </Typography>
            </Grid>
            <Grid item xs={6} sm={6}>
              <Typography variant="subtitle1">40,2</Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  </Box>
  )
}
