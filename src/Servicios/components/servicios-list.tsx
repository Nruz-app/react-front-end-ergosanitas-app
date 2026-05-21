import {
  Box,
  Grid,
  Typography,
} from "@mui/material";

import { IServicios } from "../interface/servicios.interfaz";

import ServicioCard from "./servicio-card";

interface Props {
  servicios: IServicios[];
  onSelect: (servicio: IServicios) => void;
}

const ServiciosList = ({servicios,onSelect}: Props) => {

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          mb: 5,
          textAlign: "center",
          color: "#0369a1",
          fontWeight: "bold",
        }}
      >
        Selecciona un Servicio
      </Typography>
      <Grid container spacing={3}>
        {servicios.map((servicio) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={servicio.id}
          >
            <ServicioCard
              servicio={servicio}
              onClick={() =>
                onSelect(servicio)
              }
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ServiciosList;