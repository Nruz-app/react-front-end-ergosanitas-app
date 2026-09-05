import { useContext } from 'react';
import { Box, Button, Divider, Modal, Typography } from '@mui/material';

import { COLORES } from '../../config/tema';
import { ModalBarContext } from '../../context';

/**
 * Modal informativo del Home: qué significa el estado general y qué recomendar.
 * El texto es divulgativo y no depende de ningún dato del deportista.
 */
export const ModalStatus = () => {

    const { isModalOpen, onOpenModal } = useContext(ModalBarContext);

    const handleClose = () => onOpenModal({ isModalOpen: false, typePresion: '' });

    return (
        <Modal
            keepMounted
            open={isModalOpen}
            onClose={handleClose}
            aria-labelledby="titulo-detalle-clinico"
        >
            <Box
                sx={{
                    position  : 'absolute',
                    top       : '50%',
                    left      : '50%',
                    transform : 'translate(-50%, -50%)',
                    width     : 'calc(100% - 32px)',
                    maxWidth  : 520,
                    maxHeight : '90vh',
                    overflowY : 'auto',
                    p         : { xs: 2.5, md: 3.5 },
                    backgroundColor : COLORES.fondoTarjeta,
                    borderRadius    : 3,
                    boxShadow       : 24,
                    outline         : 'none',
                }}
            >
                <Typography
                    id="titulo-detalle-clinico"
                    component="h2"
                    sx={{ fontSize: 19, fontWeight: 700, color: COLORES.primarioOsc, mb: 1 }}
                >
                    Detalle del estado general
                </Typography>

                <Divider sx={{ mb: 2, borderColor: COLORES.divisor }} />

                <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2 }}>
                    El estado general es un indicador de salud del deportista. Un estado normal
                    sugiere que no presenta síntomas evidentes de enfermedad o malestar, aunque
                    puede variar según la edad, el sexo y otros factores individuales.
                </Typography>

                <Typography sx={{ fontSize: 14, fontWeight: 700, color: COLORES.primarioOsc, mb: 1 }}>
                    Recomendaciones
                </Typography>

                <Box component="ul" sx={{ pl: 2.5, m: 0, color: 'text.secondary', fontSize: 14 }}>
                    <li>Realizar chequeos médicos regulares.</li>
                    <li>Mantener una dieta equilibrada y saludable.</li>
                    <li>Realizar actividad física con regularidad.</li>
                    <li>Gestionar el estrés y dormir lo suficiente.</li>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                            textTransform : 'none',
                            fontWeight    : 600,
                            borderRadius  : 2,
                            px            : 3,
                            backgroundColor : COLORES.primario,
                            '&:hover'       : { backgroundColor: COLORES.primarioHover },
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};
