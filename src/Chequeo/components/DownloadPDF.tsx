import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';

import { Button} from "@mui/material";


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
        <Button
            variant="outlined"
            style={{ color: "primary", borderColor: "primary" }}
            onClick={handleClick}
            title={title}
        >
            <SimCardDownloadIcon 
                style={{ 
                    backgroundColor: 'blue',
                    color: 'white',  // Puedes ajustar el color del ícono también
                    borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                  }}/>
        </Button>
    )
}
