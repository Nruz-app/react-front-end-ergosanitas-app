import type { ChipProps } from '@mui/material';

/**
 * Los 7 valores de `estado_paciente` que escribe el backend, **literales exactos** (con
 * espacios, puntos y la errata `Testiado`). Un typo aquí no da error: cae en el color por
 * defecto en silencio. No confundir con `ModoFicha`, que es navegación de React.
 */
export type EstadoPaciente =
    | 'ingresado'
    | 'Testiado'
    | 'ECG FOTO'
    | 'REVISION MEDICA'
    | 'En Rev. Cardio'
    | 'Diag. Card. - Normal'
    | 'Diag. Card. - Alterado';

/** Cómo se pinta un estado en el `Chip` de la lista. */
export interface IEstadoProps {
    label : string;
    color : ChipProps['color'];
}
