import { Box, Typography } from "@mui/material"
import { Gallery } from "react-grid-gallery";


/**************************************************************
* * Link 
* * - https://www.npmjs.com/package/react-grid-gallery
* * Instalar 
* * - npm install react-grid-gallery
*************************************************************/

import images from '../config/list-gallery.json'; 

export const GalleryImage = () => {

  return (
    <Box ml={ 4 } mr={ 4 } mt={ 2 } sx={{ flexGrow: 1 }} >

   <Typography
      variant="h5"
      align="center"
      sx={{
         fontFamily: 'cursive',
         fontWeight: 'bold',
         letterSpacing: '0.15rem',
         textTransform: 'uppercase',
         color: 'secondary.main',
         mb: 3,
         animation: 'bounceOutRight 1s ease-in-out',
         textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
      }}
   >
      Conoces Nuestro Trabajo Por el Bienestar de tu Corazón
   </Typography>

    <Gallery 
      images={images} 
      enableImageSelection={false} // Desactiva la selección de imágenes si no es necesaria
      rowHeight={240} // Ajusta la altura de las filas
      margin={5} // Espaciado entre imágenes
    />

    </Box>
  )
}
