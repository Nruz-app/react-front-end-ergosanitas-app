import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useState } from "react";

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface Props {
  newPassword : string;
  setNewPassword : (value: string) => void;
}


export const InputPassword = ({newPassword,setNewPassword } : Props) => {

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
    

  return (
    
    <TextField
      fullWidth
      name= "newPassword"
      value = {newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      label="Modificar Contraseña"
      variant="filled"
      type={showPassword ? 'text' : 'password'}
      InputProps={{
        sx: {
          height: 70,               // Altura más alta
          
        },
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              sx={{
                color: showPassword ? '#1976d2' : 'gray',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                },
              }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
    
        
  )
}
