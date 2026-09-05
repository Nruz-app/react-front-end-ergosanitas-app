import SaveAsIcon from '@mui/icons-material/SaveAs';
import { Button } from '@mui/material';
import { COLORES, sxFocoVisible } from '../../config/tema';

interface Props {
    onSubmit  : () => void;
    title     : string;
    btnStatus : boolean;
}

/** Botón de guardar del formulario. `btnStatus` lo bloquea mientras vuela la petición. */
export const ButtonsForm = ({ title, btnStatus, onSubmit }: Props) => {

    return (
        <Button
            onClick={onSubmit}
            variant="contained"
            startIcon={<SaveAsIcon />}
            size="large"
            disabled={btnStatus}
            fullWidth
            sx={{
                backgroundColor : COLORES.primario,
                color           : COLORES.fondoTarjeta,
                borderRadius    : '12px',
                py              : 1.5,
                textTransform   : 'none',
                boxShadow       : '0 6px 16px rgba(25, 118, 210, 0.25)',
                fontWeight      : 'bold',
                fontSize        : 16,
                transition      : 'all 0.3s ease',
                '&:hover'       : { backgroundColor: COLORES.primarioHover, boxShadow: '0 8px 20px rgba(13, 71, 161, 0.3)' },
                '&:active'      : { backgroundColor: COLORES.primarioOsc },
                ...sxFocoVisible,
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
        >
            { title }
        </Button>
    );
};
