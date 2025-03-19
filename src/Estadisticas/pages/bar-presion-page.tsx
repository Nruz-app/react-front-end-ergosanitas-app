import { Box, Card, CardContent, CardHeader, IconButton, Modal, Typography } from "@mui/material";
import { Bar,Line  } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useCallback, useContext, useEffect, useState } from "react";
import { ModalBarContext } from "../../Chequeo/context/modal-bar/Modal-bar-Context";
import { UseEstadisticasService } from "../services/UseEstadisticasService";
import { LoginContext } from "../../common/context";
import { IEstadisticaPresion } from "../interface";


import HighlightOffIcon from '@mui/icons-material/HighlightOff';
// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const initialValues : IEstadisticaPresion = {
  total_paciente      : 0,
  nombres_pacientes   : [],
  presion_alterial    : [],
  presion_sistolica   : []
}




export const BarPresionPage = () => {

    const { user }  = useContext( LoginContext );
    const { user_email }  = user;

    const [presionAlterial,setPresionAlterial] = useState<IEstadisticaPresion>(initialValues);
    const { isModalOpen,onOpenModal,typePresion }  = useContext( ModalBarContext );


    const fetchEstadisticaPresion = useCallback(async (): Promise<void> => {
        const {  getEstadisticaPresion } = UseEstadisticasService() ;
        const responseEstadisticaPresion = await getEstadisticaPresion(user_email);
        setPresionAlterial(responseEstadisticaPresion);
    }, [typePresion]);


    const handleClose = () => {
      setPresionAlterial(initialValues);
      onOpenModal({isModalOpen : false,typePresion : ''});
    }

    useEffect(() => {
              fetchEstadisticaPresion();
    }, [typePresion]);
    
    let data = {
      labels: presionAlterial.nombres_pacientes, // Nombres de los pacientes
      datasets: [
        {
          label: 'Presión Alterial',
          data: presionAlterial.presion_alterial,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
    
    if (typePresion != 'Presion Alterial') {
      data = {
          labels: presionAlterial.nombres_pacientes, // Nombres de los pacientes
          datasets: [
            {
              label: 'Presión Diastólica',
              data: presionAlterial.presion_sistolica,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
      };
    }
    
  return (
    <Modal
      keepMounted
      open={isModalOpen}
      onClose={handleClose}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          p: 2, // Añade un pequeño padding para evitar que se pegue a los bordes
        }}
      >
        <Card
          sx={{
            borderRadius: 6,
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
            backgroundColor: "white",
            textAlign: "center",
            width: "90vw", // Ajusta el ancho dinámicamente
            maxWidth: "1200px", // Límite máximo para que no sea demasiado grande
            maxHeight: "80vh", // Limita la altura del modal
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardHeader
            title={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between", // Separa el título y el botón
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    letterSpacing: "0.5px",
                  }}
                >
                  { typePresion }
                </Typography>
                
                {/* Botón de eliminar */}
                <IconButton onClick={handleClose} sx={{ color: "error.main" }}>
                  <HighlightOffIcon />
                </IconButton>
              </Box>
            }
          />
            <CardContent
              sx={{
                flex: 1,
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: "60vh", // Ajusta el contenido para permitir scroll vertical
              }}
            >
              <Box
                sx={{
                  p: 3,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 4,
                  minWidth: "1200px", // Hace que el gráfico sea ancho y provoque scroll horizontal si es necesario
                  minHeight: "500px", // Asegura que el gráfico tenga buena altura
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
              {
                (typePresion == 'Presion Alterial') ? (

                  <Bar
                    data={data}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "top",
                          labels: {
                            font: {
                              size: 14,
                              family: "Roboto",
                              weight: "bold",
                            },
                            color: "#333",
                            padding: 15,
                          },
                        },
                      },
                    }}
                    width={1000}
                    height={400}
                  />
                )
                : (
                  <Line
                    data={data} // Aquí usas el mismo 'data' que tenías para el gráfico de barras
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "top",
                          labels: {
                            font: {
                              size: 14,
                              family: "Roboto",
                              weight: "bold",
                            },
                            color: "#333",
                            padding: 15,
                          },
                        },
                      },
                      scales: {
                        x: {
                          beginAtZero: true, // Inicia el eje X desde 0
                          grid: {
                            color: "#f0f0f0", // Color de la cuadrícula del eje X
                          },
                        },
                        y: {
                          beginAtZero: true, // Inicia el eje Y desde 0
                          grid: {
                            color: "#f0f0f0", // Color de la cuadrícula del eje Y
                          },
                          ticks: {
                            font: {
                              size: 14,
                              family: "Roboto",
                              weight: "bold",
                            },
                            color: "#333",
                          },
                        },
                      },
                    }}
                    width={1000}
                    height={400}
                  /> 
                )
              }
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Modal>
  )
}
