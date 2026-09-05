import {
    Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    useMediaQuery, useTheme,
} from '@mui/material';

import { COLORES, sxFocoVisible, UI } from '../../config/tema';
import type { IChequeo } from '../../interface';
import {
    capitalizarPalabras, estadoDeTarjeta, formatearPresion, getEstadoProps, hayDato, oGuion,
} from '../../utilities';

import { TarjetaGrafico } from '../estadisticas/TarjetaGrafico';
import { TarjetaAlterado } from './TarjetaAlterado';

interface Props {
    alterados  : IChequeo[];
    cargado    : boolean;
    error      : boolean;
    totalFilas : number;
}

interface Columna {
    id      : string;
    titulo  : string;
    ancho?  : string;
    /** Los signos vitales van a la derecha: son cifras y así se comparan entre filas. */
    cifra?  : boolean;
}

const COLUMNAS: Columna[] = [
    { id: 'nombre',  titulo: 'Nombre' },
    { id: 'rut',     titulo: 'RUT',      ancho: '130px' },
    { id: 'edad',    titulo: 'Edad',     ancho: '70px',  cifra: true },
    { id: 'presion', titulo: 'Presión',  ancho: '95px',  cifra: true },
    { id: 'fc',      titulo: 'FC',       ancho: '80px',  cifra: true },
    { id: 'sat',     titulo: 'Sat.',     ancho: '75px',  cifra: true },
    { id: 'imc',     titulo: 'IMC',      ancho: '75px',  cifra: true },
    { id: 'estado',  titulo: 'Estado',   ancho: '170px' },
];

/**
 * Los deportistas con diagnóstico cardíaco alterado.
 *
 * Sustituye a los gráficos «Avance por etapa» y «Avance por curso» de la primera versión del
 * Home. Aquellos decían *cuántos* había —cosa que los contadores de arriba ya dicen—; esta lista
 * dice **quiénes son**, que es lo único de la pantalla sobre lo que un colegio puede actuar.
 *
 * Es de **solo lectura**: ver el detalle, el PDF y el ECG siguen en el tab «Lista de
 * deportistas», que ya los tiene. Traerlos aquí obligaría a cablear handlers desde el
 * orquestador hasta el Home, y esa decisión no está tomada.
 *
 * No lleva `TablaAccesible`: **ya es una `<table>` real** con encabezados, así que un lector de
 * pantalla la lee entera. Añadírsela duplicaría el contenido.
 *
 * Bajo 900 px se sustituye por `TarjetaAlterado`. Las dos son la misma fila y se cambian juntas.
 */
export const ListaAlterados = ({ alterados, cargado, error, totalFilas }: Props) => {

    const theme = useTheme();
    const esMovil = useMediaQuery(theme.breakpoints.down('md'));

    const estado = estadoDeTarjeta(cargado, error, alterados.length > 0);

    const subtitulo = totalFilas === 0
        ? 'Sin deportistas registrados'
        : alterados.length > 0
            ? `${alterados.length} de ${totalFilas} deportistas requieren seguimiento`
            : `${totalFilas} deportistas revisados`;

    return (
        <TarjetaGrafico
            titulo="Deportistas con diagnóstico alterado"
            subtitulo={subtitulo}
            estado={estado}
            alto="auto"
            mensajeVacio="Ningún deportista con diagnóstico alterado."
        >
            {/*
                `tabIndex` porque la lista puede desbordar los 420 px y una zona con scroll
                que solo se mueve con el ratón deja fuera a quien navega con teclado.
            */}
            <Box
                tabIndex={0}
                role="group"
                aria-label="Listado de deportistas con diagnóstico alterado"
                sx={{ width: '100%', maxHeight: 420, overflowY: 'auto', ...sxFocoVisible }}
            >

                {/* MÓVIL */}
                { esMovil && alterados.map((row) => (
                    <TarjetaAlterado key={row.id ?? row.rut} row={row} />
                )) }

                {/* ESCRITORIO */}
                { !esMovil && (
                    <TableContainer>
                        <Table stickyHeader size="small" aria-label="Deportistas con diagnóstico alterado">
                            <TableHead>
                                <TableRow>
                                    { COLUMNAS.map((columna) => (
                                        <TableCell
                                            key={columna.id}
                                            align={columna.cifra ? 'right' : 'left'}
                                            sx={{
                                                width           : columna.ancho,
                                                backgroundColor : COLORES.primario,
                                                color           : COLORES.fondoTarjeta,
                                                fontWeight      : 700,
                                                fontSize        : 13,
                                                letterSpacing   : '0.03em',
                                            }}
                                        >
                                            { columna.titulo }
                                        </TableCell>
                                    )) }
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                { alterados.map((row) => {

                                    const { label, color } = getEstadoProps(row.estado_paciente ?? '');

                                    const presion = formatearPresion(row.presion_sistolica, row.presionArterial);

                                    return (
                                        <TableRow
                                            key={row.id ?? row.rut}
                                            sx={{
                                                '&:nth-of-type(odd)': { backgroundColor: UI.fondoSutil },
                                                // Barra lateral en vez de fondo rojo: el rojo pleno
                                                // dejaba el texto ilegible, igual que en el tab 1.
                                                borderLeft : `4px solid ${UI.atencion}`,
                                            }}
                                        >
                                            <TableCell sx={{ fontSize: 13, fontWeight: 600, color: COLORES.primarioOsc }}>
                                                { capitalizarPalabras(row.nombre) }
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 13 }}>{ oGuion(row.rut) }</TableCell>
                                            <TableCell align="right" sx={{ fontSize: 13 }}>{ oGuion(row.edad) }</TableCell>
                                            <TableCell align="right" sx={{ fontSize: 13 }}>{ oGuion(presion) }</TableCell>
                                            <TableCell align="right" sx={{ fontSize: 13 }}>
                                                { oGuion(row.frecuencia_cardiaca_paciente) }
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: 13 }}>
                                                { hayDato(row.saturacionOxigeno) ? `${row.saturacionOxigeno}%` : '—' }
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: 13 }}>
                                                { oGuion(row.imc_paciente) }
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={label} color={color} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    );
                                }) }
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </TarjetaGrafico>
    );
};
