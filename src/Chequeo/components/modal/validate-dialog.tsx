import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment
} from "@mui/material";

import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useState } from "react";

interface ValidateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
}

export const ValidateDialog = ({ open, onClose, onConfirm }: ValidateDialogProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = () => {
    if (!value.trim()) {
      setError(true);
      return;
    }
    setError(false);
    onConfirm(value);
    setValue("");
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          padding: 2,
          textAlign: "center"
        }
      }}
    >
      {/* HEADER */}
      <DialogTitle>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Box
            sx={{
              background: "#1976d2",
              color: "white",
              borderRadius: "50%",
              width: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <LockIcon />
          </Box>

          <Typography variant="h6" fontWeight="bold">
            Validación Ergosanitas
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Ingresa el código para continuar
          </Typography>
        </Box>
      </DialogTitle>

      {/* INPUT PASSWORD */}
      <DialogContent sx={{ mt: 1 }}>
        <TextField
          fullWidth
          type={showPassword ? "text" : "password"} 
          label="Ergo Pass"
          placeholder="••••••"
          value={value}
          error={error}
          helperText={error ? "Campo requerido" : ""}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          sx={{
            mt: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              fontSize: 18
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 3, px: 3 }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{
            borderRadius: 3,
            px: 4,
            background: "linear-gradient(45deg,#1976d2,#42a5f5)"
          }}
        >
          Validar
        </Button>
      </DialogActions>
    </Dialog>
  );
}