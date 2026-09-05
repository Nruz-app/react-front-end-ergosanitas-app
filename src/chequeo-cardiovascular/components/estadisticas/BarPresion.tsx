import { useCallback, useContext, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip,
} from 'chart.js';

import { COLORES } from '../../config/tema';
import { LoginContext } from '../../../common/context';
import type { IEstadisticaPresion } from '../../interface';
import { UseEstadisticasService } from '../../services';
import { colorClinico, estadoDeTarjeta } from '../../utilities';

import { TablaAccesible } from './TablaAccesible';
import { TarjetaGrafico } from './TarjetaGrafico';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SIN_DATOS: IEstadisticaPresion = { total_paciente: 0, labels: [], data: [] };

/**
 * Distribución de presión arterial del colegio, en barras.
 *
 * Se queda en barras y no pasa a dona como los otros tres: la presión se lee comparando
 * categorías entre sí, y para eso una barra es más precisa que un ángulo.
 */
export const BarPresion = () => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [serie, setSerie] = useState<IEstadisticaPresion>(SIN_DATOS);
    const [cargado, setCargado] = useState(false);
    const [error, setError] = useState(false);

    const cargar = useCallback(async () => {

        try {
            setError(false);
            const { getEstadisticaPresion } = UseEstadisticasService();
            const response = await getEstadisticaPresion(user_email);

            // Mismo blindaje que en `GraficoTorta`: el backend devuelve 200 con sobre de error
            // en algunos endpoints de estadísticas, y sin esto el Home se cae entero.
            if (Array.isArray(response?.data)) setSerie(response);
            else {
                setSerie(SIN_DATOS);
                setError(true);
            }
        }
        catch (problema) {
            console.error('Error al cargar la presión arterial:', problema);
            setSerie(SIN_DATOS);
            setError(true);
        }
        finally {
            setCargado(true);
        }
    }, [user_email]);

    useEffect(() => { cargar(); }, [cargar]);

    const hayDatos = serie.data.length > 0 && serie.data.some((valor) => valor > 0);
    const estado = estadoDeTarjeta(cargado, error, hayDatos);

    const total = serie.data.reduce((suma, valor) => suma + valor, 0);
    const colores = serie.labels.map((etiqueta) => colorClinico(etiqueta));

    return (
        <TarjetaGrafico
            titulo="Presión arterial"
            subtitulo={
                serie.total_paciente > 0
                    ? `${serie.total_paciente} deportistas`
                    : 'Sin mediciones registradas'
            }
            estado={estado}
            tabla={
                <TablaAccesible
                    titulo="Presión arterial: distribución de deportistas"
                    columnas={['Categoría', 'Cantidad', 'Porcentaje']}
                    filas={serie.labels.map((etiqueta, indice) => [
                        etiqueta,
                        serie.data[indice] ?? 0,
                        `${total > 0 ? Math.round(((serie.data[indice] ?? 0) / total) * 100) : 0}%`,
                    ])}
                />
            }
        >
            <Bar
                data={{
                    labels   : serie.labels,
                    datasets : [{
                        label           : 'Deportistas',
                        data            : serie.data,
                        backgroundColor : colores,
                        borderColor     : COLORES.fondoTarjeta,
                        borderWidth     : 2,
                        borderRadius    : 6,
                    }],
                }}
                options={{
                    maintainAspectRatio : false,
                    plugins : {
                        // Una sola serie: la leyenda repetiría lo que ya dice el título.
                        legend  : { display: false },
                        tooltip : {
                            callbacks: {
                                label: (contexto) => {
                                    const valor = Number(contexto.parsed.y) || 0;
                                    const porcentaje = total > 0
                                        ? Math.round((valor / total) * 100)
                                        : 0;
                                    return ` ${valor} deportistas (${porcentaje}%)`;
                                },
                            },
                        },
                    },
                    scales: {
                        x : { grid: { display: false } },
                        y : { beginAtZero: true, ticks: { precision: 0 } },
                    },
                }}
            />
        </TarjetaGrafico>
    );
};
