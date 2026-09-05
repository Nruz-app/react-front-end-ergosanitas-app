import { Box } from '@mui/material';

import { sxSoloLectores } from '../../config/tema';

interface Props {
    titulo   : string;
    columnas : string[];
    filas    : (string | number)[][];
}

/**
 * El equivalente en texto de un gráfico, oculto en pantalla y disponible para lectores de
 * pantalla.
 *
 * `chart.js` pinta un `<canvas>`: para un lector de pantalla es una imagen sin contenido, así
 * que hasta la Spec 02 toda la información del Home era invisible para quien no ve los colores.
 * Esta tabla no reemplaza al gráfico, lo acompaña — y de paso da el valor exacto, que un
 * segmento de dona nunca da.
 */
export const TablaAccesible = ({ titulo, columnas, filas }: Props) => {

    return (
        <Box component="table" sx={sxSoloLectores}>
            <caption>{ titulo }</caption>
            <thead>
                <tr>
                    { columnas.map((columna) => <th key={columna} scope="col">{ columna }</th>) }
                </tr>
            </thead>
            <tbody>
                { filas.map((fila) => (
                    <tr key={String(fila[0])}>
                        <th scope="row">{ fila[0] }</th>
                        { fila.slice(1).map((celda, indice) => (
                            <td key={`${fila[0]}-${columnas[indice + 1]}`}>{ celda }</td>
                        )) }
                    </tr>
                )) }
            </tbody>
        </Box>
    );
};
