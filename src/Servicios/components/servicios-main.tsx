import {
  Box,
  Paper,
} from "@mui/material";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { IServicios } from "../interface/servicios.interfaz";
import { ServiciosService } from "../service/servicios.service";
import { ServicioConfirmacionStep, ServicioDetalleStep, ServiciosList,ServiciosStepper } from ".";
import { IAgendaHora } from "../interface/agenda-hora.interfaz";

export const ServiciosMain = () => {

  const [activeStep, setActiveStep] = useState<number>(0);

  const [servicios, setServicios] = useState<IServicios[]>([]);
  const [agendaHoras, setAgendaHoras] = useState<IAgendaHora | null>(null);

  const [servicioSeleccionado, setServicioSeleccionado] = useState<IServicios | null>(null);

  const fetchServicios = useCallback(async () => {

    const { getServicios } = await ServiciosService();

    const response = await getServicios();

    setServicios(response);

  }, []);

  useEffect(() => {

    fetchServicios();

  }, []);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  }

  const handleSelectServicio = (servicio: IServicios) => {
    setServicioSeleccionado(servicio);
    handleNext();
  }

  const renderStep = () => {

    switch (activeStep) {

      case 0:
        return (
          <ServiciosList
            servicios={servicios}
            onSelect={handleSelectServicio}
          />
        );

      case 1:
        return (
          <ServicioDetalleStep
            servicio={servicioSeleccionado}
            setAgendaHoras={setAgendaHoras}
            handleNext={handleNext}
          />
        );

      case 2:

        return (
          <ServicioConfirmacionStep 
            agendaHoras={agendaHoras}
            servicioSeleccionado={servicioSeleccionado!}
          />
        );

      default:
        return null;
    }
  }

  return (

    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: 4,
        background:
          "linear-gradient(to bottom, #e0f2fe, #f8fafc)",
      }}
    >

      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 6,
          background:"rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.4)",
        }}
      >

        <ServiciosStepper
          activeStep={activeStep}
        />

        <Box sx={{ mt: 5 }}>
          {renderStep()}
        </Box>

        {activeStep > 0 && (
          <Box sx={{ mt: 5 }}>
            <Box
              onClick={handleBack}
              sx={{
                cursor: "pointer",
                color: "#0284c7",
                fontWeight: "bold",
                display: "inline-flex",
                "&:hover": {
                  opacity: 0.7,
                },
              }}
            >
              ← Volver
            </Box>

          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ServiciosMain;