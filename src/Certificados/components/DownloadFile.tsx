import { useContext } from "react";
import { CertificadoContext } from "../context";
import { Box, Button } from "@mui/material";

import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

//import { useNavigate } from 'react-router-dom';
import { UseChequeoService } from '../../Chequeo/services/useChequeoService';


export const DownloadFile = () => {

  //const navigate = useNavigate();
  const { name_pdf, url_pdf,titulo,rutUser }  = useContext( CertificadoContext );

  const handleClick = async (isClick : boolean) => {

    //navigate('/home'); // Redirige al destino
    if(isClick) {
      const {  chequeoPDFRut } = await UseChequeoService() ;
      await chequeoPDFRut(rutUser);

    }
  }

// { label: "Electro Cardiograma", color: "#1976D2", hoverColor: "#115293", isClick : false }
  return (
    <Box mt={4} sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
    {[
      { label: "Certificado", color: "#4CAF50", hoverColor: "#388E3C", isClick : true }
    ].map((btn, index) => (
      <Button
        key={index}
        variant="contained"
        href={!btn.isClick ? url_pdf : ''}
        target="_blank"
        download={!btn.isClick ? name_pdf : ''}
        onClick={ btn.isClick ? () => handleClick(btn.isClick) : undefined }
        startIcon={<CloudDownloadIcon sx={{ fontSize: 28 }} />}
        sx={{
          borderRadius: "12px",
          textTransform: "none",
          padding: "14px 28px",
          fontSize: "18px",
          fontWeight: "600",
          letterSpacing: "0.8px",
          backgroundColor: btn.color,
          color: "#fff",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: btn.hoverColor,
            transform: "translateY(-2px)",
            boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {btn.label} - {titulo}
      </Button>
    ))}
  </Box>
  
    
  )
}
