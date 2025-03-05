import { Box, Card, Stack, Typography } from "@mui/material"

export const StatisticsSex = () => {
  return (
    <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: 1,
    }}
  >
    <Card
      sx={{
        textAlign: "center",
        borderRadius: 3,
        boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.15)",  // Sombra más suave
        display: "flex",
        flexDirection: "column",  // Se mantiene como columna para todo el card
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #e0e0e0",
      }}
    > 
      {/* Stack con dirección row para que las imágenes estén una al lado de la otra */}
      <Stack direction="row" alignItems="center" spacing={4} justifyContent="center">
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: "text.secondary",
            mb: 1,
          }}
        >
          10
        </Typography>
        <img
          src="/public/masculino.jpg"
          alt="Masculino"
          style={{
            height: "300px",  // Fija la altura de la imagen
            width: "120px",   // Ajusta el ancho para un tamaño más proporcionado
            objectFit: "cover", // Asegura que la imagen cubra sin distorsión
            borderRadius: "8px", // Bordes redondeados para las imágenes
          }}
        />
      </Box>

      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: "text.secondary",
            mb: 1,
          }}
        >
          8
        </Typography>
        <img
          src="/public/hembra.png"
          alt="Femenino"
          style={{
            height: "300px",  // Fija la altura de la imagen
            width: "120px",   // Ajusta el ancho para un tamaño más proporcionado
            objectFit: "cover", // Asegura que la imagen cubra sin distorsión
            borderRadius: "8px", // Bordes redondeados para las imágenes
          }}
        />
      </Box>
    </Stack>
    </Card>
  </Box>
  
  )
}
