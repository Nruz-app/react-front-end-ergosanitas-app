/**
 * Panel del electrocardiograma, junto a la silueta.
 *
 * Muestra SIEMPRE el control más reciente del paciente, con su fecha rotulada, sea cual
 * sea la bioimpedancia elegida arriba. Las dos series no coinciden en fechas y parear
 * «el más cercano» habría presentado un control de hace meses como si fuera del mismo
 * día. Aquí lo que interesa es el estado cardiovascular actual.
 *
 * A diferencia de las cifras por segmento, todo lo de este panel ES MEDIDO.
 */

import { Alert, Box, Divider, Paper, Typography } from '@mui/material';

import { EstadoClinico, IElectrocardiograma } from '../../interface';
import { ESCALAS, clasificar, peorEstado } from '../../utilities';
import { SIN_DATO, formatFechaCL, formatPresion } from '../../utilities/format';
import { COLOR_ESTADO, ETIQUETA_ESTADO } from './paleta';

interface Props {
    electro: IElectrocardiograma | null;
}

interface SignoProps {
    etiqueta : string;
    valor    : string | number | null;
    unidad?  : string;
    estado   : EstadoClinico;
}

const Signo = ({ etiqueta, valor, unidad, estado }: SignoProps) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            py: 0.75,
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: COLOR_ESTADO[estado],
                    flexShrink: 0,
                }}
            />
            <Typography variant="body2" noWrap>
                {etiqueta}
            </Typography>
        </Box>

        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {valor === null ? SIN_DATO : `${valor}${unidad ? ` ${unidad}` : ''}`}
            </Typography>
            <Typography variant="caption" sx={{ color: COLOR_ESTADO[estado] }}>
                {ETIQUETA_ESTADO[estado]}
            </Typography>
        </Box>
    </Box>
);

/** Campo de evaluación clínica: etiqueta arriba, texto del médico abajo. */
const Campo = ({ etiqueta, valor }: { etiqueta: string; valor: string | null }) => (
    <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {etiqueta}
        </Typography>
        <Typography
            variant="body2"
            // La lectura del ECG viene multilínea desde el backend: sin `pre-line` los
            // tres renglones del informe se juntan en un párrafo ilegible.
            sx={{ whiteSpace: 'pre-line' }}
        >
            {valor ?? SIN_DATO}
        </Typography>
    </Box>
);

export const PanelElectro = ({ electro }: Props) => {

    if (!electro) {
        return (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Electrocardiograma
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Este paciente no tiene controles cardiológicos registrados.
                </Alert>
            </Paper>
        );
    }

    const estadoPresion = peorEstado(
        clasificar(electro.presionSistolica, ESCALAS.presionSistolica),
        clasificar(electro.presionDiastolica, ESCALAS.presionDiastolica),
    );

    return (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>

            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Electrocardiograma
            </Typography>
            {/* La fecha va visible porque este control puede ser de otro día que la
                bioimpedancia que se está mirando en la silueta. */}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Control del {formatFechaCL(electro.fecha)}
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Signo
                etiqueta="Presión arterial"
                valor={formatPresion(electro.presionSistolica, electro.presionDiastolica)}
                unidad="mmHg"
                estado={estadoPresion}
            />
            <Signo
                etiqueta="Frecuencia cardíaca"
                valor={electro.frecuenciaCardiaca}
                unidad="ppm"
                estado={clasificar(electro.frecuenciaCardiaca, ESCALAS.frecuenciaCardiaca)}
            />
            <Signo
                etiqueta="Saturación O₂"
                valor={electro.saturacionOxigeno}
                unidad="%"
                estado={clasificar(electro.saturacionOxigeno, ESCALAS.saturacionOxigeno)}
            />
            <Signo
                etiqueta="Hemoglucotest"
                valor={electro.hemoglucotest}
                unidad="mg/dL"
                estado={clasificar(electro.hemoglucotest, ESCALAS.hemoglucotest)}
            />
            <Signo
                etiqueta="Temperatura"
                valor={electro.temperatura}
                unidad="°C"
                estado={clasificar(electro.temperatura, ESCALAS.temperatura)}
            />

            <Divider sx={{ my: 1.5 }} />

            <Campo etiqueta="Estado" valor={electro.status} />
            <Campo etiqueta="Evaluación del paciente" valor={electro.estadoPaciente} />
            <Campo etiqueta="Derivación" valor={electro.derivacion} />
            <Campo etiqueta="Lectura del ECG" valor={electro.observacion} />

        </Paper>
    );
};

export default PanelElectro;
