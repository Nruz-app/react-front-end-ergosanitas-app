import { Box, Card, Typography, useTheme } from "@mui/material"
import PageContainer from "../../AgendarHora/container/PageContainer"


import { Logo,GoogleOAuth } from '../components';


export const AppLoginGooglePage = () => {

    /********************************************************************************************** 
    * * Este hook es útil cuando deseas aplicar o consultar propiedades específicas del tema global 
    * * (por ejemplo, colores, tipografías, o espacios) dentro de un componente. Te permite hacer 
    * * que los estilos sean coherentes con el tema de Material-UI.
    ************************************************************************************************/

  const theme = useTheme();

  return (
    <PageContainer title="Login" description="this is Login page">
        <Box
            sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.background.default,
                    "&:before": {
                    content: '""',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    backgroundSize: "200% 200%",
                    animation: "gradient 10s ease infinite",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0.6,
                    zIndex: -1,
                },
            }}
        >
            <Card
                elevation={12}
                sx={{
                    p: 4,
                    width: "100%",
                    maxWidth: "450px",
                    mx: 2,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
            >
                 <Box display="flex" justifyContent="center" mb={2}>
                    <Logo />
                 </Box>
                 <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    mt={ 3 }
                >
                    <Typography 
                        variant="h6" 
                        align="center" 
                        sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                        Bienvenido a Ergosanitas
                    </Typography>

                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        mb={2}
                        
                    >
                        <GoogleOAuth />
                    </Box>
                </Box>
            
            </Card>    
        
        </Box>

    </PageContainer>
  )
}
