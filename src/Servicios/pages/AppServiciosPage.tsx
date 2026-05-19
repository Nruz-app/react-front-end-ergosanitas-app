import  {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

import { IServicios } from "../interface/serviio.interfaz";
import { ServiciosService } from "../service/servicios.service";

const steps = [
  "Seleccionar Servicio",
  "Datos del Servicio",
  "Confirmación",
];

export const AppServiciosPage = () => {

  const [activeStep, setActiveStep] = useState(0);

  const [valueServicios, valueServiciosSet] =
    useState<IServicios[]>([]);

  const [servicioSeleccionado, setServicioSeleccionado] =
    useState<IServicios | null>(null);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const fetchServicios = useCallback(async (): Promise<void> => {

    const { getServicios } =
      await ServiciosService();

    const response = await getServicios();

    valueServiciosSet(response);

  }, []);

  useEffect(() => {

    fetchServicios();

  }, []);

  const handleSelectServicio = (
    servicio: IServicios
  ) => {

    setServicioSeleccionado(servicio);

    handleNext();

  };

  const renderStepContent = () => {

    switch (activeStep) {

      case 0:

        return (

          <Box>

            <Typography
              variant="h4"
              sx={{
                mb: 5,
                fontWeight: "bold",
                color: "#0369a1",
                textAlign: "center",
              }}
            >
              Selecciona un Servicio
            </Typography>

            <Grid container spacing={3}>

              {valueServicios.map((servicio) => (

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={servicio.id}
                >

                  <Card
                    onClick={() =>
                      handleSelectServicio(servicio)
                    }
                    sx={{
                      cursor: "pointer",
                      height: "100%",
                      borderRadius: 5,

                      transition:
                        "all 0.3s ease",

                      border:
                        "1px solid rgba(255,255,255,0.2)",

                      background:
                        "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",

                      color: "#fff",

                      boxShadow:
                        "0 10px 25px rgba(14,165,233,0.35)",

                      "&:hover": {

                        transform:
                          "scale(1.06)",

                        boxShadow:
                          "0 20px 40px rgba(14,165,233,0.55)",

                        background:
                          "linear-gradient(135deg, #67e8f9 0%, #0284c7 100%)",
                      },
                    }}
                  >

                    <CardContent>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          mb: 1,
                          color: "#fff",
                        }}
                      >
                        {servicio.nombre}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mb: 3,

                          color:
                            "rgba(255,255,255,0.85)",
                        }}
                      >
                        {servicio.descripcion}
                      </Typography>

                      <Chip
                        label={`$ ${servicio.precio}`}
                        sx={{
                          background: "#bef264",

                          color: "#365314",

                          fontWeight: "bold",

                          fontSize: "15px",

                          boxShadow:
                            "0 4px 10px rgba(190,242,100,0.5)",
                        }}
                      />

                    </CardContent>

                  </Card>

                </Grid>

              ))}

            </Grid>

          </Box>

        );

      case 1:

        return (

          <Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#0369a1",
              }}
            >
              Datos del Servicio
            </Typography>

            <Typography
              sx={{
                mt: 3,
                fontSize: "18px",
              }}
            >

              Servicio seleccionado:

              <strong>
                {" "}
                {servicioSeleccionado?.nombre}
              </strong>

            </Typography>

            <Typography
              sx={{
                mt: 4,
                color: "#f59e0b",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              🚧 Página en construcción
            </Typography>

          </Box>

        );

      case 2:

        return (

          <Box>

            <Typography
              variant="h4"
              sx={{
                color: "#0369a1",
                fontWeight: "bold",
              }}
            >
              Confirmación
            </Typography>

          </Box>

        );

      default:
        return null;
    }
  };

  return (

    <Box
      sx={{
        width: "100%",
        p: 4,

        background:
          "linear-gradient(to bottom, #e0f2fe, #f8fafc)",

        minHeight: "100vh",
      }}
    >

      <Paper
        elevation={0}
        sx={{
          p: 4,

          borderRadius: 5,

          background:
            "rgba(255,255,255,0.7)",

          backdropFilter: "blur(10px)",

          border:
            "1px solid rgba(255,255,255,0.4)",
        }}
      >

        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 5,
          }}
        >

          {steps.map((label) => (

            <Step key={label}>

              <StepLabel>

                <Typography
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  {label}
                </Typography>

              </StepLabel>

            </Step>

          ))}

        </Stepper>

        {/* Contenido */}
        <Box sx={{ mt: 5 }}>

          {renderStepContent()}

        </Box>

        {/* Volver */}
        {activeStep > 0 && (

          <Box sx={{ mt: 5 }}>

            <Typography
              onClick={handleBack}
              sx={{
                cursor: "pointer",

                color: "#0284c7",

                fontWeight: "bold",

                fontSize: "16px",

                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              ← Volver
            </Typography>

          </Box>

        )}

      </Paper>

    </Box>

  );
};

export default AppServiciosPage;