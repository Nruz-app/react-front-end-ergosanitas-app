import { Box, Typography } from "@mui/material"

import 'react-multi-carousel/lib/styles.css';


import { SearchServicios } from "./SearchServicios";


export const BoxServicios = () => {
  return (
    <Box
      sx={{
        display: 'flex', // Usa flexbox para dividir la pantalla
        flexDirection: 'row', // Alinea los hijos horizontalmente
      }} 
    >
    <Box
        sx={{
          flex: 5, // 40% del espacio disponible
          flexDirection: 'column', // Alinea verticalmente los elementos internos
          justifyContent: 'center', // Centra el contenido verticalmente
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
            Descubre Nuestro Pack Médico Exclusivo y Una Amplia Variedad de Servicios de Salud
        </Typography>

        <img
            src="/banner01.jpg"
            alt="Logo Google"
            height={400}
            width={700}
        />    


    </Box>
    <Box
        sx={{
          flex: 5, // 50% del espacio disponible
          display: 'flex', // Asegura que el contenido interno use flexbox
          flexDirection: 'column', // Alinea verticalmente los elementos internos
          justifyContent: 'center', // Centra el contenido verticalmente
          alignItems: 'center', // Centra el contenido horizontalmente
          padding: 2,
        }}
        
      >
        <SearchServicios
          style={{
            position: 'relative',
          }}
        />
        
      </Box>
    </Box>
  )
}
