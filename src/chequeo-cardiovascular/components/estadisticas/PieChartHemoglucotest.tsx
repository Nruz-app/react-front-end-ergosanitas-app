import { UseEstadisticasService } from '../../services';
import { GraficoTorta } from './GraficoTorta';

// Ver la nota de `PieChartImc`: identidad estable para no refetchear en cada re-render.
const { getEstadisticaHemoglucotest } = UseEstadisticasService();

/** Distribución de hemoglucotest del colegio. */
export const PieChartHemoglucotest = () => (

    <GraficoTorta
        titulo="Hemoglucotest"
        etiqueta="Deportistas"
        colores={['#81C784', '#FFCC80', '#FFA000', '#E57373']}
        fetchSerie={getEstadisticaHemoglucotest}
    />
);
