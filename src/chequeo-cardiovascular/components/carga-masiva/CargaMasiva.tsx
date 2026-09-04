import { useContext, useState } from 'react';
import { Alert, Box, Button, Chip, Divider, Paper, Typography } from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import PostAddIcon from '@mui/icons-material/PostAdd';
import Swal from 'sweetalert2';

import { LoginContext } from '../../../common/context';
import { ExportToExcel } from '../../hooks';
import type { ResponseCargaMasiva } from '../../interface';
import { UseChequeoCardiovascularService } from '../../services';

import { FileUploadExcel } from './FileUploadExcel';

/** Columnas que debe traer el Excel, en este orden. Coincide con la plantilla que se descarga. */
const COLUMNAS_ESPERADAS = ['Nombre Completo', 'Rut', 'Fecha Nacimiento', 'Sexo', 'Division'];

interface Props {
    handleReloadTable: () => void;
}

/**
 * Carga masiva de deportistas desde un Excel.
 *
 * Rediseño respecto al original: el formato esperado está **a la vista** antes de subir nada
 * —era la causa más común de un archivo rechazado— y el resultado se muestra en la propia
 * pantalla además del Swal, para que quede constancia de cuántos registros entraron.
 */
export const CargaMasiva = ({ handleReloadTable }: Props) => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [archivo, setArchivo] = useState<File | null>(null);
    const [subiendo, setSubiendo] = useState(false);
    const [resultado, setResultado] = useState<ResponseCargaMasiva | null>(null);

    const onDescargarPlantilla = async () => {

        try {
            await ExportToExcel('Plantilla-Carga-Masiva');
        }
        catch (problema) {
            Swal.fire({
                title : '❌ No se pudo generar la plantilla',
                text  : problema instanceof Error ? problema.message : 'Inténtalo de nuevo.',
                icon  : 'error',
            });
        }
    };

    const onCargar = async () => {

        if (!archivo) {
            Swal.fire({
                title : 'Falta el archivo',
                text  : 'Selecciona o arrastra un Excel antes de cargar.',
                icon  : 'info',
            });
            return;
        }

        setSubiendo(true);
        setResultado(null);

        try {
            const { postCargaMasiva } = await UseChequeoCardiovascularService();
            const response = await postCargaMasiva(archivo, user_email);

            setResultado(response);

            if (response.status === 200) {
                await Swal.fire({
                    title            : '✅ Carga exitosa',
                    html             : `Se insertaron <strong>${response.cantidad}</strong> registros correctamente.`,
                    icon             : 'success',
                    confirmButtonText: 'Aceptar',
                    timer            : 3000,
                    timerProgressBar : true,
                });

                setArchivo(null);
                handleReloadTable();
            }
            else {
                // El original solo mostraba el Swal de éxito: un fallo se quedaba mudo.
                Swal.fire({
                    title : '⚠️ La carga no se completó',
                    text  : response.message || 'El servidor rechazó el archivo.',
                    icon  : 'warning',
                });
            }
        }
        catch (problema) {
            Swal.fire({
                title : '❌ No se pudo cargar el archivo',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
        finally {
            setSubiendo(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 780, mx: 'auto' }}>

            <Typography
                component="h2"
                sx={{ fontWeight: 700, fontSize: { xs: 18, md: 20 }, color: '#0d47a1', mb: 0.5 }}
            >
                Carga masiva de deportistas
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
                Sube un Excel con el listado del colegio y se registrarán todos de una vez.
            </Typography>

            <Paper
                elevation={0}
                sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, border: '1px solid #e3f2fd' }}
            >
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0d47a1', mb: 1.5 }}>
                    1 · El archivo debe traer estas columnas
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {COLUMNAS_ESPERADAS.map((columna) => (
                        <Chip
                            key={columna}
                            label={columna}
                            size="small"
                            sx={{ backgroundColor: '#e3f2fd', color: '#0d47a1', fontWeight: 500 }}
                        />
                    ))}
                </Box>

                <Button
                    onClick={onDescargarPlantilla}
                    startIcon={<PostAddIcon />}
                    variant="text"
                    size="small"
                    sx={{ textTransform: 'none', fontWeight: 600, color: '#1976d2', mb: 1 }}
                >
                    Descargar plantilla vacía
                </Button>

                <Divider sx={{ my: 2.5, borderColor: '#e3f2fd' }} />

                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0d47a1', mb: 1.5 }}>
                    2 · Sube el archivo
                </Typography>

                <FileUploadExcel archivo={archivo} onSeleccionar={setArchivo} />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
                    <Button
                        onClick={onCargar}
                        disabled={subiendo || !archivo}
                        startIcon={<BackupIcon />}
                        variant="contained"
                        sx={{
                            textTransform : 'none',
                            fontWeight    : 600,
                            borderRadius  : 2,
                            px            : 3,
                            backgroundColor : '#1976d2',
                            '&:hover'       : { backgroundColor: '#115293' },
                        }}
                    >
                        { subiendo ? 'Cargando…' : 'Cargar deportistas' }
                    </Button>
                </Box>

                { resultado && (
                    <Alert
                        severity={resultado.status === 200 ? 'success' : 'warning'}
                        sx={{ mt: 2.5, borderRadius: 2 }}
                    >
                        <strong>{ resultado.cantidad ?? 0 }</strong> registro
                        { resultado.cantidad === 1 ? '' : 's' } procesado
                        { resultado.cantidad === 1 ? '' : 's' }.
                        { resultado.message ? ` ${resultado.message}` : '' }
                    </Alert>
                )}
            </Paper>
        </Box>
    );
};
