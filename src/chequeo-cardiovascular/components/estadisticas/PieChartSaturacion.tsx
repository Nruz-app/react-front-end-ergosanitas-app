import type { SerieSimple } from '../../interface';
import { estadoDeTarjeta, subtituloResumen } from '../../utilities';

import { Dona } from './Dona';

interface Props {
    serie      : SerieSimple;
    cargado    : boolean;
    error      : boolean;
    totalFilas : number;
}

/**
 * Distribución de saturación de oxígeno del colegio.
 *
 * **Es el único gráfico clínico que no viene del backend.** Consultaba
 * `GET /estadisticas/estadistica-saturacion/{user_email}`, que devuelve HTTP 500 desde que existe
 * el módulo, así que la tarjeta llevaba meses diciendo «este indicador no está disponible».
 *
 * El dato, sin embargo, **nunca faltó**: viene en `saturacionOxigeno` de cada fila de
 * `chequeo-all`, la misma llamada que ya alimenta la lista de alterados y la pirámide. Ahora se
 * agrupa en el front con `resumirPorSaturacion` y el gráfico funciona sin depender del endpoint
 * roto. Por eso, a diferencia de IMC y hemoglucotest, este recibe su serie por props.
 */
export const PieChartSaturacion = ({ serie, cargado, error, totalFilas }: Props) => {

    const hayDatos = serie.data.some((valor) => valor > 0);

    return (
        <Dona
            titulo="Saturación de oxígeno"
            subtitulo={subtituloResumen(serie.usadas, totalFilas)}
            etiqueta="Deportistas"
            estado={estadoDeTarjeta(cargado, error, hayDatos)}
            labels={serie.labels}
            data={serie.data}
            colores={serie.colores}
        />
    );
};
