import { Box, Card, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useState } from "react";
import { UseChequeoService } from "../../services/useChequeoService";
import { LoginContext } from "../../../common/context";
import { EstadoGenerales } from "../../interface";

const initialValues : EstadoGenerales = {
   can_imc_normal           : 0,
    total_examenes          : 0,
    can_imc_anormal         : 0,
    can_estado_normal       : 0,
    total_examenes_ec       : 0,
    can_estado_alterado     : 0,
    porcentaje_imc_normal   : 0,
    porcentaje_estado_normal: 0,
    can_masculino           : 0,
    can_femenino            : 0
}


export const StatisticsGlobal = () => {

    const { user }  = useContext( LoginContext );
    const { user_email }  = user;

    const [estadoGenerales,setEstadoGenerales] = useState<EstadoGenerales>(initialValues);
        
    const fetchEstadoGeneral = useCallback(async (): Promise<void> => {
        
        const {  getEstadoGeneral } = await UseChequeoService() ;
        const response = await getEstadoGeneral(user_email);
        
        setEstadoGenerales(response);
    
    }, []);
        
    useEffect(() => {
             fetchEstadoGeneral();
    }, []); 

  return (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
        }}
        >
        <Card
            sx={{
                textAlign: "center",
                borderRadius: 5,
                boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.1)",  // Sombra más suave y sutil
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
                width: "90%",
                border: "1px solid #e0e0e0",  // Borde sutil para el Card
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 600,
                    color: "primary.main",  // Color primario para el título
                }}
            >
            Estado General
            </Typography>

            <ol style={{ textAlign: "left", width: "100%", paddingLeft: "1.5rem" }}>
            <li>
                <Typography variant="body1" sx={{ fontSize: "1.1rem", color: "text.primary" }}>
                Exámenes Realizados: <strong>{ estadoGenerales.total_examenes }</strong>
                </Typography>
            </li>
            <li>
                <Typography variant="body1" sx={{ fontSize: "1.1rem", color: "text.primary" }}>
                Estado Nutricional: <strong>{ estadoGenerales.porcentaje_imc_normal }%</strong>
                </Typography>
            </li>
            <li>
                <Typography variant="body1" sx={{ fontSize: "1.1rem", color: "text.primary" }}>
                Estado Cardiaco: <strong>{ estadoGenerales.porcentaje_estado_normal }%</strong>
                </Typography>
            </li>
            <li>
                <Typography variant="body1" sx={{ fontSize: "1.1rem", color: "text.primary" }}>
                Masculino: <strong>{ estadoGenerales.can_masculino }</strong> Femenino <strong>{ estadoGenerales.can_femenino }</strong> 
                </Typography>
            </li>
            </ol>
        </Card>
    </Box>


  )
}
