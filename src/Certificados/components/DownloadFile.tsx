import { useContext, useEffect, useState } from "react";
import { CertificadoContext } from "../context";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
//import { useNavigate } from "react-router-dom";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { UseChequeoService } from '../../Chequeo/services/useChequeoService';
import { IUrlCertificado } from '../../Chequeo/interface/url-certificado'; 
import Swal from 'sweetalert2';

export const DownloadFile = () => {
  const { rutUser, onSetCertificado } = useContext(CertificadoContext);
  const [certificado, setCertificado] = useState<IUrlCertificado | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  //const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { validaCertificado } = await UseChequeoService();
        const response: IUrlCertificado = await validaCertificado(rutUser);

        setLoading(false);

        if (response && response.status === 200) {
          setCertificado(response);
          onSetCertificado({
            isValidRut: true,
            banner: false,
            completed: 100,
            rutUser,
            url_pdf: response.url_pdf,
            name_pdf: response.name_pdf,
            titulo: response.titulo,
          });
        } else {
          onSetCertificado({
            isValidRut: false,
            banner: true,
            completed: 0,
            rutUser,
            url_pdf: '',
            name_pdf: '',
            titulo: '',
          });

          if (!alertShown) {
            setAlertShown(true);
            Swal.fire({
              icon: 'warning', 
              title: 'Usuario en evaluación médica',
              text: 'Su evaluación médica está en proceso. Será redirigido en 5 segundos.',
              timer: 5000,
              timerProgressBar: true,
              showConfirmButton: false,
              willClose: () => {
                window.location.href = "https://ergosanitas.com/";
              }
            });
          }
        }

      } catch (error) {
        console.error('Error al validar certificado:', error);
      }
    };

    if (rutUser) {
      fetchData();
    }
  }, [rutUser, onSetCertificado, alertShown]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={5} color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 500, color: "#555" }}>
          Validando certificado...
        </Typography>
        <Typography variant="body2" sx={{ color: "#888" }}>
          Por favor, espere unos segundos
        </Typography>
      </Box>
    );
  }

  if (!certificado) return null;

  const handleClick = async (isClick: boolean) => {
    if (isClick) {
      try {
        const { chequeoPDFRut } = await UseChequeoService();
        await chequeoPDFRut(rutUser);
      } catch (error) {
        console.error('Error al generar PDF:', error);
      }
    }
  };

  return (
    <Box mt={4} sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
      {[
        { label: "Certificado", color: "#4CAF50", hoverColor: "#388E3C", isClick: true },
        { label: "Electro Cardiograma", color: "#1976D2", hoverColor: "#115293", isClick: false }
      ].map((btn, index) => (
        <Button
          key={index}
          variant="contained"
          href={!btn.isClick ? certificado?.url_pdf : ''}
          target="_blank"
          download={!btn.isClick ? certificado?.name_pdf : ''}
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
           {btn.label} - {certificado?.titulo}
        </Button>
      ))}
    </Box>
  );
}