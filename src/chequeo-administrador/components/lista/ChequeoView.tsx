import { useContext } from 'react';
import dayjs from 'dayjs';
import { Box, Button, Grid, Modal, Typography } from '@mui/material';

import { ModalContext } from '../../../common/context';
import { COLORES, DEGRADADOS, UI, sxFocoVisible } from '../../config/tema';
import type { IChequeo } from '../../interface';

interface Props {
    /** `undefined` mientras no se ha pedido ningún detalle. */
    chequeoView?: IChequeo;
}

interface Dato {
    label : string;
    value?: string | number | null;
}

/** Un valor del detalle, o «—» si el backend no lo trajo. Nunca «undefined» en pantalla. */
const mostrar = (valor?: string | number | null): string | number =>
    valor === null || valor === undefined || valor === '' ? '—' : valor;

const ListaDatos = ({ datos }: { datos: Dato[] }) => (
    <>
        {datos.map((item) => (
            <Typography key={item.label} variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
                <strong>{item.label}: </strong> {mostrar(item.value)}
            </Typography>
        ))}
    </>
);

/**
 * Modal «Ver» de la lista: el detalle completo de un chequeo.
 *
 * Mismo contenido y orden que el original. Lo único que cambia es que un dato ausente se pinta
 * «—» y no «undefined» —el original mostraba «undefined/undefined» como presión de una ficha a
 * medias—, que es la regla de ausencia de dato de todo el proyecto.
 */
export const ChequeoView = ({ chequeoView }: Props) => {

    const { isViewModalOpen, onOpenModalView } = useContext(ModalContext);

    const handleClose = () => onOpenModalView(false);

    const ch = chequeoView;

    const presion = ch?.presion_sistolica || ch?.presionArterial
        ? `${mostrar(ch?.presion_sistolica)}/${mostrar(ch?.presionArterial)}`
        : null;

    return (
        <Modal
            keepMounted
            open={isViewModalOpen}
            onClose={handleClose}
            aria-labelledby="detalle-chequeo-titulo"
        >
            <Box
                sx={{
                    position     : 'absolute',
                    top          : '50%',
                    left         : '50%',
                    transform    : 'translate(-50%, -50%)',
                    width        : { xs: 'calc(100% - 32px)', sm: '100%' },
                    maxWidth     : '600px',
                    maxHeight    : '90vh',
                    overflowY    : 'auto',
                    bgcolor      : UI.fondoArchivo,
                    borderRadius : 3,
                    boxShadow    : 5,
                    p            : { xs: 2, sm: 4 },
                    outline      : 'none',
                }}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography
                            id="detalle-chequeo-titulo"
                            variant="h5"
                            align="center"
                            gutterBottom
                            sx={{ fontWeight: 'bold', color: UI.tituloModal }}
                        >
                            Detalles del Chequeo
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ListaDatos
                            datos={[
                                { label: 'Nombre', value: ch?.nombre },
                                { label: 'Rut', value: ch?.rut },
                                {
                                    label : 'Fecha Nacimiento',
                                    value : ch?.fechaNacimiento ? dayjs(ch.fechaNacimiento).format('DD-MM-YYYY') : null,
                                },
                                { label: 'Edad', value: ch?.edad },
                                { label: 'Estatura', value: ch?.estatura },
                                { label: 'Peso', value: ch?.peso },
                                { label: 'Hemoglucotest', value: ch?.hemoglucotest },
                                { label: 'IMC', value: ch?.imc_paciente },
                            ]}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ListaDatos
                            datos={[
                                { label: 'Presión Arterial', value: presion },
                                { label: 'Saturación Oxígeno', value: ch?.saturacionOxigeno },
                                { label: 'Temperatura', value: ch?.temperatura },
                                { label: 'Enfermedades Crónicas', value: ch?.enfermedadesCronicas },
                                { label: 'Medicamentos Diarios', value: ch?.medicamentosDiarios },
                                { label: 'Sistema Osteoarticular', value: ch?.sistemaOsteoarticular },
                                { label: 'Sistema Cardiovascular', value: ch?.sistemaCardiovascular },
                            ]}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <ListaDatos
                            datos={[
                                { label: 'Enfermedades Anteriores', value: ch?.enfermedadesAnteriores },
                                { label: 'Recuperación', value: ch?.Recuperacion },
                                { label: 'Grado Incidencia Posterio', value: ch?.gradoIncidenciaPosterio },
                                { label: 'Email del Usuario', value: ch?.user_email },
                            ]}
                        />
                    </Grid>

                    <Grid item xs={12} textAlign="center">
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            sx={{
                                mt           : 3,
                                px           : 4,
                                py           : 1.5,
                                background   : DEGRADADOS.botonModal,
                                color        : COLORES.textoSobrePrimario,
                                borderRadius : '12px',
                                '&:hover'    : { background: DEGRADADOS.botonModalHover },
                                ...sxFocoVisible,
                            }}
                        >
                            Cerrar
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
    );
};
