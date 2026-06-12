import { Avatar, Box, Typography } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';

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
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                    flexShrink: 0
                }}
            >
                <PersonIcon fontSize="small" />
            </Avatar>
            <Box
                sx={{
                    marginRight: 2,
                    padding: '12px 16px',
                    backgroundColor: 'indigo.700',
                    borderRadius: '12px',
                    boxShadow: 2,

                    maxWidth: {
                        xs: '75%',
                        sm: '70%',
                        md: '60%',
                    },

                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',

                    transition: 'background-color 0.3s ease',

                    '&:hover': {
                        backgroundColor: 'indigo.800',
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
