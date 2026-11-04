import { useContext, useState } from 'react';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { Box, Paper } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { COLORES, SOMBRAS, UI } from '../../config/tema';
import { LikeTextContext } from '../../context';

/** Filtro de la lista por fecha de atención. Envía `YYYY-MM-DD` en `fechaCalendar`. */
export const DatePickerInput = () => {

    const { onSetLikeText, ...likeTextContext } = useContext(LikeTextContext);

    const [value, setValue] = useState<Dayjs | null>(null);

    const onChange = (newValue: Dayjs | null) => {

        // El original asumía que siempre llegaba una fecha (`newValue!`) y rompía al vaciar.
        if (!newValue || !newValue.isValid()) return;

        setValue(newValue);
        onSetLikeText({ ...likeTextContext, fechaCalendar: newValue.format('YYYY-MM-DD') });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <Paper
                    sx={{
                        boxSizing       : 'border-box',
                        p               : { xs: '12px', sm: '20px 30px' },
                        display         : 'flex',
                        alignItems      : 'center',
                        width           : { xs: '100%', sm: '80%' },
                        boxShadow       : SOMBRAS.campo,
                        borderRadius    : '16px',
                        backgroundColor : COLORES.fondoTarjeta,
                        border          : `1px solid ${COLORES.borde}`,
                    }}
                >
                    <DatePicker
                        label="Fecha de atención"
                        value={value}
                        onChange={onChange}
                        sx={{
                            '& .MuiPickersDay-root'  : { borderRadius: '8px' },
                            '& .MuiTypography-root'  : { fontWeight: 'bold', color: UI.textoFuerte },
                        }}
                    />
                </Paper>
            </LocalizationProvider>
        </Box>
    );
};
