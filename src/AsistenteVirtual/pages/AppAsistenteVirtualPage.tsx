
//import { AsistenteVirtual } from "./";
import { Box, Typography } from '@mui/material';
import { AssistantPage } from '../../presentation/pages/assistant/AssistantPage';


export const AppAsistenteVirtualPage = () => {


    return (
        <Box ml={ 10 } mr={ 10 }  >
            <Typography
                variant="h4"
                align="center"
                sx={{
                    fontFamily: 'cursive',
                    fontWeight: 'bold',
                    letterSpacing: '0.1rem',
                    textTransform: 'uppercase',
                    color: 'primary.main',
                    mb: 3,
                    mt: 4,
                    animation: 'flip 1s ease-out'
                }}
            >
                Asistente Virtual
            </Typography>
            <AssistantPage />
        </Box>
    )

}

export default AppAsistenteVirtualPage;