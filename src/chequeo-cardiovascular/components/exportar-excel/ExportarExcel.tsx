import { useContext, useState } from 'react';
import { Button } from '@mui/material';
import TableViewIcon from '@mui/icons-material/TableView';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

import { LoginContext } from '../../../common/context';
import { UseChequeoCardiovascularService } from '../../services';
import type { IChequeo } from '../../interface';

/**
 * Exporta a Excel todos los deportistas del colegio.
 *
 * Las columnas se arman **desde la forma del primer registro**, así que un campo nuevo en el
 * backend aparece solo. El feedback va por Swal, no por `alert()` como en el original.
 */
export const ExportarExcel = () => {

    const { user } = useContext(LoginContext);
    const { user_email } = user;

    const [exportando, setExportando] = useState(false);

    const exportar = async () => {

        setExportando(true);

        try {
            const { postChequeoAll } = await UseChequeoCardiovascularService();
            const response = await postChequeoAll(user_email);

            if (!response || response.length === 0) {
                Swal.fire({
                    title : 'Sin datos para exportar',
                    text  : 'Todavía no hay deportistas registrados en este colegio.',
                    icon  : 'info',
                });
                return;
            }

            const fecha = new Date().toLocaleDateString('es-CL', {
                year : 'numeric', month : '2-digit', day : '2-digit',
            });

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Chequeos');

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
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1976D2' } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top    : { style: 'thin' },
                    left   : { style: 'thin' },
                    bottom : { style: 'thin' },
                    right  : { style: 'thin' },
                };
            });

            response.forEach((item: IChequeo) => { worksheet.addRow(item); });

            // Filas alternadas: sobre 300 deportistas, leer una fila sin bandas es un suplicio.
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber !== 1 && rowNumber % 2 === 0) {
                    row.eachCell((cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F1FA' } };
                    });
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(
                new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
                `Chequeos ${user_email} ${fecha}.xlsx`,
            );
        }
        catch (problema) {
            Swal.fire({
                title : '❌ No se pudo exportar',
                text  : problema instanceof Error ? problema.message : 'No hay respuesta del servidor.',
                icon  : 'error',
            });
        }
        finally {
            setExportando(false);
        }
    };

    return (
        <Button
            onClick={exportar}
            disabled={exportando}
            startIcon={<TableViewIcon />}
            variant="outlined"
            size="small"
            sx={{
                textTransform : 'none',
                fontWeight    : 600,
                borderRadius  : 2,
                borderColor   : '#1976d2',
                color         : '#1976d2',
                '&:hover'     : { borderColor: '#0d47a1', backgroundColor: '#e3f2fd' },
                '&:focus-visible': { outline: '3px solid #90caf9', outlineOffset: 2 },
            }}
        >
            { exportando ? 'Exportando…' : 'Exportar a Excel' }
        </Button>
    );
};
