import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import { IconButton, Tooltip } from '@mui/material';

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
                    color           : '#fff',
                    backgroundColor : '#1976d2',
                    '&:hover'       : { backgroundColor: '#115293' },
                    '&:focus-visible': { outline: '3px solid #90caf9', outlineOffset: 2 },
                }}
            >
                <SimCardDownloadIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};
