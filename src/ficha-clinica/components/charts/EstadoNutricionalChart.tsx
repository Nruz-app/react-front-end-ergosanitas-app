import { Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Plugin } from 'chart.js';
import { clasificarIMC } from './chart-utils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    imc: number | null;
}

// Rangos OMS y sus colores (mismo orden que las categorías).
const CATEGORIAS = [
    { etiqueta: 'Bajo peso', color: '#42a5f5' },
    { etiqueta: 'Normal', color: '#66bb6a' },
    { etiqueta: 'Sobrepeso', color: '#ffa726' },
    { etiqueta: 'Obesidad', color: '#ef5350' },
];

/**
 * Dona de estado nutricional según el IMC actual: resalta la categoría del
 * paciente y muestra el valor de IMC al centro mediante un plugin inline.
 */
export const EstadoNutricionalChart = ({ imc }: Props) => {

    // Sin IMC no hay categoría que resaltar: una dona con las cuatro categorías
    // atenuadas se leería como "ninguna", que no es lo mismo que "no sabemos".
    if (imc === null) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sin IMC registrado en este control.
            </Typography>
        );
    }

    const categoriaActual = clasificarIMC(imc);

    const data = {
        labels: CATEGORIAS.map((c) => c.etiqueta),
        datasets: [
            {
                data: [1, 1, 1, 1], // segmentos iguales; el color indica la categoría activa
                backgroundColor: CATEGORIAS.map((c) =>
                    c.etiqueta === categoriaActual.etiqueta ? c.color : `${c.color}33`,
                ),
                borderColor: '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    // Plugin inline que dibuja el IMC y la categoría en el centro de la dona.
    const centerText: Plugin<'doughnut'> = {
        id: 'centerTextIMC',
        afterDraw: (chart) => {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);
            const arc = meta.data[0] as unknown as { x: number; y: number };
            if (!arc) return;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = '700 30px Roboto';
            ctx.fillStyle = categoriaActual.color;
            ctx.fillText(imc.toFixed(1), arc.x, arc.y - 8);

            ctx.font = '600 13px Roboto';
            ctx.fillStyle = '#555';
            ctx.fillText(categoriaActual.etiqueta, arc.x, arc.y + 16);
            ctx.restore();
        },
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    font: { size: 12, family: 'Roboto', weight: 'bold' as const },
                    color: '#333',
                    padding: 12,
                    usePointStyle: true,
                },
            },
            tooltip: { enabled: false },
        },
    };

    return <Doughnut data={data} options={options} plugins={[centerText]} />;
};

export default EstadoNutricionalChart;
