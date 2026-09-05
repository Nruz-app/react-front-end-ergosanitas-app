import { SyntheticEvent, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import { COLORES, DEGRADADOS, SOMBRAS, sxFocoVisible } from '../config/tema';
import { ModalProvider } from '../../common/context';
import { CargaMasiva, ChequeoTable, ChequeoView, TabPanel } from '../components';
import { LikeTextProvider } from '../context';
import type { IChequeo } from '../interface';
import { UseChequeoCardiovascularService } from '../services';

import { AsistentePage } from './AsistentePage';
import { ChequeoPage } from './ChequeoPage';
import { HomePage } from './HomePage';

const CHEQUEO_VACIO: IChequeo = {
    nombre : '', rut : '', fechaNacimiento : '', edad : '',
    user_email : '', sexo_paciente : '', estado_paciente : '',
};

/**
 * Los índices son la navegación interna del módulo y **están escritos a mano en dos handlers**
 * (`handleChange` y `handleUpdateStatus`). Insertar un tab en medio obliga a revisar los dos:
 * es lo que pasó al meter «Asistente Virtual» en la posición 1, que empujó los tres siguientes.
 */
const TAB_HOME      = 0;
const TAB_ASISTENTE = 1;
const TAB_LISTA     = 2;
const TAB_ALTA      = 3;
const TAB_CARGA     = 4;

const TABS = [
    { indice: TAB_HOME,      titulo: 'Home',                 icono: <HomeIcon /> },
    { indice: TAB_ASISTENTE, titulo: 'Asistente Virtual',    icono: <SmartToyIcon /> },
    { indice: TAB_LISTA,     titulo: 'Lista de deportistas', icono: <ListAltIcon /> },
    { indice: TAB_ALTA,      titulo: 'Agregar deportista',   icono: <PersonAddIcon /> },
    { indice: TAB_CARGA,     titulo: 'Carga masiva',         icono: <CloudUploadIcon /> },
];

/**
 * Orquestador del módulo: los 5 tabs del perfil `Colegios`.
 *
 * **No ramifica por perfil.** Esa es la diferencia de fondo con `AppChequeo`, que reparte una
 * sola pantalla entre tres bloques de perfil con índices de tab que no coinciden: agregar un
 * tab allí obliga a revisar los tres. Aquí el módulo es de un solo perfil, así que los índices
 * son estables y el array de tabs y sus paneles se leen juntos.
 *
 * Monta su propio `ModalProvider` anidado sobre el global de `App.tsx`, para que el modal de
 * detalle de este módulo no comparta estado con el de login.
 */
export const AppChequeoCardiovascular = () => {

    const [tab, setTab] = useState(0);
    const [{ rut_paciente, id_paciente }, setSeleccion] = useState({ rut_paciente: '', id_paciente: 0 });
    const [chequeoView, setChequeoView] = useState<IChequeo>(CHEQUEO_VACIO);
    const [reloadTable, setReloadTable] = useState(false);

    const handleChange = (_event: SyntheticEvent, nuevoTab: number) => {

        setTab(nuevoTab);

        // Entrar al tab de alta por el menú siempre abre un formulario limpio; se llega a la
        // edición desde la lista, que sí trae rut e id.
        if (nuevoTab === TAB_ALTA) setSeleccion({ rut_paciente: '', id_paciente: 0 });
    };

    /**
     * `status` es la navegación interna heredada del módulo original: 0 = alta limpia,
     * 1 = edición. No tiene nada que ver con `estado_paciente`, que es el estado clínico.
     */
    const handleUpdateStatus = (status: number, rut: string, id: number) => {

        setSeleccion({ rut_paciente: status === 1 ? rut : '', id_paciente: status === 1 ? id : 0 });
        setTab(status === 1 ? TAB_ALTA : TAB_LISTA);
    };

    const handleViewData = async (id: number) => {

        try {
            const { getChequeoRut } = await UseChequeoCardiovascularService();
            setChequeoView(await getChequeoRut(id));
        }
        catch (problema) {
            console.error('Error al cargar el detalle del deportista:', problema);
            setChequeoView(CHEQUEO_VACIO);
        }
    };

    const handleReloadTable = () => setReloadTable((previo) => !previo);

    return (
        <ModalProvider>
            <Box
                sx={{
                    display    : 'flex',
                    minHeight  : '100%',
                    background : DEGRADADOS.fondo,
                    p          : { xs: 1, md: 3 },
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        display      : 'flex',
                        width        : '100%',
                        background   : COLORES.fondoTarjeta,
                        borderRadius : 3,
                        overflow     : 'hidden',
                        boxShadow    : SOMBRAS.tarjeta,
                    }}
                >
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={tab}
                        onChange={handleChange}
                        aria-label="Secciones del chequeo cardiovascular"
                        sx={{
                            width       : { xs: 64, md: 90 },
                            flexShrink  : 0,
                            borderRight : `1px solid ${COLORES.borde}`,
                            bgcolor     : COLORES.fondoRail,
                            pt          : 1,

                            '& .MuiTab-root': {
                                minHeight    : 70,
                                minWidth     : 'auto',
                                m            : '8px',
                                borderRadius : '16px',
                                color        : COLORES.textoSuave,
                                transition   : 'all 0.25s ease',
                                '& .MuiSvgIcon-root': { fontSize: 26 },
                                '&:hover': {
                                    background : DEGRADADOS.hover,
                                    color      : COLORES.fondoTarjeta,
                                },
                                ...sxFocoVisible,
                                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                            },
                            '& .Mui-selected': {
                                background : DEGRADADOS.primario,
                                color      : `${COLORES.fondoTarjeta} !important`,
                                boxShadow  : SOMBRAS.seleccion,
                            },
                            '& .MuiTabs-indicator': { display: 'none' },
                        }}
                    >
                        {TABS.map(({ indice, titulo, icono }) => (
                            <Tab
                                key={indice}
                                icon={icono}
                                aria-label={titulo}
                                title={titulo}
                                id={`vertical-tab-${indice}`}
                                aria-controls={`vertical-tabpanel-${indice}`}
                            />
                        ))}
                    </Tabs>

                    <Box sx={{ flex: 1, minWidth: 0 }}>

                        <TabPanel value={tab} index={TAB_HOME}>
                            <HomePage />
                        </TabPanel>

                        {/* `activo` solo lo necesita el chat: `TabPanel` oculta con
                            `display: none`, así que sin esta señal el micrófono seguiría
                            escuchando tras cambiar de tab. */}
                        <TabPanel value={tab} index={TAB_ASISTENTE}>
                            <AsistentePage activo={tab === TAB_ASISTENTE} />
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_LISTA}>
                            <LikeTextProvider>
                                <ChequeoTable
                                    handleViewData={handleViewData}
                                    reloadTable={reloadTable}
                                />
                            </LikeTextProvider>
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_ALTA}>
                            <ChequeoPage
                                rut_paciente={rut_paciente}
                                id_paciente={id_paciente}
                                handleUpdateStatus={handleUpdateStatus}
                                handleReloadTable={handleReloadTable}
                            />
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_CARGA}>
                            <CargaMasiva handleReloadTable={handleReloadTable} />
                        </TabPanel>

                    </Box>
                </Box>
            </Box>

            <ChequeoView chequeoView={chequeoView} />
        </ModalProvider>
    );
};

export default AppChequeoCardiovascular;
