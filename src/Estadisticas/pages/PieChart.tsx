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
import { IEstadisticaIMC } from '../interface/estadisticaIMC.interface';
import { LoginContext } from '../../common/context';
//import { LoginContext } from '../../common/context';

/********************************************************************* 
* * - Link Docs 
* * https://chatgpt.com/c/677ff668-0270-8007-8ef4-07c9cb21f1ae
* * https://react-chartjs-2.js.org/examples/pie-chart
* * - Instalar react-chartjs-2
* * npm install react-chartjs-2 chart.js
**********************************************************************/

const initialValues : IEstadisticaIMC = {
    labels: [],
    data: [],
    totalExamen : 0
}



// Registrar los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export const PieChartIMC = () => {

    const { user }  = useContext( LoginContext );
    const { user_email }  = user;
    
    const [estadisticaIMC,setEstadisticaIMC] = useState<IEstadisticaIMC>(initialValues);


    const fetchEstadisticaIMC = useCallback(async (): Promise<void> => {
    
          const {  getEstadisticaIMC } = UseEstadisticasService() ;
          const response = await getEstadisticaIMC(user_email);
          
          setEstadisticaIMC(response);
    }, []);
    

    useEffect(() => {
          fetchEstadisticaIMC();
    }, []);



    const data = {
        labels: estadisticaIMC.labels, //['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: "# IMC Paciente",
            data: estadisticaIMC.data,
            backgroundColor: [
              "#FFCC80", // Amarillo pastel
              "#64B5F6", // Azul pastel
              "#81C784", // Verde pastel
              "#FF8A80", // Rojo pastel
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
            Nutrición IMC
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
            style={{ width: "100%", height: "400px" }}
          />
        </Box>
      </CardContent>
    </Card>
  </Box>
  
  )
}