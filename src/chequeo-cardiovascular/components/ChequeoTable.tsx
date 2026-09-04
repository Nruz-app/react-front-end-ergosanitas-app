import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react';
import {
    Box, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Swal from 'sweetalert2';

import { LoginContext, ModalContext } from '../../common/context';
import { LikeTextContext } from '../context';
import type { IChequeo } from '../interface';
import { UseChequeoCardiovascularService } from '../services';
import { capitalizarPalabras, esReciente, getEstadoProps } from '../utilities';

import { ChequeoTarjeta } from './ChequeoTarjeta';
import { DownloadPDF } from './DownloadPDF';
import { LoadingTable } from './LoadingTable';
import { FilterTable } from './filters/FilterTable';
import { ExportarExcel } from './exportar-excel/ExportarExcel';

/** Columna de la tabla. Se declara local: `common/table/` es código muerto. */
interface ColumnaTabla {
    id      : number;
    titulo  : string;
    ancho?  : string;
}

const COLUMNAS: ColumnaTabla[] = [
    { id: 1, titulo: 'Nombre' },
    { id: 2, titulo: 'RUT',    ancho: '140px' },
    { id: 3, titulo: 'Edad',   ancho: '80px' },
    { id: 4, titulo: 'Estado', ancho: '180px' },
];

interface Props {
    handleViewData    : (id_paciente: number) => void;
    reloadTable       : boolean;
}

/**
 * Lista de deportistas del colegio.
 *
 * Cuatro columnas y tres acciones: ver, descargar PDF y descargar ECG. **No hay editar, ni
 * subir archivo, ni papelera**: ninguna de esas la tiene el perfil `Colegios` hoy.
 *
 * Bajo 900 px la tabla se sustituye por tarjetas (`ChequeoTarjeta`); una tabla de 4 columnas
 * con 3 botones no cabe en un teléfono sin scroll horizontal.
 */
export const ChequeoTable = ({ handleViewData, reloadTable }: Props) => {

    const theme = useTheme();
    const esMovil = useMediaQuery(theme.breakpoints.down('md'));

    const likeTextContext = useContext(LikeTextContext);
    const { fechaCalendar, textoValue, selectClub } = likeTextContext;

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const { onOpenModalView } = useContext(ModalContext);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);

    const [rowTable, setRowTable] = useState<IChequeo[]>([]);
    const [cargado, setCargado] = useState(false);

    const handleVer = (id_paciente: number) => {
        handleViewData(id_paciente);
        onOpenModalView(true);
    };

    const handleDescargarPDF = async (id_paciente: number) => {
        const { chequeoPDF } = await UseChequeoCardiovascularService();
        await chequeoPDF(id_paciente);
    };

    /**
     * Descarga el ECG. El original avisaba con un `alert()` nativo, el único de todo el módulo;
     * aquí va con Swal, como el resto del repositorio.
     */
    const handleDescargarECG = async (rut: string, id_paciente: number) => {

        try {
            const { pathUrlCertificado } = await UseChequeoCardiovascularService();
            const response = await pathUrlCertificado(rut, id_paciente);

            if (!response || response.status !== 200 || !response.url_pdf) {
                Swal.fire({
                    title : 'Sin electrocardiograma',
                    text  : `Todavía no hay un ECG cargado para el RUT ${rut}.`,
                    icon  : 'info',
                });
                return;
            }

            const link = document.createElement('a');
            link.href = response.url_pdf;
            link.download = `ECG_${response.titulo}.pdf`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        catch (problema) {
            Swal.fire({
                title : '❌ No se pudo descargar el ECG',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
    };

    const fetchChequeos = useCallback(async (pageNumber: number, limit: number): Promise<void> => {

        try {
            setCargado(false);
            const { postChequeoSearch } = await UseChequeoCardiovascularService();
            const response = await postChequeoSearch(
                { textoValue, fechaCalendar, selectClub }, user_email, limit, pageNumber,
            );

            setRowTable(response.data ?? []);
            setTotal(response.total ?? 0);
        }
        catch (problema) {
            // Que la API falle y que la app se cuelgue tienen que verse distinto: sin esto la
            // lista se quedaría en el spinner para siempre.
            console.error('Error al cargar los chequeos:', problema);
            setRowTable([]);
            setTotal(0);
        }
        finally {
            setCargado(true);
        }
    }, [textoValue, fechaCalendar, selectClub, user_email]);

    useEffect(() => {
        fetchChequeos(page + 1, rowsPerPage);
    }, [page, rowsPerPage, reloadTable, fetchChequeos]);

    // Cambiar un filtro con la lista en la página 5 dejaba resultados vacíos sin explicación.
    useEffect(() => {
        setPage(0);
    }, [textoValue, fechaCalendar, selectClub]);

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const sinResultados = cargado && rowTable.length === 0;

    return (
        <Box sx={{ flexGrow: 1 }}>

            <FilterTable />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    { cargado ? `${total} deportista${total === 1 ? '' : 's'}` : 'Cargando…' }
                </Typography>
                <ExportarExcel />
            </Box>

            {/* ESCRITORIO */}
            {!esMovil && (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflowX: 'auto' }}
                >
                    <Table stickyHeader size="small" aria-label="Lista de deportistas">
                        <TableHead>
                            <TableRow>
                                {COLUMNAS.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{
                                            width           : column.ancho,
                                            backgroundColor : '#1976d2',
                                            color           : '#fff',
                                            fontWeight      : 700,
                                            fontSize        : 13,
                                            letterSpacing   : '0.03em',
                                        }}
                                    >
                                        { column.titulo }
                                    </TableCell>
                                ))}
                                <TableCell
                                    align="right"
                                    sx={{ backgroundColor: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 13, width: '170px' }}
                                >
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {!cargado && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center"><LoadingTable /></TableCell>
                                </TableRow>
                            )}

                            {sinResultados && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                        No se encontraron deportistas con esos filtros.
                                    </TableCell>
                                </TableRow>
                            )}

                            {cargado && rowTable.map((row) => {

                                const reciente = esReciente(row.created_at, row.estado_paciente);

                                return (
                                    <TableRow
                                        key={row.id}
                                        hover
                                        sx={{
                                            '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                                            '&:hover': { backgroundColor: '#e3f2fd' },
                                            // Indicador lateral en vez del fondo rojo pleno del
                                            // módulo original, que dejaba el texto ilegible.
                                            borderLeft: reciente ? '5px solid #d32f2f' : '5px solid transparent',
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>
                                            { capitalizarPalabras(row.nombre) }
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 13 }}>{ row.rut }</TableCell>
                                        <TableCell sx={{ fontSize: 13 }}>{ row.edad || '—' }</TableCell>
                                        <TableCell>
                                            <Chip
                                                {...getEstadoProps(row.estado_paciente ?? '')}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end' }}>
                                                <Tooltip title="Ver detalle">
                                                    <IconButton
                                                        onClick={() => handleVer(row.id!)}
                                                        aria-label={`Ver detalle de ${row.nombre}`}
                                                        size="small"
                                                        sx={{
                                                            color: '#fff', backgroundColor: '#2e7d32',
                                                            '&:hover': { backgroundColor: '#1b5e20' },
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <DownloadPDF
                                                    handleClickDownload={handleDescargarPDF}
                                                    id_paciente={row.id!}
                                                    title={`Descargar PDF de ${row.rut}`}
                                                />

                                                <Tooltip title={`Descargar ECG de ${row.rut}`}>
                                                    <IconButton
                                                        onClick={() => handleDescargarECG(row.rut, row.id!)}
                                                        aria-label={`Descargar ECG de ${row.rut}`}
                                                        size="small"
                                                        sx={{
                                                            color: '#fff', backgroundColor: '#0288d1',
                                                            '&:hover': { backgroundColor: '#01579b' },
                                                        }}
                                                    >
                                                        <AssignmentTurnedInIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* MÓVIL */}
            {esMovil && (
                <Box>
                    { !cargado && <LoadingTable /> }

                    { sinResultados && (
                        <Typography sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
                            No se encontraron deportistas con esos filtros.
                        </Typography>
                    )}

                    { cargado && rowTable.map((row) => (
                        <ChequeoTarjeta
                            key={row.id}
                            row={row}
                            handleVer={handleVer}
                            handleDescargarPDF={handleDescargarPDF}
                            handleDescargarECG={handleDescargarECG}
                        />
                    ))}
                </Box>
            )}

            <TablePagination
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
                labelRowsPerPage="Filas:"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
                sx={{ borderTop: '1px solid #eee' }}
            />
        </Box>
    );
};
