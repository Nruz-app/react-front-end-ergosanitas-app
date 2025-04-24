import * as React from 'react';
import { useContext } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
//import dayjs, { Dayjs } from 'dayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Box, Paper } from '@mui/material';
import { LikeTextContext } from '../../context';

export const DatePickerInput = () => {
  
    const { onSetLikeText,...likeTextContext }  = useContext( LikeTextContext );
    
    //const [value, setValue] = React.useState<Dayjs | null>(dayjs(new Date()));
    const [value, setValue] = React.useState<Dayjs | null>(null);

    /********************************************************************************************
    const fetchData = async () => {
      try {
          const fechaCalendar = value!.format("YYYY-MM-DD");
          const newLikeTextState = {...likeTextContext, fechaCalendar : fechaCalendar}
          setValue(value);
          onSetLikeText(newLikeTextState);

      } catch (error) {
          console.error("Error al obtener los chequeos:", error);
      }
    }

    useEffect(() => {      
      fetchData();
    }, []);
    ****************************************************************************************/

    const OnChange = async (newValue : Dayjs) => {

        const fechaCalendar = newValue.format("YYYY-MM-DD");
        const newLikeTextState = {...likeTextContext, fechaCalendar : fechaCalendar}
        setValue(newValue);
        onSetLikeText(newLikeTextState);

    }
  
    return (
      <Box
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
        }}  
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <Paper
            sx={{ 
              p: '20px 30px', 
              display: 'flex', 
              alignItems: 'center', 
              width: '80%', 
              boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)', /* Sombra más pronunciada */
              borderRadius: '16px', /* Bordes más redondeados */
              backgroundColor: '#ffffff', /* Fondo blanco limpio */
              border: '1px solid #e0e0e0', /* Borde suave para resaltar el formulario */
            }}
          >
            
              <DatePicker
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
            
          </Paper>
        </LocalizationProvider>
      </Box>
        
  )
}


