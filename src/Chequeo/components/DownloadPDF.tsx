import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';

import { Button, Tooltip} from "@mui/material";


interface Props { 
    handleClickDowload : (id_paciente : number) => void;
    id_paciente : number,
    title       : string
}

export const DownloadPDF = ({handleClickDowload,id_paciente,title}:Props) => {

    const handleClick = () => {

        handleClickDowload(id_paciente);
    }

    return (
        <Tooltip title={title} key={title}>
        <Button
            variant="outlined"
            style={{ color: "primary", borderColor: "primary" }}
            onClick={handleClick}
        >
            <SimCardDownloadIcon 
                style={{ 
                    backgroundColor: 'blue',
                    color: 'white',  // Puedes ajustar el color del ícono también
                    borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                  }}/>
        </Button>
        </Tooltip>
    )
}
