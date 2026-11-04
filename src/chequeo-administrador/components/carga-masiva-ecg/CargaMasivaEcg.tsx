import { ChangeEvent, useMemo, useRef, useState } from 'react';
import {
    Box, Button, Chip, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Paper, Select,
    Stack, Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Swal from 'sweetalert2';

import { UI } from '../../config/tema';
import type { IProcesadoEcg } from '../../interface';
import { UseChequeoAdministradorService } from '../../services';

/** Una fila de la grilla: el resultado del backend más el `id` que exige `DataGrid`. */
type FilaEcg = IProcesadoEcg & { id: number };

const COLUMNAS: GridColDef<FilaEcg>[] = [
    { field: 'archivo', headerName: 'Archivo', flex: 1.5, minWidth: 180 },
    { field: 'rut', headerName: 'Rut', width: 130 },
    { field: 'nombre', headerName: 'Paciente', flex: 1.2, minWidth: 180 },
    {
        field      : 'resultado',
        headerName : 'Resultado',
        width      : 120,
        renderCell : (params) => (
            <Chip
                size="small"
                icon={params.value === 'OK' ? <CheckCircleRoundedIcon /> : <ErrorRoundedIcon />}
                label={params.value}
                color={params.value === 'OK' ? 'success' : 'error'}
                sx={{ width: 95, fontWeight: 700 }}
            />
        ),
    },
    { field: 'mensaje', headerName: 'Mensaje', flex: 2, minWidth: 220 },
];

interface Props {
    /** Tras procesar, la lista se recarga: los chequeos cambian de estado. */
    handleReloadTable: () => void;
}

/**
 * Tab «Carga masiva ECG»: subida múltiple de PDFs, con el resumen Procesados / OK / Error y una
 * grilla por archivo.
 *
 * Correcciones respecto al original:
 *
 * - Un error ya no se queda solo en la consola: se avisa con Swal.
 * - El selector «derivado médico» lleva etiqueta: en el original era un `SI`/`NO` sin rótulo.
 * - El input se vacía tras cada subida, para poder volver a subir los mismos archivos.
 *
 * La grilla sigue en inglés («No rows», «0–0 of 0»): traducirla (`localeText`) está anotado
 * para la spec de cargas.
 */
export const CargaMasivaEcg = ({ handleReloadTable }: Props) => {

    const inputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [derivadoMedico, setDerivadoMedico] = useState('NO');
    const [rows, setRows] = useState<FilaEcg[]>([]);

    const totalOK = useMemo(() => rows.filter((fila) => fila.resultado === 'OK').length, [rows]);
    const totalError = useMemo(() => rows.filter((fila) => fila.resultado === 'ERROR').length, [rows]);

    const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {

        const archivos = Array.from(event.target.files ?? []);
        event.target.value = '';

        if (archivos.length === 0) return;

        setLoading(true);

        try {
            const formData = new FormData();
            archivos.forEach((file) => formData.append('files[]', file));

            const { cargaMasivaECG } = await UseChequeoAdministradorService();
            const response = await cargaMasivaECG(derivadoMedico, formData);

            setRows((response.procesados ?? []).map((item, index) => ({ id: index + 1, ...item })));
            handleReloadTable();
        }
        catch (problema) {
            console.error('Error en la carga masiva de ECG:', problema);
            Swal.fire({
                title : '❌ No se pudieron procesar los ECG',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>

            <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid ${UI.bordeGrilla}` }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <Typography component="h2" variant="h6" fontWeight={800}>Carga Masiva ECG</Typography>
                        <Typography variant="body2" color="text.secondary">Subida múltiple de PDFs</Typography>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="derivado-medico-label">Derivado médico</InputLabel>
                            <Select
                                labelId="derivado-medico-label"
                                label="Derivado médico"
                                value={derivadoMedico}
                                onChange={(e) => setDerivadoMedico(e.target.value)}
                            >
                                <MenuItem value="NO">NO</MenuItem>
                                <MenuItem value="SI">SI</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={loading
                                ? <CircularProgress size={18} color="inherit" />
                                : <UploadFileRoundedIcon aria-hidden="true" />}
                            onClick={() => inputRef.current?.click()}
                            disabled={loading}
                            sx={{ borderRadius: 2, height: 42, fontWeight: 700 }}
                        >
                            { loading ? 'Procesando...' : 'Subir ECG PDF' }
                        </Button>

                        <input hidden multiple type="file" ref={inputRef} onChange={handleFiles} />
                    </Grid>
                </Grid>
            </Paper>

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip label={`Procesados: ${rows.length}`} color="primary" />
                <Chip label={`OK: ${totalOK}`} color="success" />
                <Chip label={`Error: ${totalError}`} color="error" />
            </Stack>

            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${UI.bordeGrilla}` }}>
                <DataGrid
                    rows={rows}
                    columns={COLUMNAS}
                    density="compact"
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 20, 50]}
                    rowHeight={38}
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor : UI.cabeceraGrilla,
                            borderBottom    : `1px solid ${UI.bordeGrilla}`,
                        },
                        '& .MuiDataGrid-columnHeaderTitle' : { fontWeight: 700, fontSize: 13 },
                        '& .MuiDataGrid-cell'              : { fontSize: 12, borderColor: UI.celdaGrilla },
                        '& .MuiDataGrid-footerContainer'   : { minHeight: 40 },
                    }}
                />
            </Paper>
        </Box>
    );
};
