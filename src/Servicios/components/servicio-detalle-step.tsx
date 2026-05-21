import {
  Box,
  Chip,
  Typography,
} from "@mui/material";

import { IServicios } from "../interface/servicios.interfaz";
import { AgendaHoraForm } from "./agenda/agenda-hora-form";
import { IAgendaHora } from "../interface/agenda-hora.interfaz";

interface Props {
  servicio: IServicios | null;
  setAgendaHoras: React.Dispatch<React.SetStateAction<IAgendaHora | null>>;
  handleNext: () => void;
}

const ServicioDetalleStep = ({servicio, setAgendaHoras, handleNext}: Props) => {

  return (
   <Box>
    <Typography
      variant="h4"
      sx={{
        color: "#0369a1",
        fontWeight: "bold",
        mb: 1,
      }}
    >
      Ingrese Datos del Paciente
    </Typography>
    {/* Servicio seleccionado */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
        mb: 4,
        p: 2,
        borderRadius: 3,
        background: "#f0f9ff",
        border:"1px solid #bae6fd",
      }}
    >
      <Chip
        label={servicio?.nombre || "Servicio"}
        sx={{
          background: "#3f51b5",
          color: "#fff",
          fontWeight: "bold",
        }}
      />
      <Chip
        label={`$ ${servicio?.precio}`}
        sx={{
          background: "#bef264",
          color: "#365314",
          fontWeight: "bold",
        }}
      />
    </Box>
    {/* Formulario */}
    <AgendaHoraForm
      servicios_name={servicio?.nombre}
      handleNext={handleNext}
      setAgendaHoras={setAgendaHoras}
    />

  </Box>
  );
}

export default ServicioDetalleStep;