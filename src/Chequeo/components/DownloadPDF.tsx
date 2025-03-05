import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';

import { Button} from "@mui/material";


interface Props { 
    handleClickDowload   :  (rut : string) => void;
    rut     : string,
    title   : string
}

export const DownloadPDF = ({handleClickDowload,rut,title}:Props) => {

    const handleClick = () => {

        handleClickDowload(rut);
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
