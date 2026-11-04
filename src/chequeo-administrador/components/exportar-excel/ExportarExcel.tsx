import { useContext, useState } from 'react';
import { Box, Link } from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

import { LoginContext } from '../../../common/context';
import { sxFocoVisible } from '../../config/tema';
import type { IChequeo } from '../../interface';
import { UseChequeoAdministradorService } from '../../services';

/**
 * «Exportar Información»: todo lo que `chequeo-all` devuelve para el `user_email` del
 * Administrador, en un Excel con una columna por campo del primer registro.
 *
 * ⚠️ Para el Administrador eso es **la base completa en una sola respuesta** (hallazgo de la
 * spec). Se conserva el comportamiento; paginarlo va en otra spec.
 *
 * Los dos `alert()` nativos del original pasan a Swal (§6.2). Los `argb` son formato de celda
 * de ExcelJS, no color de pantalla, y por eso no están en `tema.ts`.
 */
export const ExportarExcel = () => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [exportando, setExportando] = useState(false);

    const exportar = async () => {

        setExportando(true);

        try {
            const { postChequeoAll } = await UseChequeoAdministradorService();
            const response = await postChequeoAll(user_email);

            if (!response || response.length === 0) {
                Swal.fire({ title: 'Sin datos', text: '⚠️ No hay datos disponibles para exportar.', icon: 'info' });
                return;
            }

            const fecha = new Date().toLocaleString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' });

            const workbook = new ExcelJS.Workbook();
            // Excel no admite «/» en el nombre de una hoja; `es-CL` formatea con guiones.
            const worksheet = workbook.addWorksheet(`Chequeos Deportivos - ${fecha}`);

            worksheet.columns = Object.keys(response[0])
                .filter((key) => key !== 'id')
                .map((key) => ({
                    header : key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                    key,
                    width  : 25,
                }));

            const headerRow = worksheet.getRow(1);
            headerRow.height = 25;
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top    : { style: 'thin' },
                    left   : { style: 'thin' },
                    bottom : { style: 'thin' },
                    right  : { style: 'thin' },
                };
            });

            response.forEach((item: IChequeo) => { worksheet.addRow(item); });

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber !== 1 && rowNumber % 2 === 0) {
                    row.eachCell((cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F1FA' } };
                    });
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(
                new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
                `Listado de Chequeos Realizados - ${user_email} - ${fecha}.xlsx`,
            );
        }
        catch (problema) {
            console.error('Error al exportar los datos del chequeo:', problema);
            Swal.fire({
                title : '❌ No se pudo exportar',
                text  : problema instanceof Error ? problema.message : 'Ocurrió un error al exportar los datos.',
                icon  : 'error',
            });
        }
        finally {
            setExportando(false);
        }
    };

    return (
        <Box sx={{ mx: 'auto', mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link
                component="button"
                variant="body2"
                onClick={exportar}
                disabled={exportando}
                sx={{
                    textDecoration : 'none',
                    fontWeight     : 'bold',
                    fontSize       : '16px',
                    padding        : '10px 20px',
                    borderRadius   : '20px',
                    '&:hover'      : { backgroundColor: 'primary.light', color: 'common.white' },
                    ...sxFocoVisible,
                }}
            >
                { exportando ? 'Exportando…' : 'Exportar Información' }
            </Link>
        </Box>
    );
};
