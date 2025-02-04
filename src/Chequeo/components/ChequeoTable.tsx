import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { IColumnsTable } from "../../common/table/interface/table.interface";
import { UseChequeoService } from "../services/useChequeoService";
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";

import { IChequeo } from '../interface';
import { DownloadPDF,LikeTextCheque } from "./";

import { LoginContext, ModalContext } from '../../common/context';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';


import { type formData } from '../interface/';

let rows:IChequeo[] = [];

interface Props {
  handleFormData : (formData : formData) => void;
  handleUpdateStatus : (status : number, rut_paciente : string) => void;
  handleViewData : (rut : string) => void;
}

export const ChequeoTable = (  {
  handleFormData,
  handleUpdateStatus,
  handleViewData
} : Props ) => {


   const { user }  = useContext( LoginContext );
   const { user_email,user_perfil }  = user;

   const { onOpenModal,onOpenModalView }  = useContext( ModalContext );


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

    const handleOpenModal = (rut: string, nombre : string) => {

      const formData:formData = { rut, nombre };

      handleFormData(formData);

      onOpenModal(true);
    }

    const handleOpenModalView = (rut: string) => {

      handleViewData(rut);
      onOpenModalView(true);

    }

    
    const columnsTable: IColumnsTable[] = useMemo(
        () => 
        [
          {
            id: 1,
            displayName: "Nombres",
            column: "nombre",
            isFilterable: true,
          },
          {
            id: 2,
            displayName: "Rut",
            column: "rut",
            isFilterable: true,
          },
          {
            id: 3,
            displayName: "Edad",
            column: "edad",
            isFilterable: true,
          }
        ],
        []
    ); 

    const handleClickDowload = async (rut: string) => {

      const {  chequeoPDF } = await UseChequeoService() ;
      await chequeoPDF(rut);
          
    }

    const handleUpdatePaciente = async(rut_paciente : string) => {

      handleUpdateStatus(1,rut_paciente)

    }
    const handleUpdatePacienteH = async(rut_paciente : string) => {

      handleUpdateStatus(3,rut_paciente)

    }

    const handleDeletePaciente = async(rut_paciente : string) => {

      const  { getDeleteRut } = await UseChequeoService();

      await getDeleteRut(rut_paciente);

      fetchAgendaHoras();

    }


    const fetchAgendaHoras = useCallback(async (): Promise<void> => {

        const {  getChequeo,postChequeoUser } = await UseChequeoService() ;

        let response;
        
        if(user_perfil == "Administrador")
            response = await getChequeo();  
        else
            response = await postChequeoUser(user_email);  
    
        setRowTable([]);
        setStatusTable(false);
        
        const rows = [...response];

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
                animation: 'fadeOutRight 1s ease-out' 
            }}
            >
              Listado de Chequeos
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

          <LikeTextCheque
            setRowTable = { setRowTable }
          />  

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
                  <TableCell colSpan = {3}  key={99} > Accion </TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {
      
                (statusTable) &&
      
                  rowTable.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
      
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                            <TableCell >{row.nombre}</TableCell>
                            <TableCell >{row.rut}</TableCell>
                            <TableCell >{row.edad}</TableCell>
                            <TableCell >
                            {
                              (user_perfil == "Administrador") ? (
                                <>
                                  <DownloadPDF
                                      handleClickDowload={handleClickDowload}
                                      rut={row.rut}
                                      title= {'Descargar PDF - '+row.rut }
                                    />
                                  <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    onClick={() => handleOpenModal(row.rut, row.nombre)}
                                    title= {'Subir Examen - '+row.rut }
                                  >
                                    <CloudUploadIcon />
                                  </Button> 
                                  <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    //href={`/${row.rut}`}
                                    onClick={ () => handleUpdatePaciente(row.rut)}
                                    title= {'Editar Paciente - '+row.rut }
                                  >
                                    <EditIcon />
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    onClick={() => handleOpenModalView(row.rut)}
                                    title= {'Subir Examen - '+row.rut }
                                  >
                                    <VisibilityIcon />
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    onClick={() => handleUpdatePacienteH(row.rut)}
                                    title= {'Aprobar Certificado  - '+row.rut }
                                  >
                                    <FavoriteIcon />
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    style={{ color: "error", borderColor: "error" }}
                                    title= {'Borrar - '+ row.rut }
                                    onClick={() => handleDeletePaciente(row.rut)}
                                  >
                                    <DeleteIcon />
                                  </Button> 
                                </>
                              )
                              : ( <>-</> )
                            }
                            </TableCell>
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