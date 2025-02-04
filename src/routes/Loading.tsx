import { Box, CircularProgress, Typography } from "@mui/material"


export const Loading = () => {
  return (
    <Box
        sx={{
        bgcolor: '#121212',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        }}
    >
        <Box
            sx={{
                display: 'flex',
                gap: 2,
            }}
        >
            <CircularProgress size={60} />
            <CircularProgress size={60} color="secondary" />
            <CircularProgress size={60} color="success" />
            <CircularProgress size={60} color="info" />
            <CircularProgress size={60} color="error" />
            <CircularProgress size={60} color="warning" />
        </Box>
        <Typography
            variant="h6"
            sx={{
                color: '#fff',
                mt: 3,
                fontFamily: 'Arial, sans-serif'
            }}
        >
            Cargando, Por Favor Espera...
        </Typography>
    </Box>
  )
}
