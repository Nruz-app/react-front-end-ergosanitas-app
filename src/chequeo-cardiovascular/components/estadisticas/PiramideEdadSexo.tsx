import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';

import { COLORES } from '../../config/tema';
import type { SerieApilada } from '../../interface';
import { estadoDeTarjeta, subtituloResumen } from '../../utilities';

import { TablaAccesible } from './TablaAccesible';
import { TarjetaGrafico } from './TarjetaGrafico';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    serie      : SerieApilada;
    cargado    : boolean;
    error      : boolean;
    totalFilas : number;
}

/**
 * Población evaluada por rango etario y sexo.
 *
 * Describe a quién está atendiendo el colegio, que es el contexto que da sentido al resto de
 * los indicadores: los mismos porcentajes de IMC significan cosas distintas en un colegio de
 * básica que en uno de media.
 *
 * `Masculino` llega con los valores **en negativo** desde `resumirPorEdadSexo`, que es como
 * chart.js dibuja una pirámide. Por eso tanto el eje como el tooltip aplican `Math.abs`: el
 * signo es un truco de dibujo, no un dato.
 */
export const PiramideEdadSexo = ({ serie, cargado, error, totalFilas }: Props) => {

    const hayDatos = serie.labels.length > 0;
    const estado = estadoDeTarjeta(cargado, error, hayDatos);

    return (
        <TarjetaGrafico
            titulo="Población evaluada por edad y sexo"
            subtitulo={subtituloResumen(serie.usadas, totalFilas)}
            estado={estado}
            alto={280}
            tabla={
                <TablaAccesible
                    titulo="Deportistas por rango de edad y sexo"
                    columnas={['Rango de edad', ...serie.pilas.map((pila) => pila.nombre)]}
                    filas={serie.labels.map((rango, indice) => [
                        rango,
                        ...serie.pilas.map((pila) => Math.abs(pila.data[indice] ?? 0)),
                    ])}
                />
            }
        >
            <Bar
                data={{
                    labels   : serie.labels,
                    datasets : serie.pilas.map((pila) => ({
                        label           : pila.nombre,
                        data            : pila.data,
                        backgroundColor : pila.color,
                        borderColor     : COLORES.fondoTarjeta,
                        borderWidth     : 1,
                        borderRadius    : 4,
                    })),
                }}
                options={{
                    indexAxis           : 'y',
                    maintainAspectRatio : false,
                    plugins : {
                        legend : {
                            display  : true,
                            position : 'bottom',
                            labels   : { font: { size: 12 }, boxWidth: 12, padding: 12 },
                        },
                        tooltip : {
                            callbacks: {
                                label: (contexto) => {
                                    // `Math.abs` porque Masculino viaja en negativo: el signo
                                    // es cómo se dibuja la pirámide, no un dato.
                                    const valor = Math.abs(Number(contexto.parsed.x) || 0);
                                    // El porcentaje se calcula sobre los deportistas que
                                    // entraron en la pirámide, que es el mismo `n` que declara
                                    // el subtítulo. Usar el total descargado daría porcentajes
                                    // que no suman 100 sin explicación.
                                    const porcentaje = serie.usadas > 0
                                        ? Math.round((valor / serie.usadas) * 100)
                                        : 0;
                                    return ` ${contexto.dataset.label}: ${valor} (${porcentaje}%)`;
                                },
                            },
                        },
                    },
                    scales: {
                        x : {
                            stacked : true,
                            ticks   : {
                                precision : 0,
                                // El signo negativo es cómo se dibuja la pirámide, no un valor.
                                callback  : (valor) => Math.abs(Number(valor)),
                            },
                        },
                        y : { stacked: true, grid: { display: false } },
                    },
                }}
            />
        </TarjetaGrafico>
    );
};
