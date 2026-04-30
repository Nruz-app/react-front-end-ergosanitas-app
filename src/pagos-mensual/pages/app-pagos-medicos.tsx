import { Box, Typography } from "@mui/material";
import { ResumenMensual } from "../components/resumen-mensual";
import { useCallback, useEffect, useState } from "react";
import { PagoMedico } from "../interface/pago-medicos";
import { PagoMensualService } from "../service/pagoMensualService";


const AppPagosMedicosPage = () => {

    const [pagoMensual, setPagoMensual] = useState<PagoMedico[]>([]);

    const fetchPagoMensual = useCallback(async (): Promise<void> => {
      
          const {  getEstadisticaPagoMensual } = await PagoMensualService() ;
          const response = await getEstadisticaPagoMensual();
          setPagoMensual(response);
    
      },[setPagoMensual]);
    
    useEffect(() => {
        fetchPagoMensual();
    }, [fetchPagoMensual]);

    
    const handleUpdatePrecio = async (club: string, valor_cgc: string, periodo: string) => {
        const {  postPagoMensual } = await PagoMensualService();
        await postPagoMensual(club, valor_cgc, periodo );
    }
    const onDelete = async (club: string, periodo: string) => {
        const {  deletePagoMensual } = await PagoMensualService();
        await deletePagoMensual(club, periodo);
        fetchPagoMensual();
    }
    
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
                Pagos Médicos {new Date().getFullYear()}
            </Typography>
        </Box>
        <ResumenMensual 
            pagoMensual={pagoMensual}
            onUpdatePrecio={handleUpdatePrecio}
            onDelete={onDelete}
        />
        </>
    )
}

export default AppPagosMedicosPage;