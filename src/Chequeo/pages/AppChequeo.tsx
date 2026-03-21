import { Box, Tab, Tabs, Tooltip } from "@mui/material";
import { LoginContext, ModalProvider } from '../../common/context';
import { TabPanel } from "../components/tabs/TabPanel";
import React, { useContext, useState } from "react";

import { Chequeo } from "./Chequeo";
import { ChequeoTable, FormUpload, ChequeoView, CargaMasiva, CalculadoraImc, PerfilUsuario } from "../components";
import { IChequeo, type formData } from '../interface/';
import { LikeTextProvider } from "../context";
import { UseChequeoService } from "../services/useChequeoService";
import { ElectroCardiograma } from "./ElectroCardiograma";
import { UseCertificadoService } from "../../Certificados/services/useCertificadoService";
import { HomePage } from "./Home-page";
import { ModalBarProvider } from "../context/modal-bar/Modal-bar-Provider";
import { FormUser } from "../../User";

import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CalculateIcon from '@mui/icons-material/Calculate';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const initial_status = { status: 0, rut_paciente: '', id_paciente: 0, url_pdf: '' };
const initial_value: formData = { rut: '', nombre: '', url_pdf: '' };
const initial_view: IChequeo = {
  nombre: '', rut: '', fechaNacimiento: '', edad: '', estatura: '', peso: '',
  hemoglucotest: '', pulso: '', presionArterial: '', presion_sistolica: '', saturacionOxigeno: '',
  temperatura: '', enfermedadesCronicas: '', medicamentosDiarios: '', sistemaOsteoarticular: '',
  sistemaCardiovascular: '', enfermedadesAnteriores: '', Recuperacion: '', gradoIncidenciaPosterio: '',
  user_email: '', sexo_paciente: '', imc_paciente: '', status: 'ingresado', division_paciente: '',
  medio_pago_paciente: '', email_paciente: '',
};

