import { Box, Button, Card, CardContent, Divider, List, ListItem, ListItemIcon, Paper, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useState } from "react";
import { UseChequeoService } from "../../services/useChequeoService";
import { LoginContext } from "../../../common/context";
import { EstadoGenerales } from "../../interface";
import { ModalBarContext } from "../../context/modal-bar/Modal-bar-Context";

import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
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
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
                    <Button
                    onClick={ () => handleOpenModal ('Presion Alterial')}
                    variant="contained"
                    startIcon={<BarChartIcon />}
                    sx={{
                        backgroundColor: "primary.main",
                        color: "white",
                        borderRadius: 8,
                        px: 3,
                        py: 1.5,
                        fontWeight: "bold",
                        "&:hover": {
                        backgroundColor: "primary.dark",
                        },
                    }}
                    >
                        Presión Arterial
                    </Button>

                    <Button
                        onClick={ () => handleOpenModal ('Presion Sistolica')}
                        variant="contained"
                        startIcon={<TimelineIcon />}
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
                    Presión Sistólica
                    </Button>
                </Box>
            </CardContent>
        </Card>
    </Box>
  )
}
