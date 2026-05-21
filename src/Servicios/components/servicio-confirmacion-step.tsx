import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import CreditCardIcon from "@mui/icons-material/CreditCard";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import { IAgendaHora } from "../interface/agenda-hora.interfaz";
import { IServicios } from "../interface/servicios.interfaz";

import { ServiciosService } from "../service/servicios.service";

interface Props {
  agendaHoras: IAgendaHora | null;
  servicioSeleccionado: IServicios;
}

const ServicioConfirmacionStep = ({agendaHoras,servicioSeleccionado}: Props) => {

  const handlePago = async () => {

    const { postWebPayRequest } = await ServiciosService();

    await postWebPayRequest({
      servicios_name : 'ECG',
      rut : agendaHoras?.rut_paciente || '',
      monto: servicioSeleccionado.precio,
    });
  }

  return (

    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#0369a1",
            fontWeight: "bold",
            mb: 1,
          }}
        >
          Confirmación de Reserva
        </Typography>
        <Typography
          sx={{
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Revise cuidadosamente los datos antes
          de continuar con el pago.
        </Typography>
      </Box>
      {/* Card */}
      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2.5,
            sm: 4,
          },
          borderRadius: 6,
          background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Decoración */}
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(14,165,233,0.08)",
          }}
        />
        <Stack spacing={4}>
          {/* Servicio */}
          <Box>
            <Typography
              sx={{
                color: "#64748b",
                mb: 1.5,
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Servicio Seleccionado
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <Chip
                icon={<EventAvailableIcon />}
                label={servicioSeleccionado.nombre}
                sx={{
                  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 1,
                  height: 38,
                  boxShadow: "0 6px 15px rgba(2,132,199,0.2)",
                }}
              />
              <Chip
                label={`$ ${servicioSeleccionado.precio}`}
                sx={{background: "#bef264",
                  color: "#365314",
                  fontWeight: "bold",
                  height: 38,
                  fontSize: "15px",
                  boxShadow:"0 6px 15px rgba(190,242,100,0.3)",
                }}
              />
            </Stack>
          </Box>
          <Divider />
          {/* Datos paciente */}
          <Box>
            <Typography
              sx={{
                color: "#64748b",
                mb: 2,
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Datos del Paciente
            </Typography>
            <Stack
              spacing={1.5}
              sx={{
                background: "#f8fafc",
                p: 3,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography>
                <strong>Nombre:</strong>{" "}
                {agendaHoras?.nombre_paciente}
              </Typography>
              <Typography>
                <strong>RUT:</strong>{" "}
                {agendaHoras?.rut_paciente}
              </Typography>
              <Typography>
                <strong>Email:</strong>{" "}
                {agendaHoras?.email_paciente}
              </Typography>
              <Typography>
                <strong>Celular:</strong>{" "}
                {agendaHoras?.celular_paciente}
              </Typography>
              <Typography>
                <strong>Fecha Reserva:</strong>{" "}
                {agendaHoras?.fecha_reserva_paciente}
              </Typography>
            </Stack>
          </Box>
          <Divider />
          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Total a Pagar
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#0f172a",
                  fontWeight: "bold",
                  mt: 0.5,
                }}
              >
                $ {servicioSeleccionado.precio}
              </Typography>
            </Box>
            {/* Botón */}
            <Button
              variant="contained"
              size="large"
              startIcon={<CreditCardIcon />}
              onClick={handlePago}
              sx={{
                borderRadius: 4,
                px: 4,
                py: 1.6,
                minWidth: {
                  xs: "100%",
                  sm: "auto",
                },
                fontWeight: "bold",
                fontSize: "15px",
                textTransform: "none",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
                boxShadow: "0 10px 25px rgba(2,132,199,0.25)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform:"translateY(-2px)",
                  background:"linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
                  boxShadow:"0 14px 30px rgba(2,132,199,0.35)",
                },
              }}
            >
              Pagar con Transbank
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
export default ServicioConfirmacionStep;