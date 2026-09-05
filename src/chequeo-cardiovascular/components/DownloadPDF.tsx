import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import { IconButton, Tooltip } from '@mui/material';
import { COLORES, sxFocoVisible } from '../config/tema';

interface Props {
    handleClickDownload : (id_paciente: number) => void;
    id_paciente         : number;
    title               : string;
}

/** Botón que abre el PDF del chequeo en una pestaña nueva. */
export const DownloadPDF = ({ handleClickDownload, id_paciente, title }: Props) => {

    return (
        <Tooltip title={title}>
            <IconButton
                onClick={() => handleClickDownload(id_paciente)}
                aria-label={title}
                size="small"
                sx={{
                    color           : COLORES.fondoTarjeta,
                    backgroundColor : COLORES.primario,
                    '&:hover'       : { backgroundColor: COLORES.primarioHover },
                    ...sxFocoVisible,
                }}
            >
                <SimCardDownloadIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};
