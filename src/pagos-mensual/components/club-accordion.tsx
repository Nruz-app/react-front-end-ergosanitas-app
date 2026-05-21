import { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Typography
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { IChequeo } from "../interface/pago-medico-mdc";
import { TablaChequeos } from "./tabla-chequeos";

interface Props {
  chequeo: IChequeo;
  periodo: string;
  index: number;
}

export const ClubAccordion = ({chequeo}: Props) => {

  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) =>
        setExpanded(isExpanded)
      }
      sx={{
        mb: 2,
        borderRadius: "16px !important",
        overflow: "hidden",
        boxShadow: 2,
        border: "1px solid #dbeafe",
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
          background:
            "linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)",
          color: "#fff"
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

            <Typography
              variant="h6"
              fontWeight={700}
            >
              {(chequeo.club ?? "").split("@")[0]}
            </Typography>

            <Typography
              variant="body2"
              color="#e0f2fe"
            >
              MDC Pendiente / Revisado
            </Typography>

          </Box>

          {/* RESUMEN */}
          <Box
            display="flex"
            gap={1}
            flexWrap="wrap"
          >

            <Chip
              label={`Pen: ${chequeo.cantidad_pen ?? 0}`}
              sx={{
                backgroundColor: "#f59e0b",
                color: "#fff",
                fontWeight: 700
              }}
            />

            <Chip
              label={`Rev: ${chequeo.cantidad_rev ?? 0}`}
              sx={{
                backgroundColor: "#22c55e",
                color: "#fff",
                fontWeight: 700
              }}
            />

            <Chip
              label={`Monto Pen: $${(chequeo.monto_pen ?? 0).toLocaleString()}`}
              sx={{
                backgroundColor: "#dc2626",
                color: "#fff",
                fontWeight: 700
              }}
            />

            <Chip
              label={`Monto Rev: $${(chequeo.monto_rev ?? 0).toLocaleString()}`}
              sx={{
                backgroundColor: "#16a34a",
                color: "#fff",
                fontWeight: 700
              }}
            />

          </Box>

        </Box>

      </AccordionSummary>

      <AccordionDetails
        sx={{
          p: 0,
          backgroundColor: "#fff"
        }}
      >

        <Divider />

        <TablaChequeos
          data={chequeo.data}
        />

      </AccordionDetails>

    </Accordion>
  );
}