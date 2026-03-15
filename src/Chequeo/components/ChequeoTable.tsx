import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { IColumnsTable } from "../../common/table/interface/table.interface";
import { UseChequeoService } from "../services/useChequeoService";
import { Box, Button,Table, TableBody, TableCell, TableContainer, Paper,TableHead, TablePagination, TableRow  } from "@mui/material";
//import Swal from 'sweetalert2';
import { IChequeo } from '../interface';
import { DownloadPDF, LoadingTable } from "./";

import { LoginContext, ModalContext } from '../../common/context';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import { useNavigate } from "react-router-dom";
import { type formData } from '../interface/';

import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { FilterTable } from "./filters/FilterTable";
import { ExportExcel } from "./exportar-excel/Exportar-excel";
import { LikeTextContext } from "../context";

const rows:IChequeo[] = [];

interface Props {
  handleFormData : (formData : formData) => void;
  handleUpdateStatus : (status : number, rut_paciente : string, id_paciente : number) => void;
  handleViewData : (id_paciente : number) => void;
}

export const ChequeoTable = ({
  handleFormData,
  handleUpdateStatus,
  handleViewData
}: Props ) => {

  const navigate = useNavigate();

  const { ...likeTextContext }  = useContext( LikeTextContext );
  const { user }  = useContext( LoginContext );
  const { user_email,user_perfil }  = user;

  const { onOpenModal,onOpenModalView }  = useContext( ModalContext );

  // 🔹 permisos
  const isAdmin = user_perfil === "Administrador";
  const isMedico = user_perfil === "Medicos";
  const isColegio = user_perfil === "Colegios";
  const isUsuario = user_perfil === "Usuario";

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [rowTable,setRowTable] = useState(rows);
  const [statusTable,setStatusTable] = useState(false);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

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
      { id: 1, displayName: "Nombres", column: "nombre", isFilterable: true },
      { id: 2, displayName: "Rut", column: "rut", isFilterable: true },
      { id: 3, displayName: "Edad", column: "edad", isFilterable: true },
      { id: 4, displayName: "Estado", column: "estado_paciente", isFilterable: true }
    ],
    []
  ); 

  const handleClickDowload = async (id_paciente: number) => {
    const { chequeoPDF } = await UseChequeoService() ;
    await chequeoPDF(id_paciente);
  }

  const handleClickDowloadECG = async (rut: string, id_paciente: number) => {

    const { pathUrlCertificado } = await UseChequeoService();
    const response = await pathUrlCertificado(rut, id_paciente);

    if (!response || response.status !== 200 || !response.url_pdf) {
      alert("No se encontró el certificado");
      return;
    }

    const link = document.createElement('a');
    link.href = response.url_pdf;
    link.download = `ECG_${response.titulo}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleUpdatePaciente = async(rut_paciente : string,id_paciente : number) => {
    handleUpdateStatus(1,rut_paciente,id_paciente)
  }

  const handleUpdatePacienteH = async(rut_paciente : string,id_paciente : number) => {
    handleUpdateStatus(3,rut_paciente,id_paciente)
  }

  const handRedictCertificado  = async (rut_paciente : string,id_paciente : number) => {
    navigate(`/certificado/${rut_paciente}/${id_paciente}`);
  } 

  const capitalizeWords = (text : string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const fetchAgendaHoras = useCallback(
    async (pageNumber = 1, limit = 10): Promise<void> => {
      try {
        setStatusTable(false);
        const { postChequeoSearch } = await UseChequeoService(); 

        const response = await postChequeoSearch(likeTextContext, user_email, limit, pageNumber);
        console.log(response.data);
        setRowTable(response.data); 
        setTotal(response.total);

      } catch (error) {
        console.error("Error al cargar chequeos:", error);
      } finally {
        setStatusTable(true);
      }
    },
    [likeTextContext, user_email]
  )

  useEffect(() => {
    fetchAgendaHoras(page + 1, rowsPerPage);
  }, [page, rowsPerPage, likeTextContext.fechaCalendar,
    likeTextContext.textoValue, likeTextContext.selectClub]);

  return (
    <Box sx={{ flexGrow: 1 }} >
     
      <FilterTable />
      <ExportExcel />

      <Box sx={{  padding: 2, marginBottom: 1 }}>   
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3,  margin: "auto" }}>
          <Table stickyHeader aria-label="sticky table">

          <TableHead>
          <TableRow >
            {columnsTable.map((column) => (
              <TableCell 
                key={column.id} 
                sx={{ 
                  color: "white",
                  bgcolor: "#1976d2", 
                  fontFamily: "'UnifrakturMaguntia', serif",
                  fontSize: "20px"
                }}> 
                { column.displayName } 
              </TableCell>
            ))}

            {!isColegio && (
              <>
              <TableCell sx={{color:"white",bgcolor:"#1976d2",fontSize:"20px"}}>
                { isAdmin ? 'Fech Aten' : 'Fech Crea'}
              </TableCell>
              {!isMedico && (
                <TableCell sx={{ color: "white", bgcolor: "#1976d2", fontSize: "20px" }}>
                  User
                </TableCell>
              )}
              
              </>
            )}

            <TableCell colSpan={6} sx={{color:"white",bgcolor:"#1976d2",fontSize:"20px"}}>
              Accion
            </TableCell>

          </TableRow>
          </TableHead>

          <TableBody>

          {!statusTable && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <LoadingTable />
              </TableCell>
            </TableRow>
          )}

          {statusTable && rowTable.map((row, index) => (

            <TableRow key={index}>

              <TableCell>{ capitalizeWords(row.nombre) }</TableCell>
              <TableCell>{row.rut}</TableCell>
              <TableCell>{row.edad}</TableCell>
              <TableCell>{row.estado_paciente}</TableCell>

              {!isColegio && (
                <>
                  {/* Fecha */}
                  <TableCell>
                    {(isAdmin || isMedico) 
                      ? (row.fecha_atencion ?? row.created_at)
                      : row.created_at}
                  </TableCell>

                  {!isMedico && (
                    <TableCell>{row.user_email.split('@')[0]}</TableCell>
                  )}
                </>
              )}

              <TableCell>

              {/* VISUALIZAR */}
              {(isAdmin || isMedico || isColegio) && (
                <Button onClick={() => handleOpenModalView(row.id!)}>
                  <VisibilityIcon style={{backgroundColor:'green',color:'white',borderRadius:'50%'}}/>
                </Button>
              )}

              {/* EDITAR */}
              {(isAdmin || (!isColegio && row.status === 'ingresado')) && (
                <Button onClick={() => handleUpdatePaciente(row.rut,row.id!)}>
                  <EditIcon style={{backgroundColor:'green',color:'white',borderRadius:'50%'}}/>
                </Button>
              )}

              {/* ECG FOTO */}
              {isAdmin && (
                <Button onClick={() => handRedictCertificado(row.rut,row.id!)}>
                  <MonitorHeartIcon style={{backgroundColor:'green',color:'white',borderRadius:'50%'}}/>
                </Button>
              )}

              {/* REVISION MEDICA */}
              {(isAdmin || isMedico) && (
                <Button onClick={() => handleUpdatePacienteH(row.rut,row.id!)}>
                  <FavoriteIcon style={{backgroundColor:'green',color:'white',borderRadius:'50%'}}/>
                </Button>
              )}

              {/* PDF */}
              {!isUsuario && !isMedico && (
                <>
                  <DownloadPDF
                    handleClickDowload={handleClickDowload}
                    id_paciente={row.id!}
                    title={'Descargar PDF - '+row.rut }
                  />

                  <Button onClick={() => handleClickDowloadECG(row.rut,row.id!)}>
                    <AssignmentTurnedInIcon style={{backgroundColor:'blue',color:'white',borderRadius:'50%'}}/>
                  </Button>
                </>
              )}

              {/* ADMIN EXTRA */}
              {isAdmin && (
                <>
                  <Button onClick={() => handleOpenModal(row.rut, row.nombre)}>
                    <CloudUploadIcon style={{backgroundColor:'blue',color:'white',borderRadius:'50%'}}/>
                  </Button>
                  <Button>
                    <DeleteIcon style={{backgroundColor:'red',color:'white',borderRadius:'50%'}}/>
                  </Button>
                </>
              )}

              </TableCell>

            </TableRow>

          ))}

          </TableBody>
          </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        rowsPerPage={Number(rowsPerPage)}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[20]}
      />

      </Box>  
    </Box>
  )
}