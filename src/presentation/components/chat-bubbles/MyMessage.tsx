import { Avatar, Box, Typography } from "@mui/material";

interface Props {
    text : string;
}

export const MyMessage = ({text}:Props) => {
  return  (
        <Box 
            sx={{
                padding: 2,
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'row-reverse',
                borderRadius: '8px',
                backgroundColor: 'transparent',
            }}
        >
            <Avatar 
                sx={{ 
                    backgroundColor: 'indigo.500',
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    fontSize: '1.25rem',  // Aumenta el tamaño de la letra en el avatar
                }}
            >
                U
            </Avatar>
            <Box 
                sx={{
                    marginLeft: 2,
                    padding: '12px 16px',  // Aumentar el padding para más espacio
                    backgroundColor: 'indigo.700',
                    borderRadius: '12px',
                    boxShadow: 2,
                    transition: 'background-color 0.3s ease',  // Efecto de transición
                    '&:hover': {
                        backgroundColor: 'indigo.800',  // Color más oscuro en hover
                    },
                }}
            >
                <Typography 
                    variant="body2" 
                    sx={{
                        lineHeight: 1.5,  // Mejora la legibilidad
                    }}
                >
                    {text}
                </Typography>
            </Box>
        </Box>
  )
}
