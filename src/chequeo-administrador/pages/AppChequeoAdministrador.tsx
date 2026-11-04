import { SyntheticEvent, useRef, useState } from 'react';
import { Box } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CollectionsIcon from '@mui/icons-material/Collections';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { ModalProvider } from '../../common/context';
import {
    CalculadoraImc, CargaMasiva, CargaMasivaEcg, ChequeoTable, ChequeoView, FormUsuario, MiCuenta,
    ModalSubirEcg, RailTabs, TabPanel,
} from '../components';
import type { ItemRail } from '../components';
import { FICHA_ALTA } from '../config/ficha';
import { COLORES, DEGRADADOS, SOMBRAS } from '../config/tema';
import { LikeTextProvider } from '../context';
import type { FormDataChequeo, IChequeo, ModoFicha, SeleccionFicha } from '../interface';
import { UseCertificadoService, UseChequeoAdministradorService } from '../services';
import { FichaChequeoPage } from './FichaChequeoPage';
import { ImagenesHomePage } from './ImagenesHomePage';

/*
 * Índices estables (§4). Ni los `<TabPanel>` ni los handlers escriben un número: insertar un
 * tab en medio desplazaba en silencio los literales, y en `chequeo-cardiovascular` pasó dos
 * veces. El orden agrupa por tarea (D3 a): chequeos (0-1), cargas (2-3), administración (4-7).
 * «Imágenes del Home» entró en la Spec 02 **antes** de «Mi cuenta», que sigue siendo la última:
 * por eso `TAB_CUENTA` pasó de 6 a 7.
 */
const TAB_LISTA       = 0;
const TAB_FICHA       = 1;
const TAB_CARGA       = 2;
const TAB_CARGA_ECG   = 3;
const TAB_USUARIOS    = 4;
const TAB_CALCULADORA = 5;
const TAB_IMAGENES    = 6;
const TAB_CUENTA      = 7;

const TABS: ItemRail[] = [
    { indice: TAB_LISTA,       titulo: 'Lista de chequeos', icono: <ListAltIcon /> },
    { indice: TAB_FICHA,       titulo: 'Ficha del chequeo', icono: <PersonAddIcon /> },
    { indice: TAB_CARGA,       titulo: 'Carga masiva Excel', icono: <CloudUploadIcon /> },
    { indice: TAB_CARGA_ECG,   titulo: 'Carga masiva ECG',  icono: <DriveFolderUploadIcon /> },
    { indice: TAB_USUARIOS,    titulo: 'Crear usuario',     icono: <GroupAddIcon /> },
    { indice: TAB_CALCULADORA, titulo: 'Calculadora IMC',   icono: <CalculateIcon /> },
    { indice: TAB_IMAGENES,    titulo: 'Imágenes del Home', icono: <CollectionsIcon /> },
    { indice: TAB_CUENTA,      titulo: 'Mi cuenta',         icono: <ManageAccountsIcon /> },
];

/** Título de un tab por su constante, para la cabecera de cada panel. */
const tituloDe = (indice: number): string => TABS.find((t) => t.indice === indice)?.titulo ?? '';

const FORM_DATA_VACIO: FormDataChequeo = { rut: '', nombre: '', url_pdf: '' };

/**
 * Orquestador del chequeo del perfil `Administrador`.
 *
 * Es el bloque «OTROS» de `AppChequeo` sin ninguna rama por perfil, con índice estable y etiqueta
 * visible: los 7 tabs de la Spec 01 más «Imágenes del Home» (Spec 02), **8 en total**. `src/Chequeo/` queda intacto para `Medicos` y `Usuario`.
 *
 * Monta su propio `ModalProvider` anidado, como el original: aísla el `isDateModalOpen` del
 * modal «Subir archivo» del modal de login global, que comparte el mismo booleano.
 */
