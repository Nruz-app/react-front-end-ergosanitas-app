import { Box, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';

import type { IChequeo } from '../interface';
import { capitalizarPalabras, esReciente, getEstadoProps } from '../utilities';
import { DownloadPDF } from './DownloadPDF';

interface Props {
    row                 : IChequeo;
    handleVer           : (id_paciente: number) => void;
    handleDescargarPDF  : (id_paciente: number) => void;
    handleDescargarECG  : (rut: string, id_paciente: number) => void;
}

/**
 * La fila de la lista pintada como tarjeta, para pantallas bajo 900 px.
 *
 * Los datos se cargan en cancha, desde el teléfono: una tabla de 4 columnas con 3 botones no
 * cabe en 375 px sin scroll horizontal, y el criterio de aceptación lo prohíbe explícitamente.
 */
export const ChequeoTarjeta = ({ row, handleVer, handleDescargarPDF, handleDescargarECG }: Props) => {

    const reciente = esReciente(row.created_at, row.estado_paciente);

    return (
        <Paper
            elevation={0}
            sx={{
                p            : 2,
                mb           : 1.5,
                borderRadius : 2,
                border       : '1px solid #e0e0e0',
                // El «reciente» se marca con una barra lateral, no con fondo rojo pleno:
                // el rojo completo dejaba el texto ilegible.
                borderLeft   : reciente ? '5px solid #d32f2f' : '5px solid transparent',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0d47a1', wordBreak: 'break-word' }}>
                        { capitalizarPalabras(row.nombre) }
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.3 }}>
                        { row.rut } · { row.edad ? `${row.edad} años` : 'edad —' }
                    </Typography>
                </Box>

                <Chip
                    {...getEstadoProps(row.estado_paciente ?? '')}
                    size="small"
                    sx={{ fontWeight: 500, flexShrink: 0 }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
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
        </Paper>
    );
};
