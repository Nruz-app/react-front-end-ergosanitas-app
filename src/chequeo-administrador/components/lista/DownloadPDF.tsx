import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';

import { UI } from '../../config/tema';
import { BotonAccion } from './BotonAccion';

interface Props {
    handleClickDownload : (id_paciente: number) => void;
    id_paciente         : number;
    title               : string;
}

/** Acción «Descargar PDF» de la fila. Abre el PDF del chequeo en una pestaña nueva. */
export const DownloadPDF = ({ handleClickDownload, id_paciente, title }: Props) => {

    return (
        <BotonAccion
            titulo={title}
            icono={<SimCardDownloadIcon />}
            color={UI.accionAzul}
            variant="outlined"
            onClick={() => handleClickDownload(id_paciente)}
        />
    );
};
