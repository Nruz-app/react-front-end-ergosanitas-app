import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { IChequeo } from "../../interface";
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { Box, Paper, Typography } from '@mui/material';
import { UseChequeoService } from "../../services/useChequeoService";

import { LoginContext } from "../../../common/context";

interface Props {
    setRowTable  : (chequeo:IChequeo[]) => void;
}

export const DatePickers = ({setRowTable}: Props) => {
  
    const { user }  = React.useContext( LoginContext );
    const { user_email }  = user;
    const [value, setValue] = React.useState<Dayjs | null>(dayjs(new Date()));

    const fetchData = async () => {
      try {
          const { postFilterCalendar } = await UseChequeoService();
          const fecha_calendar = value!.format("YYYY-MM-DD");
          const responseChequeos = await postFilterCalendar(fecha_calendar, user_email);
          setRowTable(responseChequeos);
          setValue(value);
      } catch (error) {
          console.error("Error al obtener los chequeos:", error);
      }
    }

    React.useEffect(() => {      
      fetchData();
    }, []);

    const OnChange = async (newValue : Dayjs) => {

        const fecha_calendar = newValue.format("YYYY-MM-DD");
        const {  postFilterCalendar } = await UseChequeoService();
        const responseChequeos = await postFilterCalendar(fecha_calendar,user_email);
        setRowTable(responseChequeos); 

        setValue(newValue);
    }
  
    return (
        <Box
        mt={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <Paper
            sx={{
              p: 3, 
              borderRadius: 4, // Bordes más redondeados
              boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)", // Sombra elegante
              bgcolor: "background.paper",
              maxWidth: 300,
              maxHeight: 330,
              overflow: "hidden",
              background: "linear-gradient(135deg, #ffffff 30%, #f3f3f3 100%)", // Degradado de fondo
            }}
          >
            <Typography
              align="center"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: "primary.main",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Selecciona una fecha
            </Typography>
      
            <Box
              sx={{ 
                transformOrigin: "top center",
                transition: "all 0.3s ease-in-out", // Suaviza transiciones
              }}
            >
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={value}
                onChange={(newValue) => OnChange(newValue!)}
                sx={{
                  "& .MuiPickersDay-daySelected": {
                    bgcolor: "primary.dark", // Color más vibrante
                    color: "white",
                    borderRadius: "50%", // Hace que los días seleccionados sean más circulares
                    transition: "all 0.3s ease-in-out",
                  },
                  "& .MuiPickersDay-root": {
                    borderRadius: "8px", // Días con bordes más suaves
                  },
                  "& .MuiPickersDay-dayDisabled": {
                    color: "#bdbdbd", // Más contraste para los días deshabilitados
                  },
                  "& .MuiTypography-root": {
                    fontWeight: "bold",
                    color: "#333",
                  },
                }}
              />
            </Box>
          </Paper>
        </LocalizationProvider>
      </Box>
        
  )
}


