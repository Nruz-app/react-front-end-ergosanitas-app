import React, { useCallback, useContext, useEffect, useState } from 'react';
import bodyImage from '../../../assets/body.png';
import { Box, Tooltip, Typography } from '@mui/material';
import { LigaData } from '../../interfaces/liga.interface';
import { UseIncidentesService } from '../../../Incidentes';
import { LoginContext } from '../../../common/context';


// Tipado para las coordenadas de cada parte del cuerpo
interface BodyPartCoordinates {
  [key: string]: { top: string; left: string };
}

const bodyPartCoordinates: BodyPartCoordinates = {
  'Cabeza': { top: '5%', left: '50%' },
  'Hombro': { top: '20%', left: '35%' },
  'Espalda': { top: '30%', left: '60%' },
  'Muñeca': { top: '40%', left: '20%' },
  'Muslo': { top: '53%', left: '60%' },
  'Rodilla': { top: '63%', left: '40%' },
  'Pierna': { top: '75%', left: '60%' },
  'Tobillo': { top: '85%', left: '45%' },
};

// Tipo para cada registro de lesión con cantidad
interface LesionData {
  parteCuerpo: string;
  Cantidad: number;
}

const BodyMap: React.FC = () => {
  const { user } = useContext(LoginContext);
  const { user_email } = user;

  const [lesiones, setLesiones] = useState<LesionData[]>([]);

  // Función para limpiar la parte del cuerpo y quitar el número entre paréntesis
  const cleanParteCuerpo = (parte: string) => parte.replace(/\s*\(\d+\)$/, '');

  const fetchSpEstadisticaParteCuerpo = useCallback(async () => {
    try {
      const { SpEstadisticaParteCuerpo } = await UseIncidentesService();
      const response: LigaData = await SpEstadisticaParteCuerpo(user_email);

      // Convertimos labels y data en un array de objetos { parteCuerpo, Cantidad }
      const mappedData: LesionData[] = response.labels.map((label, index) => ({
        parteCuerpo: label,
        Cantidad: response.data[index] || 0,
      }));

      setLesiones(mappedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [user_email]);

  useEffect(() => {
    fetchSpEstadisticaParteCuerpo();
  }, [fetchSpEstadisticaParteCuerpo]);

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Mapa Corporal de Lesiones
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: '300px',
          height: '600px',
          margin: '0 auto',
          backgroundImage: `url(${bodyImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {lesiones.map(({ parteCuerpo, Cantidad }) => {
          const parteLimpia = cleanParteCuerpo(parteCuerpo);
          if (!bodyPartCoordinates[parteLimpia]) return null;

          const coords = bodyPartCoordinates[parteLimpia];
          const scale = 1 + (Cantidad - 1) * 0.2;

          return (
            <Tooltip key={parteCuerpo} title={`${parteLimpia}: ${Cantidad} caso(s)`} arrow>
              <Box
                sx={{
                  position: 'absolute',
                  top: coords.top,
                  left: coords.left,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  width: 30,
                  height: 30,
                  bgcolor: 'error.main',
                  color: 'common.white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: `translate(-50%, -50%) scale(${scale + 0.2})`,
                  },
                }}
              >
                {Cantidad}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default BodyMap;
