import { UseEstadisticasService } from '../../services';
import { GraficoTorta } from './GraficoTorta';

// Ver la nota de `PieChartImc`: identidad estable para no refetchear en cada re-render.
const { getEstadisticaSaturacion } = UseEstadisticasService();

/** Distribución de saturación de oxígeno del colegio. */
export const PieChartSaturacion = () => (

    <GraficoTorta
        titulo="Saturación de oxígeno"
        etiqueta="Deportistas"
        colores={['#81C784', '#FFCC80', '#FFA000', '#E57373']}
        fetchSerie={getEstadisticaSaturacion}
    />
);
