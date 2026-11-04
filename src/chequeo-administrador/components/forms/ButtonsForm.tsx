import SaveAsIcon from '@mui/icons-material/SaveAs';
import { Button } from '@mui/material';

import { COLORES, SOMBRAS, sxFocoVisible } from '../../config/tema';

interface Props {
    onSubmit  : () => void;
    title     : string;
    btnStatus : boolean;
}

/**
 * Botón de guardar de los formularios. `btnStatus` lo bloquea mientras vuela la petición.
 * Quien lo usa le pasa `handleSubmit(onSubmit)`, no `onSubmit` directo (D4).
 */
export const ButtonsForm = ({ title, btnStatus, onSubmit }: Props) => {

    return (
        <Button
            onClick={onSubmit}
            variant="contained"
            startIcon={<SaveAsIcon aria-hidden="true" />}
            size="large"
            disabled={btnStatus}
            sx={{
                backgroundColor : COLORES.primario,
                color           : COLORES.textoSobrePrimario,
                borderRadius    : '12px',
                padding         : '12px 24px',
                textTransform   : 'none',
                boxShadow       : SOMBRAS.boton,
                fontWeight      : 'bold',
                fontSize        : 16,
                transition      : 'all 0.3s ease',
                '&:hover'       : { backgroundColor: COLORES.primarioHover, boxShadow: SOMBRAS.botonHover },
                '&:active'      : { backgroundColor: COLORES.primarioOsc },
                ...sxFocoVisible,
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
        >
            { title }
        </Button>
    );
};
