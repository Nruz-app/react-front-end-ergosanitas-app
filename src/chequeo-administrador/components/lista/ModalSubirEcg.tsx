import { useContext, useState } from 'react';
import { Box, Button, Grid, Modal } from '@mui/material';
import Swal from 'sweetalert2';

import { ModalContext } from '../../../common/context';
import { DEGRADADOS, COLORES, sxFocoVisible } from '../../config/tema';
import type { FormDataChequeo, IAnalisisEcg } from '../../interface';
import { UseChequeoAdministradorService } from '../../services';
import { escaparHtml } from '../../utilities';
import { InputFileUpload } from '../forms';

interface Props {
    /** RUT y nombre de la fila desde la que se abrió el modal. */
    formData: FormDataChequeo;
}

/**
 * Arma el informe del ECG para el `html` de Swal, con **cada valor escapado** (§7.1).
 *
 * El original interpolaba los 16 campos de `GPT/analisis-ecg` tal cual: un `<img onerror>` en
 * la respuesta del modelo se ejecutaba en la sesión del Administrador. El marcado de la
 * plantilla es nuestro; el texto que llega, no.
 */
const informeHtml = (ecg: IAnalisisEcg): string => {

    const v = (valor?: string | number) => escaparHtml(valor);

    return `
        <div style="text-align:left;font-size:14px">
            <h3>📋 Resumen</h3>
            <p><b>Conclusión:</b><br>${v(ecg.conclusion)}</p>
            <p><b>Nivel de Urgencia:</b>${v(ecg.nivel_urgencia)}</p>
            <hr>
            <h3>❤️ Ritmo y Frecuencia</h3>
            <p><b>Ritmo:</b> ${v(ecg.ritmo)}</p>
            <p><b>Frecuencia:</b> ${v(ecg.frecuencia_cardiaca)}</p>
            <p><b>Eje Eléctrico:</b> ${v(ecg.eje_electrico)}</p>
            <hr>
            <h3>📈 Intervalos</h3>
            <p><b>PR:</b> ${v(ecg.intervalo_pr)}</p>
            <p><b>QRS:</b> ${v(ecg.complejo_qrs)}</p>
            <p><b>QT:</b> ${v(ecg.qt)}</p>
            <p><b>QTc:</b> ${v(ecg.qtc)}</p>
            <hr>
            <h3>🔍 Hallazgos</h3>
            <p><b>Onda P:</b> ${v(ecg.onda_p)}</p>
            <p><b>Segmento ST:</b> ${v(ecg.segmento_st)}</p>
            <p><b>Onda T:</b> ${v(ecg.onda_t)}</p>
            <p><b>Hipertrofias:</b> ${v(ecg.hipertrofias)}</p>
            <p><b>Bloqueos:</b> ${v(ecg.bloqueos)}</p>
            <p><b>Arritmias:</b> ${v(ecg.arritmias)}</p>
            <hr>
            <h3>📝 Observaciones</h3>
            <p>${v(ecg.hallazgos)}</p>
        </div>
    `;
};

/**
 * Mensaje del backend si lo hay, en vez del genérico. Se lee por forma y no con
 * `axios.isAxiosError`: axios se importa en un solo archivo del repo, `api.adapter.ts`.
 */
const mensajeDeError = (problema: unknown): string => {

    const respuesta = (problema as { response?: { data?: { message?: unknown } } } | null)?.response;
    const mensaje = respuesta?.data?.message;

    return typeof mensaje === 'string' && mensaje ? mensaje : 'Error al procesar el ECG';
};

/**
 * Modal «Subir archivo» de la lista: sube una imagen o un PDF del ECG a `GPT/analisis-ecg` y
 * muestra el informe. Clon de `FormUpload`, controlado por el `ModalContext` que el
 * orquestador monta anidado (`isDateModalOpen`).
 */
export const ModalSubirEcg = ({ formData }: Props) => {

    const { isDateModalOpen, onOpenModal } = useContext(ModalContext);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [enviando, setEnviando] = useState(false);

    const handleClose = () => {
        onOpenModal(false);
        setSelectedFile(null);
    };

    const onSubmit = async () => {

        if (!selectedFile) {
            Swal.fire({ icon: 'warning', title: 'Archivo requerido', text: 'Por favor selecciona una imagen.' });
            return;
        }

        setEnviando(true);

        try {
            const { postUploadFile } = await UseChequeoAdministradorService();
            const response = await postUploadFile(selectedFile, formData);

            setSelectedFile(null);
            onOpenModal(false);

            Swal.fire({
                icon              : 'success',
                title             : '🫀 Informe Electrocardiograma',
                width             : 900,
                html              : informeHtml(response.analisis ?? {}),
                confirmButtonText : 'Aceptar',
            });
        }
        catch (problema) {
            console.error('Error al subir el archivo:', problema);
            Swal.fire({ icon: 'error', title: 'Error', text: mensajeDeError(problema) });
        }
        finally {
            setEnviando(false);
        }
    };

    return (
        <Modal
            keepMounted
            open={isDateModalOpen}
            onClose={handleClose}
            aria-label={`Subir ECG de ${formData.nombre || formData.rut}`}
        >
            <Box
                sx={{
                    position     : 'absolute',
                    top          : '50%',
                    left         : '50%',
                    transform    : 'translate(-50%, -50%)',
                    width        : '80%',
                    maxWidth     : '600px',
                    bgcolor      : 'background.paper',
                    borderRadius : '8px',
                    boxShadow    : 24,
                    p            : 4,
                    outline      : 'none',
                }}
            >
                <Grid item xs={12} sm={6} md={6}>
                    <InputFileUpload
                        fileName={selectedFile?.name ?? null}
                        onFileSelect={setSelectedFile}
                        typeAccept="image/*, .pdf"
                    />
                </Grid>
                <Grid item sx={{ textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={!selectedFile || enviando}
                        sx={{ mt: 2, px: 4, py: 1.5, borderRadius: '12px', ...sxFocoVisible }}
                    >
                        { enviando ? 'Cargando…' : 'Cargar' }
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                            mt           : 2,
                            ml           : 2,
                            px           : 4,
                            py           : 1.5,
                            background   : DEGRADADOS.botonModal,
                            color        : COLORES.textoSobrePrimario,
                            borderRadius : '12px',
                            ...sxFocoVisible,
                        }}
                    >
                        Cerrar
                    </Button>
                </Grid>
            </Box>
        </Modal>
    );
};
