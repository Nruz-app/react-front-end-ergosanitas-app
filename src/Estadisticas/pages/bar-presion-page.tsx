import { Box, Card, CardContent, CardHeader,  Typography } from "@mui/material";
import { Bar  } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useCallback, useContext, useEffect, useState } from "react";
import { isMobile } from 'react-device-detect';
import { UseEstadisticasService } from "../services/UseEstadisticasService";
import { LoginContext } from "../../common/context";
import { IEstadisticaPresion } from "../interface";


// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const initialValues : IEstadisticaPresion = {
  total_paciente  : 0,
  labels          : [],
  data            : [],
}

export const BarPresionPage = () => {

    const { user }  = useContext( LoginContext );
    const { user_email }  = user;

    const [presionAlterial,setPresionAlterial] = useState<IEstadisticaPresion>(initialValues);
    

    const fetchEstadisticaPresion = useCallback(async (): Promise<void> => {
        const {  getEstadisticaPresion } = UseEstadisticasService() ;
        const responseEstadisticaPresion = await getEstadisticaPresion(user_email);
        setPresionAlterial(responseEstadisticaPresion);
    }, []);


    useEffect(() => {
              fetchEstadisticaPresion();
    }, []);
    
    const data = {
      labels: presionAlterial.labels, // Nombres de los pacientes
      datasets: [
        {
          label: '# Presión Alterial',
          data: presionAlterial.data,
          backgroundColor: [
            "#81C784",
            "#FFCC80",
            "#FFA500",
            "#FF8A80",
          ],
           borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    };
    
  return (
      <Box sx={{  justifyContent: "center", alignItems: "center", p: 3, }}>
      
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
                Presión Arterial
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
                  height: "250px", 
                }}
              >  
                <Bar
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
                  style={isMobile ? { width: "100%", height: "800px" } : {} }
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
  )
}
