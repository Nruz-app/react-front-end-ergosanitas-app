import { useCallback,  useContext,  useEffect, useState } from 'react';
import { LoginContext } from '../../../common/context';
import { UseIncidentesService } from "../../../Incidentes/services/use-incidentes.service"; // Adjust the path as needed
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
} from 'chart.js'
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { isMobile } from 'react-device-detect';

const initialValues : LigaData = {
    labels: [],
    data: [],
}

// Registrar los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);


export const PieChartLiga = () => {

    const { user }  = useContext( LoginContext );
    const { user_email }  = user;
        
    const [liga,setLiga] = useState<LigaData>(initialValues);


    const fetchSpEstadisticaLiga = useCallback(async (): Promise<void> => {
        
            const {  SpEstadisticaLiga } = await UseIncidentesService() ;
            const response = await SpEstadisticaLiga(user_email);
            setLiga(response);
    }, []);
    

    useEffect(() => {
            fetchSpEstadisticaLiga();
    }, [user_email]);


    const data = {
        labels: liga.labels, 
        datasets: [
          {
            label: "# CLUB",
            data: liga.data,
            backgroundColor: [
              "#FFCC80", 
              "#81C784",
              "#f39c12", 
              "#FF8A80",
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
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
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
                Lesiones por Club
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
                style={isMobile ? undefined : { width: "100%", height: "200px" } }
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
      
    )

}