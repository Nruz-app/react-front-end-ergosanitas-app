import {
  Box,
  Paper,
  Typography,
  Divider
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PaidIcon from "@mui/icons-material/Paid";

import { IPagoMedicoMDC } from "../interface/pago-medico-mdc";

interface Props {
  pagoMensualMDC: IPagoMedicoMDC[];
}

export const ResumenMensualMDC = ({pagoMensualMDC}: Props) => {

  const periodosOrdenados = [...(pagoMensualMDC ?? [])]
    .sort((a, b) =>b.periodo.localeCompare(a.periodo));

  const formatMes = (fecha: string) => {

    if (!fecha) return "-";

    const [year, month] = fecha.split("-");

    return new Date(
      Number(year),
      Number(month) - 1
    ).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long"
    });
  }

  return (

    <Box p={{ xs: 2, md: 3 }}>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr",
          md: "repeat(2, 1fr)",
          xl: "repeat(3, 1fr)"
        }}
        gap={3}
      >
        {(periodosOrdenados ?? []).map((periodo, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "28px",
              background:
                "linear-gradient(145deg, #0f172a 0%, #1e293b 45%, #1d4ed8 100%)",
              color: "#fff",
              p: 3,
              minHeight: 240,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 10px 35px rgba(15,23,42,0.35)",
              transition: "all .25s ease",
              backdropFilter: "blur(12px)",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow:
                  "0 18px 45px rgba(15,23,42,0.45)"
              }
            }}
          >
            {/* EFECTO */}
            <Box
              sx={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background:
                  "rgba(255,255,255,0.06)"
              }}
            />
            {/* HEADER */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={4}
              position="relative"
              zIndex={2}
            >
              <Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1}
                >
                  <CalendarMonthIcon
                    sx={{
                      fontSize: 28,
                      color: "#93c5fd"
                    }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    textTransform="capitalize"
                    sx={{
                      fontSize: {
                        xs: "1.2rem",
                        md: "1.5rem"
                      }
                    }}
                  >
                    {formatMes(periodo.periodo)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.75,
                    letterSpacing: 0.5
                  }}
                >
                  Resumen mensual MDC
                </Typography>
              </Box>
              <Typography
                sx={{
                  px: 1.8,
                  py: 0.6,
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: "#22c55e20",
                  color: "#86efac",
                  border:
                    "1px solid rgba(134,239,172,0.2)"
                }}
              >
                ACTIVO
              </Typography>
            </Box>
            <Divider
              sx={{
                borderColor: "rgba(255,255,255,0.08)",
                mb: 3
              }}
            />
            {/* RESUMEN */}
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "1fr",
                sm: "1fr 1fr"
              }}
              gap={2}
              position="relative"
              zIndex={2}
            >
              {/* MONTO */}
              <Box
                sx={{
                  borderRadius: "22px",
                  p: 2.5,
                  background:
                    "rgba(255,255,255,0.08)",
                  border:
                    "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1.5}
                >
                  <PaidIcon
                    sx={{
                      color: "#facc15"
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.8,
                      letterSpacing: 1
                    }}
                  >
                    MONTO TOTAL
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                >
                  $
                  {(periodo.monto_total ?? 0)
                    .toLocaleString("es-CL")}
                </Typography>
              </Box>
              {/* CANTIDAD */}
              <Box
                sx={{
                  borderRadius: "22px",
                  p: 2.5,
                  background:
                    "rgba(255,255,255,0.08)",
                  border:
                    "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1.5}
                >
                  <MonitorHeartIcon
                    sx={{
                      color: "#4ade80"
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.8,
                      letterSpacing: 1
                    }}
                  >
                    CANTIDAD TOTAL
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#86efac"
                >
                  {(periodo.cantidad_total ?? 0)
                    .toLocaleString("es-CL")}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}