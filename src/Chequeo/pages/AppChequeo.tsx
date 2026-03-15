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
  const [menuOpen, setMenuOpen] = useState(false); // menu inicia colapsado

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    setValue(newValue);

    let statusTab = newValue;
    if (newValue === 2) statusTab = 1;

    statusSet({ status: statusTab, rut_paciente: '', id_paciente: 0, url_pdf: '' });
  };

  const handleUpdateStatus = async (status: number, rut_paciente: string, id_paciente: number) => {
    try {
      const { getCertificadoRut } = await UseCertificadoService();
      const { url_pdf } = await getCertificadoRut(rut_paciente);

      statusSet({ status, rut_paciente, id_paciente, url_pdf });

      if (user_perfil === "Colegios") {
        setValue(status === 1 ? 2 : 0);
      } else if (user_perfil !== "Medicos") {
        setValue(status === 0 ? 0 : 1);
      }
      // Medicos no cambia value → evita error MUI Tabs
    } catch {
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
            onMouseEnter={() => setMenuOpen(true)} // se expande al pasar el mouse
            onMouseLeave={() => setMenuOpen(false)} // vuelve a siglas
            sx={{
              width: menuOpen ? 180 : 60, // ancho colapsado más chiquito
              transition: "width 0.3s ease",
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: '#ffffff',
              '& .MuiTab-root': {
                minHeight: 60,
                fontSize: 14,
                justifyContent: menuOpen ? 'flex-start' : 'center',
                paddingLeft: menuOpen ? 3 : 0,
                transition: "all 0.2s",
                '&:hover': { background: "#1976d2", color: "white" }
              }
            }}
          >
            {user_perfil === "Colegios" && <>
              <Tab label={menuOpen ? "Home" : "H"} {...a11yProps(0)} />
              <Tab label={menuOpen ? "Lista de Deportista" : "L"} {...a11yProps(1)} />
              <Tab label={menuOpen ? "Agregar Deportista" : "A"} {...a11yProps(2)} />
              <Tab label={menuOpen ? "Carga Masiva" : "C"} {...a11yProps(3)} />
            </>}
            {user_perfil === "Medicos" && (
              <Tab
                label={menuOpen ? "Lista de Deportista" : "L"}
                {...a11yProps(0)}
                onClick={() => {
                  // Al presionar este Tab, cambiamos status si estaba en 3
                  if (status === 3) {
                    statusSet({ ...{ status: 0, rut_paciente, id_paciente, url_pdf } });
                  }
                }}
              />
            )}
            {user_perfil !== "Colegios" && user_perfil !== "Medicos" && <>
              <Tab label={menuOpen ? "Lista de Deportista" : "L"} {...a11yProps(0)} />
              <Tab label={menuOpen ? "Agregar Deportista" : "A"} {...a11yProps(1)} />
              <Tab label={menuOpen ? "Carga Masiva" : "C"} {...a11yProps(2)} />
              <Tab label={menuOpen ? "Agregar Perfil" : "P"} {...a11yProps(3)} />
              <Tab label={menuOpen ? "Calculos QTc" : "Q"} {...a11yProps(4)} />
              <Tab label={menuOpen ? "Perfil Usuario" : "U"} {...a11yProps(5)} />
            </>}
          </Tabs>

          <Box sx={{ flex: 1, padding: 2 }}>
            {/* PERFIL MEDICOS */}
            {
            user_perfil === "Medicos" && (
              <>
                <TabPanel value={value} index={0}>
                  {status === 3 ? (
                    <ElectroCardiograma
                      rut_paciente={rut_paciente}
                      id_paciente={id_paciente}
                      url_pdf={url_pdf}
                      handleUpdateStatus={handleUpdateStatus}
                    />
                  ) : (
                    <LikeTextProvider>
                      <ChequeoTable
                        handleFormData={handleFormData}
                        handleUpdateStatus={handleUpdateStatus}
                        handleViewData={handleViewData}
                      />
                    </LikeTextProvider>
                  )}
                </TabPanel>
              </>
            )
            }
            {/* PERFIL COLEGIOS */}
            {user_perfil === "Colegios" && <>
              <TabPanel value={value} index={0}><ModalBarProvider><HomePage /></ModalBarProvider></TabPanel>
              <TabPanel value={value} index={1}><LikeTextProvider><ChequeoTable handleFormData={handleFormData} handleUpdateStatus={handleUpdateStatus} handleViewData={handleViewData} /></LikeTextProvider></TabPanel>
              <TabPanel value={value} index={2}>{status === 1 ? <Chequeo rut_paciente={rut_paciente} id_paciente={id_paciente} handleUpdateStatus={handleUpdateStatus} /> : <ElectroCardiograma rut_paciente={rut_paciente} id_paciente={id_paciente} url_pdf={url_pdf} handleUpdateStatus={handleUpdateStatus} />}</TabPanel>
              <TabPanel value={value} index={3}><CargaMasiva /></TabPanel>
            </>}

            {/* OTROS PERFILES */}
            {user_perfil !== "Colegios" && user_perfil !== "Medicos" && <>
              <TabPanel value={value} index={0}><LikeTextProvider><ChequeoTable handleFormData={handleFormData} handleUpdateStatus={handleUpdateStatus} handleViewData={handleViewData} /></LikeTextProvider></TabPanel>
              <TabPanel value={value} index={1}>{status === 1 ? <Chequeo rut_paciente={rut_paciente} id_paciente={id_paciente} handleUpdateStatus={handleUpdateStatus} /> : <ElectroCardiograma rut_paciente={rut_paciente} id_paciente={id_paciente} url_pdf={url_pdf} handleUpdateStatus={handleUpdateStatus} />}</TabPanel>
              <TabPanel value={value} index={2}><CargaMasiva /></TabPanel>
              <TabPanel value={value} index={3}><FormUser /></TabPanel>
            </>}

            <TabPanel value={value} index={4}><CalculadoraImc /></TabPanel>
            <TabPanel value={value} index={5}><PerfilUsuario /></TabPanel>
          </Box>

        </Box>
      </Box>

      <FormUpload formData={formData} />
      <ChequeoView chequeoView={chequeoView} />
    </ModalProvider>
  );
};

export default AppChequeo;