import { useState } from "react";
import { Chequeo } from "./Chequeo";
import { ChequeoTable,FormUpload,ChequeoView } from "../components";
import { Box, Button, ButtonGroup } from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';

import { ModalProvider } from '../../common/context';

import { IChequeo, type formData } from '../interface/';
import { LikeTextProvider } from "../context";
import { UseChequeoService } from "../services/useChequeoService";
import { ElectroCardiograma } from "./ElectroCardiograma";
import { UseCertificadoService } from "../../Certificados/services/useCertificadoService";

const initial_value:formData = {
  rut    : '',
  nombre : '',
  url_pdf   : '' 
}

let initial_status = {
  status        : 0,
  rut_paciente  : '',
  url_pdf   : ''
}

const initial_view = {
    nombre                  : '',
    rut                     : '',
    fechaNacimiento         : '',
    edad                    : '',
    estatura                : '',
    peso                    : '',
    hemoglucotest           : '',
    pulso                   : '',
    presionArterial         : '',
    saturacionOxigeno       : '',
    temperatura             : '',
    imc                     : '',
    enfermedadesCronicas    : '',
    medicamentosDiarios     : '',
    sistemaOsteoarticular   : '',
    sistemaCardiovascular   : '',
    enfermedadesAnteriores  : '',
    Recuperacion            : '',
    gradoIncidenciaPosterio : '',
    user_email              : ''
}


export const AppChequeo = () => {


  const [{status,rut_paciente,url_pdf},statusSet] = useState(initial_status);

  const [formData,formDataSet] = useState(initial_value);
  const [chequeoView,setChequeoView] = useState(initial_view);


  const handleUpdateStatus = async (status : number,rut_paciente : string) => {

     const {  getCertificadoRut } = await UseCertificadoService();

     const {url_pdf}  = await getCertificadoRut(rut_paciente);
     if(url_pdf) 
      statusSet({status,rut_paciente,url_pdf});
     else
      statusSet({status,rut_paciente,url_pdf:''});
    
  } 

  const handleFormData = async(formData : formData) => {

    formDataSet(formData);

  }

  const handleViewData = async(rut_paciente : string) => {
    
    const {  getChequeoRut } = await UseChequeoService() ;
    const resChequeo:IChequeo = await getChequeoRut(rut_paciente);

    setChequeoView(resChequeo);

  }


  return (
    <ModalProvider>
      <Box 
          ml={15} 
          mt={8} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3 // más espacio entre los botones
          }}
        >
          <ButtonGroup
            orientation="vertical"
            variant="contained"
            size="large"
            sx={{
              width: '250px',
              '& .MuiButton-root': {
                fontWeight: 'bold', // Texto más llamativo
                textTransform: 'uppercase', // Texto en mayúsculas para destacar
              },
            }}
        >
          <Button
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => handleUpdateStatus(1, '')}
            sx={{
              borderRadius: '30px',
              backgroundColor: '#007bff', // Color base del botón
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#0056b3', // Color al pasar el mouse
              
              },
            }}
          >
            Grabar
          </Button>
          <Button
            color="success"
            startIcon={<SaveIcon />}
            onClick={() => handleUpdateStatus(2, '')}
            sx={{
              borderRadius: '30px',
              backgroundColor: '#28a745', // Color base del botón
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#1e7e34', // Color al pasar el mouse
              
              },
            }}
          >
            Listar
          </Button>
          </ButtonGroup>
      </Box>
        {
          (status == 1) ? 
            <Chequeo 
              rut_paciente = {rut_paciente}
              handleUpdateStatus = { handleUpdateStatus }
            />
          : (status == 3) ?
            (
              <ElectroCardiograma 
              rut_paciente = {rut_paciente}
              url_pdf = { url_pdf }
              handleUpdateStatus = { handleUpdateStatus }
            />  
          )
          : (
            <LikeTextProvider>  
              <ChequeoTable
                handleFormData = { handleFormData } 
                handleUpdateStatus = { handleUpdateStatus }
                handleViewData = { handleViewData }
              />
            </LikeTextProvider>  
          )
        }
        <FormUpload
          formData = { formData } 
        />
        <ChequeoView
          chequeoView = { chequeoView }
        />
      </ModalProvider>
      
  )
}
export default AppChequeo;