import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WcIcon from '@mui/icons-material/Wc';

import { COLORES, sxFocoVisible, sxTarjeta, sxTituloSeccion } from '../../config/tema';
import { LoginContext } from '../../../common/context';
import { ModalBarContext } from '../../context';
import type { EstadoGenerales } from '../../interface';
import { UseChequeoCardiovascularService } from '../../services';

const SIN_DATOS: EstadoGenerales = {
    total_examenes           : 0,
    total_examenes_ec        : 0,
    porcentaje_imc_normal    : 0,
    porcentaje_estado_normal : 0,
    can_imc_anormal          : 0,
    can_estado_normal        : 0,
    can_estado_alterado      : 0,
    can_imc_normal           : 0,
    can_masculino            : 0,
    can_femenino             : 0,
    can_realizado            : 0,
};

interface KpiProps {
    icon     : ReactNode;
    label    : string;
    valor    : ReactNode;
    destacado?: boolean;
}

/** Una cifra del encabezado. La cifra manda visualmente; la etiqueta la acompaña. */
const Kpi = ({ icon, label, valor, destacado = false }: KpiProps) => (

    <Paper
        elevation={0}
        sx={{
            ...sxTarjeta,
            p            : 2,
            borderRadius : 2.5,
            backgroundColor : destacado ? COLORES.fondoSuave : COLORES.fondoTarjeta,
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            { icon }
            <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                { label }
            </Typography>
        </Box>
        <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 700, color: COLORES.primarioOsc, lineHeight: 1.1 }}>
            { valor }
        </Typography>
    </Paper>
);

/**
 * Encabezado del Home: los 11 contadores de `estado-general`, repartidos en 6 tarjetas.
 *
 * Rediseño respecto al original, que era una lista vertical de seis líneas de texto donde la
 * cifra pesaba lo mismo que su etiqueta. Aquí la cifra manda y se leen de un vistazo.
 */
export const StatisticsGlobal = () => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;
    const { onOpenModal } = useContext(ModalBarContext);

    const [estado, setEstado] = useState<EstadoGenerales>(SIN_DATOS);

    const cargar = useCallback(async () => {

        try {
            const { getEstadoGeneral } = await UseChequeoCardiovascularService();
            setEstado(await getEstadoGeneral(user_email));
        }
        catch (problema) {
            console.error('Error al cargar el estado general:', problema);
            setEstado(SIN_DATOS);
        }
    }, [user_email]);

    useEffect(() => { cargar(); }, [cargar]);

    return (
        <Box sx={{ width: '100%' }}>
            <Typography
                component="h2"
                sx={{ ...sxTituloSeccion, mb: 2 }}
            >
                Estado general del colegio
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <Kpi
                        icon={<AssignmentIcon sx={{ color: COLORES.primario, fontSize: 20 }} aria-hidden="true" />}
                        label="Exámenes totales"
                        valor={estado.total_examenes}
                        destacado
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Kpi
                        icon={<TaskAltIcon sx={{ color: COLORES.normal, fontSize: 20 }} aria-hidden="true" />}
                        label="Exámenes realizados"
                        valor={estado.can_realizado ?? 0}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Kpi
                        icon={<RestaurantIcon sx={{ color: COLORES.limite, fontSize: 20 }} aria-hidden="true" />}
                        label="Estado nutricional normal"
                        valor={`${estado.porcentaje_imc_normal ?? 0}%`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Kpi
                        icon={<FavoriteIcon sx={{ color: COLORES.alterado, fontSize: 20 }} aria-hidden="true" />}
                        label="Estado cardíaco normal"
                        valor={`${estado.porcentaje_estado_normal ?? 0}%`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Kpi
                        icon={<WcIcon sx={{ color: COLORES.primario, fontSize: 20 }} aria-hidden="true" />}
                        label="Masculino / Femenino"
                        valor={`${estado.can_masculino} / ${estado.can_femenino}`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Kpi
                        icon={<BarChartIcon sx={{ color: COLORES.normal, fontSize: 20 }} aria-hidden="true" />}
                        label="Normales / Alterados"
                        valor={`${estado.can_estado_normal} / ${estado.can_estado_alterado}`}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                    onClick={() => onOpenModal({ isModalOpen: true, typePresion: 'Presion Sistolica' })}
                    startIcon={<DescriptionIcon />}
                    variant="outlined"
                    size="small"
                    sx={{
                        textTransform : 'none',
                        fontWeight    : 600,
                        borderRadius  : 2,
                        borderColor   : COLORES.primario,
                        color         : COLORES.primario,
                        '&:hover'     : {
                            borderColor     : COLORES.primarioOsc,
                            backgroundColor : COLORES.fondoSuave,
                        },
                        ...sxFocoVisible,
                    }}
                >
                    Detalle clínico
                </Button>
            </Box>
        </Box>
    );
};
