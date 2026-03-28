import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

<FullCalendar
  plugins={[timeGridPlugin]}
  initialView="timeGridDay"
  events={[
    { title: 'Paciente', start: '2026-03-28T10:00:00' }
  ]}
/>