import { UseEstadisticasService } from '../../services';
import { GraficoTorta } from './GraficoTorta';

// El servicio se resuelve a nivel de módulo, no dentro del componente: así la identidad de
// `getEstadisticaIMC` es estable y `GraficoTorta` no vuelve a pedir la serie cada vez que el
// padre re-renderiza (por ejemplo, al cambiar de tab).
const { getEstadisticaIMC } = UseEstadisticasService();

/** Distribución nutricional por IMC del colegio. */
export const PieChartImc = () => (

    <GraficoTorta
        titulo="Nutrición (IMC)"
        etiqueta="Deportistas"
        fetchSerie={getEstadisticaIMC}
    />
);
