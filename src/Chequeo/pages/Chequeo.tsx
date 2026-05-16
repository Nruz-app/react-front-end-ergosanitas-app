import { Box, Typography } from "@mui/material"
import { ChequeoForm, ChequeoFormUpdate } from "../components"

interface Props  {
  rut_paciente : string;
  id_paciente  : number;
  handleUpdateStatus : (status : number, rut_paciente : string, id_paciente : number) => void;
  handleReloadTable: () => void;
}


export const Chequeo = ({ rut_paciente,id_paciente,handleUpdateStatus, handleReloadTable }: Props) => {

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
              handleReloadTable = { handleReloadTable }
            />
          :
            <ChequeoFormUpdate 
              rut_paciente = { rut_paciente }
              id_paciente = { id_paciente }
              handleUpdateStatus = { handleUpdateStatus } 
              handleReloadTable = { handleReloadTable }
            />
        }
        
      </Box>   
  )
}
