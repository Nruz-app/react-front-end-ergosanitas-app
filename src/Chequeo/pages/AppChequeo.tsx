import { Box, Tab, Tabs } from "@mui/material";

//import SaveIcon from '@mui/icons-material/Save';

import { ModalProvider } from '../../common/context';
import { TabPanel } from "../components/tabs/TabPanel";
import React, { useState } from "react";

import { Chequeo } from "./Chequeo";
import { ChequeoTable,FormUpload,ChequeoView } from "../components";
import { IChequeo, type formData } from '../interface/';

import { LikeTextProvider } from "../context";
import { UseChequeoService } from "../services/useChequeoService";

import { ElectroCardiograma } from "./ElectroCardiograma";

let initial_status = {
  status        : 0,
  rut_paciente  : '',
  url_pdf   : ''
}

const initial_value:formData = {
  rut    : '',
  nombre : '',
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
  presion_sistolica       : '',
  saturacionOxigeno       : '',
  temperatura             : '',
  enfermedadesCronicas    : '',
  medicamentosDiarios     : '',
  sistemaOsteoarticular   : '',
  sistemaCardiovascular   : '',
  enfermedadesAnteriores  : '',
  Recuperacion            : '',
  gradoIncidenciaPosterio : '',
  user_email              : '',
  sexo_paciente           : '',
  imc_paciente            : '',
}


import { UseCertificadoService } from "../../Certificados/services/useCertificadoService";

export const AppChequeo = () => {

  const [value, setValue] = React.useState(0);

  const [{status,rut_paciente,url_pdf},statusSet] = useState(initial_status);
  const [formData,formDataSet] = useState(initial_value);

  

  const [chequeoView,setChequeoView] = useState(initial_view);


  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    setValue(newValue);

    statusSet(
      {status : newValue,
      rut_paciente : '',
      url_pdf : ''
    });


  };

  const handleUpdateStatus = async (status : number,rut_paciente : string) => {

    try {
     const {  getCertificadoRut } = await UseCertificadoService();

     const {url_pdf}  = await getCertificadoRut(rut_paciente);
     statusSet({status,rut_paciente,url_pdf});
     
      if(status==0)
        setValue(0);
      else 
        setValue(1);
     
    }
    catch(exception) {
     statusSet({status,rut_paciente,url_pdf:''});
     setValue(0);
    }
 }

 const handleFormData = async(formData : formData) => {

    formDataSet(formData);

  }

  const handleViewData = async(rut_paciente : string) => {
    
    const {  getChequeoRut } = await UseChequeoService() ;
    const resChequeo:IChequeo = await getChequeoRut(rut_paciente);

    setChequeoView(resChequeo);

  }

  const a11yProps = (index: number) => {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  };

  return (
    <ModalProvider>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          bgcolor: 'background.paper',
          paddingTop: 2, // Aleja del borde superior
          paddingLeft: 2, // Aleja del borde izquierdo
          justifyContent: 'center', // Centra el contenido
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '90%', // Limita el ancho para no ocupar toda la pantalla
            height: '100%',
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              flexShrink: 0,
              minWidth: 200,
              bgcolor: 'background.paper',
              boxShadow: 2,
              borderRadius: '8px 0 0 8px',
              '& .MuiTab-root': {
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                },
              },
            }}
          >
            <Tab label="Listar" {...a11yProps(0)} />
            <Tab label="Ingresar" {...a11yProps(1)} />
          </Tabs>

          <TabPanel value={value} index={0}>
            <Box sx={{ flexGrow: 1 }}>
              <LikeTextProvider>  
                <ChequeoTable
                  handleFormData = { handleFormData } 
                  handleUpdateStatus = { handleUpdateStatus }
                  handleViewData = { handleViewData }
                />
              </LikeTextProvider>
            </Box> 
          </TabPanel>
          <TabPanel value={value} index={1}>
              <Box sx={{ flexGrow: 1 }}>
                {
                  (status == 1) ?
                    <Chequeo 
                      rut_paciente = {rut_paciente}
                      handleUpdateStatus = { handleUpdateStatus }
                    />
                  :
                    <ElectroCardiograma 
                      rut_paciente = {rut_paciente}
                      url_pdf = { url_pdf }
                      handleUpdateStatus = { handleUpdateStatus }
                    />  
                }
              </Box>
          </TabPanel>
        </Box>
      </Box>
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