import { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
    ArcElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,
} from 'chart.js';

import { LoginContext } from '../../../common/context';
import type { IEstadistica } from '../../interface';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const SIN_DATOS: IEstadistica = { labels: [], data: [], totalExamen: 0 };

interface Props {
    titulo   : string;
    etiqueta : string;
    colores  : string[];
    /** Trae la serie del backend para el `user_email` del colegio. */
    fetchSerie : (user_email: string) => Promise<IEstadistica>;
}

/**
 * Base común de los tres gráficos de torta del Home (IMC, hemoglucotest, saturación).
 *
 * En el módulo original eran tres archivos de ~145 líneas idénticos salvo el título, los
 * colores y el método del servicio. Aquí la diferencia va por props y cada gráfico se queda en
 * media docena de líneas, lo que también garantiza que los tres se vean consistentes entre sí.
 */
export const GraficoTorta = ({ titulo, etiqueta, colores, fetchSerie }: Props) => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [serie, setSerie] = useState<IEstadistica>(SIN_DATOS);
    const [cargado, setCargado] = useState(false);

    const cargar = useCallback(async () => {

        try {
            const response = await fetchSerie(user_email);

            // El backend puede responder 200 con un sobre de error en vez de la serie
            // (`{response: {status: 'Error en ejecucion', ...}}`). Sin esta comprobación,
            // `serie.data.length` reventaría en el render y tumbaría el Home entero por un
            // solo gráfico caído.
            setSerie(Array.isArray(response?.data) ? response : SIN_DATOS);
        }
        catch (problema) {
            // Que la API falle no debe dejar el Home en blanco: el resto de tarjetas sigue viva.
            console.error(`Error al cargar «${titulo}»:`, problema);
            setSerie(SIN_DATOS);
        }
        finally {
            setCargado(true);
        }
    }, [fetchSerie, user_email, titulo]);

    useEffect(() => { cargar(); }, [cargar]);

    const hayDatos = serie.data.length > 0 && serie.data.some((valor) => valor > 0);

    return (
        <Card
            elevation={0}
            sx={{ borderRadius: 3, border: '1px solid #e3f2fd', height: '100%' }}
        >
            <CardContent>
                <Typography
                    component="h3"
                    sx={{ fontWeight: 700, fontSize: 15, color: '#0d47a1', mb: 0.5 }}
                >
                    { titulo }
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>
                    { serie.totalExamen > 0 ? `${serie.totalExamen} exámenes` : 'Sin exámenes registrados' }
                </Typography>

                <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    { !cargado && (
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Cargando…</Typography>
                    )}

                    { cargado && !hayDatos && (
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                            Todavía no hay datos suficientes.
                        </Typography>
                    )}

                    { cargado && hayDatos && (
                        <Pie
                            data={{
                                labels   : serie.labels,
                                datasets : [{
                                    label           : etiqueta,
                                    data            : serie.data,
                                    backgroundColor : colores,
                                    borderColor     : '#ffffff',
                                    borderWidth     : 2,
                                }],
                            }}
                            options={{
                                maintainAspectRatio : false,
                                plugins : {
                                    legend: {
                                        display  : true,
                                        position : 'bottom',
                                        labels   : {
                                            font    : { size: 12, family: 'Roboto' },
                                            color   : '#555',
                                            padding : 12,
                                            boxWidth: 12,
                                        },
                                    },
                                },
                            }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
