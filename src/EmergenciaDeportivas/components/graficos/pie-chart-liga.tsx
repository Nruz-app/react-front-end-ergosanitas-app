import { useCallback, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../../../common/context';
import { UseIncidentesService } from "../../../Incidentes/services/use-incidentes.service"; 
import { type LigaData } from '../../interfaces/liga.interface';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';

const initialValues: LigaData = {
  labels: [],
  data: [],
}

// Registrar los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export const PieChartLiga = () => {

  const { user } = useContext(LoginContext);
  const { user_email } = user;

  const [liga, setLiga] = useState<LigaData>(initialValues);

  const fetchSpEstadisticaLiga = useCallback(async (): Promise<void> => {
    try {
     const {  SpEstadisticaLiga } = await UseIncidentesService() ;
      const response = await SpEstadisticaLiga(user_email);
      setLiga(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user_email]);

  useEffect(() => {
    fetchSpEstadisticaLiga();
  }, [fetchSpEstadisticaLiga]);


  const data: ChartData<'pie', number[], string> = {
    labels: liga.labels,
    datasets: [
      {
        label: 'Lesiones por Club',
        data: liga.data,
        backgroundColor: [
              "#FFCC80", 
              "#81C784",
              "#f39c12", 
              "#FF8A80",
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 12,
      },
    ],
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: {
            size: 13,
            family: 'Poppins, Roboto, sans-serif',
            weight: 800,
          },
          color: '#444',
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        padding: 10,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1200,
      easing: 'easeOutQuart' as const,
    },
  };

  return (
   <Box
      sx={{
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        p: 3,
      }}
    > 
 {/* GRÁFICO */}
        <Card
          sx={{
            borderRadius: 5,
            boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
            background: "linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)",
            textAlign: "center",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            },
          }}
        >
          <CardHeader
            title={
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1565c0",
                  letterSpacing: 0.5,
                  fontFamily: "Poppins, Roboto, sans-serif",
                }}
              >
              Lesiones por Club
              </Typography>
            }
          />

          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 3,
            }}
          >
            <Box
              sx={{
                height: 320,
                width: 380,
                p: 2,
                backgroundColor: "#fff",
                borderRadius: 3,
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pie data={data} options={options} />
            </Box>
          </CardContent>
        </Card>
      </Box>
  );
};
