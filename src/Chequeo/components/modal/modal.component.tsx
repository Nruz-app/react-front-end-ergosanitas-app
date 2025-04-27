import { useContext } from "react";
import { ModalBarContext } from "../../context/modal-bar/Modal-bar-Context";
import { Box, Button, Card, Modal, Typography } from "@mui/material";



export const ModalStatus = () => {

    const { isModalOpen,onOpenModal }  = useContext( ModalBarContext );
 
    const handleClose = () => {
        onOpenModal({isModalOpen : false,typePresion : ''});
    }
    //


  return (
    <Modal
        keepMounted
        open={isModalOpen}
        onClose={handleClose}
        aria-labelledby="patient-modal-title"
        aria-describedby="patient-modal-description"
        >
        <Box
            sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",  
            justifyContent: "center",  
            position: "absolute",  
            top: "50%",  // Desplazamos el modal hacia el 50% de la pantalla desde arriba
            left: "50%",  // Desplazamos el modal hacia el 50% de la pantalla desde la izquierda
            transform: "translate(-50%, -50%)",  // Ajustamos para que el modal quede centrado exacto
            p: 3,
            maxWidth: "500px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: 3,
            }}
        >
            <Typography
            variant="h5"
            color="primary"
            sx={{
                fontWeight: 600,
                mb: 2,
                textAlign: "center",
            }}
            >
            Detalle y Recomendaciones del Estado General
            </Typography>

            <Card
            sx={{
                backgroundColor: "#f9f9f9",
                padding: 2,
                borderRadius: "8px",
                boxShadow: 1,
                width: "100%",
            }}
            >
            <Typography variant="body1" color="textSecondary" gutterBottom>
                El estado general del paciente es un indicador clave de su salud. Un
                estado general normal sugiere que el paciente no presenta síntomas
                evidentes de enfermedad o malestar. Sin embargo, este puede variar
                según diversos factores como la edad, el sexo y otros aspectos
                individuales.
            </Typography>

            <Typography
                variant="h6"
                color="textPrimary"
                sx={{
                mt: 2,
                fontWeight: 600,
                }}
            >
                Recomendaciones:
            </Typography>

            <ul style={{ paddingLeft: "20px", color: "#333" }}>
                <li>Realizar chequeos médicos regulares.</li>
                <li>Mantener una dieta equilibrada y saludable.</li>
                <li>Realizar actividad física regularmente.</li>
                <li>Gestionar el estrés y dormir lo suficiente.</li>
            </ul>
            </Card>

            <Button
                variant="outlined"
                color="error"
                onClick={handleClose}
                sx={{
                    marginTop: 2,
                    borderRadius: "12px",  
                    fontSize: "16px",  // Un tamaño de fuente más grande
                    border: "2px solid #d32f2f",  // Borde de color rojo más intenso
                    backgroundColor: "#fff",  // Fondo blanco para el botón
                    color: "#d32f2f",  // Color del texto en rojo
                    transition: "all 0.3s ease",  // Transición suave para el hover
                    '&:hover': {
                    backgroundColor: "#d32f2f",  // Cambiar fondo a rojo en hover
                    color: "#fff",  // Cambiar texto a blanco
                    borderColor: "#b71c1c",  // Borde más oscuro al pasar el mouse
                    },
                    '&:active': {
                    backgroundColor: "#b71c1c",  // Fondo rojo más oscuro cuando se hace clic
                    borderColor: "#9a0007",  // Borde más oscuro cuando se hace clic
                    }
                }}
                >
                Cerrar
            </Button>
        </Box>
    </Modal>
  )
}
