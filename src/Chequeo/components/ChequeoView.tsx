import { Box, Button, Grid, Modal, Typography } from "@mui/material"
import { useContext } from "react";
import { ModalContext } from "../../common/context";
import { IChequeo } from "../interface";
import dayjs from "dayjs";


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
};

interface Props {
    chequeoView : IChequeo
}

export const ChequeoView = ({chequeoView}: Props) => {


    const { isViewModalOpen,onOpenModalView }  = useContext( ModalContext );

    const handleClose = () => {
        onOpenModalView(false);
    }

  return (
    <Modal
        keepMounted
        open={isViewModalOpen}
        onClose={handleClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
    >
        <Box sx={style} p={4} borderRadius={3} boxShadow={5} bgcolor="#f5f5f5">
            <Grid container spacing={3}>
                {/* Título del Modal */}
                <Grid item xs={12}>
                    <Typography 
                        variant="h5" 
                        align="center" 
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#3f51b5' }}
                    >
                        Detalles del Chequeo
                    </Typography>
                </Grid>

                {/* Información del Chequeo */}
                <Grid item xs={12} md={6}>
                    {[
                        { label: 'Nombre', value: chequeoView.nombre },
                        { label: 'Rut', value: chequeoView.rut },
                        { label: 'Fecha Nacimiento', value: dayjs(chequeoView.fechaNacimiento).format("DD-MM-YYYY")  },
                        { label: 'Edad', value: chequeoView.edad },
                        { label: 'Estatura', value: chequeoView.estatura },
                        { label: 'Peso', value: chequeoView.peso },
                        { label: 'Hemoglucotest', value: chequeoView.hemoglucotest },
                        { label: 'IMC', value: chequeoView.imc_paciente },
                    ].map((item) => (
                        <Typography 
                            key={item.label} 
                            variant="body1" 
                            sx={{ mb: 1, fontWeight: 'medium' }}
                        >
                            <strong>{item.label}: </strong> {item.value}
                        </Typography>
                    ))}
                </Grid>

                <Grid item xs={12} md={6}>
                    {[
                        { label: 'Presión Arterial', value: chequeoView.presionArterial },
                        { label: 'Saturación Oxígeno', value: chequeoView.saturacionOxigeno },
                        { label: 'Temperatura', value: chequeoView.temperatura },
                        { label: 'Enfermedades Crónicas', value: chequeoView.enfermedadesCronicas },
                        { label: 'Medicamentos Diarios', value: chequeoView.medicamentosDiarios },
                        { label: 'Sistema Osteoarticular', value: chequeoView.sistemaOsteoarticular },
                        { label: 'Sistema Cardiovascular', value: chequeoView.sistemaCardiovascular },
                    ].map((item) => (
                        <Typography 
                            key={item.label} 
                            variant="body1" 
                            sx={{ mb: 1, fontWeight: 'medium' }}
                        >
                            <strong>{item.label}: </strong> {item.value}
                        </Typography>
                    ))}
                </Grid>

                {/* Información adicional */}
                <Grid item xs={12}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        <strong>Enfermedades Anteriores: </strong> {chequeoView.enfermedadesAnteriores}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 2 }}>
                        <strong>Recuperación: </strong> {chequeoView.Recuperacion}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 2 }}>
                        <strong>Grado Incidencia Posterio: </strong> {chequeoView.gradoIncidenciaPosterio}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 2 }}>
                        <strong>Email del Usuario: </strong> {chequeoView.user_email}
                    </Typography>
                </Grid>

                {/* Botón de cierre */}
                <Grid item xs={12} textAlign="center">
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                            mt: 3,
                            px: 4,
                            py: 1.5,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            color: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        Cerrar
                    </Button>
                </Grid>
            </Grid>
        </Box>
    </Modal>
  )
}
