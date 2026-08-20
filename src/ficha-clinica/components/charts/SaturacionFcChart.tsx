import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { IElectrocardiograma } from '../../interface';
import { baseLineOptions, buildLabels } from './chart-utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

interface Props {
    electrocardiogramas: IElectrocardiograma[];
}

// Evolución de saturación de O2 (%) y frecuencia cardíaca (ppm) en dos ejes Y.
export const SaturacionFcChart = ({ electrocardiogramas }: Props) => {

    // El modelo entrega orden descendente; el eje X se grafica en orden
    // cronológico. Se invierte una COPIA para no dar vuelta la tabla.
    const cronologico = [...electrocardiogramas].reverse();

    const data = {
        labels: buildLabels(cronologico),
        datasets: [
            {
                label: 'Saturación O₂ (%)',
                data: cronologico.map((e) => e.saturacionOxigeno),
                borderColor: '#26c6da',
                backgroundColor: 'rgba(38, 198, 218, 0.2)',
                tension: 0.35,
                fill: true,
                yAxisID: 'y',
                pointRadius: 4,
                // Un control sin dato deja hueco, no un cero.
                spanGaps: true,
            },
            {
                label: 'Frecuencia cardíaca (ppm)',
                data: cronologico.map((e) => e.frecuenciaCardiaca),
                borderColor: '#ab47bc',
                backgroundColor: 'rgba(171, 71, 188, 0.15)',
                tension: 0.35,
                fill: false,
                yAxisID: 'y1',
                pointRadius: 4,
                spanGaps: true,
            },
        ],
    };

    const options = {
        ...baseLineOptions,
        scales: {
            y: {
                type: 'linear' as const,
                position: 'left' as const,
                title: { display: true, text: 'SpO₂ (%)' },
                suggestedMin: 90,
                suggestedMax: 100,
            },
            y1: {
                type: 'linear' as const,
                position: 'right' as const,
                title: { display: true, text: 'FC (ppm)' },
                grid: { drawOnChartArea: false },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export default SaturacionFcChart;
