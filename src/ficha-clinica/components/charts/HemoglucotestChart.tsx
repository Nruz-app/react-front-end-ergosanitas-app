import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { IElectrocardiograma } from '../../interface';
import { baseLineOptions, buildLabels } from './chart-utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    electrocardiogramas: IElectrocardiograma[];
}

// Hemoglucotest (mg/dL) por fecha de atención.
export const HemoglucotestChart = ({ electrocardiogramas }: Props) => {

    // El modelo entrega orden descendente; las barras se dibujan en orden
    // cronológico. Se invierte una COPIA para no dar vuelta la tabla.
    const cronologico = [...electrocardiogramas].reverse();

    const data = {
        labels: buildLabels(cronologico),
        datasets: [
            {
                label: 'Hemoglucotest (mg/dL)',
                data: cronologico.map((e) => e.hemoglucotest),
                backgroundColor: 'rgba(255, 167, 38, 0.75)',
                borderColor: '#fb8c00',
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const options = {
        ...baseLineOptions,
        scales: {
            y: { title: { display: true, text: 'mg/dL' } },
        },
    };

    return <Bar data={data} options={options} />;
};

export default HemoglucotestChart;
