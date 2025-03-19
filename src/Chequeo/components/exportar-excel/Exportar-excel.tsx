import { Box, Link } from "@mui/material"
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IChequeo } from "../../interface";


interface Props {
    rowsFiles : IChequeo[]
} 


export const ExportExcel = ( {rowsFiles }: Props) => {

   const ExportToExcel = async (fileName : string) => {

    if(!rowsFiles) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Lista Chequeos");
    
    // 2️⃣ Definir los encabezados con estilos
    const headers = ["Rut", "Nombre Completo", "Fecha Nacimiento", "Sexo","Division"];
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
    
    rowsFiles.forEach((chequeo) => {
        worksheet.addRow([
            chequeo.rut,                // Acceder directamente a cada propiedad
            chequeo.nombre,
            chequeo.fechaNacimiento,
            chequeo.sexo_paciente,
            chequeo.division_paciente
        ]);
    });
    
    // 4️⃣ Autoajustar las columnas al contenido
    worksheet.columns.forEach((column) => { column.width = 25;});
    
    // 5️⃣ Crear el archivo Excel y guardarlo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${fileName}.xlsx`);

   } 


  return (
    <Box
        sx={{
            mx: "auto",
            mt: 2,
            display: "flex",
            justifyContent: "center", // Centra el contenido
            alignItems: "center", // Centra el contenido verticalmente
        }}
    >
  <Link
    component="button"
    variant="body2"
    onClick={() => ExportToExcel('Lista de Deportistas')}
    sx={{
      textDecoration: "none", // Elimina el subrayado
      fontWeight: "bold", // Fuente en negrita
      fontSize: "16px", // Tamaño de fuente más grande
      padding: "10px 20px", // Añade un poco de espacio alrededor del texto
      borderRadius: "20px", // Bordes redondeados
      "&:hover": {
        backgroundColor: "primary.light", // Color de fondo cuando el mouse pasa por encima
        color: "white", // Cambia el color del texto a blanco
        transform: "scale(1.05)", // Efecto de expansión al pasar el mouse
      },
      "&:active": {
        transform: "scale(0.98)", // Efecto cuando el enlace es presionado
      },
    }}
  >
    Exportar Información
  </Link>
</Box>
  )
}
