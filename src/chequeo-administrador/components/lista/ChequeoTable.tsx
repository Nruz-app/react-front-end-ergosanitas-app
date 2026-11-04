import { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TablePagination, TableRow,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Swal from 'sweetalert2';

import { LoginContext, ModalContext } from '../../../common/context';
import { COLORES, DEGRADADOS, SOMBRAS, UI } from '../../config/tema';
import { LikeTextContext } from '../../context';
import type { FormDataChequeo, IChequeo } from '../../interface';
import { UseChequeoAdministradorService } from '../../services';
import {
    capitalizarPalabras, esReciente, escaparHtml, fechaAtencionDeFila, getEstadoProps,
} from '../../utilities';
import { ExportarExcel } from '../exportar-excel';
import { FilterTable } from '../filtros';
import { BotonAccion } from './BotonAccion';
import { DownloadPDF } from './DownloadPDF';
import { LoadingTable } from './LoadingTable';

/** Columna de datos. Se declara local: `common/table/` es código muerto. */
interface ColumnaTabla {
    id     : number;
    titulo : string;
}

/** Las cuatro columnas de datos con cabecera degradada. «Fech Aten» y «User» van aparte. */
const COLUMNAS: ColumnaTabla[] = [
    { id: 1, titulo: 'Nombres' },
    { id: 2, titulo: 'Rut' },
    { id: 3, titulo: 'Edad' },
    { id: 4, titulo: 'Estado' },
];

/** Nombres + Rut + Edad + Estado + Fech Aten + User + Accion. */
const TOTAL_COLUMNAS = 7;

const sxCabeceraDatos = {
    background    : DEGRADADOS.cabeceraTabla,
    color         : COLORES.textoSobrePrimario,
    fontWeight    : 'bold',
    fontSize      : '14px',
    letterSpacing : '0.5px',
};

const sxCabeceraExtra = {
    color    : COLORES.textoSobrePrimario,
    bgcolor  : COLORES.primario,
    fontSize : '20px',
};

interface Props {
    /** «Ver»: el orquestador carga el chequeo; la tabla abre `ChequeoView`. */
    onVer          : (id_paciente: number) => void;
    /** «Editar»: abre la ficha en modo `edicion`. */
    onEditar       : (rut_paciente: string, id_paciente: number) => Promise<void> | void;
    /** «Revisión Médica»: abre la ficha en modo `revision`. */
    onRevision     : (rut_paciente: string, id_paciente: number) => Promise<void> | void;
    /** «Subir Archivo»: el orquestador guarda RUT y nombre; la tabla abre `ModalSubirEcg`. */
    onSubirArchivo : (formData: FormDataChequeo) => void;
    /** Cambia de valor cada vez que hay que recargar la lista. */
    reloadTable       : boolean;
    handleReloadTable : () => void;
}

/**
 * Lista de chequeos del Administrador (tab 0): 6 columnas y las 8 acciones de hoy.
 *
 * Es el `ChequeoTable` del bloque «OTROS» de `src/Chequeo/` aplanado a `isAdmin = true`: sin
 * `isMedico`, `isColegio` ni `isUsuario`, y sin ninguna comparación de perfil. Aspecto 1:1;
 * el rediseño de la lista (responsive, tarjetas en móvil, indicador lateral) es la Spec 03.
 *
 * Como en el original y en `chequeo-cardiovascular`, la tabla hace su propio fetch: depende
 * del contexto de búsqueda y de la paginación, que son suyos.
 */
export const ChequeoTable = ({
    onVer, onEditar, onRevision, onSubirArchivo, reloadTable, handleReloadTable,
}: Props) => {

    const navigate = useNavigate();

    const { fechaCalendar, textoValue, selectClub } = useContext(LikeTextContext);
    const { user } = useContext(LoginContext);
    const { user_email } = user;

    // Los modales cuelgan del `ModalProvider` que monta el orquestador. El orquestador no puede
    // leer un contexto que él mismo provee, así que los abre la tabla, igual que el original.
    const { onOpenModal, onOpenModalView } = useContext(ModalContext);

    const handleVer = (id_paciente: number) => {
        onVer(id_paciente);
        onOpenModalView(true);
    };

    const handleSubirArchivo = (row: IChequeo) => {
        onSubirArchivo({ rut: row.rut, nombre: row.nombre });
        onOpenModal(true);
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [total, setTotal] = useState(0);

    const [rowTable, setRowTable] = useState<IChequeo[]>([]);
    const [cargado, setCargado] = useState(false);

    // Turno de la última búsqueda. Con el buscador, la fecha, el club y la paginación pueden
    // volar dos peticiones a la vez; si la vieja llega después, pintaría resultados de un filtro
    // que ya no es el de pantalla. Solo la última escribe el estado.
    const turnoBusqueda = useRef(0);

    const fetchChequeos = useCallback(async (pageNumber: number, limit: number): Promise<void> => {

        const turno = ++turnoBusqueda.current;

        try {
            setCargado(false);
            const { postChequeoSearch } = await UseChequeoAdministradorService();
            const response = await postChequeoSearch(
                { textoValue, fechaCalendar, selectClub }, user_email, limit, pageNumber,
            );

            if (turno !== turnoBusqueda.current) return;

            setRowTable(response.data ?? []);
            setTotal(response.total ?? 0);
        }
        catch (problema) {
            if (turno !== turnoBusqueda.current) return;

            // Sin esto un error dejaría la lista anterior en pantalla como si fuera la actual.
            console.error('Error al cargar chequeos:', problema);
            setRowTable([]);
            setTotal(0);
        }
        finally {
            if (turno === turnoBusqueda.current) setCargado(true);
        }
    }, [textoValue, fechaCalendar, selectClub, user_email]);

    // Depende de `fetchChequeos` y no de los campos del contexto uno a uno (§7.1).
    useEffect(() => {
        fetchChequeos(page + 1, rowsPerPage);
    }, [page, rowsPerPage, reloadTable, fetchChequeos]);

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDescargarPDF = async (id_paciente: number) => {
        const { chequeoPDF } = await UseChequeoAdministradorService();
        await chequeoPDF(id_paciente);
    };

    /** «Descargar ECG». El `alert()` nativo del original pasa a Swal (§6.2). */
    const handleDescargarECG = async (rut: string, id_paciente: number) => {

        try {
            const { pathUrlCertificado } = await UseChequeoAdministradorService();
            const response = await pathUrlCertificado(rut, id_paciente);

            if (!response || response.status !== 200 || !response.url_pdf) {
                Swal.fire({ title: 'Sin certificado', text: 'No se encontró el certificado', icon: 'info' });
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

    const handleEditar = async (rut_paciente: string, id_paciente: number) => {
        await onEditar(rut_paciente, id_paciente);
        handleReloadTable();
    };

    const handleRevision = async (rut_paciente: string, id_paciente: number) => {
        await onRevision(rut_paciente, id_paciente);
        handleReloadTable();
    };

    /**
     * «Borrar» (D2 a): el único borrado del módulo. La confirmación muestra **nombre y RUT**
     * para que no se borre una fila por error, y la lista se recarga **una** vez, no dos como
     * en el original.
     */
    const handleBorrar = async (row: IChequeo) => {

        const result = await Swal.fire({
            title             : '⚠️ ¿Estás seguro?',
            html              : `Esta acción eliminará permanentemente el chequeo de<br>
                <b>${escaparHtml(capitalizarPalabras(row.nombre))}</b> · RUT <b>${escaparHtml(row.rut)}</b>.`,
            icon              : 'warning',
            showCancelButton  : true,
            confirmButtonColor: UI.peligro,
            cancelButtonColor : UI.cancelar,
            confirmButtonText : 'Sí, eliminar',
            cancelButtonText  : 'Cancelar',
            reverseButtons    : true,
            focusCancel       : true,
        });

        if (!result.isConfirmed) return;

        try {
            const { getDeleteById } = await UseChequeoAdministradorService();
            await getDeleteById(row.id!);

            Swal.fire({
                title             : '✅ Eliminado',
                text              : 'El paciente ha sido eliminado correctamente.',
                icon              : 'success',
                timer             : 2000,
                showConfirmButton : false,
            });
            handleReloadTable();
        }
        catch (problema) {
            console.error('Error al eliminar paciente:', problema);
            Swal.fire({ title: '❌ Error', text: 'No se pudo eliminar el paciente. Intenta nuevamente.', icon: 'error' });
        }
    };

    const sinResultados = cargado && rowTable.length === 0;

    return (
        <Box sx={{ flexGrow: 1 }}>

            <FilterTable />
            <ExportarExcel />

            <Box sx={{ padding: { xs: 0, sm: 2 }, marginBottom: 1 }}>
                <TableContainer
                    component={Paper}
                    sx={{ borderRadius: 3, boxShadow: SOMBRAS.tabla, overflowX: 'auto' }}
                >
                    <Table stickyHeader aria-label="Lista de chequeos">

                        <TableHead>
                            <TableRow>
                                {COLUMNAS.map((column) => (
                                    <TableCell key={column.id} align="center" sx={sxCabeceraDatos}>
                                        { column.titulo }
                                    </TableCell>
                                ))}
                                <TableCell align="center" sx={sxCabeceraExtra}>Fech Aten</TableCell>
                                <TableCell align="center" sx={sxCabeceraExtra}>User</TableCell>
                                <TableCell align="center" sx={sxCabeceraExtra}>Accion</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {!cargado && (
                                <TableRow>
                                    <TableCell colSpan={TOTAL_COLUMNAS} align="center"><LoadingTable /></TableCell>
                                </TableRow>
                            )}

                            {sinResultados && (
                                <TableRow>
                                    <TableCell colSpan={TOTAL_COLUMNAS} align="center">
                                        No se encontraron pacientes Vigentes.
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
                                            backgroundColor      : reciente ? UI.filaReciente : undefined,
                                            '&:nth-of-type(odd)' : { backgroundColor: reciente ? UI.filaReciente : UI.fondoSutil },
                                            '&:hover'            : { backgroundColor: reciente ? UI.filaRecienteHover : COLORES.fondoSuave },
                                            '& td'               : reciente ? { color: COLORES.textoSobrePrimario } : undefined,
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: '13px' }}>{ capitalizarPalabras(row.nombre) }</TableCell>
                                        <TableCell>{ row.rut }</TableCell>
                                        <TableCell>{ row.edad }</TableCell>
                                        <TableCell>
                                            <Chip
                                                {...getEstadoProps(row.estado_paciente)}
                                                size="small"
                                                sx={{ fontWeight: 500, textTransform: 'uppercase' }}
                                            />
                                        </TableCell>
                                        <TableCell>{ fechaAtencionDeFila(row.fecha_atencion, row.created_at) }</TableCell>
                                        <TableCell>{ row.user_email?.split('@')[0] }</TableCell>

                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            <BotonAccion
                                                titulo={`Ver ${row.rut}`}
                                                icono={<VisibilityIcon />}
                                                color={UI.accionVerde}
                                                onClick={() => handleVer(row.id!)}
                                            />
                                            <BotonAccion
                                                titulo={`Editar ${row.rut}`}
                                                icono={<EditIcon />}
                                                color={UI.accionVerde}
                                                onClick={() => handleEditar(row.rut, row.id!)}
                                            />
                                            <BotonAccion
                                                titulo={`ECG Foto ${row.rut}`}
                                                icono={<MonitorHeartIcon />}
                                                color={UI.accionVerde}
                                                onClick={() => navigate(`/certificado/${row.rut}/${row.id}`)}
                                            />
                                            <BotonAccion
                                                titulo={`Revisión Médica ${row.rut}`}
                                                icono={<FavoriteIcon />}
                                                color={UI.accionVerde}
                                                onClick={() => handleRevision(row.rut, row.id!)}
                                            />
                                            <DownloadPDF
                                                handleClickDownload={handleDescargarPDF}
                                                id_paciente={row.id!}
                                                title={`Descargar PDF - ${row.rut}`}
                                            />
                                            <BotonAccion
                                                titulo={`Descargar ECG - ${row.rut}`}
                                                icono={<AssignmentTurnedInIcon />}
                                                color={UI.accionAzul}
                                                onClick={() => handleDescargarECG(row.rut, row.id!)}
                                            />
                                            <BotonAccion
                                                titulo={`Subir Archivo ${row.rut}`}
                                                icono={<CloudUploadIcon />}
                                                color={UI.accionAzul}
                                                onClick={() => handleSubirArchivo(row)}
                                            />
                                            <BotonAccion
                                                titulo={`Borrar - ${row.rut}`}
                                                icono={<DeleteIcon />}
                                                color={UI.accionAzul}
                                                variant="outlined"
                                                onClick={() => handleBorrar(row)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 20, 50]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                    sx={{ borderTop: `1px solid ${UI.bordeSuave}` }}
                />
            </Box>
        </Box>
    );
};
