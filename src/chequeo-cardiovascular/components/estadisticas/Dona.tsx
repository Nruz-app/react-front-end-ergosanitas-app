import { Box, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';

import { COLORES } from '../../config/tema';
import type { EstadoTarjeta } from '../../interface';

import { LeyendaGrafico } from './LeyendaGrafico';
import { TablaAccesible } from './TablaAccesible';
import { TarjetaGrafico } from './TarjetaGrafico';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface Props {
    titulo    : string;
    subtitulo : string;
    /** Qué cuenta la dona: «Deportistas». Va bajo el total del centro y en el tooltip. */
    etiqueta  : string;
    estado    : EstadoTarjeta;
    labels    : string[];
    data      : number[];
    colores   : string[];
}

/**
 * La dona con el total al centro, su leyenda y su tabla accesible.
 *
 * Es **solo presentación**: no pide datos ni decide colores. La comparten los gráficos que
 * consultan `estadisticas/*` —vía `GraficoTorta`, que sí trae la serie— y los que se derivan de
 * `chequeo-all`, que la reciben ya calculada. Antes de separarla, añadir un gráfico derivado
 * obligaba a copiar cien líneas de canvas, leyenda y tabla.
 */
export const Dona = ({ titulo, subtitulo, etiqueta, estado, labels, data, colores }: Props) => {

    const total = data.reduce((suma, valor) => suma + valor, 0);

    const items = labels.map((nombre, indice) => ({
        nombre,
        color : colores[indice] ?? COLORES.neutro,
        valor : data[indice] ?? 0,
    }));

    return (
        <TarjetaGrafico
            titulo={titulo}
            subtitulo={subtitulo}
            estado={estado}
            alto={200}
            leyenda={<LeyendaGrafico items={items} />}
            tabla={
                <TablaAccesible
                    titulo={`${titulo}: distribución de ${etiqueta.toLowerCase()}`}
                    columnas={['Categoría', 'Cantidad', 'Porcentaje']}
                    filas={items.map(({ nombre, valor }) => [
                        nombre,
                        valor,
                        `${total > 0 ? Math.round((valor / total) * 100) : 0}%`,
                    ])}
                />
            }
        >
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Doughnut
                    data={{
                        labels,
                        datasets : [{
                            label           : etiqueta,
                            data,
                            backgroundColor : colores,
                            borderColor     : COLORES.fondoTarjeta,
                            borderWidth     : 2,
                        }],
                    }}
                    options={{
                        maintainAspectRatio : false,
                        cutout  : '62%',
                        plugins : {
                            // La leyenda va fuera del canvas: dentro descentraría el anillo y
                            // el total del medio dejaría de caer donde debe.
                            legend  : { display: false },
                            tooltip : {
                                callbacks: {
                                    label: (contexto) => {
                                        const valor = Number(contexto.parsed) || 0;
                                        const porcentaje = total > 0
                                            ? Math.round((valor / total) * 100)
                                            : 0;
                                        return ` ${valor} ${etiqueta.toLowerCase()} (${porcentaje}%)`;
                                    },
                                },
                            },
                        },
                    }}
                />

                <Box
                    aria-hidden="true"
                    sx={{
                        position      : 'absolute',
                        top           : '50%',
                        left          : '50%',
                        transform     : 'translate(-50%, -50%)',
                        textAlign     : 'center',
                        pointerEvents : 'none',
                    }}
                >
                    <Typography sx={{ fontSize: 26, fontWeight: 700, color: COLORES.primarioOsc, lineHeight: 1 }}>
                        { total }
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>
                        { etiqueta }
                    </Typography>
                </Box>
            </Box>
        </TarjetaGrafico>
    );
};
