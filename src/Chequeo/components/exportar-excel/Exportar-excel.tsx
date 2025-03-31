import { Box, Link } from "@mui/material"
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IChequeo } from "../../interface";
import { useContext } from "react";
import { LoginContext } from "../../../common/context";

import columnJson from './config/column.excel.json';


interface Props {
    rowsFiles : IChequeo[]
} 


export const ExportExcel = ( {rowsFiles }: Props) => {

  const { user }  = useContext( LoginContext );
  const { user_email }  = user;
      

   const ExportToExcel = async (fileName : string) => {

    if(!rowsFiles) return;

    const currentDate = new Date().toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Lista Chequeos ${user_email} - ${currentDate}`);
    
    // 2️⃣ Definir los encabezados con estilos
    let headers:string[] = [];
    if(user_email == "Colegio") {
      headers = ["Rut", "Nombre Completo", "Fecha Nacimiento", "Sexo","Division"];
    }
    else {
       headers = columnJson;
    }
   
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
    
    if(user_email == "Colegio") {
      rowsFiles.forEach((chequeo) => {
          worksheet.addRow([
              chequeo.rut,                // Acceder directamente a cada propiedad
              chequeo.nombre,
              chequeo.fechaNacimiento,
              chequeo.sexo_paciente,
              chequeo.division_paciente
          ]);
      });
    }
    else {
      rowsFiles.forEach((chequeo) => {
        worksheet.addRow([
          chequeo.rut || '',                           // Rut
          chequeo.nombre || '',                        // Nombre Completo
          chequeo.fechaNacimiento || '',               // Fecha de Nacimiento
          chequeo.edad || '',                          // Edad
          chequeo.estatura || '',                      // Estatura
          chequeo.peso || '',                          // Peso
          chequeo.hemoglucotest || '',                 // Hemoglucotest
          chequeo.pulso || '',                         // Pulso
          chequeo.presionArterial || '',               // Presión Arterial
          chequeo.presion_sistolica || '',             // Presión Sistólica
          chequeo.saturacionOxigeno || '',             // Saturación de Oxígeno
          chequeo.temperatura || '',                   // Temperatura
          chequeo.enfermedadesCronicas || '',          // Enfermedades Crónicas
          chequeo.medicamentosDiarios || '',           // Medicamentos Diarios
          chequeo.sistemaOsteoarticular || '',         // Sistema Osteoarticular
          chequeo.sistemaCardiovascular || '',         // Sistema Cardiovascular
          chequeo.enfermedadesAnteriores || '',        // Enfermedades Anteriores
          chequeo.Recuperacion || '',                  // Recuperación
          chequeo.gradoIncidenciaPosterio || '',       // Grado de Incidencia Posterior
          chequeo.user_email || '',                    // Correo Electrónico
          chequeo.sexo_paciente || '',                 // Sexo del Paciente
          chequeo.imc_paciente || '',                  // IMC del Paciente
          chequeo.status || '',                        // Estado del Paciente
          chequeo.division_paciente || '',             // División del Paciente
          chequeo.medio_pago_paciente || '',           // Medio de Pago del Paciente
          chequeo.estado_paciente || '',               // Estado del Paciente
          chequeo.frecuencia_cardiaca_paciente || '',  // Frecuencia Cardiaca del Paciente
          chequeo.derivacion_paciente || '',           // Derivación del Paciente
          chequeo.observacion_paciente || '',          // Observaciones del Paciente
          chequeo.fecha_atencion || '',                // Fecha de Atención
          chequeo.created_at || ''                     // Fecha de Creación
        ]);
      });
      
    }
    
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