export const AppChequeo = () => {
  const { user } = useContext(LoginContext);
  const { user_perfil } = user;

  const [value, setValue] = useState(0);
  const [{ status, rut_paciente, id_paciente, url_pdf }, statusSet] = useState(initial_status);
  const [formData, formDataSet] = useState(initial_value);
  const [chequeoView, setChequeoView] = useState<IChequeo>(initial_view);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    if (user_perfil === "Colegios" && newValue === 2) {
      statusSet({ status: 1, rut_paciente: '', id_paciente: 0, url_pdf: '' });
    } else {
      statusSet({ status: 0, rut_paciente: '', id_paciente: 0, url_pdf: '' });
    }
  };

  const handleUpdateStatus = async (status: number, rut_paciente: string, id_paciente: number) => {
    try {
      const { getCertificadoRut } = await UseCertificadoService();
      const { url_pdf = '' } = await getCertificadoRut(rut_paciente) || {};

      statusSet({ status, rut_paciente, id_paciente, url_pdf });

      if (user_perfil === "Colegios") {
        setValue((prev) => (prev === 2 ? prev : 2));
      } else if (user_perfil !== "Medicos") {
        setValue(1);
      }

    } catch (error) {
      console.error(error);
      statusSet({ status, rut_paciente, id_paciente, url_pdf: '' });
      if (user_perfil !== "Medicos") setValue(0);
    }
  };

  const handleFormData = async (formData: formData) => { formDataSet(formData); };

  const handleViewData = async (id_paciente: number) => {
    const { getChequeoRut } = await UseChequeoService();
    const resChequeo: IChequeo = await getChequeoRut(id_paciente);
    setChequeoView(resChequeo);
  };

  const a11yProps = (index: number) => ({
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  });

  return (
    <ModalProvider>
      {/* 🌈 FONDO MODERNO */}
      <Box sx={{
        display: 'flex',
        height: '100%',
        background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
        padding: 3,
        justifyContent: 'center'
      }}>
        <Box sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'white',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
        }}>

          {/* 🔥 MENU PRO */}
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            sx={{
              width: 90,
              borderRight: '1px solid #e0e0e0',
              bgcolor: '#f9fafc',
              paddingTop: 1,

              '& .MuiTab-root': {
                minHeight: 75,
                margin: '8px',
                borderRadius: '16px',
                transition: 'all 0.25s ease',
                color: '#6b7280',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                '& .MuiSvgIcon-root': {
                  fontSize: 28,
                  transition: 'all 0.25s ease',
                },

                '&:hover': {
                  transform: 'scale(1.15)',
                  background: 'linear-gradient(135deg, #42a5f5, #1976d2)',
                  color: '#fff',
                  boxShadow: '0 8px 20px rgba(25, 118, 210, 0.35)',

                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.2)',
                  }
                }
              },

              '& .Mui-selected': {
                background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
                color: '#fff !important',
                boxShadow: '0 10px 25px rgba(13, 71, 161, 0.4)',

                '& .MuiSvgIcon-root': {
                  fontSize: 30,
                }
              },

              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >

            {/* COLEGIOS */}
            {user_perfil === "Colegios" && [
              <Tooltip key="Home" title="Home" placement="right"><Tab key={0} icon={<HomeIcon />} {...a11yProps(0)} /></Tooltip>,
              <Tooltip key="Lista Deportista" title="Lista Deportista" placement="right"><Tab key={1} icon={<ListAltIcon />} {...a11yProps(1)} /></Tooltip>,
              <Tooltip key="Agregar Deportista" title="Agregar Deportista" placement="right"><Tab key={2} icon={<PersonAddIcon />} {...a11yProps(2)} /></Tooltip>,
              <Tooltip key="Carga Masiva" title="Carga Masiva" placement="right"><Tab key={3} icon={<CloudUploadIcon />} {...a11yProps(3)} /></Tooltip>
            ]}

            {/* MEDICOS */}
            {user_perfil === "Medicos" && [
              <Tooltip key="Lista Deportista" title="Lista Deportista" placement="right"><Tab key={0} icon={<ListAltIcon />} {...a11yProps(0)} /></Tooltip>,
              <Tooltip key="Perfil Usuario"  title="Perfil Usuario" placement="right"><Tab key={1} icon={<ManageAccountsIcon />} {...a11yProps(1)} /></Tooltip>
            ]}

            {/* OTROS */}
            {user_perfil !== "Colegios" && user_perfil !== "Medicos" && [
              <Tooltip key="Lista Deportista" title="Lista Deportista" placement="right"><Tab key={0} icon={<ListAltIcon />} {...a11yProps(0)} /></Tooltip>,
              <Tooltip key="Agregar Deportista" title="Agregar Deportista" placement="right"><Tab key={1} icon={<PersonAddIcon />} {...a11yProps(1)} /></Tooltip>,
              <Tooltip key="Carga Masiva" title="Carga Masiva" placement="right"><Tab key={2} icon={<CloudUploadIcon />} {...a11yProps(2)} /></Tooltip>,
              <Tooltip key="Agregar Perfil" title="Agregar Perfil" placement="right"><Tab key={3} icon={<GroupAddIcon />} {...a11yProps(3)} /></Tooltip>,
              <Tooltip key="Calculos QTC" title="Calculos QTC" placement="right"><Tab key={4} icon={<CalculateIcon />} {...a11yProps(4)} /></Tooltip>,
              <Tooltip key="Perfil Usuario" title="Perfil Usuario" placement="right"><Tab key={5} icon={<ManageAccountsIcon />} {...a11yProps(5)} /></Tooltip>
            ]}
          </Tabs>

          {/* CONTENIDO (NO TOCADO) */}
          <Box sx={{ flex: 1, padding: 2 }}>

            {user_perfil === "Medicos" && (
              <>
                <TabPanel value={value} index={0}>
                  {status === 3 ? (
                    <ElectroCardiograma {...{ rut_paciente, id_paciente, url_pdf, handleUpdateStatus }} />
                  ) : (
                    <LikeTextProvider>
                      <ChequeoTable {...{ handleFormData, handleUpdateStatus, handleViewData }} />
                    </LikeTextProvider>
                  )}
                </TabPanel>
                <TabPanel value={value} index={1}><PerfilUsuario /></TabPanel>
              </>
            )}

            {user_perfil === "Colegios" && (
              <>
                <TabPanel value={value} index={0}><ModalBarProvider><HomePage /></ModalBarProvider></TabPanel>
                <TabPanel value={value} index={1}><LikeTextProvider><ChequeoTable {...{ handleFormData, handleUpdateStatus, handleViewData }} /></LikeTextProvider></TabPanel>
                <TabPanel value={value} index={2}><Chequeo {...{ rut_paciente, id_paciente, handleUpdateStatus }} /></TabPanel>
                <TabPanel value={value} index={3}><CargaMasiva /></TabPanel>
              </>
            )}

            {user_perfil !== "Colegios" && user_perfil !== "Medicos" && (
              <>
                <TabPanel value={value} index={0}>
                  <LikeTextProvider>
                    <ChequeoTable {...{ handleFormData, handleUpdateStatus, handleViewData }} />
                  </LikeTextProvider>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  {status !== 3
                    ? <Chequeo {...{ rut_paciente, id_paciente, handleUpdateStatus }} />
                    : <ElectroCardiograma {...{ rut_paciente, id_paciente, url_pdf, handleUpdateStatus }} />}
                </TabPanel>
                <TabPanel value={value} index={2}><CargaMasiva /></TabPanel>
                <TabPanel value={value} index={3}><FormUser /></TabPanel>
                <TabPanel value={value} index={4}><CalculadoraImc /></TabPanel>
                <TabPanel value={value} index={5}><PerfilUsuario /></TabPanel>
              </>
            )}

          </Box>
        </Box>
      </Box>

      <FormUpload formData={formData} />
      <ChequeoView chequeoView={chequeoView} />
    </ModalProvider>
  );
};

export default AppChequeo;