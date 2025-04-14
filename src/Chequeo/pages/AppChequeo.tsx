import { Box,Button, Tab, Tabs } from "@mui/material";

import { LoginContext, ModalProvider } from '../../common/context';
import { TabPanel } from "../components/tabs/TabPanel";
import React, { useContext, useState } from "react";

import { Chequeo } from "./Chequeo";
import { ChequeoTable,FormUpload,ChequeoView,CargaMasiva } from "../components";
import { IChequeo, type formData } from '../interface/';

import { LikeTextProvider } from "../context";
import { UseChequeoService } from "../services/useChequeoService";

import { ElectroCardiograma } from "./ElectroCardiograma";

import { isMobile } from 'react-device-detect';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListIcon from '@mui/icons-material/List';


const initial_status = {
  status        : 0,
  rut_paciente  : '',
  id_paciente   : 0,
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
  status                  : 'ingresado',
  division_paciente       : '',
  medio_pago_paciente     : ''
}


import { UseCertificadoService } from "../../Certificados/services/useCertificadoService";
import { HomePage } from "./Home-page";
import { ModalBarProvider } from "../context/modal-bar/Modal-bar-Provider";
import { FormUser } from "../../User";

export const AppChequeo = () => {

  const { user }  = useContext( LoginContext );
  const { user_perfil }  = user;

  const [value, setValue] = React.useState(0);

  const [{status,rut_paciente,id_paciente,url_pdf},statusSet] = useState(initial_status);
  const [formData,formDataSet] = useState(initial_value);

  const [chequeoView,setChequeoView] = useState(initial_view);

  const [collapsed, setCollapsed] = useState(isMobile);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    setValue(newValue);

    let status = newValue;
    if(newValue == 2) status=1;

    statusSet({
      status : status,
      rut_paciente : '',
      id_paciente : 0,
      url_pdf : ''
    });


  };

  const handleUpdateStatus = async (status : number,rut_paciente : string,id_paciente : number) => {

    try {
     const {  getCertificadoRut } = await UseCertificadoService();

     const {url_pdf}  = await getCertificadoRut(rut_paciente);
     statusSet(
        {
          status,
          rut_paciente,
          id_paciente,
          url_pdf
        });
     
      if(user_perfil == "Colegios") {
        
        if(status == 1 ) setValue(2);  
        else setValue(0); 

      }
      else {
        
        if(status==0) setValue(0);
        
        else setValue(1);
      }
     
    }
    catch {
     statusSet({status,rut_paciente,id_paciente,url_pdf:''});
     setValue(0);
    }
 }

 const handleFormData = async(formData : formData) => {

    formDataSet(formData);

  }

  const handleViewData = async(id_paciente : number) => {
    
    const {  getChequeoRut } = await UseChequeoService() ;
    const resChequeo:IChequeo = await getChequeoRut(id_paciente);

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
        <Button
          variant="contained"
          color="success"
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            borderRadius: '20px',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'success.light'
            },
          }}
          startIcon={collapsed 
            ? <ExitToAppIcon fontSize="large" sx={{  width: 30,height: 30 }}/> 
            : <ListIcon fontSize="large"  sx={{  width: 30,height: 30 }} />}
        />
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
              minWidth: 10,
              bgcolor: 'background.paper',
              boxShadow: 2,
              width: collapsed ? 100 : 220,
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
          {
            (user_perfil == "Colegios") && (
              <Tab label= { collapsed? "H" : "Home"} {...a11yProps(0)} />
            )
          } 
          {
            (user_perfil == "Colegios") && (
              <Tab label= { collapsed? "L" : "Lista de Deportista"}  {...a11yProps(1)} />
              
            )
          } 
          {
            (user_perfil == "Colegios") && (
              <Tab label={ collapsed? "A" : "Agrega un Deportista"} {...a11yProps(2) } />
            )
          }
          {
            (user_perfil == "Colegios") && (
              <Tab label={ collapsed? "C" : "Carga Masiva Deportista"} {...a11yProps(3) } />
            )
          }
          {
            (user_perfil != "Colegios") && (
              <Tab label={ collapsed? "L" : "Lista de Deportista"}  {...a11yProps(0)} />
            )
          }
          {
            (user_perfil != "Colegios") && (
              <Tab label={ collapsed? "A" : "Agrega un Deportista"} {...a11yProps(1) } />
            )
          }
          {
            (user_perfil != "Colegios") && (
              <Tab label={ collapsed? "C" : "Carga Masica Deportista"} {...a11yProps(2) } />
            )
          }
          {
            (user_perfil != "Colegios") && (
              <Tab label={ collapsed? "P" : "Agregar Perfil"} {...a11yProps(3) } />
            )
          }
          </Tabs>
          {
            (user_perfil == "Colegios") ? (
            <>
              <TabPanel value={value} index={0}>
                <Box sx={{ flexGrow: 1, p: 3 }}>
                  <ModalBarProvider>
                    <HomePage />
                  </ModalBarProvider>
                </Box>
              </TabPanel>
              <TabPanel value={value} index={1}>
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
              <TabPanel value={value} index={2}>
                  <Box sx={{ flexGrow: 1 }}>
                    {
                      (status == 1) ?
                        <Chequeo 
                          rut_paciente = {rut_paciente}
                          id_paciente = {id_paciente}
                          handleUpdateStatus = { handleUpdateStatus }
                        />
                      :
                        <ElectroCardiograma 
                          rut_paciente = {rut_paciente}
                          id_paciente = {id_paciente}
                          url_pdf = { url_pdf }
                          handleUpdateStatus = { handleUpdateStatus }
                        />  
                    }
                  </Box>
              </TabPanel>
              <TabPanel value={value} index={3}>
                <CargaMasiva />
              </TabPanel>
            </>
            ) : (
              <>
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
                          id_paciente = { id_paciente }
                          handleUpdateStatus = { handleUpdateStatus }
                        />
                      :
                        <ElectroCardiograma 
                          rut_paciente = {rut_paciente}
                          id_paciente = {id_paciente}
                          url_pdf = { url_pdf }
                          handleUpdateStatus = { handleUpdateStatus }
                        />  
                    }
                  </Box>
              </TabPanel>
              <TabPanel value={value} index={2}>
                <CargaMasiva />
              </TabPanel>
              <TabPanel value={value} index={3}>
                  <FormUser />
              </TabPanel>
              </>
            )
          }
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