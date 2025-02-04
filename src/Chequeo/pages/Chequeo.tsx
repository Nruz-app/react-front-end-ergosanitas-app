import { Box, Typography } from "@mui/material"
import { ChequeoForm, ChequeoFormUpdate } from "../components"

interface Props  {
  rut_paciente : string;
  handleUpdateStatus : (status : number, rut_paciente : string) => void;
}


export const Chequeo = ({ rut_paciente,handleUpdateStatus }: Props) => {


  


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
            Chequeo Preventivo Cardiovascular
        </Typography>
        {
          (!rut_paciente) ?
            <ChequeoForm
              handleUpdateStatus = { handleUpdateStatus } 
            />
          :
            <ChequeoFormUpdate 
              rut_paciente = { rut_paciente }
              handleUpdateStatus = { handleUpdateStatus } 
            />
        }
        
      </Box>   
  )
}
