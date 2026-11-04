import { Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material';

import type { IPreparacion } from '../interface';

interface Props {
    titulo      : string;
    preparacion : IPreparacion | null;
}

/**
 * Preparación del paciente: el back ya consolidó la indicación más exigente (ayuno mayor,
 * orden médica, mañana). Aquí solo se muestra.
 */
export const PreparacionConsolidada = ({ titulo, preparacion }: Props) => {

    if (!preparacion || (preparacion.indicaciones.length === 0 && !preparacion.requiere_orden_medica)) return null;

    return (
        <Alert severity={preparacion.ayuno ? 'warning' : 'info'} sx={{ borderRadius: 3 }}>
            <AlertTitle>{titulo}</AlertTitle>
            <List dense disablePadding>
                {preparacion.indicaciones.map((indicacion) => (
                    <ListItem key={indicacion} disableGutters sx={{ py: 0 }}>
                        <ListItemText primary={`• ${indicacion}`} />
                    </ListItem>
                ))}
                {preparacion.requiere_orden_medica && (
                    <ListItem disableGutters sx={{ py: 0 }}>
                        <ListItemText primary="• Necesitas la orden médica: te la pediremos al pagar." />
                    </ListItem>
                )}
            </List>
        </Alert>
    );
};
