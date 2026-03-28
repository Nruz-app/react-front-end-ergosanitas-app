import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useState } from 'react';

import { VideoCallDialog } from './dialog/video-call-dialog';


export const AgendaHoras = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [openVideo, setOpenVideo] = useState(false);
  const [roomName, setRoomName] = useState("");

  const [events] = useState([
    {
        id: "1",
        title: "Paciente: Juan Pérez",
        start: "2026-03-28T10:00:00",
        end: "2026-03-28T11:00:00",
        roomName: "consulta-juan-20260328-1000",
        paciente: "Juan Pérez",
        medico: "Dr. Ruz",

    },
    {
        id: "2",
        title: "Paciente: María Gómez",
        start: "2026-03-29T10:00:00",
        end: "2026-03-29T11:00:00",
        roomName: "consulta-maria-20260329-1000",
        paciente: "María Gómez",
        medico: "Dr. Ruz"
    }
 ]);

  const handleEventClick = (info : any) => {

    const { roomName, paciente, medico } = info.event.extendedProps;

    console.log("Sala:", roomName);
    console.log("Paciente:", paciente);
    console.log("Medico:", medico);

    setRoomName(roomName);
    setOpenVideo(true);
}

  return (
    <Box px={2}>
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}

          // Responsive real
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}

          locales={[esLocale]}
          locale="es"
          firstDay={1}

          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:30:00"

          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: isMobile ? '' : 'timeGridWeek,timeGridDay'
          }}
          nowIndicator={true}
          allDaySlot={false}
          height="75vh"
          events={events}
          eventClick={handleEventClick}
          
        />
      </Paper>
      {/* DIALOG VIDEO */}
      <VideoCallDialog
        open={openVideo}
        onClose={() => setOpenVideo(false)}
        roomName={roomName}
      />
    </Box>
  );
}