import { Box, Typography } from '@mui/material';

import { ChequeoForm, ChequeoFormUpdate } from '../components';

interface Props {
    rut_paciente       : string;
    id_paciente        : number;
    handleUpdateStatus : (status: number, rut_paciente: string, id_paciente: number) => void;
    handleReloadTable  : () => void;
}

/**
 * Tab de alta y edición. Decide cuál de los dos formularios monta: si hay `rut_paciente` es
 * una edición, si no es un alta nueva.
 */
export const ChequeoPage = ({ rut_paciente, id_paciente, handleUpdateStatus, handleReloadTable }: Props) => {

    const esEdicion = Boolean(rut_paciente);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography
                component="h2"
                sx={{ fontWeight: 700, fontSize: { xs: 18, md: 20 }, color: '#0d47a1', mb: 0.5 }}
            >
                { esEdicion ? 'Editar deportista' : 'Nuevo deportista' }
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
                Chequeo preventivo cardiovascular
            </Typography>

            { esEdicion
                ? (
                    <ChequeoFormUpdate
                        id_paciente={id_paciente}
                        handleUpdateStatus={handleUpdateStatus}
                        handleReloadTable={handleReloadTable}
                    />
                )
                : (
                    <ChequeoForm
                        handleUpdateStatus={handleUpdateStatus}
                        handleReloadTable={handleReloadTable}
                    />
                )}
        </Box>
    );
};
