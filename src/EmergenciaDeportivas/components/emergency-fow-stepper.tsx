import { Box, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';

const steps = [
  {
    label: 'Identificación de Emergencia',
    icon: <SearchIcon sx={{ color: '#D32F2F' }} />,
    color: '#FFCDD2',
  },
  {
    label: 'Activación de Protocolos',
    icon: <NotificationsActiveIcon sx={{ color: '#1976D2' }} />,
    color: '#BBDEFB',
  },
  {
    label: 'Evaluación Inicial y Primeros Auxilios',
    icon: <MedicalServicesIcon sx={{ color: '#388E3C' }} />,
    color: '#C8E6C9',
  },
  {
    label: 'Estabilización del Deportista',
    icon: <SportsKabaddiIcon sx={{ color: '#FBC02D' }} />,
    color: '#FFF9C4',
  },
  {
    label: 'Registro de Datos del Incidente',
    icon: <AssignmentIcon sx={{ color: '#9C27B0' }} />,
    color: '#E1BEE7',
  },
  {
    label: 'Notificación a',
    icon: <GroupIcon sx={{ color: '#00897B' }} />,
    color: '#B2DFDB',
  },
];

export const EmergencyFlowStepper = () => {

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      {steps.map((step, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid',
            borderColor: '#ccc',
            borderRadius: 2,
            p: 2,
            mb: 2,
            backgroundColor: step.color,
          }}
        >
          <Box sx={{ mr: 2 }}>{step.icon}</Box>
          <Typography fontWeight="bold">{step.label}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default EmergencyFlowStepper;
