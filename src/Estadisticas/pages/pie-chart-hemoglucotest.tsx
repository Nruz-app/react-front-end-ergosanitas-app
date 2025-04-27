import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { useCallback,  useContext,  useEffect, useState } from 'react';
import { UseEstadisticasService } from '../services/UseEstadisticasService';
import { IEstadistica } from '../interface/estadisticaIMC.interface';
import { LoginContext } from '../../common/context';
//import { LoginContext } from '../../common/context';
import { isMobile } from 'react-device-detect';

/********************************************************************* 
* * - Link Docs 
* * https://chatgpt.com/c/677ff668-0270-8007-8ef4-07c9cb21f1ae
* * https://react-chartjs-2.js.org/examples/pie-chart
* * - Instalar react-chartjs-2
* * npm install react-chartjs-2 chart.js
**********************************************************************/

const initialValues : IEstadistica = {
    labels: [],
    data: [],
    totalExamen : 0
}



// Registrar los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export const PieChartHemoglucotest = () => {

    const { user }  = useContext( LoginContext );
    const { user_email }  = user;
    
    const [estadistica,setEstadistica] = useState<IEstadistica>(initialValues);


    const fetchEstadisticaHemoglucotest = useCallback(async (): Promise<void> => {
    
          const {  getEstadisticaHemoglucotest } = UseEstadisticasService() ;
          const response = await getEstadisticaHemoglucotest(user_email);
          
          setEstadistica(response);
    }, []);
    

    useEffect(() => {
          fetchEstadisticaHemoglucotest();
    }, []);



    const data = {
        labels: estadistica.labels, 
        datasets: [
          {
            label: "# Hemoglucotest",
            data: estadistica.data,
            backgroundColor: [
              "#FFCC80",
              "#81C784",  
              "#FF8A80"
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
    };




  return (
    <Box sx={{  justifyContent: "center", alignItems: "center", p: 3 }}>
    <Card
      sx={{
        borderRadius: 6,
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)", // Sombra más elegante
        backgroundColor: "white",
        textAlign: "center",
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              letterSpacing: "0.5px",
            }}
          >
            Glicemia Capilar
          </Typography>
        }
      />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
            backgroundColor: "#f9f9f9",
            borderRadius: 4,
            
          }}
        >
          <Pie
            data={data}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    font: {
                      size: 12,
                      family: "Roboto",
                      weight: "bold",
                    },
                    color: "#333",
                    padding: 15,
                  },
                },
              },
            }}
            style={isMobile ? undefined : { width: "100%", height: "300px" } }
          />
        </Box>
      </CardContent>
    </Card>
  </Box>
  
  )
}