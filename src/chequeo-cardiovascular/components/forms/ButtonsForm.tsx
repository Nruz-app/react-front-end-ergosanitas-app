import SaveAsIcon from '@mui/icons-material/SaveAs';
import { Button } from '@mui/material';

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
                backgroundColor : '#1976d2',
                color           : '#fff',
                borderRadius    : '12px',
                py              : 1.5,
                textTransform   : 'none',
                boxShadow       : '0 6px 16px rgba(25, 118, 210, 0.25)',
                fontWeight      : 'bold',
                fontSize        : 16,
                transition      : 'all 0.3s ease',
                '&:hover'       : { backgroundColor: '#115293', boxShadow: '0 8px 20px rgba(13, 71, 161, 0.3)' },
                '&:active'      : { backgroundColor: '#0d47a1' },
                '&:focus-visible': { outline: '3px solid #90caf9', outlineOffset: 2 },
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
        >
            { title }
        </Button>
    );
};
