import { Step, StepButton, Stepper, useMediaQuery, useTheme } from '@mui/material';

import { PASOS } from '../config/textos';
import { COLORES } from '../config/tema';

interface Props {
    paso        : number;
    /** Hasta qué paso se puede volver con un click (los siguientes exigen completar el actual). */
    maximo      : number;
    onIr        : (paso: number) => void;
}

/** Los 7 pasos del flujo. En pantallas angostas se oculta la etiqueta y queda el número. */
export const StepperCartFlow = ({ paso, maximo, onIr }: Props) => {

    const theme = useTheme();
    const angosto = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Stepper nonLinear activeStep={paso} alternativeLabel sx={{ '& .MuiStepIcon-root.Mui-active': { color: COLORES.primarioOsc } }}>
            {PASOS.map((etiqueta, indice) => (
                <Step key={etiqueta} completed={indice < paso}>
                    <StepButton
                        onClick={() => onIr(indice)}
                        disabled={indice > maximo || indice === PASOS.length - 1}
                        aria-label={`Paso ${indice + 1}: ${etiqueta}`}
                    >
                        {angosto ? '' : etiqueta}
                    </StepButton>
                </Step>
            ))}
        </Stepper>
    );
};
