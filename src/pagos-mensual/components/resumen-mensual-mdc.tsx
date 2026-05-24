import {
  Box,
  Paper,
  Typography,
  Divider,
  Stack
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { IPagoMedicoMDC } from "../interface/pago-medico-mdc";

interface Props {
  pagoMensualMDC: IPagoMedicoMDC[];
}

export const ResumenMensualMDC = ({ pagoMensualMDC }: Props) => {

  const periodosOrdenados = [...(pagoMensualMDC ?? [])]
    .sort((a, b) =>
      b.periodo.localeCompare(a.periodo)
    );

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
  };

  const resumenCardStyle = {
    borderRadius: "20px",
    p: 2.2,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(8px)",
    transition: "all .2s ease",
    "&:hover": {
      background: "rgba(255,255,255,0.12)",
      transform: "scale(1.02)"
    }
  };

  const renderResumenCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    color: string
  ) => (
    <Box sx={resumenCardStyle}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        mb={1.5}
      >
        {icon}

        <Typography
          variant="caption"
          sx={{
            opacity: 0.8,
            letterSpacing: 1,
            fontWeight: 700
          }}
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="h5"
        fontWeight={800}
        sx={{
          color,
          fontSize: {
            xs: "1.4rem",
            md: "1.6rem"
          }
        }}
      >
        {value}
      </Typography>
    </Box>
  );

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
        {periodosOrdenados.map((periodo, index) => {

          const cantidadPendiente =
            periodo.chequeos.reduce(
              (acc, chequeo) =>
                acc + (chequeo.cantidad_pen ?? 0),
              0
            );

          const cantidadRevision =
            periodo.chequeos.reduce(
              (acc, chequeo) =>
                acc + (chequeo.cantidad_rev ?? 0),
              0
            );

          const montoRevision =
            periodo.chequeos.reduce(
              (acc, chequeo) =>
                acc + (chequeo.monto_rev ?? 0),
              0
            );

          return (
            <Paper
              key={index}
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "30px",
                background:
                  "linear-gradient(145deg, #0f172a 0%, #172554 45%, #2563eb 100%)",
                color: "#fff",
                p: 3,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 12px 40px rgba(15,23,42,0.35)",
                transition: "all .25s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow:
                    "0 20px 50px rgba(15,23,42,0.45)"
                }
              }}
            >

              {/* EFECTO FONDO */}
              <Box
                sx={{
                  position: "absolute",
                  top: -70,
                  right: -70,
                  width: 220,
                  height: 220,
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
                position="relative"
                zIndex={2}
                mb={3}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
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
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.75
                    }}
                  >
                    Resumen mensual MDC
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 1.5,
                    py: 0.7,
                    borderRadius: 99,
                    background:
                      "rgba(34,197,94,0.15)",
                    border:
                      "1px solid rgba(34,197,94,0.25)"
                  }}
                >
                  <Typography
                    fontSize={12}
                    fontWeight={700}
                    color="#86efac"
                  >
                    ACTIVO
                  </Typography>
                </Box>
              </Box>

              <Divider
                sx={{
                  borderColor:
                    "rgba(255,255,255,0.08)",
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

                {/* TOTAL MES */}
                {renderResumenCard(
                  <AccountBalanceWalletIcon
                    sx={{
                      color: "#fb7185",
                      fontSize: 22,
                      p: 0.8,
                      borderRadius: "50%",
                      background:
                        "rgba(251,113,133,0.15)"
                    }}
                  />,
                  "TOTAL MES",
                  `$${(periodo.cantidad_total ?? 0)
                    .toLocaleString("es-CL")}`,
                  "#fda4af"
                )}

                {/* MONTO REVISADO */}
                {renderResumenCard(
                  <PaidIcon
                    sx={{
                      color: "#facc15",
                      fontSize: 22,
                      p: 0.8,
                      borderRadius: "50%",
                      background:
                        "rgba(250,204,21,0.15)"
                    }}
                  />,
                  "MONTO A PAGAR REVISADO",
                  `$${montoRevision
                    .toLocaleString("es-CL")}`,
                  "#fde047"
                )}

                {/* CANTIDAD REVISADA */}
                {renderResumenCard(
                  <MonitorHeartIcon
                    sx={{
                      color: "#4ade80",
                      fontSize: 22,
                      p: 0.8,
                      borderRadius: "50%",
                      background:
                        "rgba(74,222,128,0.15)"
                    }}
                  />,
                  "CANTIDAD REVISADA",
                  cantidadRevision
                    .toLocaleString("es-CL"),
                  "#86efac"
                )}

                {/* CANTIDAD PENDIENTE */}
                {renderResumenCard(
                  <PendingActionsIcon
                    sx={{
                      color: "#fca5a5",
                      fontSize: 22,
                      p: 0.8,
                      borderRadius: "50%",
                      background:
                        "rgba(252,165,165,0.15)"
                    }}
                  />,
                  "CANTIDAD PENDIENTE",
                  cantidadPendiente
                    .toLocaleString("es-CL"),
                  "#fca5a5"
                )}

              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}