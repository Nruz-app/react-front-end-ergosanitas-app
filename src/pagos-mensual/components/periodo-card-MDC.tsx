import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { IPagoMedicoMDC } from "../interface/pago-medico-mdc";
import { ResumenCardMDC } from "./resumen-card-MDC";

interface Props {
  periodo: IPagoMedicoMDC;
}

export const PeriodoCardMDC = ({ periodo }: Props) => {

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

      {/* EFECTO */}
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
            >
              {formatMes(periodo.periodo)}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{ opacity: 0.75 }}
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

        <ResumenCardMDC
          icon={
            <AccountBalanceWalletIcon
              sx={{
                color: "#fb7185",
                fontSize: 22,
                p: 0.8,
                borderRadius: "50%",
                background:
                  "rgba(251,113,133,0.15)"
              }}
            />
          }
          title="TOTAL MES"
          value={`$${(periodo.cantidad_total ?? 0)
            .toLocaleString("es-CL")}`}
          color="#fda4af"
        />

        <ResumenCardMDC
          icon={
            <PaidIcon
              sx={{
                color: "#facc15",
                fontSize: 22,
                p: 0.8,
                borderRadius: "50%",
                background:
                  "rgba(250,204,21,0.15)"
              }}
            />
          }
          title="MONTO REVISADO"
          value={`$${montoRevision
            .toLocaleString("es-CL")}`}
          color="#fde047"
        />

        <ResumenCardMDC
          icon={
            <MonitorHeartIcon
              sx={{
                color: "#4ade80",
                fontSize: 22,
                p: 0.8,
                borderRadius: "50%",
                background:
                  "rgba(74,222,128,0.15)"
              }}
            />
          }
          title="CANTIDAD REVISADA"
          value={cantidadRevision
            .toLocaleString("es-CL")}
          color="#86efac"
        />

        <ResumenCardMDC
          icon={
            <PendingActionsIcon
              sx={{
                color: "#fca5a5",
                fontSize: 22,
                p: 0.8,
                borderRadius: "50%",
                background:
                  "rgba(252,165,165,0.15)"
              }}
            />
          }
          title="CANTIDAD PENDIENTE"
          value={cantidadPendiente
            .toLocaleString("es-CL")}
          color="#fca5a5"
        />

      </Box>
    </Paper>
  );
}