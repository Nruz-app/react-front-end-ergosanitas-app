import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material"
import { useCallback, useEffect, useMemo, useState } from "react";
import { IColumnsTable } from "../../common/table/interface/table.interface";

import { IAgendaHoras } from "../interface";
import { UseAgendaHoraService } from "../services/useAgendaHoraService";


let rows:IAgendaHoras[] = [];


export const AgendarHoraTable = ( ) => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [rowTable,setRowTable] = useState(rows);
    const [statusTable,setStatusTable] = useState(false);
    
    
    const handleChangePage = (event: any, newPage: number) => {
        event.preventDefault();
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    

    const columnsTable: IColumnsTable[] = useMemo(
        () => 
        [
          {
            id: 1,
            displayName: "Nombres",
            column: "nombre_paciente",
            isFilterable: true,
          },
          {
            id: 2,
            displayName: "Rut",
            column: "rut_paciente",
            isFilterable: true,
          },
          {
            id: 3,
            displayName: "Edad",
            column: "edad_paciente",
            isFilterable: true,
          },
          {
            id: 4,
            displayName: "Direccion",
            column: "direccion_paciente",
            isFilterable: true,
          },
          {
            id: 5,
            displayName: "Email",
            column: "email_paciente",
            isFilterable: true,
          },
          {
            id: 6,
            displayName: "Pagado",
            column: "pagado_paciente",
            isFilterable: true,
          }
        ],
        []
    ); 

    const fetchAgendaHoras = useCallback(async (): Promise<void> => {

      const {  getAgendaHora } = await UseAgendaHoraService() ;
  
      const response = await getAgendaHora();
      

      rows = [];
      response.map ( (res) => {
               rows.push(res);
      } );
      setRowTable(rows);
      setStatusTable(true);
    
    }, [setStatusTable]);
  
  
    useEffect(() => {
      fetchAgendaHoras();
    }, [setStatusTable]);
    
  return (


    <Box ml={ 15 } mt={ 8 } sx={{ flexGrow: 1 }} >
    <Typography
        variant="h4"
        align="center"
        sx={{
            fontFamily: 'cursive',
            fontWeight: 'bold',
            letterSpacing: '0.1rem',
            textTransform: 'uppercase',
            color: 'primary.main',
            mb: 3,
            animation: 'fadeInDownBig 1s ease-out' 
        }}
        >
          Listado de Reservas
    </Typography>
  
    <Paper sx={{ 
      mt: 4,
      ml:4,
      mr:4,
      width: '90%', 
      overflow: 'hidden', 
      boxShadow: 3, // Sombra suave para darle profundidad
      borderRadius: 2, // Bordes redondeados
    }} >
    <Box sx={{  padding: 4, marginBottom: 1 }}>   
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
            {
              columnsTable.map((column) => (
                            
                <TableCell key={column.id} > { column.displayName } </TableCell>
              ))
            }
            </TableRow>
        </TableHead>
        <TableBody>
        {

          (statusTable) &&

            rowTable.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {

                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      <TableCell >{row.nombre_paciente}</TableCell>
                      <TableCell >{row.rut_paciente}</TableCell>
                      <TableCell >{row.edad_paciente}</TableCell>
                      <TableCell >{row.direccion_paciente}</TableCell>
                      <TableCell >{row.email_paciente}</TableCell>
                      <TableCell >{row.pagado_paciente}</TableCell>
                  </TableRow>
                )

              })
        }
        </TableBody>
        </Table>      
      </TableContainer>
      <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rowTable.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>  
    </Paper>
    </Box>  
  )
}
