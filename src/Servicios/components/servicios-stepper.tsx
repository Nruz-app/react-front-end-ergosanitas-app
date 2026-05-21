import {
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

interface Props {
  activeStep: number;
}

const steps = [
  "Seleccionar Servicio",
  "Reservar Hora",
  "Realizar Pago",
];

const ServiciosStepper = ({activeStep}: Props) => {

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>
            <Typography
              sx={{
                fontWeight: "bold",
              }}
            >
              {label}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export default ServiciosStepper;