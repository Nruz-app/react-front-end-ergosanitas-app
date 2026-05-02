import {
  Box,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { useState } from "react";
import { IAgendaMensual } from "../interfaces/agenda-mensual";
import { AgendaService } from "../services/agenda.service";
import { DayCellContent } from "./day-cell-content";

export const CalendarioMensual = () => {
  const [dataPorDia, setDataPorDia] = useState<Record<string, IAgendaMensual>>({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const transformarData = (data: IAgendaMensual[]) => {
    const result: Record<string, IAgendaMensual> = {};
    data.forEach((item) => { result[item.fecha] = item; });
    return result;
  }

  const handleDatesSet = async (info: any) => {
    try {
      const { postAgendamensual } = await AgendaService();

      const date = info.view.currentStart;

      const fecha = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;

      const response: IAgendaMensual[] = await postAgendamensual(fecha);

      setDataPorDia(transformarData(response));
    } 
    catch (error) {
      console.error(error);
    }
  }

  const formatDateLocal = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1)
        .padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  // calendario (desktop)
  const dayCellContent = (info: any) => {
    const date = formatDateLocal(info.date);
    const dia = dataPorDia[date];

    return (
      <DayCellContent
        dayNumberText={info.dayNumberText}
        dia={dia}
        isMobile={false}
      />
    );
  }

  // versión mobile tipo lista
  const renderMobile = () => {
    const diasOrdenados = Object.values(dataPorDia).sort((a, b) => a.fecha.localeCompare(b.fecha));

    return (
      <Box>
        {diasOrdenados.map((dia) => (
          <Paper
            key={dia.fecha}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: 3,
            }}
          >
            <Typography fontWeight={600}>{dia.fecha}</Typography>

            <Typography fontSize={13} color="text.secondary">
              Total: {dia.total}
            </Typography>

            <Box mt={1}>
              {dia.data.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    backgroundColor: "#E8F5E9",
                    borderLeft: "4px solid #4CAF50",
                    p: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    fontSize: 13,
                  }}
                >
                  {item.user_email} ({item.cantidad})
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <Box px={2}>
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        {isMobile ? (
          renderMobile()
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locales={allLocales}
            locale="es"
            firstDay={1}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            height="75vh"
            fixedWeekCount={false}
            showNonCurrentDates={true}
            datesSet={handleDatesSet}
            dayCellContent={dayCellContent}
          />
        )}
      </Paper>
    </Box>
  );
}