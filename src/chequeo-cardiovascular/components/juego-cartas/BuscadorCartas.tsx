import { IconButton, InputAdornment, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

import { COLORES, sxFocoVisible } from '../../config/tema';

interface Props {
    texto      : string;
    handleTexto: (texto: string) => void;
}

/**
 * El buscador de la grilla: por nombre o por RUT.
 *
 * **No lleva debounce, a diferencia de `LikeTextChequeo`.** Aquel dispara una consulta al
 * servidor por cada cambio; este filtra en memoria sobre las cartas ya descargadas, así que
 * esperar 350 ms solo haría que la grilla pareciera lenta.
 *
 * 🔴 El botón de limpiar usa **`ClearIcon`**, nunca un icono de papelera. La regla del módulo
 * —ninguna operación de borrado— se comprueba con un `grep`, y una papelera lo ensuciaría.
 */
export const BuscadorCartas = ({ texto, handleTexto }: Props) => (

    <TextField
        value={texto}
        onChange={(evento) => handleTexto(evento.target.value)}
        placeholder="Buscar por nombre o RUT…"
        size="small"
        fullWidth
        inputProps={{ 'aria-label': 'Buscar alumno por nombre o RUT' }}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon fontSize="small" aria-hidden="true" sx={{ color: COLORES.textoSuave }} />
                </InputAdornment>
            ),
            endAdornment: texto ? (
                <InputAdornment position="end">
                    <IconButton
                        onClick={() => handleTexto('')}
                        aria-label="Limpiar la búsqueda"
                        size="small"
                        sx={sxFocoVisible}
                    >
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </InputAdornment>
            ) : null,
        }}
        sx={{
            maxWidth: { md: 420 },
            '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: COLORES.fondoTarjeta },
        }}
    />
);
