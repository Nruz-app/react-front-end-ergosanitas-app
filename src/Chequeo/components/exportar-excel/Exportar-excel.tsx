import { Box, Link } from "@mui/material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useContext } from "react";
import { LoginContext } from "../../../common/context";
import { UseChequeoService } from "../../services/useChequeoService"; 

export const ExportExcel = () => {
  const { user } = useContext(LoginContext);
  const { user_email } = user;

  const ExportToExcel = async (fileName: string) => {
    try {
      const { postChequeoAll } = await UseChequeoService();
      const response = await postChequeoAll(user_email); 

      if (!response || response.length === 0) {
        alert("⚠️ No hay datos disponibles para exportar.");
        return;
      }

      // Crear libro y hoja Excel
      const currentDate = new Date().toLocaleString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Chqueos Deportivos - ${currentDate}`);

      // Crear encabezados dinámicos desde el response
      const sample = response[0];
      const dynamicColumns = Object.keys(sample)
      .filter((key) => key !== "id") 
      .map((key) => ({
        header: key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        key,
        width: 25,
      }));

      worksheet.columns = dynamicColumns;

      //Estilos de encabezado
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4F81BD" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // 🔹 Agregar datos desde la API
      response.forEach((item: any) => {
        worksheet.addRow(item);
      });

      // 🔹 Colorear filas alternadas
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber !== 1 && rowNumber % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "E8F1FA" },
            };
          });
        }
      });

      // 🔹 Generar archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${fileName} ${currentDate}.xlsx`
      );
    } catch (error) {
      console.error("❌ Error al exportar los datos del chequeo:", error);
      alert("Ocurrió un error al exportar los datos. Revisa la consola.");
    }
  };

  return (
    <Box
      sx={{
        mx: "auto",
        mt: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link
        component="button"
        variant="body2"
        onClick={() => ExportToExcel(`Listado de Chequeos Realizados - ${user_email} -`)}
        sx={{
          textDecoration: "none",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "10px 20px",
          borderRadius: "20px",
          "&:hover": {
            backgroundColor: "primary.light",
            color: "white",
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        }}
      >
        Exportar Información
      </Link>
    </Box>
  );
}
