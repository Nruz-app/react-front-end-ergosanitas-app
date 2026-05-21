import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PaidIcon from "@mui/icons-material/Paid";

import { IPagoMedicoMDC } from "../interface/pago-medico-mdc";
import { ClubAccordion } from "./club-accordion";

interface Props {
  periodo: IPagoMedicoMDC;
  expanded: boolean;
  onChange: (event: React.SyntheticEvent,expanded: boolean) => void;
}

export const PeriodoAccordion = ({periodo,expanded,onChange}: Props) => {

  const formatMes = (fecha: string) => {

    if (!fecha) return "-";

    const [year, month] = fecha.split("-");

    return new Date(Number(year), Number(month) - 1)
      .toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long"
      });
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      sx={{
        mb: 2,
        borderRadius: "20px !important",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        color: "#fff",
        boxShadow: 5,
        "&:before": {
          display: "none"
        }
      }}
    >

      <AccordionSummary
        expandIcon={
          <ExpandMoreIcon
            sx={{ color: "#fff" }}
          />
        }
        sx={{
          px: 3,
          py: 1.5
        }}
      >

        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >

          {/* TITULO */}
          <Box>

            <Box
              display="flex"
              alignItems="center"
              gap={1}
            >

              <CalendarMonthIcon />

              <Typography
                variant="h5"
                fontWeight={700}
                textTransform="capitalize"
              >
                {formatMes(periodo.periodo)}
              </Typography>

            </Box>

            <Typography
              variant="body2"
              sx={{ opacity: 0.8 }}
            >
              Resumen mensual MDC
            </Typography>

          </Box>

          {/* RESUMEN */}
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
          >

            <Paper
              sx={{
                p: 1.5,
                borderRadius: 3,
                minWidth: 150,
                backgroundColor: "#ffffff15",
                backdropFilter: "blur(10px)",
                color: "#fff"
              }}
            >

              <Box
                display="flex"
                alignItems="center"
                gap={1}
              >

                <PaidIcon fontSize="small" />

                <Typography variant="caption">
                  MONTO TOTAL
                </Typography>

              </Box>

              <Typography
                variant="h6"
                fontWeight={700}
              >
                $
                {(periodo.monto_total ?? 0).toLocaleString()}
              </Typography>

            </Paper>

            <Paper
              sx={{
                p: 1.5,
                borderRadius: 3,
                minWidth: 150,
                backgroundColor: "#ffffff15",
                backdropFilter: "blur(10px)",
                color: "#fff"
              }}
            >

              <Box
                display="flex"
                alignItems="center"
                gap={1}
              >

                <MonitorHeartIcon fontSize="small" />

                <Typography variant="caption">
                  CANTIDAD
                </Typography>

              </Box>

              <Typography
                variant="h6"
                fontWeight={700}
                color="#9ef01a"
              >
                {(periodo.cantidad_total ?? 0).toLocaleString()}
              </Typography>

            </Paper>

          </Box>

        </Box>

      </AccordionSummary>

      <AccordionDetails
        sx={{
          backgroundColor: "#f8fafc"
        }}
      >

        {(periodo.chequeos ?? []).map((chequeo, index) => (

          <ClubAccordion
            key={index}
            chequeo={chequeo}
            periodo={periodo.periodo}
            index={index}
          />

        ))}

      </AccordionDetails>

    </Accordion>
  );
}