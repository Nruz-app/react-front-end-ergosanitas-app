import { Box,Button,Card, CardContent,  List, ListItem, ListItemIcon, Paper, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useState } from "react";
import { UseChequeoService } from "../../services/useChequeoService";
import { LoginContext } from "../../../common/context";
import { EstadoGenerales } from "../../interface";
import { ModalBarContext } from "../../context/modal-bar/Modal-bar-Context";
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WcIcon from '@mui/icons-material/Wc';
import BarChartIcon from '@mui/icons-material/BarChart';

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
    can_femenino            : 0,
    can_realizado           : 0,    
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
                    <Typography
                        variant="h5"
                        color="primary"
                        sx={{
                            fontWeight: 600,
                            mb: 2,
                            textAlign: "center",
                        }}
                    >
                        Estado General
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <AssignmentIcon  sx={{ color: '#1976D2', fontSize: 28 }} />
                            </ListItemIcon>
                            <Typography variant="body1">
                            Exámenes Total: <strong>{estadoGenerales.total_examenes}</strong>
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <TaskAltIcon sx={{ color: '#388E3C ', fontSize: 28 }} />
                            </ListItemIcon>
                            <Typography variant="body1">
                            Exámenes Realizados: <strong>{estadoGenerales.can_realizado ?? 0}</strong>
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                            <RestaurantIcon  sx={{ color: '#FFA000', fontSize: 28 }}  />
                            </ListItemIcon>
                            <Typography variant="body1">
                            Estado Nutricional: <strong>{estadoGenerales.porcentaje_imc_normal}%</strong>
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                            <FavoriteIcon  sx={{ color: '#D32F2F', fontSize: 28 }}  />
                            </ListItemIcon>
                            <Typography variant="body1">
                            Estado Cardiaco: <strong>{estadoGenerales.porcentaje_estado_normal?? 0}%</strong>
                            </Typography>
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <WcIcon sx={{ color: '#1976D2', fontSize: 28 }}  />
                            </ListItemIcon>
                            <Typography variant="body1">
                                Masculino: <strong>{estadoGenerales.can_masculino}</strong> | Femenino: <strong>{estadoGenerales.can_femenino}</strong>
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <BarChartIcon sx={{ color: '#388E3C', fontSize: 28 }} />
                            </ListItemIcon>
                            <Typography variant="body1">
                                Normales: <strong>{estadoGenerales.can_estado_normal}</strong> | Alterados: <strong>{estadoGenerales.can_estado_alterado}</strong>
                            </Typography>
                        </ListItem>
                    </List>
                </Paper>
    
                {
                <Box sx={{ display: "flex", justifyContent: "center" }}>
            
                    <Button
                        onClick={ () => handleOpenModal ('Presion Sistolica')}
                        variant="contained"
                        startIcon={<DescriptionIcon />}
                        sx={{
                            backgroundColor: "#66bb6a",
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
                        Detalle Clinico
                    </Button>
                </Box>
                }
            </CardContent>
        </Card>
    </Box>
  )
}
