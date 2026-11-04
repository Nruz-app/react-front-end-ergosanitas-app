import { MouseEvent, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { COLORES } from '../../config/tema';

interface Props {
    id          : string;
    newPassword : string;
    setNewPassword : (value: string) => void;
    label       : string;
}

/** Campo de contraseña con el botón de mostrar/ocultar. Clon 1:1 de `form-perfil/input-password`. */
export const InputPassword = ({ id, newPassword, setNewPassword, label }: Props) => {

    const [showPassword, setShowPassword] = useState(false);

    const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();

    return (
        <TextField
            id={id}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            label={label}
            variant="filled"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            InputProps={{
                sx: { height: 70 },
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            onMouseDown={handleMouseDown}
                            edge="end"
                            aria-label={showPassword ? `Ocultar ${label}` : `Mostrar ${label}`}
                            sx={{
                                color     : showPassword ? COLORES.primario : COLORES.textoSuave,
                                '&:hover' : { backgroundColor: COLORES.fondoSuave },
                            }}
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};
