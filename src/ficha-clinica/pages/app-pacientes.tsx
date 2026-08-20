import { useCallback, useContext, useEffect, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { LoginContext } from '../../common/context';
import { UsePacienteService } from '../services';
import { IFichaClinica } from '../interface';
import { EmptyState } from '../components/EmptyState';
import { TabHome } from '../components/tabs/TabHome';
import { TabBioimpedancias } from '../components/tabs/TabBioimpedancias';
import { TabElectrocardiogramas } from '../components/tabs/TabElectrocardiogramas';
import { TabDistribucionSegmentaria } from '../components/tabs/TabDistribucionSegmentaria';

/**
 * RUT de respaldo para desarrollo sin sesión iniciada.
 *
 * Es el mismo con el que se consultó la API para generar `data/paciente.json`, así que
 * sirve tanto con el mock como apuntando al backend real.
 */
const RUT_DEMO = '16900918-k';

/**
 * Contenedor de la ficha clínica.
 *
 * Es el único punto del módulo que hace fetch: pide la ficha, muestra el estado de
 * carga y reparte los datos ya normalizados a cada tab por props.
 */
export const AppPacientePages = () => {

    // La API entrega la ficha de una persona a la vez. Esta página la monta `routesPA`
    // solo para el perfil 'Paciente', que ve la suya: el RUT sale de su sesión.
    const { user } = useContext(LoginContext);
    const rut = user?.rut_paciente || RUT_DEMO;

    const [ficha, setFicha] = useState<IFichaClinica | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState(0);

    const fetchFicha = useCallback(async (): Promise<void> => {

        setCargando(true);
        setError(null);

        try {
            const { getFichaClinica } = UsePacienteService();
            setFicha(await getFichaClinica(rut));
        } catch (problema) {
            // Sin esto un 404 o un 500 dejarían la vista en el spinner para siempre.
            // Que la API falle y que la app se cuelgue tienen que verse distinto.
            setFicha(null);
            setError(problema instanceof Error
                ? problema.message
                : 'No hay respuesta del servidor.');
        } finally {
            setCargando(false);
        }
    }, [rut]);

    useEffect(() => {
        fetchFicha();
    }, [fetchFicha]);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    // Estado de carga (mientras resuelve la Promise del servicio).
    if (cargando) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80vh',
                    gap: 2,
                }}
            >
                <CircularProgress size={56} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Cargando ficha clínica…
                </Typography>
            </Box>
        );
    }

    // La petición falló, o llegó una respuesta sin ficha. Se ofrece reintentar antes que
    // obligar a recargar la aplicación entera.
    if (error || !ficha) {
        return (
            <Container maxWidth="sm" sx={{ py: 6 }}>
                <Paper elevation={3} sx={{ borderRadius: 3, py: 2 }}>
                    <EmptyState
                        icon={<ErrorOutlineIcon fontSize="inherit" color="error" />}
                        mensaje="No se pudo cargar la ficha clínica"
                        detalle={error ?? 'No hay respuesta del servidor.'}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 3 }}>
                        <Button variant="contained" onClick={fetchFicha}>
                            Reintentar
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    const { paciente, bioimpedancias, electrocardiogramas } = ficha;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>

                {/* Encabezado */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Typography variant="h5" fontWeight={600}>
                        Ficha clínica
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {paciente.nombre ? `${paciente.nombre} · ` : ''}{paciente.rut}
                    </Typography>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        icon={<PersonIcon />}
                        iconPosition="start"
                        label="Home"
                    />
                    <Tab
                        icon={<MonitorWeightIcon />}
                        iconPosition="start"
                        label={`Bioimpedancias (${bioimpedancias.length})`}
                    />
                    <Tab
                        icon={<MonitorHeartIcon />}
                        iconPosition="start"
                        label={`Electrocardiogramas (${electrocardiogramas.length})`}
                    />
                    <Tab
                        icon={<AccessibilityNewIcon />}
                        iconPosition="start"
                        label="Distribución Segmentaria"
                    />
                </Tabs>

                {/* Contenido */}
                <Box p={3}>
                    {tab === 0 && (
                        <TabHome
                            paciente={paciente}
                            // El mapper ordena por fecha DESC: el primero es el más reciente.
                            ultimoElectro={electrocardiogramas[0] ?? null}
                        />
                    )}

                    {tab === 1 && <TabBioimpedancias bioimpedancias={bioimpedancias} />}

                    {tab === 2 && (
                        <TabElectrocardiogramas electrocardiogramas={electrocardiogramas} />
                    )}

                    {tab === 3 && (
                        <TabDistribucionSegmentaria
                            paciente={paciente}
                            bioimpedancias={bioimpedancias}
                            electrocardiogramas={electrocardiogramas}
                        />
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default AppPacientePages;
