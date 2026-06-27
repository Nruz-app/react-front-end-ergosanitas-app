import { useContext, useEffect, useState } from "react";
import { CertificadoContext } from "../context";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { UseChequeoService } from "../../Chequeo/services/useChequeoService";
import { IUrlCertificado } from "../../Chequeo/interface/url-certificado";
import { IUrlBio } from "../../Chequeo/interface/url-bio.interface";
import Swal from "sweetalert2";

export const DownloadFile = () => {
  const { rutUser, onSetCertificado } = useContext(CertificadoContext);

  const [certificado, setCertificado] =
    useState<IUrlCertificado | null>(null);

  const [userBio, setUserBio] =
    useState<IUrlBio | null>(null);

  const [loading, setLoading] = useState(true);
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { validaCertificado, getUrlBio } =
          await UseChequeoService();

        const [response, bioResponse] = await Promise.all([
          validaCertificado(rutUser),
          getUrlBio(rutUser),
        ]);

        let existeCertificado = false;
        let existeBio = false;

        // ===============================
        // CERTIFICADO
        // ===============================
        if (response && response.status === 200) {
          existeCertificado = true;

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
        }

        // ===============================
        // BIOIMPEDANCIA
        // ===============================
        
        if (bioResponse && bioResponse.success && bioResponse.data) {
          existeBio = true;
          setUserBio(bioResponse.data);
          console.log("Bioimpedancia encontrada:", bioResponse.data );
        }

        // ===============================
        // NO EXISTE NINGUNO
        // ===============================
        if (!existeCertificado && !existeBio && !alertShown) {
          onSetCertificado({
            isValidRut: false,
            banner: true,
            completed: 0,
            rutUser,
            url_pdf: "",
            name_pdf: "",
            titulo: "",
          });

          setAlertShown(true);

          Swal.fire({
            icon: "warning",
            title: "Usuario en evaluación médica",
            text: "Su evaluación médica está en proceso. Será redirigido en 5 segundos.",
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
            willClose: () => {
              window.location.href = "https://ergosanitas.com/";
            },
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
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
        <CircularProgress size={60} thickness={5} />

        <Typography variant="h6">
          Validando certificado...
        </Typography>

        <Typography variant="body2">
          Por favor espere unos segundos
        </Typography>
      </Box>
    );
  }

  if (!certificado && !userBio) {
    return null;
  }

  const handleClick = async () => {
    try {
      const { chequeoPDFRut } = await UseChequeoService();
      await chequeoPDFRut(rutUser);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  }

  const handleClickBio = async () => {
    try {
      const { bioPDFRut } = await UseChequeoService();
      await bioPDFRut(rutUser);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  }


  return (
    <Box
      mt={4}
      sx={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* CERTIFICADO */}
      {certificado && (
        
        <Box
      component="fieldset"
      sx={{
        border: "1px solid",
        borderColor: "grey.400",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography
        component="legend"
        sx={{
          px: 1,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Certificado Electrocardiograma
      </Typography>
       <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleClick}
                startIcon={<CloudDownloadIcon />}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  padding: "14px 28px",
                  fontSize: "18px",
                  fontWeight: 600,
                  letterSpacing: "0.8px",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  boxShadow: "0px 4px 10px rgba(0,0,0,.2)",
                  "&:hover": {
                    backgroundColor: "#388E3C",
                  },
                }}
              >
              Certificado - {certificado.titulo}
            </Button>
          </Grid>
          <Grid item>

          <Button
            variant="contained"
            href={certificado.url_pdf}
            target="_blank"
            download={certificado.name_pdf}
            startIcon={<CloudDownloadIcon />}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              padding: "14px 28px",
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.8px",
              backgroundColor: "#1976D2",
              color: "#fff",
              boxShadow: "0px 4px 10px rgba(0,0,0,.2)",
              "&:hover": {
                backgroundColor: "#115293",
              },
            }}
          >
            Electro Cardiograma
          </Button>
          </Grid>
        </Grid>
        </Box>
      )}

      {/* BIOIMPEDANCIA */}
      {userBio && (
        <Box
          component="fieldset"
          sx={{
            border: "1px solid",
            borderColor: "grey.400",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography
            component="legend"
            sx={{
              px: 1,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Bioimpedancia
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleClickBio}
                startIcon={<CloudDownloadIcon />}
                sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    backgroundColor: "#FF9800",
                    boxShadow: 3,
                    "&:hover": {
                      backgroundColor: "#F57C00",
                    },
                  }}
              >
                Certificado - {userBio.nombre}
              </Button>
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                href={userBio.archivo}
                target="_blank"
                download
                startIcon={<CloudDownloadIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  backgroundColor: "#FF9800",
                  boxShadow: 3,
                  "&:hover": {
                    backgroundColor: "#F57C00",
                  },
                }}
              >
                Descargar Bioimpedancia
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}