import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { isMobile } from 'react-device-detect';

//Link Documentacion 
//https://swiperjs.com/demos

// Import Swiper styles
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';


import listCardJson from '../../../config/list-card.json';

import imgEcgDomicilio from '/assets/images/ECGDomicilio.jpg';
import imgServicioEnfermeria from '/assets/images/ServicioEnfermeria.jpg';
import imgChequeoAdultoMayor from '/assets/images/chequeoAdultoMayor.jpg';
import imgChequeoDeportista from '/assets/images/chequeoDeportistas.jpg';




const imgCardList = [
  imgEcgDomicilio,
  imgServicioEnfermeria,
  imgChequeoAdultoMayor,
  imgChequeoDeportista
];
import { useNavigate } from "react-router-dom";


export const CarouserServer = () => {

  const navigate = useNavigate();

  const handleServices = (idService: number) => {

    navigate(`/agendarHora/${idService}`); 

  }



  return (
    <Box
      sx={{
        px: 4,
        py: 6,
        backgroundColor: '#f7f9fc',
        borderRadius: 4,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          letterSpacing: '0.1rem',
          textTransform: 'uppercase',
          color: 'primary.main',
          mb: 4,
          animation: 'backInLeft 1s ease-out',
        }}
      >
        Solicita Nuestros Servicios y Sé Parte de Nuestras Alianzas
      </Typography>

      <Swiper 
        spaceBetween={20}
        slidesPerView={isMobile ? 1 : 3}
        className="mySwiper"
        modules={[Autoplay]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
      >

        {listCardJson.map(({ id, img, title, description }) => (
          <SwiperSlide key={id}>
            
            <Card
               onClick={() => handleServices(1)}  
              sx={{
                maxWidth: 300,
                margin: '0 auto',
                borderRadius: 4,
                boxShadow: 4,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  image = { imgCardList[img] }
                  alt={ title }
                />
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    { title }
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'justify' }}
                  >
                    { description }
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
