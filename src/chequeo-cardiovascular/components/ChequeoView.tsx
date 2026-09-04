import { useContext } from 'react';
import { Box, Button, Chip, Divider, Grid, Modal, Typography } from '@mui/material';
import dayjs from 'dayjs';

import { ModalContext } from '../../common/context';
import type { IChequeo } from '../interface';
import { getEstadoProps } from '../utilities';

interface Props {
    chequeoView: IChequeo;
}

/** Un dato del detalle. `null`/vacío se muestra como «—», nunca como 0 ni en blanco. */
const Dato = ({ label, value }: { label: string; value?: string | number | null }) => (

    <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            { label }
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#0d47a1' }}>
            { value === null || value === undefined || value === '' ? '—' : value }
        </Typography>
    </Box>
);

/**
 * Modal de detalle del deportista. Es de solo lectura: no ofrece editar ni borrar.
 * Se controla con el `ModalProvider` que monta el orquestador del módulo.
 */
export const ChequeoView = ({ chequeoView }: Props) => {

    const { isViewModalOpen, onOpenModalView } = useContext(ModalContext);

    const handleClose = () => onOpenModalView(false);

    const fechaNacimiento = chequeoView.fechaNacimiento
        ? dayjs(chequeoView.fechaNacimiento).format('DD-MM-YYYY')
        : null;

    const presion = (chequeoView.presion_sistolica || chequeoView.presionArterial)
        ? `${chequeoView.presion_sistolica ?? '—'}/${chequeoView.presionArterial ?? '—'}`
        : null;

    return (
        <Modal
            keepMounted
            open={isViewModalOpen}
            onClose={handleClose}
            aria-labelledby="titulo-detalle-chequeo"
        >
            <Box
                sx={{
                    position  : 'absolute',
                    top       : '50%',
                    left      : '50%',
                    transform : 'translate(-50%, -50%)',
                    width     : 'calc(100% - 32px)',
                    maxWidth  : 640,
                    maxHeight : '90vh',
                    overflowY : 'auto',
                    bgcolor   : 'background.paper',
                    borderRadius : 3,
                    boxShadow : 24,
                    p         : { xs: 2.5, md: 4 },
                    outline   : 'none',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                    <Typography
                        id="titulo-detalle-chequeo"
                        component="h2"
                        sx={{ fontSize: 20, fontWeight: 700, color: '#0d47a1' }}
                    >
                        { chequeoView.nombre || 'Detalle del chequeo' }
                    </Typography>
                    <Chip {...getEstadoProps(chequeoView.estado_paciente ?? '')} size="small" />
                </Box>

                <Divider sx={{ mb: 3, borderColor: '#bbdefb' }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Dato label="RUT" value={chequeoView.rut} />
                        <Dato label="Fecha de nacimiento" value={fechaNacimiento} />
                        <Dato label="Edad" value={chequeoView.edad} />
                        <Dato label="Sexo" value={chequeoView.sexo_paciente} />
                        <Dato label="División" value={chequeoView.division_paciente} />
                        <Dato label="Estatura" value={chequeoView.estatura} />
                        <Dato label="Peso" value={chequeoView.peso} />
                        <Dato label="IMC" value={chequeoView.imc_paciente} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Dato label="Presión (sistólica/diastólica)" value={presion} />
                        <Dato label="Saturación de oxígeno" value={chequeoView.saturacionOxigeno} />
                        <Dato label="Temperatura" value={chequeoView.temperatura} />
                        <Dato label="Hemoglucotest" value={chequeoView.hemoglucotest} />
                        <Dato label="Enfermedades crónicas" value={chequeoView.enfermedadesCronicas} />
                        <Dato label="Medicamentos diarios" value={chequeoView.medicamentosDiarios} />
                        <Dato label="Sistema osteoarticular" value={chequeoView.sistemaOsteoarticular} />
                        <Dato label="Sistema cardiovascular" value={chequeoView.sistemaCardiovascular} />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ mb: 2, borderColor: '#e3f2fd' }} />
                        <Dato label="Enfermedades anteriores" value={chequeoView.enfermedadesAnteriores} />
                        <Dato label="Recuperación" value={chequeoView.Recuperacion} />
                        <Dato label="Grado de incidencia posterior" value={chequeoView.gradoIncidenciaPosterio} />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                            textTransform : 'none',
                            fontWeight    : 600,
                            borderRadius  : 2,
                            px            : 3,
                            backgroundColor : '#1976d2',
                            '&:hover'       : { backgroundColor: '#115293' },
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};
