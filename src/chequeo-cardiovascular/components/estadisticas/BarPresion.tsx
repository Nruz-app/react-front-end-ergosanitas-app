import { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
    BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,
} from 'chart.js';

import { LoginContext } from '../../../common/context';
import type { IEstadisticaPresion } from '../../interface';
import { UseEstadisticasService } from '../../services';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SIN_DATOS: IEstadisticaPresion = { total_paciente: 0, labels: [], data: [] };

/** Distribución de presión arterial del colegio, en barras. */
export const BarPresion = () => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [serie, setSerie] = useState<IEstadisticaPresion>(SIN_DATOS);
    const [cargado, setCargado] = useState(false);

    const cargar = useCallback(async () => {

        try {
            const { getEstadisticaPresion } = UseEstadisticasService();
            const response = await getEstadisticaPresion(user_email);

            // Mismo blindaje que en `GraficoTorta`: el backend devuelve 200 con sobre de error
            // en algunos endpoints de estadísticas, y sin esto el Home se cae entero.
            setSerie(Array.isArray(response?.data) ? response : SIN_DATOS);
        }
        catch (problema) {
            console.error('Error al cargar la presión arterial:', problema);
            setSerie(SIN_DATOS);
        }
        finally {
            setCargado(true);
        }
    }, [user_email]);

    useEffect(() => { cargar(); }, [cargar]);

    const hayDatos = serie.data.length > 0 && serie.data.some((valor) => valor > 0);

    return (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e3f2fd', height: '100%' }}>
            <CardContent>
                <Typography
                    component="h3"
                    sx={{ fontWeight: 700, fontSize: 15, color: '#0d47a1', mb: 0.5 }}
                >
                    Presión arterial
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>
                    { serie.total_paciente > 0
                        ? `${serie.total_paciente} deportistas`
                        : 'Sin mediciones registradas' }
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
                        <Bar
                            data={{
                                labels   : serie.labels,
                                datasets : [{
                                    label           : 'Deportistas',
                                    data            : serie.data,
                                    backgroundColor : ['#81C784', '#FFCC80', '#FFA000', '#E57373'],
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
                                scales: {
                                    y: { beginAtZero: true, ticks: { precision: 0 } },
                                },
                            }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
