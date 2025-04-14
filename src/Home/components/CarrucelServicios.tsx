import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material"

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';


import imgEcgDomicilio from '/assets/images/ECGDomicilio.jpg';
import imgServicioEnfermeria from '/assets/images/ServicioEnfermeria.jpg';
import imgChequeoAdultoMayor from '/assets/images/chequeoAdultoMayor.jpg';
import imgChequeoDeportista from '/assets/images/chequeoDeportistas.jpg';

/*
* * Link
* * - https://www.npmjs.com/package/react-multi-carousel
*/

import listCardJson from '../config/list-card.json';

const imgCardList = [
    imgEcgDomicilio,
    imgServicioEnfermeria,
    imgChequeoAdultoMayor,
    imgChequeoDeportista
];

/*
const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3 // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2 // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1 // optional, default to 1.
    }
  };
  */

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3 // optional, default to 1.
    }    
  };

export const CarrucelServicios = () => {
  return (
    <Box
        sx={{
            flex: 6, // 60%
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
          }} 
    >
        <Typography
            variant="h5"
            align="center"
            sx={{
                fontFamily: 'cursive',
                fontWeight: 'bold',
                letterSpacing: '0.1rem',
                textTransform: 'uppercase',
                color: 'primary.main',
                mb: 3,
                animation: 'backInLeft 1s ease-out' 
            }}
            >
            Solicita Nuestros Servicios y Se Parte de Nuestras Alianzas
        </Typography>

        <Carousel
            responsive={responsive}
            autoPlay={true}
            infinite={true}
            autoPlaySpeed={2000}
            containerClass="carousel-container"
            arrows={false}
            renderButtonGroupOutside={true}
        >
        {
            listCardJson.map ( ({ id, img,title,description}) => (

                <Card 
                    key={ id }
                    sx={{ 
                        maxWidth: 300, 
                        boxShadow: 3, 
                        borderRadius: 3, 
                    }}
                > 
                    <CardActionArea>
                        <CardMedia
                            component="img"
                            image={ imgCardList[ img ] }
                            alt= { title }
                            sx={{
                                height: 200,
                                width: 250,
                                objectFit: 'cover',
                                borderRadius: '8px',
                                margin: 2,
                                top: 2
                            }}
                        />
                    </CardActionArea>
                    <CardContent>
                        <Typography
                            variant="body2"
                            color="purple"
                            sx={{ 
                                textAlign: 'justify', 
                                lineHeight: 1.6 
                            }}
                        >
                        { description }
                        </Typography>
                    </CardContent>    
                </Card>            
            ) )
        }    
                   
        </Carousel>
    </Box>
  )
}