export const AppChequeoAdministrador = () => {

    const [tab, setTab] = useState<number>(TAB_LISTA);
    const [seleccion, setSeleccion] = useState<SeleccionFicha>(FICHA_ALTA);
    const [formData, setFormData] = useState<FormDataChequeo>(FORM_DATA_VACIO);
    const [chequeoView, setChequeoView] = useState<IChequeo>();
    const [reloadTable, setReloadTable] = useState(false);

    // Turno de la última petición de «Editar»/«Revisión» y de «Ver». Si el Administrador pulsa
    // una fila lenta y luego otra rápida, la respuesta tardía de la primera ya no pisa a la
    // segunda: sin esto la ficha o el detalle mostraban los datos de **otro paciente**. Un
    // `useState` no sirve: el handler en vuelo ve el valor con el que se creó.
    const turnoFicha = useRef(0);
    const turnoVer = useRef(0);

    const handleReloadTable = () => setReloadTable((prev) => !prev);

    /** Entrar a cualquier tab por el rail deja la ficha en alta limpia, como el original. */
    const handleChange = (_event: SyntheticEvent, nuevoTab: number) => {
        // Una «Editar» todavía en vuelo ya no debe arrastrar al usuario a la ficha.
        turnoFicha.current++;
        setTab(nuevoTab);
        setSeleccion(FICHA_ALTA);
    };

    /**
     * «Editar» y «Revisión Médica» desde la lista: pide la URL del certificado y salta a la
     * ficha. Si falla, vuelve a la lista, igual que el original.
     */
    const abrirFicha = async (modo: ModoFicha, rut_paciente: string, id_paciente: number) => {

        const turno = ++turnoFicha.current;

        try {
            const { getCertificadoRut } = await UseCertificadoService();
            const certificado = await getCertificadoRut(rut_paciente);

            if (turno !== turnoFicha.current) return;

            setSeleccion({ modo, rut_paciente, id_paciente, url_pdf: certificado?.url_pdf ?? '' });
            setTab(TAB_FICHA);
        }
        catch (problema) {
            if (turno !== turnoFicha.current) return;

            console.error('Error al abrir la ficha:', problema);
            setSeleccion({ modo, rut_paciente, id_paciente, url_pdf: '' });
            setTab(TAB_LISTA);
        }
    };

    /** Guardar en cualquier modo: ficha en alta limpia y lista recargada (§3.4). */
    const handleGuardado = () => {
        setSeleccion(FICHA_ALTA);
        handleReloadTable();
    };

    /**
     * «Ver»: el modal se abre al instante, así que primero se vacía el detalle. El original
     * dejaba a la vista el paciente anterior hasta que llegaba la respuesta, y para siempre si
     * la petición fallaba.
     */
    const handleVer = async (id_paciente: number) => {

        const turno = ++turnoVer.current;
        setChequeoView(undefined);

        try {
            const { getChequeoRut } = await UseChequeoAdministradorService();
            const detalle = await getChequeoRut(id_paciente);

            if (turno === turnoVer.current) setChequeoView(detalle);
        }
        catch (problema) {
            console.error('Error al cargar el detalle:', problema);
        }
    };

    return (
        <ModalProvider>
            <Box
                sx={{
                    display        : 'flex',
                    minHeight      : '100%',
                    background     : DEGRADADOS.fondo,
                    p              : { xs: 1, md: 3 },
                    justifyContent : 'center',
                }}
            >
                <Box
                    sx={{
                        display      : 'flex',
                        width        : '100%',
                        minWidth     : 0,
                        background   : COLORES.fondoTarjeta,
                        borderRadius : 3,
                        overflow     : 'hidden',
                        boxShadow    : SOMBRAS.tarjeta,
                    }}
                >
                    <RailTabs tabs={TABS} value={tab} onChange={handleChange} />

                    <Box sx={{ flex: 1, minWidth: 0, p: { xs: 0.5, md: 2 } }}>

                        <TabPanel value={tab} index={TAB_LISTA} titulo={tituloDe(TAB_LISTA)}>
                            <LikeTextProvider>
                                <ChequeoTable
                                    onVer={handleVer}
                                    onEditar={(rut, id) => abrirFicha('edicion', rut, id)}
                                    onRevision={(rut, id) => abrirFicha('revision', rut, id)}
                                    onSubirArchivo={setFormData}
                                    reloadTable={reloadTable}
                                    handleReloadTable={handleReloadTable}
                                />
                            </LikeTextProvider>
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_FICHA} titulo={tituloDe(TAB_FICHA)}>
                            <FichaChequeoPage
                                seleccion={seleccion}
                                activo={tab === TAB_FICHA}
                                onGuardado={handleGuardado}
                            />
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_CARGA} titulo={tituloDe(TAB_CARGA)}>
                            <CargaMasiva />
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_CARGA_ECG} titulo={tituloDe(TAB_CARGA_ECG)}>
                            <CargaMasivaEcg handleReloadTable={handleReloadTable} />
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_USUARIOS} titulo={tituloDe(TAB_USUARIOS)}>
                            <FormUsuario />
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_CALCULADORA} titulo={tituloDe(TAB_CALCULADORA)}>
                            <CalculadoraImc />
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_IMAGENES} titulo={tituloDe(TAB_IMAGENES)}>
                            <ImagenesHomePage activo={tab === TAB_IMAGENES} />
                        </TabPanel>

                        <TabPanel value={tab} index={TAB_CUENTA} titulo={tituloDe(TAB_CUENTA)}>
                            <MiCuenta />
                        </TabPanel>
                    </Box>
                </Box>
            </Box>

            <ModalSubirEcg formData={formData} />
            <ChequeoView chequeoView={chequeoView} />
        </ModalProvider>
    );
};

export default AppChequeoAdministrador;
