import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Genera la plantilla de carga en Excel: solo los encabezados, sin filas.
 * El colegio la descarga, la rellena y la vuelve a subir por la carga masiva.
 */
export const ExportToExcel = async (fileName: string) => {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista Chequeos');

    const headers = ['Nombre Completo', 'Rut', 'Fecha Nacimiento', 'Sexo', 'Division'];
    worksheet.addRow(headers);

    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type    : 'pattern',
            pattern : 'solid',
            fgColor : { argb: '4F81BD' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    worksheet.columns.forEach((column) => { column.width = 25; });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `${fileName}.xlsx`,
    );
};
