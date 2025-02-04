
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
import { Box, Card, CardContent, Typography } from '@mui/material';


// Registrar los componentes de Chart.js necesarios
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


export const ChartsPage = () => {


    const data = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
        datasets: [
          {
            label: 'Temperatura',
            data: [22, 25, 28, 26, 29, 31, 30],
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },  
          title: {
            display: true,
            text: 'Temperatura por Mes',
            color: '#333',
          },
        },
        scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(200, 200, 200, 0.2)' },
            },
            x: { grid: { display: false } },
          },
      };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
      <Card
        sx={{
          width: 400,
          borderRadius: 4,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ textAlign: 'center', color: '#42a5f5', fontWeight: 'bold', marginBottom: 2 }}>
            Temperatura por Mes
          </Typography>
          <Box sx={{ height: 250 }}>
            <Line data={data} options={options} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
