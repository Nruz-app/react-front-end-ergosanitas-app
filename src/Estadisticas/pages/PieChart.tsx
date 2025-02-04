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
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { UseEstadisticasService } from '../services/UseEstadisticasService';
import { IEstadisticaIMC } from '../interface/estadisticaIMC.interface';
import { LoginContext } from '../../common/context';

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
    totalExamen : 0,
    canExamenNA : 0,
}



// Registrar los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export const PieChartIMC = () => {

    const { user }  = useContext( LoginContext );
     const { user_name }  = user;
    const [estadisticaIMC,setEstadisticaIMC] = useState<IEstadisticaIMC>(initialValues);


    const fetchEstadisticaIMC = useCallback(async (): Promise<void> => {
    
          const {  getEstadisticaIMC } = UseEstadisticasService() ;
          const response = await getEstadisticaIMC('palestino.avalos@ergosanitas.com');
          
          setEstadisticaIMC(response);
    }, []);
    

    useEffect(() => {
          fetchEstadisticaIMC();
    }, []);



    const data = {
        labels: estadisticaIMC.labels, //['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: '# IMC Paciente',
            data: estadisticaIMC.data, //[12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              //'rgba(75, 192, 192, 0.2)',
              //'rgba(153, 102, 255, 0.2)',
              //'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              //'rgba(75, 192, 192, 1)',
              //'rgba(153, 102, 255, 1)',
              //'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
    };




  return (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
            backgroundColor: '#f9f9f9',
            borderRadius: 2,
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
            margin: 3,
        }}
    >
        <Typography
            variant="h4"
            align="center"
            sx={{
                fontFamily: 'cursive',
                fontWeight: 'bold',
                letterSpacing: '0.1rem',
                textTransform: 'uppercase',
                color: 'primary.main',
                marginBottom: 3,
                animation: 'fadeInDownBig 1s ease-out',
            }}
        >
            Cantidad de Pacientes Por IMC - { user_name }
        </Typography>

        <Card
            sx={{
                width: 450,
                borderRadius: 4,
                boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.15)',
                backgroundColor: 'white',
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 2,
                        backgroundColor: '#e3f2fd',
                        borderRadius: 3,
                    }}
                >
                    <Pie
                        data={data}
                        options={{
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                    labels: {
                                        font: {
                                            size: 14,
                                            family: 'Roboto',
                                        },
                                    },
                                },
                            },
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    </Box>
  )
}