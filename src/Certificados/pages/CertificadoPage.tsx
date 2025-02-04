import { useContext } from "react";
import { MarqueeHome } from "../../Home/components";

import {  Certificado, DownloadFile } from '../components/';
import { CertificadoContext } from "../context/";
import { Box, Typography } from "@mui/material";


export const CertificadoPage = () => {

  const { isValidRut }  = useContext( CertificadoContext );

  return (
   <>
    <MarqueeHome dirrection='left'/>
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
              animation: 'rotateIn 1s ease-out' 
          }}
          >
          Descargar Certificados
      </Typography>
    </Box>
    {
      <Certificado />
    }    
    {
      (isValidRut) &&  ( <DownloadFile /> ) 
    }    
   </>
  )
}


export default CertificadoPage;
