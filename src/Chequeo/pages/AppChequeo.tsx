import { Box, Tab, Tabs } from "@mui/material";
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

    // Ajuste de status según perfil y tab seleccionado
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

    // Primero actualiza status
    statusSet({ status, rut_paciente, id_paciente, url_pdf });

    // Luego cambia la tab según perfil
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

  const a11yProps = (index: number) => ({ id: `vertical-tab-${index}`, 'aria-controls': `vertical-tabpanel-${index}` });

  return (
    <ModalProvider>
      <Box sx={{ display: 'flex', height: '100%', bgcolor: '#f5f7fb', padding: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', width: '100%', height: '100%', background: 'white', borderRadius: 3, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>

          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            sx={{
              width: 70,
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: '#ffffff',
              '& .MuiTab-root': {
                minHeight: 60,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                paddingLeft: 0,
                transition: "all 0.2s",
                '&:hover': { background: "#1976d2", color: "white" }
              }
            }}
          >
            {/* Tabs según perfil */}
            {user_perfil === "Colegios" && [
              <Tab key={0} icon={<HomeIcon />} title="Home" {...a11yProps(0)} />,
              <Tab key={1} icon={<ListAltIcon />} title="Lista de Deportista" {...a11yProps(1)} />,
              <Tab key={2} icon={<PersonAddIcon />} title="Agregar Deportista" {...a11yProps(2)} />,
              <Tab key={3} icon={<CloudUploadIcon />} title="Carga Masiva" {...a11yProps(3)} />
            ]}

            {user_perfil === "Medicos" && [
              <Tab key={0} icon={<ListAltIcon />} title="Lista de Deportista" {...a11yProps(0)} />,
              <Tab key={1} icon={<ManageAccountsIcon />} title="Perfil Usuario" {...a11yProps(1)} />
            ]}

            {user_perfil !== "Colegios" && user_perfil !== "Medicos" && [
              <Tab key={0} icon={<ListAltIcon />} title="Lista de Deportista" {...a11yProps(0)} />,
              <Tab key={1} icon={<PersonAddIcon />} title="Agregar Deportista" {...a11yProps(1)} />,
              <Tab key={2} icon={<CloudUploadIcon />} title="Carga Masiva" {...a11yProps(2)} />,
              <Tab key={3} icon={<GroupAddIcon />} title="Agregar Perfil" {...a11yProps(3)} />,
              <Tab key={4} icon={<CalculateIcon />} title="Calculos QTC" {...a11yProps(4)} />,
              <Tab key={5} icon={<ManageAccountsIcon />} title="Perfil Usuario" {...a11yProps(5)} />
            ]}
          </Tabs>

          <Box sx={{ flex: 1, padding: 2 }}>
            {/* PERFIL MEDICOS */}
            {user_perfil === "Medicos" && (
              <>
                <TabPanel value={value} index={0}>
                  {status === 3 ? (
                    <ElectroCardiograma rut_paciente={rut_paciente} id_paciente={id_paciente} url_pdf={url_pdf} handleUpdateStatus={handleUpdateStatus} />
                  ) : (
                    <LikeTextProvider>
                      <ChequeoTable handleFormData={handleFormData} handleUpdateStatus={handleUpdateStatus} handleViewData={handleViewData} />
                    </LikeTextProvider>
                  )}
                </TabPanel>
                <TabPanel value={value} index={1}><PerfilUsuario /></TabPanel>
              </>
            )}

            {/* PERFIL COLEGIOS */}
            {user_perfil === "Colegios" && (
              <>
                <TabPanel value={value} index={0}><ModalBarProvider><HomePage /></ModalBarProvider></TabPanel>
                <TabPanel value={value} index={1}><LikeTextProvider><ChequeoTable handleFormData={handleFormData} handleUpdateStatus={handleUpdateStatus} handleViewData={handleViewData} /></LikeTextProvider></TabPanel>
                <TabPanel value={value} index={2}><Chequeo rut_paciente={rut_paciente} id_paciente={id_paciente} handleUpdateStatus={handleUpdateStatus} /></TabPanel>
                <TabPanel value={value} index={3}><CargaMasiva /></TabPanel>
              </>
            )}

            {/* OTROS PERFILES */}
            {user_perfil !== "Colegios" && user_perfil !== "Medicos" && (
              <>
                <TabPanel value={value} index={0}>
                  <LikeTextProvider>
                    <ChequeoTable handleFormData={handleFormData} 
                    handleUpdateStatus={handleUpdateStatus} 
                    handleViewData={handleViewData} />
                    </LikeTextProvider>
                  </TabPanel>
                <TabPanel value={value} index={1}>
                  {status !== 3 ? <Chequeo rut_paciente={rut_paciente} id_paciente={id_paciente} handleUpdateStatus={handleUpdateStatus} /> : <ElectroCardiograma rut_paciente={rut_paciente} id_paciente={id_paciente} url_pdf={url_pdf} handleUpdateStatus={handleUpdateStatus} />}
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