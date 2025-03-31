import { Box, CircularProgress } from "@mui/material"



export const LoadingTable = () => {
  return (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            width: '100%',
            height: '200px', // Puedes ajustar la altura según lo que necesites
            textAlign: 'center',
            bgcolor: 'transparent',// Fondo transparente para que no interfiera con el diseño de la tabla
        }}
    >
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 3, // Espaciado entre los loaders
                animation: 'spin 2s infinite linear', // Animación de giro
                transform: 'rotate(0deg)', // Asegura que la animación de giro sea coherente
            }}
        >
            <CircularProgress size={40} color="primary" />
            <CircularProgress size={40} color="secondary" />
            <CircularProgress size={40} color="success" />
        </Box>
    </Box>
  )
}
