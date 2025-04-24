import { Box, Button, Card, CardContent, Divider, List, ListItem, ListItemIcon, Paper, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useState } from "react";
import { UseChequeoService } from "../../services/useChequeoService";
import { LoginContext } from "../../../common/context";
import { EstadoGenerales } from "../../interface";
import { ModalBarContext } from "../../context/modal-bar/Modal-bar-Context";

import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Icono para la lista

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
    const { onOpenModal }  = useContext( ModalBarContext );

    const [estadoGenerales,setEstadoGenerales] = useState<EstadoGenerales>(initialValues);
        
    const fetchEstadoGeneral = useCallback(async (): Promise<void> => {
        
        const {  getEstadoGeneral } = await UseChequeoService() ;
        const response = await getEstadoGeneral(user_email);
        
        setEstadoGenerales(response);
    
    }, []);


    const handleOpenModal = (typePresion : string) => {

        onOpenModal({isModalOpen:true,typePresion});
    }
        
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
            mt: 1,
            width: "100%",
        }}
    >
        {/* Tarjeta con información */}
        <Card
            sx={{
            width: "100%",
            maxWidth: 600,
            boxShadow: 3,
            borderRadius: 3,
            p: 2,
            backgroundColor: "#f9f9f9",
            }}
        >
            <CardContent>
                {/* Sección de estadísticas */}
                <Paper
                    sx={{
                    p: 2,
                    backgroundColor: "white",
                    borderRadius: 2,
                    mb: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                        Estado General
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <Typography variant="body1">
                            Exámenes Realizados: <strong>{estadoGenerales.total_examenes}</strong>
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <Typography variant="body1">
                            Estado Nutricional: <strong>{estadoGenerales.porcentaje_imc_normal}%</strong>
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <Typography variant="body1">
                            Estado Cardiaco: <strong>{estadoGenerales.porcentaje_estado_normal}%</strong>
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <Typography variant="body1">
                                Masculino: <strong>{estadoGenerales.can_masculino}</strong> | Femenino: <strong>{estadoGenerales.can_femenino}</strong>
                            </Typography>
                        </ListItem>
                    </List>
                </Paper>

                {/* Línea separadora */}
                <Divider sx={{ my: 2 }} />

                {/* Sección de botones */}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
            
                    <Button
                        onClick={ () => handleOpenModal ('Presion Sistolica')}
                        variant="contained"
                        startIcon={<CalculateIcon />}
                        sx={{
                            backgroundColor: "secondary.main",
                            color: "white",
                            borderRadius: 8,
                            px: 3,
                            py: 1.5,
                            fontWeight: "bold",
                            "&:hover": {
                            backgroundColor: "secondary.dark",
                            },
                        }}
                    >
                        Calculadora IMC
                    </Button>
                </Box>
            </CardContent>
        </Card>
    </Box>
  )
}
