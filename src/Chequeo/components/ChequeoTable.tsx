import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { IColumnsTable } from "../../common/table/interface/table.interface";
import { UseChequeoService } from "../services/useChequeoService";
import { Box, Button,Table, TableBody, TableCell, TableContainer, Paper,TableHead, TablePagination, TableRow  } from "@mui/material";

import { IChequeo } from '../interface';
import { DownloadPDF } from "./";

import { LoginContext, ModalContext } from '../../common/context';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { useNavigate } from "react-router-dom";
import { type formData } from '../interface/';

import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { FilterTable } from "./filters/FilterTable";
import { ExportExcel } from "./exportar-excel/Exportar-excel";


const rows:IChequeo[] = [];

interface Props {
  handleFormData : (formData : formData) => void;
  handleUpdateStatus : (status : number, rut_paciente : string, id_paciente : number) => void;
  handleViewData : (id_paciente : number) => void;
}

export const ChequeoTable = (  {
  handleFormData,
  handleUpdateStatus,
  handleViewData
} : Props ) => {


   const navigate = useNavigate();

   const { user }  = useContext( LoginContext );
   const { user_email,user_perfil }  = user;

   const { onOpenModal,onOpenModalView }  = useContext( ModalContext );


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [rowTable,setRowTable] = useState(rows);
    const [statusTable,setStatusTable] = useState(false);
    
    
    const handleChangePage = (event:  React.MouseEvent<HTMLButtonElement>| null, newPage: number) => {
        event?.preventDefault();
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

    const handleOpenModalView = (id_paciente: number) => {

      handleViewData(id_paciente);
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

    const handleClickDowload = async (id_paciente: number) => {

      const {  chequeoPDF } = await UseChequeoService() ;
      await chequeoPDF(id_paciente);
          
    }

    const handleUpdatePaciente = async(rut_paciente : string,id_paciente : number) => {

      handleUpdateStatus(1,rut_paciente,id_paciente)

    }
    const handleUpdatePacienteH = async(rut_paciente : string,id_paciente : number) => {

      handleUpdateStatus(3,rut_paciente,id_paciente)

    }

    /*const handleDeletePaciente = async(rut_paciente : string) => {

      const  { getDeleteRut } = await UseChequeoService();

      await getDeleteRut(rut_paciente);

      fetchAgendaHoras();

    }*/
    const handleDeletePaciente = async(id : number) => {

      const  { getDeleteById } = await UseChequeoService();

      await getDeleteById(id);

      fetchAgendaHoras();

    }

    const handRedictCertificado  = async (rut_paciente : string,id_paciente : number) => {
      navigate(`/certificado/${rut_paciente}/${id_paciente}`);
    } 

    const capitalizeWords = (text : string) => {
      // Convierte todo el texto a minúsculas y luego capitaliza la primera letra de cada palabra
      return text
        .toLowerCase() // Convierte todo a minúsculas
        .split(' ')    // Divide el texto en palabras
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitaliza la primera letra de cada palabra
        .join(' ');    // Junta las palabras nuevamente con espacios
    };

    const fetchAgendaHoras = useCallback(async (): Promise<void> => {

        const {  getChequeo,postChequeoUser } = await UseChequeoService() ;

        let response;
        
        if(user_perfil != "Colegios")
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
        <Box sx={{ flexGrow: 1 }} >
         
          <FilterTable
              setRowTable = { setRowTable }
          />

          <ExportExcel rowsFiles = { rowTable } />

          <Box sx={{  padding: 2, marginBottom: 1 }}>   
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3,  margin: "auto" }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                <TableRow >
                  {
                    columnsTable.map((column) => (
                                  
                      <TableCell 
                        key={column.id} 
                        sx={{ 
                          color: "white",
                          bgcolor: "#1976d2", 
                          fontFamily: "'UnifrakturMaguntia', serif", // Fuente gótica
                          fontSize: "20px", // Tamaño más grande 
                        }}> 
                        { column.displayName } 
                      </TableCell>
                    ))
                  }
                  {
                    (user_perfil != "Colegios") && (
                      <TableCell 
                        key={99} 
                        sx={{ 
                          color: "white",
                          bgcolor: "#1976d2", 
                          fontFamily: "'UnifrakturMaguntia', serif", // Fuente gótica
                          fontSize: "20px", // Tamaño más grande 
                        }}> 
                        User 
                      </TableCell>
                    )
                  }
                  <TableCell 
                    colSpan = {6}  
                    key={999}
                    sx={{ 
                      color: "white",
                      bgcolor: "#1976d2", 
                      fontFamily: "'UnifrakturMaguntia', serif", // Fuente gótica
                      fontSize: "20px", // Tamaño más grande
                    }} 
                  > 
                    Accion 
                  </TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {
      
                (statusTable) &&
      
                  rowTable.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
      
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                            <TableCell >{ capitalizeWords(row.nombre) }</TableCell>
                            <TableCell >{row.rut}</TableCell>
                            <TableCell >{row.edad}</TableCell>
                            {
                              (user_perfil != "Colegios") && (
                                <TableCell>{row.user_email.split('@')[0]}</TableCell>
                              )
                            }
                            <TableCell >
                            {
                              <Button
                                variant="outlined"
                                style={{ color: "primary", borderColor: "primary" }}
                                onClick={() => handleOpenModalView(row.id!)}
                                title= {'Visualizar Paciente - '+row.rut }
                              >
                                <VisibilityIcon
                                  style={{ 
                                    backgroundColor: 'green',
                                    color: 'white',  // Puedes ajustar el color del ícono también
                                    borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                                  }} 
                                />
                              </Button>
                            }
                            {
                              (user_perfil != "Colegios") ? (

                                <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    //href={`/${row.rut}`}
                                    onClick={ () => handleUpdatePaciente(row.rut,row.id!)}
                                    title= {'Editar Paciente - '+row.rut }
                                  >
                                    <EditIcon 
                                      style={{ 
                                        backgroundColor: row.status !== 'ingresado' ? 'green' : 'red',
                                        color: 'white',  // Puedes ajustar el color del ícono también
                                        borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                                      }} />
                                  </Button>
                              ) : (row.status === 'ingresado') && (
                                  <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    //href={`/${row.rut}`}
                                    onClick={ () => handleUpdatePaciente(row.rut,row.id!)}
                                    title= {'Editar Paciente - '+row.rut }
                                  >
                                    <EditIcon 
                                      style={{ 
                                        backgroundColor: row.status !== 'ingresado' ? 'green' : 'red',
                                        color: 'white',  // Puedes ajustar el color del ícono también
                                        borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                                      }} />
                                </Button>
                              )
                            }
                            {
                               (user_perfil == "Administrador") && (
                                <>
                                  <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    title={`ECG FOTO - ${row.rut}`}
                                    onClick={() => handRedictCertificado(row.rut,row.id!)}
                                  >
                                    <MonitorHeartIcon
                                      style={{ 
                                        backgroundColor: 
                                        row.status === 'ECG FOTO' || row.status === 'REVISION MEDICA' 
                                        ? 'green' : 'red', 
                                        color: 'white',  // Puedes ajustar el color del ícono también
                                        borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                                      }} 
                                    />
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    onClick={() => handleUpdatePacienteH(row.rut,row.id!)}
                                    title= {'Revision Medica - '+row.rut }
                                  >
                                    <FavoriteIcon
                                      style={{ 
                                        backgroundColor: row.status == 'REVISION MEDICA' ? 'green' : 'red',
                                        color: 'white',  // Puedes ajustar el color del ícono también
                                        borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                                      }} 
                                    />
                                  </Button> 
                                </>
                                )
                              }
                              {
                                 (user_perfil != "Usuario") && (
                                    <DownloadPDF
                                      handleClickDowload={handleClickDowload}
                                      id_paciente={row.id!}
                                      title= {'Descargar PDF - '+row.rut }
                                    />
                                 )
                              }
                              {
                                (user_perfil == "Administrador") && (
                                  <>
                                  <Button
                                    variant="outlined"
                                    style={{ color: "error", borderColor: "error" }}
                                    title= {'Borrar - '+ row.rut }
                                    onClick={() => handleDeletePaciente(row.id!)}
                                  >
                                    <DeleteIcon
                                      style={{ 
                                        backgroundColor: 'blue',
                                        color: 'white',  // Puedes ajustar el color del ícono también
                                        borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                                      }} 
                                    />
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    style={{ color: "primary", borderColor: "primary" }}
                                    onClick={() => handleOpenModal(row.rut, row.nombre)}
                                    title= {'Subir Examen - '+row.rut }
                                  >
                                    <CloudUploadIcon 
                                      style={{ 
                                        backgroundColor: 'blue',
                                        color: 'white',  // Puedes ajustar el color del ícono también
                                        borderRadius: '50%' // Esto hace que el fondo sea circular (opcional)
                                      }}/>
                                  </Button>
                                </>
                               )
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
        </Box>
      )
}