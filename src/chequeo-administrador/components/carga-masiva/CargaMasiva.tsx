import { useContext, useState } from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import PostAddIcon from '@mui/icons-material/PostAdd';
import Swal from 'sweetalert2';

import { LoginContext } from '../../../common/context';
import { COLORES, SOMBRAS, UI, sxFocoVisible } from '../../config/tema';
import { ExportToExcel } from '../../hooks';
import { UseChequeoAdministradorService } from '../../services';
import { FileUploadExcel } from './FileUploadExcel';

const sxBotonCarga = {
    borderRadius  : 2,
    textTransform : 'none',
    fontWeight    : 'bold',
    px            : 3,
    '&:hover'     : {
        backgroundColor : UI.accionCarga,
        color           : COLORES.textoSobrePrimario,
        boxShadow       : SOMBRAS.icono,
    },
    ...sxFocoVisible,
};

/**
 * Tab «Carga masiva Excel»: descargar la plantilla y subir el Excel relleno.
 *
 * ⚠️ Las filas quedan a nombre del `user_email` del propio Administrador, no de un club
 * (riesgo R5): es el comportamiento de hoy y cambiarlo es de otra spec.
 *
 * Correcciones respecto al original:
 *
 * - Sin archivo, el original mostraba un `alert()` **y seguía**, mandando `null` al backend.
 *   Aquí avisa con Swal y se detiene.
 * - Un error de red ya no deja el botón bloqueado: se avisa y se libera.
 * - El título pasa a «Carga masiva de chequeos» (§6.2; el original decía «Cargar Masiva»).
 */
export const CargaMasiva = () => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [btnStatus, setBtnStatus] = useState(false);
    const [archivo, setArchivo] = useState<File | null>(null);

    const onCargaMasiva = async () => {

        if (!archivo) {
            Swal.fire({ title: 'Falta el archivo', text: 'Por favor, selecciona un archivo', icon: 'warning' });
            return;
        }

        setBtnStatus(true);

        try {
            const { postCargaMasiva } = await UseChequeoAdministradorService();
            const respuesta = await postCargaMasiva(archivo, user_email);

            if (respuesta.status === 200) {
                Swal.fire({
                    title             : '✅ ¡Carga Exitosa!',
                    html              : `Se han insertado <strong>${Number(respuesta.cantidad) || 0}</strong> registros correctamente.`,
                    icon              : 'success',
                    confirmButtonText : 'Aceptar',
                    timer             : 3000,
                    timerProgressBar  : true,
                });
            }
        }
        catch (problema) {
            console.error('Error en la carga masiva:', problema);
            Swal.fire({
                title : '❌ No se pudo cargar el Excel',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
        finally {
            setBtnStatus(false);
            setArchivo(null);
        }
    };

    return (
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
            <Grid container justifyContent="center" alignItems="center" spacing={4}>
                <Grid item xs={12} md={10} lg={8}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            component="h2"
                            variant="h3"
                            sx={{
                                fontWeight    : 700,
                                letterSpacing : '0.05em',
                                color         : 'primary.main',
                                textTransform : 'uppercase',
                                fontSize      : { xs: 24, md: 40 },
                            }}
                        >
                            Carga masiva de chequeos
                        </Typography>
                    </Box>

                    <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, backgroundColor: 'background.default' }}>
                        <Grid container justifyContent="center" spacing={4}>
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        border       : '2px dashed',
                                        borderColor  : 'divider',
                                        borderRadius : 2,
                                        p            : 4,
                                        textAlign    : 'center',
                                        '&:hover'    : { borderColor: 'primary.main' },
                                    }}
                                >
                                    <FileUploadExcel
                                        fileName={archivo?.name ?? null}
                                        onFileSelectExcel={setArchivo}
                                        typeAccept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Formatos soportados: XLSX
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<PostAddIcon aria-hidden="true" />}
                                    onClick={() => ExportToExcel('Excel-Carga-Masiva')}
                                    sx={sxBotonCarga}
                                >
                                    Descargar Excel
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<BackupIcon aria-hidden="true" />}
                                    onClick={onCargaMasiva}
                                    disabled={btnStatus}
                                    sx={sxBotonCarga}
                                >
                                    { btnStatus ? 'Cargando…' : 'Cargar Chequeos' }
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
