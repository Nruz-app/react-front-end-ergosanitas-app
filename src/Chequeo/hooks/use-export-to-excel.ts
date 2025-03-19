import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
//import { ExcelDataChequeo } from "../interface/excel-data.interface";

//data: ExcelDataChequeo[]
export const ExportToExcel = async ( fileName: string) => {
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Lista Chequeos");
  
    // 2️⃣ Definir los encabezados con estilos
    const headers = ["Nombre Completo", "Rut", "Fecha Nacimiento", "Sexo","Division"];
    worksheet.addRow(headers);
  
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; 
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" }, 
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  
    // 3️⃣ Agregar datos a la hoja (No Es necesario para este Caso)
    //data.forEach((row) => { worksheet.addRow(Object.values(row)); });
  
    // 4️⃣ Autoajustar las columnas al contenido
    worksheet.columns.forEach((column) => { column.width = 25;});
  
    // 5️⃣ Crear el archivo Excel y guardarlo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${fileName}.xlsx`);     
   
};