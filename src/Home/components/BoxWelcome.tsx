import { Box, Card, CardContent, Typography } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';

/** 
 * * Link 
 * * - https://animate.style/
 * * - https://www.npmjs.com/package/react-type-animation
 * * Instalar 
 * * - npm install animate.css --save
 * * - npm i react-type-animation
*/
import 'animate.css';


const textoDescrion = [
  'Somos una empresa líder en la toma de examenes de electrocardiograma (ECG) diseñados para proporcionar diagnósticos precisos y oportunidades de intervención temprana.',
  1000,
  'Nuestros equipos están respaldados por décadas de experiencia en el area de la Salud  y las últimas tecnología en monitoreo cardíaco,nuestros servicios ofrecen soluciones confiables para nuestros clientes en todo el mundo.',
  1000, // wait 1s before rep
];

export const BoxWelcome = () => {
  return (
    <Box mt={ 1 } sx={{ flexGrow: 1,textAlign: 'center' }} >    
      <Card sx={{
          margin: 'auto',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: '15px',
          background: 'linear-gradient(135deg, #aed6f1, #2980b9)',
          padding: '20px',
        }}
      >
          <CardContent>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'cursive',
                  letterSpacing: '.2rem',
                  color: 'white',
                  textTransform: 'uppercase',
                  animation: 'zoomInDown 1s ease-out'
                }}
              >
                Bienvenidos a Ergo Sanitas SPA
              </Typography>
            <Box sx={{ textAlign: 'justify',color: 'white' }} >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Roboto, sans-serif',
                  lineHeight: 1.6,
                  color: 'white',
                }}
              >
                <TypeAnimation
                  sequence= { textoDescrion }
                  wrapper="span"
                  speed={65}
                  repeat={Infinity}
                  omitDeletionAnimation={true}
                >

                </TypeAnimation>
                </Typography>
            </Box>
          </CardContent>
      </Card> 
    </Box>
  )
}
