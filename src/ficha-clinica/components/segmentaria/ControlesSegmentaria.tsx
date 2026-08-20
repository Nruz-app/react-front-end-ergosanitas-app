/**
 * Controles del tab de distribución segmentaria: qué métrica se muestra y de qué
 * examen. Componente controlado — no guarda estado propio, lo sube al tab.
 */

import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import OpacityIcon from '@mui/icons-material/Opacity';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

import { IBioimpedancia, MetricaSegmentaria } from '../../interface';
import { formatFechaCL } from '../../utilities/format';

interface Props {
    metrica         : MetricaSegmentaria;
    onMetricaChange : (metrica: MetricaSegmentaria) => void;
    bioimpedancias  : IBioimpedancia[];   // orden: fecha DESC
    idBio           : number | null;
    onBioChange     : (id: number) => void;
    /** Examen contra el que se compara. `null` = sin comparación. */
    idBase          : number | null;
    onBaseChange    : (id: number | null) => void;
}

/** Valor del `Select` que representa «Sin comparación». */
const SIN_COMPARACION = 0;

export const ControlesSegmentaria = ({
    metrica,
    onMetricaChange,
    bioimpedancias,
    idBio,
    onBioChange,
    idBase,
    onBaseChange,
}: Props) => {

    // `exclusive` deja deseleccionar el botón activo y devuelve null: se ignora, porque
    // la silueta siempre tiene que estar mostrando alguna métrica.
    const handleMetrica = (_e: React.MouseEvent<HTMLElement>, valor: MetricaSegmentaria | null) => {
        if (valor !== null) onMetricaChange(valor);
    };

    const handleBio = (evento: SelectChangeEvent<number>) => {
        onBioChange(Number(evento.target.value));
    };

    const handleBase = (evento: SelectChangeEvent<number>) => {
        const valor = Number(evento.target.value);
        onBaseChange(valor === SIN_COMPARACION ? null : valor);
    };

    // Comparar un examen consigo mismo daría cinco ceros: no se ofrece como opción.
    const opcionesBase = bioimpedancias.filter((bio) => bio.id !== idBio);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                mb: 3,
            }}
        >
            <ToggleButtonGroup
                value={metrica}
                exclusive
                onChange={handleMetrica}
                size="small"
                color="primary"
                aria-label="Métrica que colorea la silueta"
            >
                <ToggleButton value="grasa" sx={{ px: 2 }}>
                    <OpacityIcon fontSize="small" sx={{ mr: 1 }} />
                    Masa grasa
                </ToggleButton>
                <ToggleButton value="musculo" sx={{ px: 2 }}>
                    <FitnessCenterIcon fontSize="small" sx={{ mr: 1 }} />
                    Masa muscular
                </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="label-examen-bio">Examen</InputLabel>
                    <Select
                        labelId="label-examen-bio"
                        label="Examen"
                        value={idBio ?? ''}
                        onChange={handleBio}
                    >
                        {bioimpedancias.map((bio, indice) => (
                            <MenuItem key={bio.id} value={bio.id}>
                                {formatFechaCL(bio.fecha)}
                                {/* El primero de la lista es el más reciente: el mapper ordena DESC. */}
                                {indice === 0 ? ' · más reciente' : ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="label-examen-base">Comparar con</InputLabel>
                    <Select
                        labelId="label-examen-base"
                        label="Comparar con"
                        value={idBase ?? SIN_COMPARACION}
                        onChange={handleBase}
                    >
                        <MenuItem value={SIN_COMPARACION}>Sin comparación</MenuItem>
                        {opcionesBase.map((bio) => (
                            <MenuItem key={bio.id} value={bio.id}>
                                {formatFechaCL(bio.fecha)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};

export default ControlesSegmentaria;
