import { CardActionArea, CardContent, Typography, Divider, Box } from "@mui/material"
import InfoIcon from '@mui/icons-material/Info';

export const CardIdentificacionEmerfencia = () => {
  return (
    <>
    <CardActionArea>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ color: '#1976D2', fontSize: 30, mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                    Identificación de Emergencia
                </Typography>
            </Box>

            <Typography variant="body1" gutterBottom>
                Primer paso crucial donde se detecta y reconoce una situación de emergencia.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }} gutterBottom>
                Acciones clave:
            </Typography>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Reconocer signos de emergencia (inconsciencia, dificultad respiratoria, dolor intenso)</li>
                <li>Alertar inmediatamente al personal capacitado</li>
                <li>Asegurar la zona para prevenir más accidentes</li>
                <li>Evaluar rápidamente la gravedad de la situación</li>
            </ul>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }} gutterBottom>
                Responsables:
            </Typography>
            <Typography variant="body2">
                Entrenadores, personal médico, cualquier miembro del equipo presente.
            </Typography>
        </CardContent>
    </CardActionArea>
    </>
  )
}
