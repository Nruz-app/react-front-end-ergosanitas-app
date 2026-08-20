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
import { IBioimpedancia } from '../../interface';
import { baseLineOptions, buildLabels } from './chart-utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
    bioimpedancias: IBioimpedancia[];
}

// Evolución de peso (kg) e IMC en dos ejes Y independientes.
export const PesoImcChart = ({ bioimpedancias }: Props) => {

    // El modelo entrega los exámenes en orden descendente (la tabla muestra el más
    // reciente arriba). Un gráfico de evolución necesita el orden inverso, así que
    // se invierte una COPIA: mutar el array de props rompería la tabla.
    const cronologico = [...bioimpedancias].reverse();

    const data = {
        labels: buildLabels(cronologico),
        datasets: [
            {
                label: 'Peso (kg)',
                data: cronologico.map((b) => b.pesoKg),
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.15)',
                tension: 0.35,
                fill: true,
                yAxisID: 'y',
                pointRadius: 4,
                // Un examen sin dato deja un hueco, no un cero: la línea lo salta.
                spanGaps: true,
            },
            {
                label: 'IMC',
                data: cronologico.map((b) => b.imc),
                borderColor: '#66bb6a',
                backgroundColor: 'rgba(102, 187, 106, 0.15)',
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
                title: { display: true, text: 'Peso (kg)' },
            },
            y1: {
                type: 'linear' as const,
                position: 'right' as const,
                title: { display: true, text: 'IMC' },
                grid: { drawOnChartArea: false },
            },
        },
    };

    return <Line data={data} options={options} />;
};

export default PesoImcChart;
