import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { IElectrocardiograma } from '../../interface';
import { baseLineOptions, buildLabels } from './chart-utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
    electrocardiogramas: IElectrocardiograma[];
}

// Evolución de presión arterial: sistólica vs diastólica (mmHg).
export const PresionChart = ({ electrocardiogramas }: Props) => {

    // El modelo entrega orden descendente; el eje X se grafica en orden
    // cronológico. Se invierte una COPIA para no dar vuelta la tabla.
    const cronologico = [...electrocardiogramas].reverse();

    const data = {
        labels: buildLabels(cronologico),
        datasets: [
            {
                label: 'Sistólica (mmHg)',
                data: cronologico.map((e) => e.presionSistolica),
                borderColor: '#ef5350',
                backgroundColor: 'rgba(239, 83, 80, 0.15)',
                tension: 0.35,
                pointRadius: 4,
                // Un control sin dato deja hueco, no un cero.
                spanGaps: true,
            },
            {
                label: 'Diastólica (mmHg)',
                data: cronologico.map((e) => e.presionDiastolica),
                borderColor: '#ffa726',
                backgroundColor: 'rgba(255, 167, 38, 0.15)',
                tension: 0.35,
                pointRadius: 4,
                spanGaps: true,
            },
        ],
    };

    const options = {
        ...baseLineOptions,
        scales: {
            y: { title: { display: true, text: 'mmHg' } },
        },
    };

    return <Line data={data} options={options} />;
};

export default PresionChart;
