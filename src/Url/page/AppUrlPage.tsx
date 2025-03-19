import { Box, Typography } from "@mui/material"

import { CertificadoForm } from "../components/CertificadoForm"
import { useParams } from "react-router-dom";

const AppUrlPage = () => {

    const { rut_paciente } = useParams();

  return (
    <>
        <Box ml={15} mt={8} sx={{ flexGrow: 1 }}>
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
                    animation: 'fadeInDownBig 1s ease-out'
                }}
            >
                Cargar Certificado {rut_paciente}
            </Typography>
        </Box>
        <CertificadoForm
        />
    </>
  )
}

export default AppUrlPage