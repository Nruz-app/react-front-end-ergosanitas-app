import { Alert, Box, CircularProgress } from '@mui/material';

import { useChequeoRut } from '../../hooks';
import { ChequeoForm } from './ChequeoForm';

interface Props {
    id_paciente : number;
    activo      : boolean;
    onGuardado  : () => void;
}

/**
 * Edición: carga el chequeo por id y se lo pasa a `ChequeoForm`.
 *
 * El original montaba `ChequeoForm` sin chequeo mientras la petición volaba, y `ChequeoForm`
 * decide alta o edición por la presencia del chequeo: pulsar el botón en ese intervalo, o tras
 * un fallo de la carga, **creaba un chequeo nuevo** en vez de editar. Aquí el formulario solo
 * aparece con el chequeo ya cargado.
 */
export const ChequeoFormUpdate = ({ id_paciente, activo, onGuardado }: Props) => {

    const { chequeo, error } = useChequeoRut(id_paciente);

    if (error) {
        return (
            <Alert severity="error" sx={{ mx: 'auto', maxWidth: { xs: '100%', md: '80%' } }}>
                No se pudo cargar el chequeo para editarlo. Vuelve a la lista e inténtalo de nuevo.
            </Alert>
        );
    }

    if (!chequeo) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress aria-label="Cargando el chequeo" />
            </Box>
        );
    }

    return <ChequeoForm chequeo={chequeo} activo={activo} onGuardado={onGuardado} />;
};
