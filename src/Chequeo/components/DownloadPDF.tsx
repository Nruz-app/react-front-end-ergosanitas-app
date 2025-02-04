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
            <SimCardDownloadIcon />
        </Button>
    )
}
