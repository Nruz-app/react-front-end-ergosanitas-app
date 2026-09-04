import { useChequeoRut } from '../hooks';
import { ChequeoForm } from './ChequeoForm';

interface Props {
    id_paciente        : number;
    handleUpdateStatus : (status: number, rut_paciente: string, id_paciente: number) => void;
    handleReloadTable  : () => void;
}

/**
 * Edición: carga el chequeo por id y se lo pasa a `ChequeoForm`, que es el mismo formulario.
 * La única diferencia visible es el texto del botón.
 */
export const ChequeoFormUpdate = ({ id_paciente, handleUpdateStatus, handleReloadTable }: Props) => {

    const { chequeo } = useChequeoRut(id_paciente);

    return (
        <ChequeoForm
            chequeo={chequeo}
            handleUpdateStatus={handleUpdateStatus}
            handleReloadTable={handleReloadTable}
        />
    );
};
