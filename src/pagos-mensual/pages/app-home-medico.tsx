import { Box, Typography } from "@mui/material";
import { ResumenMensualMDC } from "../components/resumen-mensual-mdc";
import { IPagoMedicoMDC } from "../interface/pago-medico-mdc";
import { useCallback, useEffect, useState } from "react";
import { PagoMensualService } from "../service/pagoMensualService";



const AppHomeMedico = () => {

    const [pagoMensualMDC, setPagoMensualMDC] = useState<IPagoMedicoMDC[]>([]);


    const fetchPagoMensualMDC = useCallback(async (): Promise<void> => {
          
            const {  getEstadisticaPagoMensualMDC } = await PagoMensualService() ;
            const response = await getEstadisticaPagoMensualMDC();
            setPagoMensualMDC(response);
    
        },[setPagoMensualMDC]);
    
    useEffect(() => {
        fetchPagoMensualMDC();
    }, [fetchPagoMensualMDC]);

    return (
        <>
        <Box ml={15} mt={8} sx={{ flexGrow: 1 }}>
            <Typography
                variant="h4"
                align="center"
                sx={{
                fontFamily: 'cursive',
                fontWeight: 'bold',
                letterSpacing: '0.1rem',
                textTransform: 'uppercase',
                color: 'primary.main',
                mb: 3,
                animation: 'fadeInDownBig 1s ease-out'
                }}
            >
                Pagos Mensual {new Date().getFullYear()}
            </Typography>
        </Box>
        <ResumenMensualMDC 
            pagoMensualMDC={pagoMensualMDC}
        />
        </>
    )

}

export default AppHomeMedico;