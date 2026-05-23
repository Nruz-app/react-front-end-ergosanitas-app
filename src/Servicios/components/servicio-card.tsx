import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";

import { IServicios } from "../interface/servicios.interfaz";

interface Props {
  servicio: IServicios;
  onClick: () => void;
}

const ServicioCard = ({
  servicio,
  onClick,
}: Props) => {

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 5,
        background:
          "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
        color: "#fff",
        transition: "all 0.3s ease",
        boxShadow:
          "0 10px 25px rgba(14,165,233,0.35)",

        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow:
            "0 18px 35px rgba(14,165,233,0.55)",
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 2,
          }}
        >
          {servicio.nombre}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mb: 3,
            opacity: 0.9,
          }}
        >
          {servicio.descripcion}
        </Typography>

        <Chip
          label={`$ ${servicio.precio}`}
          sx={{
            background: "#bef264",
            color: "#365314",
            fontWeight: "bold",
          }}
        />
      </CardContent>

      <CardActions
        sx={{
          px: 2,
          pb: 2,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={onClick}
          sx={{
            borderRadius: 3,
            fontWeight: "bold",
            background: "#082f49",

            "&:hover": {
              background: "#0c4a6e",
            },
          }}
        >
          Seleccionar examen
        </Button>
      </CardActions>
    </Card>
  );
}

export default ServicioCard;