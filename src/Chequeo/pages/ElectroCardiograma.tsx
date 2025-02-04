import { Box, Typography } from "@mui/material"
import { ElectroCardiogramaForm } from "../components";

interface Props {
    rut_paciente : string;
    url_pdf : string;
    handleUpdateStatus : (status : number, rut_paciente : string) => void;
}

export const ElectroCardiograma = ({ rut_paciente,url_pdf,handleUpdateStatus }: Props) => {


    return (
        <Box ml={ 15 } mt={ 8 } sx={{ flexGrow: 1 }} >
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
                    animation: 'fadeOutRight 1s ease-out' 
                }}
                >
                Electro Cardiograma
            </Typography>
            {
                <ElectroCardiogramaForm
                  rut_paciente = { rut_paciente }
                  url_pdf = { url_pdf }
                  handleUpdateStatus = { handleUpdateStatus } 
                />
            }
            
        </Box>   
    )
}



