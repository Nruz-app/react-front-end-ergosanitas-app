import { useContext, useState } from 'react';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { Box, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { LikeTextContext } from '../../context';

/**
 * Filtro por fecha de la lista. No llama a ningún servicio: escribe en `LikeTextContext` y es
 * `ChequeoTable` quien reacciona y vuelve a pedir la página.
 *
 * Arranca vacío para que la lista muestre todo hasta que alguien elija una fecha.
 */
export const DatePickerInput = () => {

    const { onSetLikeText, ...likeTextContext } = useContext(LikeTextContext);

    const [value, setValue] = useState<Dayjs | null>(null);

    const onChange = (newValue: Dayjs | null) => {

        setValue(newValue);
        onSetLikeText({
            ...likeTextContext,
            fechaCalendar: newValue ? newValue.format('YYYY-MM-DD') : '',
        });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <DatePicker
                    value={value}
                    onChange={onChange}
                    label="Fecha"
                    slotProps={{
                        textField: {
                            size : 'small',
                            sx   : { minWidth: 180 },
                        },
                    }}
                />
                <Button
                    onClick={() => onChange(null)}
                    disabled={!value}
                    size="small"
                    sx={{ mt: 0.4, textTransform: 'none' }}
                >
                    Quitar fecha
                </Button>
            </Box>
        </LocalizationProvider>
    );
};
