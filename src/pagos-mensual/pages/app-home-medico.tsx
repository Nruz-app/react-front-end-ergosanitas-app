import { Box, Typography } from "@mui/material";
import { ResumenMensualMDC } from "../components/resumen-mensual-mdc";
import { IPagoMedicoMDC } from "../interface/pago-medico-mdc";
import { useCallback, useContext, useEffect, useState } from "react";
import { PagoMensualService } from "../service/pagoMensualService";
import { LoginContext } from "../../common/context";
import { ResumenMensualAllMDC } from "../components/resumen-mensual-mdc-all";



const AppHomeMedico = () => {


    const { user } = useContext(LoginContext);
    const { user_perfil } = user;

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
        {
            user_perfil === "Medicos" ? (
                <ResumenMensualMDC 
                    pagoMensualMDC={pagoMensualMDC}
                />
            ) : (
                <ResumenMensualAllMDC 
                    pagoMensualMDC={pagoMensualMDC}
                />
            )
        }        
        </>
    )

}

export default AppHomeMedico;